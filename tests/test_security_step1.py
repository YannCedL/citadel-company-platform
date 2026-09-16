# Tests Unitaires — Étape 1 : Blindage de Sécurité CITADEL 360°
import pytest
from fastapi import HTTPException
from citadel_company_platform.security.sanitizer import normalize_and_sanitize, validate_siren

def test_sanitizer_normal_query():
    assert normalize_and_sanitize("  decathlon  ") == "decathlon"
    assert normalize_and_sanitize("Danone France") == "Danone France"

def test_sanitizer_nfkc_homoglyphs():
    # Test caractère plein largeur Unicode (Fullwidth 'A' -> 'A')
    fullwidth_a = "\uff21irbus"
    assert normalize_and_sanitize(fullwidth_a) == "Airbus"

def test_sanitizer_rejects_injection_characters():
    with pytest.raises(HTTPException) as exc1:
        normalize_and_sanitize("<script>alert(1)</script>")
    assert exc1.value.status_code == 400

    with pytest.raises(HTTPException) as exc2:
        normalize_and_sanitize("Danone' OR '1'='1")
    assert exc2.value.status_code == 400

    with pytest.raises(HTTPException) as exc3:
        normalize_and_sanitize("Total; DROP TABLE")
    assert exc3.value.status_code == 400

def test_sanitizer_rejects_overlong_query():
    long_str = "A" * 85
    with pytest.raises(HTTPException) as exc:
        normalize_and_sanitize(long_str)
    assert exc.value.status_code == 400
    assert "trop longue" in exc.value.detail

def test_validate_siren_clean():
    assert validate_siren("306138900") == "306138900"
    assert validate_siren(" 306 138 900 ") == "306138900"
    assert validate_siren("306-138-900") == "306138900"

def test_validate_siren_invalid_format():
    with pytest.raises(HTTPException) as exc1:
        validate_siren("12345")
    assert exc1.value.status_code == 400

    with pytest.raises(HTTPException) as exc2:
        validate_siren("abcdefghi")
    assert exc2.value.status_code == 400
