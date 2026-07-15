from fastapi import APIRouter, HTTPException, status

from app.database import shops_collection
from app.schemas import PublicShopResponse


router = APIRouter(
    prefix="/public",
    tags=["Public QR"]
)


@router.get(
    "/shops/{qr_token}",
    response_model=PublicShopResponse
)
async def get_shop_from_qr_token(
    qr_token: str
) -> PublicShopResponse:
    """
    Retourne le commerce correspondant à un QR Code public.
    Cette route est utilisée avant login ou inscription.
    """
    shop = await shops_collection.find_one(
        {
            "qr_token": qr_token,
            "is_active": True
        }
    )

    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="QR Code invalide ou commerce indisponible."
        )

    return PublicShopResponse(
        id=str(shop["_id"]),
        name=shop["name"],
        address=shop["address"],
        description=shop.get("description"),
        phone=shop.get("phone"),
        email=shop.get("email"),
        category=shop.get("category"),
        is_active=shop.get("is_active", True),
    )