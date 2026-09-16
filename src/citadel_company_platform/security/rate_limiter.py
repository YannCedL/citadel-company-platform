# Limiteur de Débit & Sémaphore de Concurrence — CITADEL 360°
# Micro-Action 1.4 : Token Bucket par IP réelle (CF-Connecting-IP) & Verrou Anti-IA
import time
import asyncio
from typing import Dict, Tuple
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response

class RateLimitGuardMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        search_limit: int = 30,      # Max 30 req/min pour recherche
        profile_limit: int = 10,     # Max 10 req/min pour profil complet
        max_concurrent_per_ip: int = 2 # Max 2 requêtes simultanées par IP
    ):
        super().__init__(app)
        self.search_limit = search_limit
        self.profile_limit = profile_limit
        self.max_concurrent_per_ip = max_concurrent_per_ip
        
        # IP -> list of timestamps
        self.search_history: Dict[str, list] = {}
        self.profile_history: Dict[str, list] = {}
        # IP -> active concurrent requests
        self.active_requests: Dict[str, int] = {}
        self.lock = asyncio.Lock()

    def get_real_ip(self, request: Request) -> str:
        # Prise en compte prioritaire de Cloudflare / Reverse Proxies
        cf_ip = request.headers.get("CF-Connecting-IP")
        if cf_ip:
            return cf_ip.strip()
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        if request.client and request.client.host:
            return request.client.host
        return "127.0.0.1"

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path
        
        # Laisser passer les fichiers statiques sans restriction
        if path.startswith("/static") or path == "/health":
            return await call_next(request)
            
        ip = self.get_real_ip(request)
        now = time.time()
        
        async with self.lock:
            # Nettoyage vieux historique (> 60s)
            self.search_history[ip] = [t for t in self.search_history.get(ip, []) if now - t < 60]
            self.profile_history[ip] = [t for t in self.profile_history.get(ip, []) if now - t < 60]
            
            # 1. Vérification Sémaphore de Concurrence (Anti-IA flood)
            current_active = self.active_requests.get(ip, 0)
            if current_active >= self.max_concurrent_per_ip:
                return JSONResponse(
                    status_code=429,
                    content={
                        "status": "error",
                        "code": "CONCURRENT_REQUEST_LIMIT",
                        "detail": "Nombre maximal de requetes simultanees atteint. Veuillez patienter."
                    }
                )
            
            # 2. Vérification Débit par Endpoint
            if "/candidates" in path or "/search" in path:
                if len(self.search_history[ip]) >= self.search_limit:
                    return JSONResponse(
                        status_code=429,
                        content={
                            "status": "error",
                            "code": "RATE_LIMIT_SEARCH",
                            "detail": "Cadence de recherche trop rapide. Veuillez ralentir vos requetes."
                        }
                    )
                self.search_history[ip].append(now)
                
            elif "/company/" in path:
                if len(self.profile_history[ip]) >= self.profile_limit:
                    return JSONResponse(
                        status_code=429,
                        content={
                            "status": "error",
                            "code": "RATE_LIMIT_PROFILE",
                            "detail": "Limite de consultation par minute atteinte pour votre session."
                        }
                    )
                self.profile_history[ip].append(now)
            
            self.active_requests[ip] = current_active + 1

        try:
            response = await call_next(request)
            return response
        finally:
            async with self.lock:
                if ip in self.active_requests:
                    self.active_requests[ip] = max(0, self.active_requests[ip] - 1)
