from datetime import UTC, datetime
from io import BytesIO
from secrets import token_urlsafe

import qrcode
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from app.config import settings
from app.database import (
    loyalty_programs_collection,
    scan_events_collection,
    shops_collection,
    users_collection,
)
from app.dependencies import require_admin
from app.schemas import (
    MessageResponse,
    ShopCreateRequest,
    ShopResponse,
    UserCreateByAdmin,
    UserResponse,
    UserRole,
    UserRoleUpdate,
    UserStatusUpdate,
    ShopSaaSUpdateRequest,
)
from app.security import hash_password
from app.serializers import serialize_shop, serialize_user


router = APIRouter(
    prefix="/admin",
    tags=["Administration"]
)


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    role: UserRole | None = Query(default=None),
    search: str | None = Query(default=None, max_length=80),
    admin: dict = Depends(require_admin),
) -> list[UserResponse]:
    query: dict = {}

    if role:
        query["role"] = role.value

    if search:
        query["$or"] = [
            {
                "full_name": {
                    "$regex": search,
                    "$options": "i"
                }
            },
            {
                "email": {
                    "$regex": search,
                    "$options": "i"
                }
            }
        ]

    users = await users_collection.find(query).sort(
        "created_at",
        -1
    ).to_list(length=250)

    return [serialize_user(user) for user in users]


@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_user(
    payload: UserCreateByAdmin,
    admin: dict = Depends(require_admin),
) -> UserResponse:
    new_user = {
        "full_name": payload.full_name.strip(),
        "email": payload.email.lower().strip(),
        "password_hash": hash_password(payload.password),
        "role": payload.role.value,
        "is_active": True,
        "created_at": datetime.now(UTC),
    }

    try:
        result = await users_collection.insert_one(new_user)

    except DuplicateKeyError as exception:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un utilisateur avec cet email existe déjà."
        ) from exception

    new_user["_id"] = result.inserted_id

    return serialize_user(new_user)


@router.patch("/users/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: str,
    payload: UserStatusUpdate,
    admin: dict = Depends(require_admin),
) -> UserResponse:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable."
        )

    if str(admin["_id"]) == user_id and not payload.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas désactiver votre propre compte."
        )

    updated_user = await users_collection.find_one_and_update(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "is_active": payload.is_active
            }
        },
        return_document=ReturnDocument.AFTER
    )

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable."
        )

    return serialize_user(updated_user)


@router.patch("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    payload: UserRoleUpdate,
    admin: dict = Depends(require_admin),
) -> UserResponse:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable."
        )

    if str(admin["_id"]) == user_id and payload.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas retirer votre propre rôle ADMIN."
        )

    updated_user = await users_collection.find_one_and_update(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "role": payload.role.value
            }
        },
        return_document=ReturnDocument.AFTER
    )

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable."
        )

    return serialize_user(updated_user)


@router.delete("/users/{user_id}", response_model=MessageResponse)
async def delete_user(
    user_id: str,
    admin: dict = Depends(require_admin),
) -> MessageResponse:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable."
        )

    if str(admin["_id"]) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas supprimer votre propre compte."
        )

    result = await users_collection.delete_one(
        {"_id": ObjectId(user_id)}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable."
        )

    return MessageResponse(
        message="Utilisateur supprimé avec succès."
    )


@router.post(
    "/shops",
    response_model=ShopResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_shop(
    payload: ShopCreateRequest,
    admin: dict = Depends(require_admin),
) -> ShopResponse:
    """
    Crée un commerce avec un token QR public unique.
    Les informations supplémentaires seront affichées dans l'espace client.
    """
    shop_document = {
        "name": payload.name.strip(),
        "address": payload.address.strip(),
        "description": (
            payload.description.strip()
            if payload.description
            else None
        ),
        "phone": (
            payload.phone.strip()
            if payload.phone
            else None
        ),
        "email": (
            payload.email.lower().strip()
            if payload.email
            else None
        ),
        "category": (
            payload.category.strip()
            if payload.category
            else None
        ),
        "qr_token": token_urlsafe(24),
        "is_active": True,
        "created_at": datetime.now(UTC),
        "created_by": admin["_id"],
        "subscription_plan": payload.subscription_plan.value,
        "onboarding_kit_status": "PENDING",
    }

    result = await shops_collection.insert_one(shop_document)
    shop_document["_id"] = result.inserted_id

    return serialize_shop(shop_document)

@router.get("/shops", response_model=list[ShopResponse])
async def list_shops(
    admin: dict = Depends(require_admin),
) -> list[ShopResponse]:
    shops = await shops_collection.find().sort(
        "created_at",
        -1
    ).to_list(length=200)

    return [serialize_shop(shop) for shop in shops]


@router.delete("/shops/{shop_id}", response_model=MessageResponse)
async def delete_shop(
    shop_id: str,
    admin: dict = Depends(require_admin),
) -> MessageResponse:
    """
    Supprime un commerce avec son programme de fidélité et ses scans associés.
    Attention : cette suppression est définitive.
    """
    if not ObjectId.is_valid(shop_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commerce introuvable."
        )

    shop_object_id = ObjectId(shop_id)

    shop = await shops_collection.find_one(
        {
            "_id": shop_object_id
        }
    )

    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commerce introuvable."
        )

    await loyalty_programs_collection.delete_many(
        {
            "shop_id": shop_object_id
        }
    )

    await scan_events_collection.delete_many(
        {
            "shop_id": shop_object_id
        }
    )

    await shops_collection.delete_one(
        {
            "_id": shop_object_id
        }
    )

    return MessageResponse(
        message="Commerce supprimé avec succès."
    )

@router.get("/shops/{shop_id}/qr-code")
async def generate_shop_qr_code(
    shop_id: str,
    admin: dict = Depends(require_admin),
) -> Response:
    """
    Génère le QR Code PNG qui redirige vers la page publique React.
    """
    if not ObjectId.is_valid(shop_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commerce introuvable."
        )

    shop = await shops_collection.find_one(
        {"_id": ObjectId(shop_id)}
    )

    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commerce introuvable."
        )

    public_url = (
        f"{settings.public_frontend_url.rstrip('/')}"
        f"/scan/{shop['qr_token']}"
    )

    qr_code = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )

    qr_code.add_data(public_url)
    qr_code.make(fit=True)

    image = qr_code.make_image(
        fill_color="black",
        back_color="white"
    )

    image_buffer = BytesIO()
    image.save(image_buffer, format="PNG")

    return Response(
        content=image_buffer.getvalue(),
        media_type="image/png",
        headers={
            "Content-Disposition": (
                f'inline; filename="qr-{shop["name"]}.png"'
            )
        }
    )


@router.patch("/shops/{shop_id}/saas", response_model=ShopResponse)
async def update_shop_saas_details(
    shop_id: str,
    payload: ShopSaaSUpdateRequest,
    admin: dict = Depends(require_admin),
) -> ShopResponse:
    """
    Met à jour le plan d'abonnement SaaS et le statut de livraison du kit d'onboarding physique.
    """
    if not ObjectId.is_valid(shop_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commerce introuvable."
        )

    result = await shops_collection.find_one_and_update(
        {"_id": ObjectId(shop_id)},
        {
            "$set": {
                "subscription_plan": payload.subscription_plan.value,
                "onboarding_kit_status": payload.onboarding_kit_status.value,
            }
        },
        return_document=ReturnDocument.AFTER
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commerce introuvable."
        )

    return serialize_shop(result)