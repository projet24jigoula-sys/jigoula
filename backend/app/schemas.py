from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    MERCHANT = "MERCHANT"
    CLIENT = "CLIENT"
    PARTNER = "PARTNER"


class LoyaltyProgramType(str, Enum):
    VISITS = "VISITS"

class PartnerRequestStatus(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DENIED = "DENIED"

class SubscriptionPlan(str, Enum):
    SILVER = "SILVER"
    GOLD = "GOLD"
    PLATINUM = "PLATINUM"

class OnboardingKitStatus(str, Enum):
    PENDING = "PENDING"
    PREPARED = "PREPARED"
    SHIPPED = "SHIPPED"
    COMPLETED = "COMPLETED"
class UserResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    phone: str | None = None
    role: UserRole
    is_active: bool
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ClientRegisterRequest(BaseModel):
    first_name: str = Field(min_length=2, max_length=50)
    last_name: str = Field(min_length=2, max_length=50)
    phone: str = Field(
        min_length=8,
        max_length=20,
        pattern=r"^\+?[0-9 ]+$"
    )
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserCreateByAdmin(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = UserRole.CLIENT


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserRoleUpdate(BaseModel):
    role: UserRole


class ShopCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    address: str = Field(min_length=2, max_length=200)
    description: str | None = Field(default=None, max_length=300)
    phone: str | None = Field(default=None, max_length=30)
    email: EmailStr | None = None
    category: str | None = Field(default=None, max_length=80)
    subscription_plan: SubscriptionPlan = SubscriptionPlan.SILVER


class ShopResponse(BaseModel):
    id: str
    name: str
    address: str
    description: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    category: str | None = None
    qr_token: str
    qr_public_url: str
    is_active: bool
    created_at: datetime
    subscription_plan: SubscriptionPlan
    onboarding_kit_status: OnboardingKitStatus


class PublicShopResponse(BaseModel):
    id: str
    name: str
    address: str
    description: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    category: str | None = None
    is_active: bool


class LoyaltyProgramCreateOrUpdateRequest(BaseModel):
    required_visits: int = Field(ge=1, le=100)
    reward_title: str = Field(min_length=2, max_length=120)
    reward_description: str | None = Field(default=None, max_length=300)
    is_active: bool = True


class LoyaltyProgramResponse(BaseModel):
    id: str
    shop_id: str
    shop_name: str
    program_type: LoyaltyProgramType
    required_visits: int
    reward_title: str
    reward_description: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ClientLoyaltyProgressResponse(BaseModel):
    shop_id: str
    shop_name: str
    shop_address: str
    current_visits: int
    required_visits: int
    remaining_visits: int
    reward_title: str
    reward_description: str | None = None
    reward_available: bool
    progress_percentage: int


class ScanHistoryResponse(BaseModel):
    id: str
    shop_id: str
    shop_name: str
    shop_address: str
    scanned_at: datetime


class ScanCheckInResponse(BaseModel):
    message: str
    recorded: bool
    scan: ScanHistoryResponse
    loyalty: ClientLoyaltyProgressResponse | None = None


class ClientScanHistoryResponse(BaseModel):
    total: int
    scans: list[ScanHistoryResponse]


class ClientLoyaltySummaryResponse(BaseModel):
    total_programs: int
    programs: list[ClientLoyaltyProgressResponse]

class ClientVisitedShopResponse(BaseModel):
    shop_id: str
    shop_name: str
    shop_address: str
    shop_description: str | None = None
    shop_phone: str | None = None
    shop_email: EmailStr | None = None
    shop_category: str | None = None
    total_visits: int
    last_visit_at: datetime
    loyalty: ClientLoyaltyProgressResponse | None = None


class ClientVisitedShopsResponse(BaseModel):
    total: int
    shops: list[ClientVisitedShopResponse]


class ClientShopDetailsResponse(BaseModel):
    shop: ClientVisitedShopResponse
    visits: list[ScanHistoryResponse]

class PartnerRequestCreateRequest(BaseModel):
    owner_full_name: str = Field(min_length=2, max_length=100)
    owner_email: EmailStr
    owner_phone: str = Field(min_length=8, max_length=30)

    shop_name: str = Field(min_length=2, max_length=120)
    shop_category: str = Field(min_length=2, max_length=80)
    shop_address: str = Field(min_length=2, max_length=200)
    shop_phone: str | None = Field(default=None, max_length=30)
    shop_email: EmailStr | None = None
    shop_description: str | None = Field(default=None, max_length=500)
    subscription_plan: SubscriptionPlan = SubscriptionPlan.SILVER


class PartnerRequestResponse(BaseModel):
    id: str
    owner_full_name: str
    owner_email: EmailStr
    owner_phone: str

    shop_name: str
    shop_category: str
    shop_address: str
    shop_phone: str | None = None
    shop_email: EmailStr | None = None
    shop_description: str | None = None

    status: PartnerRequestStatus
    admin_note: str | None = None
    created_at: datetime
    reviewed_at: datetime | None = None
    subscription_plan: SubscriptionPlan


class PartnerRequestDecisionRequest(BaseModel):
    admin_note: str | None = Field(default=None, max_length=500)


class AcceptedPartnerResponse(BaseModel):
    message: str
    partner_email: EmailStr
    temporary_password: str
    login_url: str
    partner_dashboard_url: str
    shop_qr_public_url: str
    shop: ShopResponse   
class MessageResponse(BaseModel):
    message: str


class ShopSaaSUpdateRequest(BaseModel):
    subscription_plan: SubscriptionPlan
    onboarding_kit_status: OnboardingKitStatus