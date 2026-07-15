from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError

from app.database import users_collection
from app.schemas import UserRole
from app.security import decode_access_token


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Vérifie le token puis retourne l'utilisateur connecté.
    Cette dépendance protège les routes privées.
    """
    authentication_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentification invalide ou expirée.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")

        if not user_id or not ObjectId.is_valid(user_id):
            raise authentication_error

    except InvalidTokenError as exception:
        raise authentication_error from exception

    user = await users_collection.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise authentication_error

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Votre compte est désactivé."
        )

    return user


async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Autorise uniquement l'administrateur.
    """
    if current_user.get("role") != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé à l'administrateur."
        )

    return current_user