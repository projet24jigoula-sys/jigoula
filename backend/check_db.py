import asyncio
import sys
sys.path.insert(0, '.')

async def main():
    from app.database import users_collection, shops_collection
    lines = []
    lines.append("=== USERS ===")
    users = await users_collection.find({}, {'email': 1, 'role': 1, 'full_name': 1, '_id': 0}).to_list(50)
    for u in users:
        lines.append(f"  email={u.get('email')}  role={u.get('role')}  name={u.get('full_name')}")
    lines.append(f"Total users: {len(users)}")

    lines.append("\n=== SHOPS ===")
    shops = await shops_collection.find({}, {'name': 1, 'qr_token': 1, 'is_active': 1}).to_list(50)
    for s in shops:
        lines.append(f"  id={str(s.get('_id'))} | name={s.get('name')} | qr_token={s.get('qr_token')} | active={s.get('is_active')}")
    lines.append(f"Total shops: {len(shops)}")

    with open('db_report.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print("Written to db_report.txt")

asyncio.run(main())
