from datetime import UTC, datetime, timedelta

import jwt
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash

from app.config import settings


password_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """
    Transforme le mot de passe en hash sécurisé.
    Le mot de passe réel ne sera jamais stocké dans MongoDB.
    """
    return password_hasher.hash(password)

def get_password_hash(password: str) -> str:
    return hash_password(password)
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Vérifie si le mot de passe saisi correspond au hash stocké.
    """
    return password_hasher.verify(plain_password, hashed_password)


def create_access_token(user_id: str, role: str) -> str:
    """
    Génère un token JWT contenant l'identifiant utilisateur et son rôle.
    """
    now = datetime.now(UTC)

    payload = {
        "sub": user_id,
        "role": role,
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
    }

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm
    )


def decode_access_token(token: str) -> dict:
    """
    Décode et vérifie le token JWT.
    """
    try:
        return jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
    except InvalidTokenError as exception:
        raise exception