import os
import re
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from genesis_core import ResultContract

from .engine import (
    company_full_profile_async,
    get_cached_profile,
    set_cached_profile,
    compare_companies_async,
    _MEMORY_CACHE
)
from argus_company_research.client import search_candidates_fast_async
from .security.sanitizer import normalize_and_sanitize, validate_siren
from .security.headers import SecurityHeadersMiddleware
from .security.exceptions import global_exception_handler
from .security.rate_limiter import RateLimitGuardMiddleware
from .sandbox.manager import SandboxManager

# Mode Sandbox activable par variable d'environnement (actif par défaut en environnement de démonstration)
SANDBOX_MODE = os.environ.get("SANDBOX_MODE", "true").lower() in ("true", "1", "yes")

app = FastAPI(
    title="CITADEL Company Platform API (Async Enterprise OSINT)",
    description="Plateforme d'Agrégation Corporate 360° Asynchrone",
    version="2.0.0",
    docs_url=None if SANDBOX_MODE else "/docs",
    redoc_url=None if SANDBOX_MODE else "/redoc",
    openapi_url=None if SANDBOX_MODE else "/openapi.json"
)

# 1. Enregistrement des Middlewares de Sécurité
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitGuardMiddleware)
app.add_exception_handler(Exception, global_exception_handler)

# 2. Instance du Gestionnaire Sandbox
sandbox_manager = SandboxManager()

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates")
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

templates = Jinja2Templates(directory=TEMPLATES_DIR)
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


def get_client_ip(request: Request) -> str:
    """Extrait l'adresse IP réelle (supporte Cloudflare / Reverse Proxy)."""
    cf_ip = request.headers.get("CF-Connecting-IP")
    if cf_ip:
        return cf_ip.strip()
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "127.0.0.1"


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={"sandbox_mode": SANDBOX_MODE},
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    )


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "platform": "CITADEL",
        "mode": "Enterprise_Async",
        "version": "2.0.0",
        "sandbox_mode": SANDBOX_MODE,
        "cached_entities_count": sandbox_manager.storage.count() if SANDBOX_MODE else len(_MEMORY_CACHE)
    }


@app.get("/api/v1/company/search/candidates/{query}")
async def search_candidates(query: str):
    # Micro-Action 1.1 : Assainissement et validation stricte (anti-injection, max 80 chars)
    clean_q = normalize_and_sanitize(query, field_name="query")
    if not clean_q:
        return {"query": query, "candidates": []}

    # Micro-Action 3.2 : Autocomplétion "Cache-First" (< 1 ms si présent dans le catalogue)
    upper_q = clean_q.upper()
    cached_matches = []
    for name, s in sandbox_manager.storage.indexed_names.items():
        if upper_q in name or clean_q in s:
            cached_matches.append({
                "siren": s,
                "nom_complet": name,
                "nom_raison_sociale": name,
                "source": "CATALOGUE_CERTIFIE_INSTANTANE"
            })
            if len(cached_matches) >= 5:
                break

    candidates = await search_candidates_fast_async(clean_q)
    
    # Fusionner en priorité les résultats en cache pour une réactivité maximale
    if cached_matches:
        existing_sirens = {c.get("siren") for c in cached_matches}
        for c in candidates:
            if c.get("siren") not in existing_sirens:
                cached_matches.append(c)
        candidates = cached_matches

    return {
        "query": clean_q,
        "candidates": candidates
    }


@app.get("/api/v1/company/compare", response_model=ResultContract)
async def compare_companies_endpoint(request: Request, sirens: str):
    raw_targets = [s.strip() for s in sirens.split(",") if s.strip()]
    if not raw_targets:
        raise HTTPException(status_code=400, detail="Veuillez fournir au moins un SIREN ou nom d'entreprise.")
    
    # Plafond de sécurité : max 2 cibles comparées en environnement public (Anti-IA flood)
    if len(raw_targets) > 2:
        raise HTTPException(status_code=400, detail="Le mode comparatif est limite a 2 entreprises simultanees.")

    clean_targets = [normalize_and_sanitize(t, field_name="sirens") for t in raw_targets]

    # Vérification Sandbox pour chaque cible
    if SANDBOX_MODE:
        client_ip = get_client_ip(request)
        for t in clean_targets:
            if re.match(r'^\d{9}$', t):
                sandbox_manager.can_explore_new_company(client_ip, t)

    return await compare_companies_async(clean_targets)


@app.get("/api/v1/company/{siren}", response_model=ResultContract)
@app.get("/api/v1/company/{siren}/full", response_model=ResultContract)
async def get_full_company_profile(request: Request, siren: str, refresh: bool = False):
    # Validation du SIREN ou recherche automatique si chaîne
    raw_input = siren.strip()
    if re.match(r'^\d{9}$', raw_input.replace(" ", "")):
        clean_siren = validate_siren(raw_input)
    else:
        clean_query = normalize_and_sanitize(raw_input, field_name="siren")
        fast_cands = await search_candidates_fast_async(clean_query)
        if fast_cands:
            clean_siren = fast_cands[0]["siren"]
        else:
            raise HTTPException(status_code=400, detail="Numero SIREN valide requis (9 chiffres).")

    client_ip = get_client_ip(request)

    # 1. En Mode Sandbox : le paramètre refresh=True est strictement désactivé
    if SANDBOX_MODE:
        refresh = False
        
        # Vérification du cache persistant sur disque
        cached_disk = sandbox_manager.get_cached_profile(clean_siren)
        if cached_disk:
            return cached_disk
            
        # Vérification des quotas avant appel externe (Plafond 350 et max 5 ajouts/IP)
        sandbox_manager.can_explore_new_company(client_ip, clean_siren)

    # 2. Vérification du cache in-memory si non Sandbox et pas de refresh forcé
    if not refresh:
        cached_mem = get_cached_profile(clean_siren)
        if cached_mem:
            return cached_mem

    # 3. Exécution Asynchrone des 5 sous-moteurs
    contract = await company_full_profile_async(clean_siren, force_refresh=refresh)
    
    if contract and contract.result and contract.result.get("siren"):
        set_cached_profile(clean_siren, contract)
        if SANDBOX_MODE:
            sandbox_manager.record_new_discovery(client_ip, clean_siren, contract)

    return contract
