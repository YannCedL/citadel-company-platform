# Tests automatisés d'agrégation 360° de la plateforme Citadel (Hub 1)
# Règle Zéro Fake Data : 100% Réel, Double Schéma Direct + Profile, Cache LRU Unifié

import pytest
from citadel_company_platform.engine import (
    company_full_profile,
    get_cached_profile,
    clear_engine_cache,
    _MEMORY_CACHE
)

def test_profil_360_decathlon_dual_schema():
    """
    Vérifie l'orchestration 360° complète sur Decathlon et la disponibilité
    du double schéma (direct pour index.html + conteneur profile pour Vue 3 SFC).
    """
    contract = company_full_profile("306138900")
    assert contract is not None
    res = contract.result
    assert res is not None
    assert res["siren"] == "306138900"
    assert "DECATHLON" in res["name"].upper()

    # Vérification des 5 moteurs
    assert set(res["engines_used"]) == {"argus", "ariadne", "chamber", "mercury", "raven"}

    # Schéma direct (templates/index.html & API REST)
    assert "legal_profile" in res
    assert "ownership_graph" in res
    assert "executives" in res
    assert "financials" in res
    assert "legal_monitor_events" in res
    assert "master_360_chronological_timeline" in res

    # Schéma structuré (frontend/src/App.vue)
    assert "profile" in res
    prof = res["profile"]
    assert "argus" in prof
    assert "ariadne" in prof
    assert "chamber" in prof
    assert "mercury" in prof
    assert "raven" in prof

    # Preuves épistémiques multi-moteurs
    assert len(contract.evidence) >= 4
    assert contract.confidence > 0.8

def test_unified_cache_and_clear():
    """ Vérifie le fonctionnement du cache LRU unifié et de la purge """
    clear_engine_cache()
    assert len(_MEMORY_CACHE) == 0

    # Première requête : peuple le cache
    contract = company_full_profile("306138900")
    assert len(_MEMORY_CACHE) >= 1
    cached = get_cached_profile("306138900")
    assert cached is not None
    assert cached.result["siren"] == "306138900"

    # Purge
    clear_engine_cache()
    assert len(_MEMORY_CACHE) == 0
    assert get_cached_profile("306138900") is None

def test_airbus_resolution_zero_nike_bias():
    """
    Vérifie qu'Airbus n'est plus pollué par le SIREN ou les données de Nike Retail B.V.
    """
    contract = company_full_profile("airbus")
    assert contract is not None
    res = contract.result
    assert "AIRBUS" in res["name"].upper()
    assert "NIKE" not in res["name"].upper()
    assert len(contract.evidence) >= 3

@pytest.mark.parametrize("query,expected_siren,expected_name_substr", [
    ("542039532", "542039532", "SAINT-GOBAIN"),
    ("572076396", "572076396", "HERMES"),
    ("491904546", "491904546", "COMUTO"),
])
def test_citadel_360_panel_diversifie(query, expected_siren, expected_name_substr):
    contract = company_full_profile(query)
    assert contract is not None
    res = contract.result
    assert res["siren"] == expected_siren
    assert expected_name_substr in res["name"].upper()
    assert res["ownership_graph"]["total_nodes"] >= 1
    assert "profile" in res
    assert contract.confidence > 0.8

