import urllib.request
import urllib.parse
import json

url = "http://127.0.0.1:8000/api/auth/login"

accounts = [
    {"email": "admin@loyalty.tn", "password": "admin123", "role": "Admin / Partenaire"},
    {"email": "merchant@puntacana.tn", "password": "merchant123", "role": "Commerçant"},
    {"email": "manoubaaziz7@gmail.com", "password": "client123", "role": "Client"}
]

print("Testing Logins...\n")

for acc in accounts:
    data = urllib.parse.urlencode({
        "username": acc["email"],
        "password": acc["password"]
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=data)
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                print(f"[SUCCESS] {acc['role']} Login WORKS:")
                print(f"          Email: {acc['email']}")
                print(f"          Pass:  {acc['password']}\n")
    except urllib.error.HTTPError as e:
        print(f"[FAILED] {acc['role']} Login FAILED for {acc['email']}: HTTP {e.code}\n")
