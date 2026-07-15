"""
Migration: backfill SaaS fields on existing shops
--------------------------------------------------
Adds  subscription_plan = "SILVER"  and
      onboarding_kit_status = "PENDING"
to every shop document that doesn't already have those fields.

Safe to re-run – uses $exists checks so already-migrated documents
are never overwritten.

Usage (from the backend/ directory with the venv active):
    $env:PYTHONPATH="."
    python scripts/migrate_saas_fields.py
"""

import asyncio
from datetime import UTC, datetime

from app.database import initialize_database, shops_collection


async def migrate() -> None:
    await initialize_database()

    # ------------------------------------------------------------------
    # 1. Backfill subscription_plan on shops that are missing it
    # ------------------------------------------------------------------
    plan_result = await shops_collection.update_many(
        {"subscription_plan": {"$exists": False}},
        {
            "$set": {
                "subscription_plan": "SILVER",
                "migrated_at": datetime.now(UTC),
            }
        },
    )
    print(
        f"[subscription_plan]   matched={plan_result.matched_count}  "
        f"modified={plan_result.modified_count}"
    )

    # ------------------------------------------------------------------
    # 2. Backfill onboarding_kit_status on shops that are missing it
    # ------------------------------------------------------------------
    kit_result = await shops_collection.update_many(
        {"onboarding_kit_status": {"$exists": False}},
        {
            "$set": {
                "onboarding_kit_status": "PENDING",
                "migrated_at": datetime.now(UTC),
            }
        },
    )
    print(
        f"[onboarding_kit_status] matched={kit_result.matched_count}  "
        f"modified={kit_result.modified_count}"
    )

    # ------------------------------------------------------------------
    # 3. Report totals
    # ------------------------------------------------------------------
    total = await shops_collection.count_documents({})
    fully_migrated = await shops_collection.count_documents(
        {
            "subscription_plan": {"$exists": True},
            "onboarding_kit_status": {"$exists": True},
        }
    )
    print(
        f"\n✅  Migration complete — "
        f"{fully_migrated}/{total} shops fully migrated."
    )


if __name__ == "__main__":
    asyncio.run(migrate())
