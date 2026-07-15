# PROJECT AUDIT: DigitalLoyaltyCard / Jigoula.cards

An audit of the current state of **DigitalLoyaltyCard** (also known as Jigoula.cards) before starting updates. Designed for PFE defense explanations.

---

## 1. Stack Detection
* **Backend**: Python 3 (FastAPI framework), asynchronous database driver ASGI (`pymongo`), token security (`PyJWT`), password hashing (`pwdlib` with Argon2), `pydantic-settings` to process configuration environments.
* **Frontend**: React (v19) + Vite, React Router DOM (v7.15) for client routing, and Fetch API communication wrappers.
* **Database**: MongoDB (raw dict collections with custom asynchronous indexes).

---

## 2. Backend Architecture Mapping

All source code is mapped under `backend/app/`:
* `main.py`: Binds app configuration parameters, initializes CORS routes, establishes the lifecycle database dependency, and maps routers.
* `config.py`: Decouples runtime constants via Pydantic model configurations.
* `database.py`: Establishes MongoDB asynchronous clients and binds collections:
  * `users`
  * `shops`
  * `scan_events`
  * `loyalty_programs`
  * `partner_requests`
* `dependencies.py`: Defines authentication assertions (`get_current_user` and `require_admin`).
* `security.py`: Provides cryptographic helper functions for Argon2 password hashing and JWT token issues.
* `schemas.py`: Declares Pydantic schemas validating input bodies and output serialization structures.
* `serializers.py`: Serializer converters cleansing database document data formats securely before routing outputs.
* **Controller Routers** (`backend/app/routers/`):
  * `auth.py`: Registration and JWT login paths.
  * `admin.py`: Shop handling, user metrics, and PNG QR Code image returns.
  * `client.py`: Customer visited store summaries.
  * `loyalty.py`: Loyalty progress calculations.
  * `merchant.py`: Dashboard metrics for shops owned by business partners.
  * `partner_requests.py`: Public applications for merchants and Admin decision hooks (approve/reject).
  * `public.py`: Unauthenticated shop profile lookups from QR codes.
  * `scans.py`: Check-in logging including cooldown verification to prevent duplicate scan abuse.
  * `scan.py`: Unused legacy copy of `scans.py` (not registered in `main.py`).

---

## 3. Frontend Architecture Mapping

Source structures located under `frontend/src/`:
* `main.jsx`: Mounts the React application.
* `App.jsx`: Declares client-side application endpoints matching the React routing system:
  * `/login` (Public page)
  * `/admin` (Protected Admin Dashboard)
  * `/admin/shops` (Protected Admin Shops Management)
  * `/admin/partner-requests` (Protected Partner Application Review Panel)
  * `/partner/apply` (Public partner registration form)
  * `/merchant` (Protected Merchant Dashboard)
  * `/scan/:qrToken` (Public QR redirect landing page)
  * `/scan/:qrToken/login` (Client login state within QR context)
  * `/scan/:qrToken/register` (Client register state within QR context)
  * `/client/shops` (Protected client visited shops)
  * `/client/shops/:shopId` (Protected client shop stamps detailed progress)
  * `/client/history` (Protected client scan history logs)
* `api/api.js`: Base API client managing token injection headers, authorization status hooks, and central HTTP requests.
* `context/AuthContext.jsx`: Provides login, client register, and logout global hooks, handling session saving (`localStorage`).
* `components/`: Routing security checks:
  * `ProtectedAdminRoute.jsx` (Allows UserRole `ADMIN` only)
  * `ProtectedMerchantRoute.jsx` (Allows UserRole `MERCHANT` only)
  * `ProtectedClientRoute.jsx` (Allows UserRole `CLIENT` only)
* `styles.css`: CSS containing layout rules and current color highlights.
* `theme-orange.css` & `pages-polish.css`: Extra styling configurations.

---

## 4. Current API Endpoints Mapping
* **Auth**: `POST/auth/register-client`, `POST/auth/login`, `GET/auth/me`.
* **Admin**: `GET/admin/users`, `POST/admin/users`, `PATCH/admin/users/{id}/status`, `PATCH/admin/users/{id}/role`, `DELETE/admin/users/{id}`, `POST/admin/shops`, `GET/admin/shops`, `DELETE/admin/shops/{id}`, `GET/admin/shops/{id}/qr-code`.
* **Client**: `GET/client/shops`, `GET/client/shops/{id}`.
* **Loyalty**: `PUT/loyalty/admin/shops/{id}/program`, `GET/loyalty/admin/shops/{id}/program`, `GET/loyalty/client/summary`, `GET/loyalty/client/shops/{id}/progress`.
* **Merchant**: `GET/merchant/shops`, `GET/merchant/shops/{id}/visits`, `GET/merchant/shops/{id}/stats`, `PUT/merchant/shops/{id}/program`.
* **Partner Requests**: `POST/partner-requests/public`, `GET/partner-requests/admin`, `POST/partner-requests/admin/{id}/deny`, `POST/partner-requests/admin/{id}/accept`.
* **Public**: `GET/public/shops/{qr_token}`.
* **Scans**: `POST/scans/{qr_token}/check-in`, `GET/scans/me/history`.
* **Health**: `GET/health`.

---

## 5. Security Evaluation
* **Identified Risks**:
  * Compromised credentials if default admin settings are left default (`Admin123!`).
  * Weak/insecure fallback secrets on production builds if `JWT_SECRET_KEY` is not overwritten immediately.
  * Role check guards on client-side routing redirect non-client users unconditionally to `/admin` (a merchant navigating to client pages gets redirected to the admin URL, exposing an unauthenticated routing flaw).
  * CORS headers in `.env` default to permissive strings if not carefully monitored.
* **Strong Points**:
  * Argon2 verification via `pwdlib` prevents reverse-lookup credential theft.
  * JWT access duration is limited (120 minutes fallback).
  * Strict backend checks on user roles inside routers (`require_admin`, check role for Merchant/Client).

---

## 6. Broken, Inconsistent, or Missing Components
1. **Redundant Code**: `backend/app/routers/scan.py` is present but completely bypassed by `scans.py`. It should be safely archived/cleaned.
2. **Missing Database Records & Models for SaaS Monetization**: No tables or structures representing the **Silver, Gold, Platinum** tiers, onboarding kit parameters (NFC plastic cards, shop counter stands, staff training logs), and setups tracking.
3. **No Marketing Landing Page**: Running the system on `/` redirects directly to `/login`. There is no visual showcase of the business product, available packs, CTA, or partner request portals.
4. **Visual Design Deviations**: Current styling has disjointed visual accents instead of the formal palette (Forest Deep, Deep Teal, Aerial Mint, and Pure White). The dashboards do not have unified layouts.

---

## 7. Recommended Implementation Path
* **Step 1: Code Base Stabilization**
  - Delete `backend/app/routers/scan.py` to prevent logic confusion.
  - Setup unified `.env.example` configurations.
  - Run and verify database seeds.
* **Step 2: Core SaaS & Package Fields Setup**
  - Update `schemas.py` and backend controllers to support subscription plans (`SILVER`, `GOLD`, `PLATINUM`), onboarding setup status (`PENDING`, `PREPARED`, `SHIPPED`, `COMPLETED`), and custom registration values.
  - Integrate these variables during partner approvals (`accept` router).
* **Step 3: Styling System Correction (Palette Integration)**
  - Integrate clean forest/teal/mint color variables into `frontend/src/styles.css`.
  - Design premium minimalistic layouts for dashboards and forms.
* **Step 4: Marketing Landing Page (`/`)**
  - Replace the root redirect with a modern, high-tier landing page explaining Jigoula.cards.
  - Include pricing pack info card layouts, onboarding kit details (NFC counters, training), and direct CTA links to the partner request page.
* **Step 5: Admin & Merchant Portal SaaS Functions**
  - Enable admins to adjust/audit subscription packs levels and track shop onboarding shipping statuses.
  - Showcase active subscription tiers and kit delivery status on the merchant's board.
* **Step 6: Final PFE Scenario & Seed Scripts**
  - Generate comprehensive demo databases representing test shops, visit logs, and billing packages for defense presentation.
