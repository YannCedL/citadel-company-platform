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
    clear_engine_cache,
    get_cached_profile,
    set_cached_profile,
    compare_companies_async,
    _MEMORY_CACHE
)
from argus_company_research.client import search_candidates_fast_async

app = FastAPI(
    title="CITADEL Company Platform API (Async Enterprise OSINT)",
    description="Plateforme d'Agrégation Corporate 360° Asynchrone",
    version="2.0.0"
)

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates")
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

templates = Jinja2Templates(directory=TEMPLATES_DIR)
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={},
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
        "cached_entities_count": len(_MEMORY_CACHE)
    }

@app.get("/api/v1/company/search/candidates/{query}")
async def search_candidates(query: str):
    clean_q = query.strip()
    if not clean_q:
        return {"query": query, "candidates": []}
    candidates = await search_candidates_fast_async(clean_q)
    return {
        "query": clean_q,
        "candidates": candidates
    }

@app.get("/api/v1/company/compare", response_model=ResultContract)
async def compare_companies_endpoint(sirens: str):
    targets = [s.strip() for s in sirens.split(",") if s.strip()]
    if not targets:
        raise HTTPException(status_code=400, detail="Veuillez fournir au moins un SIREN ou nom d'entreprise")
    return await compare_companies_async(targets)

@app.post("/api/v1/cache/clear")
@app.get("/api/v1/cache/clear")
async def clear_cache():
    count_before = len(_MEMORY_CACHE)
    clear_engine_cache()
    count_after = len(_MEMORY_CACHE)
    return {
        "status": "ok",
        "message": f"Cache in-memory LRU unifié vidé avec succès : {count_before} entrée(s) purgée(s) → {count_after} restante(s).",
        "entries_before": count_before,
        "entries_after": count_after,
        "cleared_at": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/v1/company/{siren}", response_model=ResultContract)
@app.get("/api/v1/company/{siren}/full", response_model=ResultContract)
async def get_full_company_profile(siren: str, refresh: bool = False):
    clean_siren = siren.strip()
    
    # Validation Regex Stricte (Anti-Injection)
    if not re.match(r'^\d{9}$', clean_siren.replace(" ", "")):
        # Si la chaîne n'est pas un SIREN 9 chiffres, chercher par candidats
        fast_cands = await search_candidates_fast_async(clean_siren)
        if fast_cands:
            clean_siren = fast_cands[0]["siren"]
        else:
            raise HTTPException(status_code=400, detail="Numéro SIREN valide requis (9 chiffres)")

    # 1. Vérification du Cache In-Memory Serveur (bypassed si refresh=True)
    if not refresh:
        cached = get_cached_profile(clean_siren)
        if cached:
            return cached
        
    # 2. Exécution Asynchrone des 5 Sub-Engines si non-caché ou force-refresh
    contract = await company_full_profile_async(clean_siren, force_refresh=refresh)
    if contract and contract.result and contract.result.get("siren"):
        set_cached_profile(clean_siren, contract)
        
    return contract
