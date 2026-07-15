"""
seed_pfe.py — Seeds demo data for PFE defense.
Uses the same security module as the backend.
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, UTC

async def main():
    from app.database import users_collection, shops_collection, loyalty_programs_collection
    from app.security import hash_password

    print("PFE Seeder starting...\n")

    # ── 1. Reset admin password ─────────────────────────────────
    admin = await users_collection.find_one({"email": "admin@loyalty.tn"})
    if admin:
        await users_collection.update_one(
            {"_id": admin["_id"]},
            {"$set": {"password_hash": hash_password("admin123")}}
        )
        print("Admin password set  -> admin@loyalty.tn / admin123")
    else:
        print("WARNING: No admin found with email admin@loyalty.tn")

    # ── 2. Create / update Merchant user ───────────────────────
    merchant_email = "merchant@puntacana.tn"
    existing_merchant = await users_collection.find_one({"email": merchant_email})

    if existing_merchant:
        merchant_id = existing_merchant["_id"]
        await users_collection.update_one(
            {"_id": merchant_id},
            {"$set": {"password_hash": hash_password("merchant123")}}
        )
        print(f"Merchant updated    -> {merchant_email} / merchant123")
    else:
        merchant_doc = {
            "email": merchant_email,
            "password_hash": hash_password("merchant123"),
            "role": "MERCHANT",
            "full_name": "Hamadi Ben Salem",
            "phone": "22334455",
            "is_active": True,
            "created_at": datetime.now(UTC),
        }
        result = await users_collection.insert_one(merchant_doc)
        merchant_id = result.inserted_id
        print(f"Merchant created    -> {merchant_email} / merchant123")

    # ── 3. Link shop to merchant ────────────────────────────────
    shop = await shops_collection.find_one({"name": "Puntacana cafe"})
    if not shop:
        shop = await shops_collection.find_one({})  # fallback: first shop

    if shop:
        await shops_collection.update_one(
            {"_id": shop["_id"]},
            {"$set": {"owner_id": merchant_id}}   # backend uses owner_id
        )
        qr = shop.get("qr_token", "")
        print(f"Shop linked         -> '{shop['name']}'")
        print(f"  QR token: {qr}")
        print(f"  Scan URL: http://localhost:5174/scan/{qr}")
        shop_id = shop["_id"]
    else:
        print("No shops in DB. Create one via Admin panel.")
        shop_id = None

    # ── 4. Ensure loyalty program exists ─────────────────────
    if shop_id:
        existing_program = await loyalty_programs_collection.find_one(
            {"shop_id": shop_id, "is_active": True}
        )
        if existing_program:
            print("Loyalty program     -> already active (no change)")
        else:
            program_doc = {
                "shop_id": shop_id,
                "required_visits": 5,
                "reward_title": "Cafe gratuit",
                "reward_description": "Apres 5 visites, recevez un cafe offert.",
                "is_active": True,
                "created_at": datetime.now(UTC),
            }
            await loyalty_programs_collection.insert_one(program_doc)
            print("Loyalty program     -> Created: 5 visits -> Cafe gratuit")

    # ── 5. Reset client password ────────────────────────────────
    client = await users_collection.find_one({"email": "manoubaaziz7@gmail.com"})
    if client:
        await users_collection.update_one(
            {"_id": client["_id"]},
            {"$set": {"password_hash": hash_password("client123")}}
        )
        print("Client password set -> manoubaaziz7@gmail.com / client123")

    print("\n=================================================")
    print("DEMO CREDENTIALS FOR PFE:")
    print("  Admin   : admin@loyalty.tn       / admin123")
    print("  Merchant: merchant@puntacana.tn  / merchant123")
    print("  Client  : manoubaaziz7@gmail.com / client123")
    if shop:
        print(f"\n  Scan URL: http://localhost:5174/scan/{shop.get('qr_token','')}")
    print("=================================================")

asyncio.run(main())
