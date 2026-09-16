# Gestionnaire Global d'Exceptions — CITADEL 360°
# Micro-Action 1.3 : "Silence Radio" sur les Stacktraces & Identifiant d'Incident
import uuid
import logging
from fastapi import Request
from fastapi.responses import JSONResponse

logger = logging.getLogger("citadel.security")

async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    incident_id = f"SEC-{uuid.uuid4().hex[:8].upper()}"
    
    # Log sécurisé uniquement côté serveur
    logger.error(
        f"Incident {incident_id} sur {request.method} {request.url.path} : {type(exc).__name__}: {str(exc)}",
        exc_info=True
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "code": "REQUEST_REJECTED",
            "message": "La requete n'a pas pu etre traitee par le protocole de securite.",
            "incident_id": incident_id
        }
    )
