import os
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from genesis_core import ResultContract
from .engine import company_full_profile

app = FastAPI(
    title="CITADEL Company Platform API",
    description="Plateforme d'Agrégation Corporate 360°",
    version="1.0.0"
)

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "templates", "index.html")

@app.get("/", response_class=HTMLResponse)
def index():
    # sert la page d'accueil de la plateforme corporate 360
    if os.path.exists(TEMPLATE_PATH):
        with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>CITADEL Platform API - Interface non trouvee</h1>"

@app.get("/health")
def health():
    return {"status": "ok", "platform": "CITADEL", "version": "1.0.0"}

@app.get("/api/v1/company/{siren}/full", response_model=ResultContract)
def get_full_company_profile(siren: str):
    return company_full_profile(siren)
