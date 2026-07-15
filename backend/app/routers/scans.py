from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status

from app.config import settings
from app.database import (
    loyalty_programs_collection,
    scan_events_collection,
    shops_collection,
)
from app.dependencies import get_current_user
from app.schemas import (
    ClientScanHistoryResponse,
    ScanCheckInResponse,
    UserRole,
)
from app.serializers import serialize_loyalty_progress, serialize_scan


router = APIRouter(
    prefix="/scans",
    tags=["Scans clients"]
)


async def get_loyalty_progress_for_scan(
    current_user: dict,
    shop: dict
):
    """
    Retourne la progression fidélité du client pour le commerce scanné,
    si un programme actif existe.
    """
    program = await loyalty_programs_collection.find_one(
        {
            "shop_id": shop["_id"],
            "is_active": True,
        }
    )

    if not program:
        return None

    current_visits = await scan_events_collection.count_documents(
        {
            "user_id": current_user["_id"],
            "shop_id": shop["_id"],
        }
    )

    return serialize_loyalty_progress(
        shop_document=shop,
        program_document=program,
        current_visits=current_visits,
    )


@router.post(
    "/{qr_token}/check-in",
    response_model=ScanCheckInResponse
)
async def register_scan_after_authentication(
    qr_token: str,
    current_user: dict = Depends(get_current_user),
) -> ScanCheckInResponse:
    """
    Enregistre une visite après connexion ou inscription du client.
    Un même client ne peut pas enregistrer plusieurs visites
    successives dans le même commerce durant le délai anti-abus.
    """
    if current_user.get("role") != UserRole.CLIENT.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les clients peuvent enregistrer une visite."
        )

    shop = await shops_collection.find_one(
        {
            "qr_token": qr_token,
            "is_active": True
        }
    )

    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="QR Code invalide ou commerce indisponible."
        )

    now = datetime.now(UTC)

    cooldown_start = now - timedelta(
        minutes=settings.scan_cooldown_minutes
    )

    recent_scan = await scan_events_collection.find_one(
        {
            "user_id": current_user["_id"],
            "shop_id": shop["_id"],
            "scanned_at": {
                "$gte": cooldown_start
            }
        },
        sort=[("scanned_at", -1)]
    )

    if recent_scan:
        loyalty_progress = await get_loyalty_progress_for_scan(
            current_user=current_user,
            shop=shop,
        )

        return ScanCheckInResponse(
            message=(
                "Visite déjà enregistrée récemment pour ce commerce. "
                "Veuillez patienter avant un nouveau scan."
            ),
            recorded=False,
            scan=serialize_scan(recent_scan, shop),
            loyalty=loyalty_progress,
        )

    scan_document = {
        "user_id": current_user["_id"],
        "shop_id": shop["_id"],
        "qr_token": qr_token,
        "scanned_at": now,
    }

    result = await scan_events_collection.insert_one(scan_document)
    scan_document["_id"] = result.inserted_id

    loyalty_progress = await get_loyalty_progress_for_scan(
        current_user=current_user,
        shop=shop,
    )

    return ScanCheckInResponse(
        message="Visite enregistrée avec succès.",
        recorded=True,
        scan=serialize_scan(scan_document, shop),
        loyalty=loyalty_progress,
    )


@router.get(
    "/me/history",
    response_model=ClientScanHistoryResponse
)
async def get_my_scan_history(
    current_user: dict = Depends(get_current_user),
) -> ClientScanHistoryResponse:
    """
    Retourne l'historique des commerces scannés par le client connecté.
    """
    if current_user.get("role") != UserRole.CLIENT.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Historique disponible uniquement pour les clients."
        )

    scan_documents = await scan_events_collection.find(
        {
            "user_id": current_user["_id"]
        }
    ).sort(
        "scanned_at",
        -1
    ).to_list(length=500)

    scans = []

    for scan_document in scan_documents:
        shop = await shops_collection.find_one(
            {
                "_id": scan_document["shop_id"]
            }
        )

        if shop:
            scans.append(
                serialize_scan(scan_document, shop)
            )

    return ClientScanHistoryResponse(
        total=len(scans),
        scans=scans,
    )