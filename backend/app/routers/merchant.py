from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import (
    loyalty_programs_collection,
    scan_events_collection,
    shops_collection,
    users_collection,
)
from app.dependencies import get_current_user
from app.routers.loyalty import calculate_client_progress
from app.schemas import (
    ClientLoyaltyProgressResponse,
    LoyaltyProgramCreateOrUpdateRequest,
    LoyaltyProgramResponse,
    ScanHistoryResponse,
    ShopResponse,
    UserRole,
)
from app.serializers import (
    serialize_loyalty_program,
    serialize_scan,
    serialize_shop,
)


router = APIRouter(
    prefix="/merchant",
    tags=["Dashboard partenaire"]
)


def require_merchant_user(current_user: dict) -> None:
    if current_user.get("role") != UserRole.MERCHANT.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux partenaires.",
        )


async def get_owned_shop_or_404(
    shop_id: str,
    current_user: dict,
) -> dict:
    if not ObjectId.is_valid(shop_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commerce introuvable.",
        )

    shop = await shops_collection.find_one(
        {
            "_id": ObjectId(shop_id),
            "owner_id": current_user["_id"],
            "is_active": True,
        }
    )

    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commerce introuvable ou non autorisé.",
        )

    return shop


@router.get(
    "/shops",
    response_model=list[ShopResponse],
)
async def get_my_merchant_shops(
    current_user: dict = Depends(get_current_user),
) -> list[ShopResponse]:
    """
    Retourne les commerces appartenant au partenaire connecté.
    """
    require_merchant_user(current_user)

    shops = await shops_collection.find(
        {
            "owner_id": current_user["_id"],
            "is_active": True,
        }
    ).sort(
        "created_at",
        -1
    ).to_list(length=100)

    return [
        serialize_shop(shop)
        for shop in shops
    ]


@router.get(
    "/shops/{shop_id}/visits",
    response_model=list[ScanHistoryResponse],
)
async def get_my_shop_visits(
    shop_id: str,
    current_user: dict = Depends(get_current_user),
) -> list[ScanHistoryResponse]:
    """
    Logs de visites/scans pour un commerce du partenaire.
    """
    require_merchant_user(current_user)

    shop = await get_owned_shop_or_404(
        shop_id=shop_id,
        current_user=current_user,
    )

    scans = await scan_events_collection.find(
        {
            "shop_id": shop["_id"]
        }
    ).sort(
        "scanned_at",
        -1
    ).to_list(length=1000)

    return [
        serialize_scan(scan, shop)
        for scan in scans
    ]


@router.get(
    "/shops/{shop_id}/stats",
)
async def get_my_shop_stats(
    shop_id: str,
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Statistiques simples pour dashboard partenaire.
    """
    require_merchant_user(current_user)

    shop = await get_owned_shop_or_404(
        shop_id=shop_id,
        current_user=current_user,
    )

    total_visits = await scan_events_collection.count_documents(
        {
            "shop_id": shop["_id"]
        }
    )

    unique_clients = len(
        await scan_events_collection.distinct(
            "user_id",
            {
                "shop_id": shop["_id"]
            }
        )
    )

    program = await loyalty_programs_collection.find_one(
        {
            "shop_id": shop["_id"],
            "is_active": True,
        }
    )

    return {
        "shop_id": str(shop["_id"]),
        "shop_name": shop["name"],
        "total_visits": total_visits,
        "unique_clients": unique_clients,
        "has_active_loyalty_program": bool(program),
    }


@router.put(
    "/shops/{shop_id}/program",
    response_model=LoyaltyProgramResponse,
)
async def create_or_update_my_shop_program(
    shop_id: str,
    payload: LoyaltyProgramCreateOrUpdateRequest,
    current_user: dict = Depends(get_current_user),
) -> LoyaltyProgramResponse:
    """
    Permet au partenaire de configurer le programme fidélité de son commerce.
    """
    require_merchant_user(current_user)

    shop = await get_owned_shop_or_404(
        shop_id=shop_id,
        current_user=current_user,
    )

    from datetime import UTC, datetime
    from pymongo import ReturnDocument

    now = datetime.now(UTC)

    program = await loyalty_programs_collection.find_one_and_update(
        {
            "shop_id": shop["_id"]
        },
        {
            "$set": {
                "required_visits": payload.required_visits,
                "reward_title": payload.reward_title.strip(),
                "reward_description": (
                    payload.reward_description.strip()
                    if payload.reward_description
                    else None
                ),
                "is_active": payload.is_active,
                "updated_at": now,
                "updated_by": current_user["_id"],
            },
            "$setOnInsert": {
                "shop_id": shop["_id"],
                "program_type": "VISITS",
                "created_at": now,
                "created_by": current_user["_id"],
            },
        },
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )

    return serialize_loyalty_program(program, shop)