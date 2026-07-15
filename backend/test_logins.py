import requests

url = "http://127.0.0.1:8000/api/auth/login"

accounts = [
    {"email": "admin@loyalty.tn", "password": "admin123", "role": "Admin"},
    {"email": "merchant@puntacana.tn", "password": "merchant123", "role": "Merchant"},
    {"email": "manoubaaziz7@gmail.com", "password": "client123", "role": "Client"}
]

print("Testing Logins...")

for acc in accounts:
    data = {
        "username": acc["email"],
        "password": acc["password"]
    }
    response = requests.post(url, data=data)
    if response.status_code == 200:
        print(f"[SUCCESS] {acc['role']} Login WORKS: {acc['email']} / {acc['password']}")
    else:
        print(f"[FAILED]  {acc['role']} Login FAILED for {acc['email']}: {response.status_code} {response.text}")

