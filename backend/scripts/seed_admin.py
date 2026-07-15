import asyncio
from datetime import UTC, datetime

from pymongo.errors import DuplicateKeyError

from app.config import settings
from app.database import initialize_database, users_collection
from app.schemas import UserRole
from app.security import hash_password


async def seed_admin() -> None:
    """
    Crée le premier compte administrateur.
    Cette commande sera exécutée une seule fois au début du projet.
    """
    await initialize_database()

    admin_email = settings.admin_email.lower().strip()

    admin_document = {
        "full_name": settings.admin_full_name.strip(),
        "email": admin_email,
        "password_hash": hash_password(settings.admin_password),
        "role": UserRole.ADMIN.value,
        "is_active": True,
        "created_at": datetime.now(UTC),
    }

    try:
        await users_collection.insert_one(admin_document)
        print(f"Administrateur créé avec succès : {admin_email}")

    except DuplicateKeyError:
        print(f"L'administrateur existe déjà : {admin_email}")


if __name__ == "__main__":
    asyncio.run(seed_admin())