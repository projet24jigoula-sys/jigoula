# 🃏 Jigoula.cards — Projet de Fin d'Études (PFE)
**Aziz M. — 2025/2026**

Plateforme SaaS de fidélisation digitale pour commerces locaux tunisiens.  
QR codes, tampons, récompenses — sans application à installer.

---

## 🚀 Démarrage rapide (pour la soutenance)

### 1. Backend (FastAPI + MongoDB)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
API disponible sur : `http://127.0.0.1:8000`  
Documentation Swagger : `http://127.0.0.1:8000/docs`

### 2. Frontend (React 18 + Vite + TypeScript)
```bash
cd "front 2"
npm install
npm run dev
```
Application disponible sur : `http://localhost:5174`

---

## 👥 Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@loyalty.tn | (défini lors du seed) |
| Merchant | baraka@shop.tn | (défini lors du seed) |
| Client | client@gmail.com | (défini lors du seed) |

> **Astuce PFE :** Scanner l'URL `/scan/{qr_token}` d'un commerce pour déclencher le flux client complet.

---

## 🏗 Architecture

```
DigitalLoyaltyCard/
├── backend/              # FastAPI + MongoDB
│   ├── app/
│   │   ├── routers/      # auth, merchant, client, scans, admin, public...
│   │   ├── schemas.py    # Pydantic models
│   │   ├── database.py   # MongoDB connection
│   │   └── config.py     # CORS, settings (.env)
│   └── requirements.txt
│
├── front 2/              # React 18 + TypeScript + Vite + Tailwind
│   └── src/
│       ├── api/api.ts            # Fetch client centralisé
│       ├── app/
│       │   ├── context/AuthContext.tsx   # Session JWT
│       │   ├── components/ProtectedRoute.tsx  # RBAC
│       │   ├── pages/
│       │   │   ├── LandingPage.tsx
│       │   │   ├── AuthPage.tsx       # Login Client/Merchant/Admin
│       │   │   ├── ScanPage.tsx       # QR check-in
│       │   │   ├── ClientPage.tsx     # Vue fidélité client
│       │   │   ├── MerchantDashboard.tsx
│       │   │   └── PartnerDashboard.tsx
│       │   └── routes.tsx
│       └── styles/
```

---

## 🔄 Flux End-to-End

```
1. Admin approuve une demande  →  Merchant créé (email + mdp temp)
2. Merchant se connecte        →  Configure programme de fidélité + QR
3. Client scanne le QR         →  /scan/{token}  (ScanPage)
4. Client se connecte          →  Visite enregistrée en DB
5. Client voit ses tampons     →  /client/{shop_id}  (ClientPage)
6. Récompense débloquée        →  Notification + badge affiché
```

---

## 🎨 Design System

- **Couleurs :** Forest Deep `#0C1F1D` · Deep Teal `#297A74` · Aerial Mint `#A6D8D2` · Sand `#F2F1EE`
- **Typographie :** Century Gothic / Sora (FR), Cairo (AR)
- **Composants :** Radix UI + Tailwind CSS + Recharts

---

## 📊 Plans SaaS

| Plan | Prix Mensuel | Frais de Setup (1x) | Fonctionnalités Clés |
|------|------|------|-----------------|
| Silver 🥈 | 49 TND | 59 TND | 1 Admin, Carte digitale 10 tampons, max 300 clients réguliers. |
| Gold 🥇 | 119 TND | 89 TND | Multiplicateur de points, Gym Mode, Segmentation, Clients illimités. |
| Platinum 💎 | 249 TND | 149 TND | Outil Blast SMS/Notifs, Synchronisation multi-sites, Support WhatsApp, Export Data. |

---

*Jigoula.cards · Nabeul, Tunisie · © 2025*
