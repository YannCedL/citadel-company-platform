# Assainisseur d'Entrées — CITADEL 360° Security Layer
# Micro-Action 1.1 : Normalisation NFKC, Rejet Null-Bytes, Validation Longueur & Format SIREN
import re
import unicodedata
from fastapi import HTTPException

MAX_QUERY_LENGTH = 80
SIREN_PATTERN = re.compile(r"^\d{9}$")

_CONTROL_CHAR_RE = re.compile(
    r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f"
    r"\x80-\x9f"
    r"\u200b-\u200f"
    r"\u2028\u2029"
    r"\ufeff"
    r"\ufffc\ufffd]"
)

FORBIDDEN_CHARS = {'<', '>', '"', "'", '`', ';', '\\'}

def normalize_and_sanitize(query: str, field_name: str = "query") -> str:
    if not isinstance(query, str):
        raise HTTPException(
            status_code=400,
            detail=f"Parametre '{field_name}' invalide : chaine attendue."
        )
    normalized = unicodedata.normalize("NFKC", query)
    cleaned = _CONTROL_CHAR_RE.sub("", normalized)
    cleaned = " ".join(cleaned.split())

    if len(cleaned) > MAX_QUERY_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Requete trop longue ({len(cleaned)} caracteres). Maximum autorise : {MAX_QUERY_LENGTH} caracteres."
        )

    if any(c in FORBIDDEN_CHARS for c in cleaned):
        raise HTTPException(
            status_code=400,
            detail="Caracteres non autorises detectes dans la requete."
        )

    return cleaned

def validate_siren(siren: str) -> str:
    if not isinstance(siren, str):
        raise HTTPException(status_code=400, detail="SIREN invalide : chaine attendue.")

    cleaned = siren.strip().replace(" ", "").replace("-", "").replace(".", "")

    if not SIREN_PATTERN.match(cleaned):
        raise HTTPException(
            status_code=400,
            detail=f"Format SIREN invalide : '{siren}'. Un SIREN officiel doit comporter exactement 9 chiffres."
        )

    return cleaned
