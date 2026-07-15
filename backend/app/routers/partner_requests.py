from datetime import UTC, datetime
from secrets import token_urlsafe

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.config import settings
from app.database import (
    partner_requests_collection,
    shops_collection,
    users_collection,
)
from app.dependencies import require_admin
from app.schemas import (
    AcceptedPartnerResponse,
    MessageResponse,
    PartnerRequestCreateRequest,
    PartnerRequestDecisionRequest,
    PartnerRequestResponse,
    PartnerRequestStatus,
    ShopResponse,
    UserRole,
)
from app.security import get_password_hash
from app.serializers import (
    serialize_partner_request,
    serialize_shop,
)


router = APIRouter(
    prefix="/partner-requests",
    tags=["Demandes partenaires"]
)


@router.post(
    "/public",
    response_model=PartnerRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
async def submit_partner_request(
    payload: PartnerRequestCreateRequest,
) -> PartnerRequestResponse:
    """
    Formulaire public rempli par un propriétaire de commerce
    après scan du QR onboarding partenaire.
    """
    existing_pending_request = await partner_requests_collection.find_one(
        {
            "owner_email": payload.owner_email.lower().strip(),
            "status": PartnerRequestStatus.PENDING.value,
        }
    )

    if existing_pending_request:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Une demande en attente existe déjà avec cet email.",
        )

    existing_user = await users_collection.find_one(
        {
            "email": payload.owner_email.lower().strip()
        }
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un compte existe déjà avec cet email.",
        )

    request_document = {
        "owner_full_name": payload.owner_full_name.strip(),
        "owner_email": payload.owner_email.lower().strip(),
        "owner_phone": payload.owner_phone.strip(),

        "shop_name": payload.shop_name.strip(),
        "shop_category": payload.shop_category.strip(),
        "shop_address": payload.shop_address.strip(),
        "shop_phone": (
            payload.shop_phone.strip()
            if payload.shop_phone
            else None
        ),
        "shop_email": (
            payload.shop_email.lower().strip()
            if payload.shop_email
            else None
        ),
        "shop_description": (
            payload.shop_description.strip()
            if payload.shop_description
            else None
        ),

        "status": PartnerRequestStatus.PENDING.value,
        "admin_note": None,
        "created_at": datetime.now(UTC),
        "reviewed_at": None,
        "reviewed_by": None,
        "subscription_plan": payload.subscription_plan.value,
    }

    result = await partner_requests_collection.insert_one(request_document)
    request_document["_id"] = result.inserted_id

    return serialize_partner_request(request_document)


@router.get(
    "/admin",
    response_model=list[PartnerRequestResponse],
)
async def list_partner_requests(
    status_filter: PartnerRequestStatus | None = None,
    admin: dict = Depends(require_admin),
) -> list[PartnerRequestResponse]:
    """
    Liste les demandes partenaires côté admin.
    """
    query = {}

    if status_filter:
        query["status"] = status_filter.value

    requests = await partner_requests_collection.find(
        query
    ).sort(
        "created_at",
        -1
    ).to_list(length=500)

    return [
        serialize_partner_request(request)
        for request in requests
    ]


@router.post(
    "/admin/{request_id}/deny",
    response_model=MessageResponse,
)
async def deny_partner_request(
    request_id: str,
    payload: PartnerRequestDecisionRequest,
    admin: dict = Depends(require_admin),
) -> MessageResponse:
    """
    Refuse une demande partenaire.
    """
    if not ObjectId.is_valid(request_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demande introuvable.",
        )

    request = await partner_requests_collection.find_one(
        {
            "_id": ObjectId(request_id)
        }
    )

    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demande introuvable.",
        )

    if request["status"] != PartnerRequestStatus.PENDING.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cette demande a déjà été traitée.",
        )

    await partner_requests_collection.update_one(
        {
            "_id": request["_id"]
        },
        {
            "$set": {
                "status": PartnerRequestStatus.DENIED.value,
                "admin_note": (
                    payload.admin_note.strip()
                    if payload.admin_note
                    else None
                ),
                "reviewed_at": datetime.now(UTC),
                "reviewed_by": admin["_id"],
            }
        }
    )

    return MessageResponse(
        message="Demande partenaire refusée."
    )


@router.post(
    "/admin/{request_id}/accept",
    response_model=AcceptedPartnerResponse,
)
async def accept_partner_request(
    request_id: str,
    payload: PartnerRequestDecisionRequest,
    admin: dict = Depends(require_admin),
) -> AcceptedPartnerResponse:
    """
    Accepte une demande partenaire.
    Crée automatiquement :
    - un compte MERCHANT
    - un commerce actif
    - un QR Code public client pour ce commerce
    """
    if not ObjectId.is_valid(request_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demande introuvable.",
        )

    request = await partner_requests_collection.find_one(
        {
            "_id": ObjectId(request_id)
        }
    )

    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demande introuvable.",
        )

    if request["status"] != PartnerRequestStatus.PENDING.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cette demande a déjà été traitée.",
        )

    existing_user = await users_collection.find_one(
        {
            "email": request["owner_email"]
        }
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un compte existe déjà avec cet email.",
        )

    now = datetime.now(UTC)

    temporary_password = token_urlsafe(10)

    user_document = {
        "full_name": request["owner_full_name"],
        "email": request["owner_email"],
        "phone": request["owner_phone"],
        "password_hash": get_password_hash(temporary_password),
        "role": UserRole.MERCHANT.value,
        "is_active": True,
        "created_at": now,
        "created_by": admin["_id"],
    }

    user_result = await users_collection.insert_one(user_document)
    user_document["_id"] = user_result.inserted_id

    shop_document = {
        "name": request["shop_name"],
        "address": request["shop_address"],
        "description": request.get("shop_description"),
        "phone": request.get("shop_phone"),
        "email": request.get("shop_email"),
        "category": request["shop_category"],
        "qr_token": token_urlsafe(24),
        "is_active": True,
        "owner_id": user_document["_id"],
        "created_at": now,
        "created_by": admin["_id"],
        "source_request_id": request["_id"],
        "subscription_plan": request.get("subscription_plan", "SILVER"),
        "onboarding_kit_status": "PENDING",
    }

    shop_result = await shops_collection.insert_one(shop_document)
    shop_document["_id"] = shop_result.inserted_id

    await partner_requests_collection.update_one(
        {
            "_id": request["_id"]
        },
        {
            "$set": {
                "status": PartnerRequestStatus.ACCEPTED.value,
                "admin_note": (
                    payload.admin_note.strip()
                    if payload.admin_note
                    else None
                ),
                "reviewed_at": now,
                "reviewed_by": admin["_id"],
                "accepted_user_id": user_document["_id"],
                "accepted_shop_id": shop_document["_id"],
            }
        }
    )

    serialized_shop: ShopResponse = serialize_shop(shop_document)

    login_url = f"{settings.public_frontend_url.rstrip('/')}/login"
    partner_dashboard_url = f"{settings.public_frontend_url.rstrip('/')}/merchant"

    return AcceptedPartnerResponse(
        message=(
            "Demande acceptée. Compte partenaire et commerce créés avec succès. "
            "Copiez ces informations pour les envoyer au partenaire."
        ),
        partner_email=user_document["email"],
        temporary_password=temporary_password,
        login_url=login_url,
        partner_dashboard_url=partner_dashboard_url,
        shop_qr_public_url=serialized_shop.qr_public_url,
        shop=serialized_shop,
    )