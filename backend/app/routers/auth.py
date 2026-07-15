from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pymongo.errors import DuplicateKeyError

from app.database import users_collection
from app.dependencies import get_current_user
from app.schemas import (
    ClientRegisterRequest,
    TokenResponse,
    UserResponse,
    UserRole,
)
from app.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.serializers import serialize_user


router = APIRouter(
    prefix="/auth",
    tags=["Authentification"]
)


@router.post(
    "/register-client",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED
)
async def register_client(
    payload: ClientRegisterRequest
) -> TokenResponse:
    """
    Inscription publique d'un nouveau client après scan d'un QR Code.
    Le rôle CLIENT est imposé côté backend.
    """
    normalized_phone = payload.phone.replace(" ", "").strip()

    client_document = {
        "first_name": payload.first_name.strip(),
        "last_name": payload.last_name.strip(),
        "full_name": (
            f"{payload.first_name.strip()} "
            f"{payload.last_name.strip()}"
        ),
        "phone": normalized_phone,
        "email": payload.email.lower().strip(),
        "password_hash": hash_password(payload.password),
        "role": UserRole.CLIENT.value,
        "is_active": True,
        "created_at": datetime.now(UTC),
    }

    try:
        result = await users_collection.insert_one(client_document)

    except DuplicateKeyError as exception:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un compte existe déjà avec cet email ou ce numéro de téléphone."
        ) from exception

    client_document["_id"] = result.inserted_id

    access_token = create_access_token(
        user_id=str(client_document["_id"]),
        role=client_document["role"]
    )

    return TokenResponse(
        access_token=access_token,
        user=serialize_user(client_document)
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends()
) -> TokenResponse:
    """
    Connexion d'un utilisateur existant.
    Le champ OAuth2 username correspond à l'email.
    """
    email = form_data.username.lower().strip()

    user = await users_collection.find_one({"email": email})

    if not user or not verify_password(
        form_data.password,
        user["password_hash"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ce compte est désactivé."
        )

    access_token = create_access_token(
        user_id=str(user["_id"]),
        role=user["role"]
    )

    return TokenResponse(
        access_token=access_token,
        user=serialize_user(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: dict = Depends(get_current_user)
) -> UserResponse:
    """
    Retourne l'utilisateur connecté.
    """
    return serialize_user(current_user)