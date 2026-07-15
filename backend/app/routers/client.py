from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import (
    loyalty_programs_collection,
    scan_events_collection,
    shops_collection,
)
from app.dependencies import get_current_user
from app.schemas import (
    ClientShopDetailsResponse,
    ClientVisitedShopResponse,
    ClientVisitedShopsResponse,
    ScanHistoryResponse,
    UserRole,
)
from app.serializers import serialize_loyalty_progress, serialize_scan


router = APIRouter(
    prefix="/client",
    tags=["Espace client"]
)


async def build_client_shop_card(
    current_user: dict,
    shop: dict,
) -> ClientVisitedShopResponse:
    total_visits = await scan_events_collection.count_documents(
        {
            "user_id": current_user["_id"],
            "shop_id": shop["_id"],
        }
    )

    last_scan = await scan_events_collection.find_one(
        {
            "user_id": current_user["_id"],
            "shop_id": shop["_id"],
        },
        sort=[("scanned_at", -1)]
    )

    program = await loyalty_programs_collection.find_one(
        {
            "shop_id": shop["_id"],
            "is_active": True,
        }
    )

    loyalty = None

    if program:
        loyalty = serialize_loyalty_progress(
            shop_document=shop,
            program_document=program,
            current_visits=total_visits,
        )

    return ClientVisitedShopResponse(
        shop_id=str(shop["_id"]),
        shop_name=shop["name"],
        shop_address=shop["address"],
        shop_description=shop.get("description"),
        shop_phone=shop.get("phone"),
        shop_email=shop.get("email"),
        shop_category=shop.get("category"),
        total_visits=total_visits,
        last_visit_at=last_scan["scanned_at"],
        loyalty=loyalty,
    )


@router.get(
    "/shops",
    response_model=ClientVisitedShopsResponse
)
async def get_my_visited_shops(
    current_user: dict = Depends(get_current_user),
) -> ClientVisitedShopsResponse:
    """
    Retourne la liste des commerces visités par le client connecté.
    Chaque commerce apparaît une seule fois, avec le nombre total de visites
    et les informations principales du commerce.
    """
    if current_user.get("role") != UserRole.CLIENT.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cette page est réservée aux clients."
        )

    scan_documents = await scan_events_collection.find(
        {
            "user_id": current_user["_id"]
        }
    ).sort(
        "scanned_at",
        -1
    ).to_list(length=1000)

    seen_shop_ids = set()
    visited_shops = []

    for scan in scan_documents:
        shop_id = scan["shop_id"]

        if str(shop_id) in seen_shop_ids:
            continue

        shop = await shops_collection.find_one(
            {
                "_id": shop_id,
                "is_active": True,
            }
        )

        if not shop:
            continue

        seen_shop_ids.add(str(shop_id))

        visited_shops.append(
            await build_client_shop_card(
                current_user=current_user,
                shop=shop,
            )
        )

    return ClientVisitedShopsResponse(
        total=len(visited_shops),
        shops=visited_shops,
    )


@router.get(
    "/shops/{shop_id}",
    response_model=ClientShopDetailsResponse
)
async def get_my_visited_shop_details(
    shop_id: str,
    current_user: dict = Depends(get_current_user),
) -> ClientShopDetailsResponse:
    """
    Retourne les détails d'un commerce visité par le client :
    informations du commerce, progression fidélité et liste complète des visites.
    """
    if current_user.get("role") != UserRole.CLIENT.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cette page est réservée aux clients."
        )

    if not ObjectId.is_valid(shop_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commerce introuvable."
        )

    shop = await shops_collection.find_one(
        {
            "_id": ObjectId(shop_id),
            "is_active": True,
        }
    )

    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commerce introuvable."
        )

    total_visits = await scan_events_collection.count_documents(
        {
            "user_id": current_user["_id"],
            "shop_id": shop["_id"],
        }
    )

    if total_visits == 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas encore visité ce commerce."
        )

    shop_card = await build_client_shop_card(
        current_user=current_user,
        shop=shop,
    )

    visit_documents = await scan_events_collection.find(
        {
            "user_id": current_user["_id"],
            "shop_id": shop["_id"],
        }
    ).sort(
        "scanned_at",
        -1
    ).to_list(length=500)

    visits: list[ScanHistoryResponse] = [
        serialize_scan(visit, shop)
        for visit in visit_documents
    ]

    return ClientShopDetailsResponse(
        shop=shop_card,
        visits=visits,
    )