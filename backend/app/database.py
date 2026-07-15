from pymongo import ASCENDING, DESCENDING, AsyncMongoClient

from app.config import settings


client = AsyncMongoClient(settings.mongodb_url)

database = client[settings.mongodb_db]

users_collection = database["users"]
shops_collection = database["shops"]
scan_events_collection = database["scan_events"]
loyalty_programs_collection = database["loyalty_programs"]
partner_requests_collection = database["partner_requests"]

async def initialize_database() -> None:
    """
    Vérifie la connexion MongoDB et crée les index nécessaires.
    """
    await database.command("ping")

    await users_collection.create_index(
        [("email", ASCENDING)],
        unique=True
    )

    await users_collection.create_index(
        [("phone", ASCENDING)],
        unique=True,
        partialFilterExpression={
            "phone": {
                "$type": "string"
            }
        }
    )
    await partner_requests_collection.create_index(
        [("owner_email", ASCENDING)]
    )

    await partner_requests_collection.create_index(
        [("status", ASCENDING)]
    )

    await partner_requests_collection.create_index(
        [("created_at", DESCENDING)]
    )

    await shops_collection.create_index(
        [("qr_token", ASCENDING)],
        unique=True
    )

    await scan_events_collection.create_index(
        [
            ("user_id", ASCENDING),
            ("scanned_at", DESCENDING)
        ]
    )

    await scan_events_collection.create_index(
        [
            ("shop_id", ASCENDING),
            ("scanned_at", DESCENDING)
        ]
    )

    await scan_events_collection.create_index(
        [
            ("user_id", ASCENDING),
            ("shop_id", ASCENDING),
            ("scanned_at", DESCENDING),
        ]
    )

    await loyalty_programs_collection.create_index(
        [("shop_id", ASCENDING)],
        unique=True
    )