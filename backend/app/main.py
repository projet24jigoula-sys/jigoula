from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import initialize_database
from app.routers import admin, auth, client, loyalty, merchant, partner_requests, public, scans

@asynccontextmanager
async def lifespan(app: FastAPI):
    await initialize_database()
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.3.0",
    description=(
        "API de fidélisation digitale pour commerces locaux. "
        "Authentification JWT, administration, QR Codes, scans "
        "et programmes de fidélité."
    ),
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(public.router, prefix="/api")
app.include_router(scans.router, prefix="/api")
app.include_router(loyalty.router, prefix="/api")
app.include_router(client.router, prefix="/api")
app.include_router(partner_requests.router, prefix="/api")
app.include_router(merchant.router, prefix="/api")
@app.get("/api/health", tags=["Système"])
async def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": settings.app_name
    }