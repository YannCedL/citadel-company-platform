from fastapi import FastAPI
from genesis_core import ResultContract
from .engine import company_full_profile

app = FastAPI(title="Citadel Company Platform API", version="1.0.0")

@app.get("/health")
def health():
    return {"status": "ok", "engine": "Citadel"}

@app.get("/api/v1/company/{siren}", response_model=ResultContract)
def full_profile(siren: str):
    return company_full_profile(siren)
