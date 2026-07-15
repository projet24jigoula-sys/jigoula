from app.config import settings
from app.schemas import (
    ClientLoyaltyProgressResponse,
    LoyaltyProgramResponse,
    LoyaltyProgramType,
    ScanHistoryResponse,
    ShopResponse,
    UserResponse,
)
from app.schemas import PartnerRequestResponse


def serialize_user(user_document: dict) -> UserResponse:
    """
    Convertit un document MongoDB utilisateur en réponse API.
    Le password_hash n'est jamais exposé.
    """
    return UserResponse(
        id=str(user_document["_id"]),
        full_name=user_document["full_name"],
        email=user_document["email"],
        phone=user_document.get("phone"),
        role=user_document["role"],
        is_active=user_document.get("is_active", True),
        created_at=user_document["created_at"],
    )


def serialize_shop(shop_document: dict) -> ShopResponse:
    """
    Convertit un commerce MongoDB en réponse API admin.
    """
    public_url = (
        f"{settings.public_frontend_url.rstrip('/')}"
        f"/scan/{shop_document['qr_token']}"
    )

    return ShopResponse(
        id=str(shop_document["_id"]),
        name=shop_document["name"],
        address=shop_document["address"],
        description=shop_document.get("description"),
        phone=shop_document.get("phone"),
        email=shop_document.get("email"),
        category=shop_document.get("category"),
        qr_token=shop_document["qr_token"],
        qr_public_url=public_url,
        is_active=shop_document.get("is_active", True),
        created_at=shop_document["created_at"],
        subscription_plan=shop_document.get("subscription_plan", "SILVER"),
        onboarding_kit_status=shop_document.get("onboarding_kit_status", "PENDING"),
    )


def serialize_scan(
    scan_document: dict,
    shop_document: dict
) -> ScanHistoryResponse:
    """
    Convertit un événement de scan et son commerce en réponse API client.
    """
    return ScanHistoryResponse(
        id=str(scan_document["_id"]),
        shop_id=str(shop_document["_id"]),
        shop_name=shop_document["name"],
        shop_address=shop_document["address"],
        scanned_at=scan_document["scanned_at"],
    )


def serialize_loyalty_program(
    program_document: dict,
    shop_document: dict
) -> LoyaltyProgramResponse:
    """
    Convertit un programme de fidélité en réponse API.
    """
    return LoyaltyProgramResponse(
        id=str(program_document["_id"]),
        shop_id=str(shop_document["_id"]),
        shop_name=shop_document["name"],
        program_type=LoyaltyProgramType.VISITS,
        required_visits=program_document["required_visits"],
        reward_title=program_document["reward_title"],
        reward_description=program_document.get("reward_description"),
        is_active=program_document.get("is_active", True),
        created_at=program_document["created_at"],
        updated_at=program_document["updated_at"],
    )


def serialize_loyalty_progress(
    shop_document: dict,
    program_document: dict,
    current_visits: int
) -> ClientLoyaltyProgressResponse:
    """
    Calcule et sérialise la progression fidélité d'un client.
    """
    required_visits = program_document["required_visits"]

    remaining_visits = max(required_visits - current_visits, 0)

    reward_available = current_visits >= required_visits

    progress_percentage = min(
        int((current_visits / required_visits) * 100),
        100
    )

    return ClientLoyaltyProgressResponse(
        shop_id=str(shop_document["_id"]),
        shop_name=shop_document["name"],
        shop_address=shop_document["address"],
        current_visits=current_visits,
        required_visits=required_visits,
        remaining_visits=remaining_visits,
        reward_title=program_document["reward_title"],
        reward_description=program_document.get("reward_description"),
        reward_available=reward_available,
        progress_percentage=progress_percentage,
    )

def serialize_partner_request(request_document: dict) -> PartnerRequestResponse:
    return PartnerRequestResponse(
        id=str(request_document["_id"]),
        owner_full_name=request_document["owner_full_name"],
        owner_email=request_document["owner_email"],
        owner_phone=request_document["owner_phone"],

        shop_name=request_document["shop_name"],
        shop_category=request_document["shop_category"],
        shop_address=request_document["shop_address"],
        shop_phone=request_document.get("shop_phone"),
        shop_email=request_document.get("shop_email"),
        shop_description=request_document.get("shop_description"),

        status=request_document["status"],
        admin_note=request_document.get("admin_note"),
        created_at=request_document["created_at"],
        reviewed_at=request_document.get("reviewed_at"),
        subscription_plan=request_document.get("subscription_plan", "SILVER"),
    )