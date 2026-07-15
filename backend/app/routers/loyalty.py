from datetime import UTC, datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo import ReturnDocument

from app.database import (
    loyalty_programs_collection,
    scan_events_collection,
    shops_collection,
)
from app.dependencies import get_current_user, require_admin
from app.schemas import (
    ClientLoyaltyProgressResponse,
    ClientLoyaltySummaryResponse,
    LoyaltyProgramCreateOrUpdateRequest,
    LoyaltyProgramResponse,
    UserRole,
)
from app.serializers import (
    serialize_loyalty_program,
    serialize_loyalty_progress,
)


router = APIRouter(
    prefix="/loyalty",
    tags=["Fidélité"]
)


async def calculate_client_progress(
    user_id: ObjectId,
    shop: dict,
    program: dict
) -> ClientLoyaltyProgressResponse:
    """
    Calcule la progression d'un client dans le programme de fidélité
    d'un commerce donné.
    """
    current_visits = await scan_events_collection.count_documents(
        {
            "user_id": user_id,
            "shop_id": shop["_id"],
        }
    )

    return serialize_loyalty_progress(
        shop_document=shop,
        program_document=program,
        current_visits=current_visits,
    )


@router.put(
    "/admin/shops/{shop_id}/program",
    response_model=LoyaltyProgramResponse
)
async def create_or_update_shop_loyalty_program(
    shop_id: str,
    payload: LoyaltyProgramCreateOrUpdateRequest,
    admin: dict = Depends(require_admin),
) -> LoyaltyProgramResponse:
    """
    Crée ou met à jour le programme de fidélité d'un commerce.
    Pour cette version MVP : 1 scan validé = 1 visite.
    """
    if not ObjectId.is_valid(shop_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commerce introuvable."
        )

    shop = await shops_collection.find_one(
        {
            "_id": ObjectId(shop_id)
        }
    )

    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commerce introuvable."
        )

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
                "updated_by": admin["_id"],
            },
            "$setOnInsert": {
                "shop_id": shop["_id"],
                "program_type": "VISITS",
                "created_at": now,
                "created_by": admin["_id"],
            },
        },
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )

    return serialize_loyalty_program(program, shop)


@router.get(
    "/admin/shops/{shop_id}/program",
    response_model=LoyaltyProgramResponse
)
async def get_shop_loyalty_program_for_admin(
    shop_id: str,
    admin: dict = Depends(require_admin),
) -> LoyaltyProgramResponse:
    """
    Retourne le programme de fidélité d'un commerce pour l'administrateur.
    """
    if not ObjectId.is_valid(shop_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commerce introuvable."
        )

    shop = await shops_collection.find_one(
        {
            "_id": ObjectId(shop_id)
        }
    )

    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commerce introuvable."
        )

    program = await loyalty_programs_collection.find_one(
        {
            "shop_id": shop["_id"]
        }
    )

    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aucun programme de fidélité configuré pour ce commerce."
        )

    return serialize_loyalty_program(program, shop)


@router.get(
    "/client/summary",
    response_model=ClientLoyaltySummaryResponse
)
async def get_client_loyalty_summary(
    current_user: dict = Depends(get_current_user),
) -> ClientLoyaltySummaryResponse:
    """
    Retourne la progression du client dans tous les programmes
    de fidélité des commerces qu'il a visités.
    """
    if current_user.get("role") != UserRole.CLIENT.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Résumé fidélité disponible uniquement pour les clients."
        )

    programs = await loyalty_programs_collection.find(
        {
            "is_active": True
        }
    ).to_list(length=500)

    progress_items = []

    for program in programs:
        shop = await shops_collection.find_one(
            {
                "_id": program["shop_id"],
                "is_active": True,
            }
        )

        if not shop:
            continue

        current_visits = await scan_events_collection.count_documents(
            {
                "user_id": current_user["_id"],
                "shop_id": shop["_id"],
            }
        )

        if current_visits == 0:
            continue

        progress_items.append(
            serialize_loyalty_progress(
                shop_document=shop,
                program_document=program,
                current_visits=current_visits,
            )
        )

    return ClientLoyaltySummaryResponse(
        total_programs=len(progress_items),
        programs=progress_items,
    )


@router.get(
    "/client/shops/{shop_id}/progress",
    response_model=ClientLoyaltyProgressResponse
)
async def get_client_loyalty_progress_for_shop(
    shop_id: str,
    current_user: dict = Depends(get_current_user),
) -> ClientLoyaltyProgressResponse:
    """
    Retourne la progression du client dans un commerce précis.
    """
    if current_user.get("role") != UserRole.CLIENT.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Progression fidélité disponible uniquement pour les clients."
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

    program = await loyalty_programs_collection.find_one(
        {
            "shop_id": shop["_id"],
            "is_active": True,
        }
    )

    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aucun programme de fidélité actif pour ce commerce."
        )

    return await calculate_client_progress(
        user_id=current_user["_id"],
        shop=shop,
        program=program,
    )