# Tests de validation formelle des remédiations d'audit de CITADEL PLATFORM (Hub 1)
# Doctrine : "Zero Fake Data, Zero Hallucination, Evidence First"
# Valide :
# 1. Résilience distribuée : dégradation gracieuse sans crash 500 en cas de panne d'un moteur tiers
# 2. Sécurisation du cache LRU : indexation exclusive par SIREN, zéro empoisonnement par clé textuelle
# 3. Éradication de l'effet N+1 : Lazy Loading des personnes morales liées par défaut

import pytest
import asyncio
from unittest.mock import patch
import httpx
from citadel_company_platform.engine import (
    company_full_profile,
    company_full_profile_async,
    get_cached_profile,
    set_cached_profile,
    clear_engine_cache,
    _MEMORY_CACHE
)

def test_resilient_gather_graceful_degradation():
    """ Faille 2 : Vérifie que le Hub ne crashe pas si RAVEN subit un timeout ou une exception """
    clear_engine_cache()

    async def _run():
        async def mock_failing_raven(siren):
            raise httpx.ReadTimeout("BODACC Gateway Timeout 15s")

        async def mock_ok_chamber(siren):
            from genesis_core import ResultContract
            return ResultContract(
                engine_version="1.0.0",
                result={"company_siren": siren, "executives": [{"name": "MULLIEZ", "role": "Président"}], "total_executives": 1}
            )

        with patch("citadel_company_platform.engine.watch_company_async", side_effect=mock_failing_raven), \
             patch("citadel_company_platform.engine.search_executives_async", side_effect=mock_ok_chamber):
            contract = await company_full_profile_async("306138900", force_refresh=True)
            assert contract is not None
            res = contract.result
            assert res["siren"] == "306138900"
            
            # Vérifier le statut de dégradation gracieuse
            assert "engines_status" in res
            status = res["engines_status"]
            assert status["raven"] == "DEGRADED"
            assert status["argus"] == "OK"
            assert status["chamber"] == "OK"
            assert status["mercury"] == "OK"
            assert status["ariadne"] == "OK"

            # Les autres données sont intactes
            assert len(res["executives"]) > 0
            assert res["financials"] is not None

    asyncio.run(_run())

def test_cache_strictly_keyed_by_siren_zero_poisoning():
    """ Faille 3 : Vérifie que le cache 360° n'accepte QUE des clés SIREN officielles """
    clear_engine_cache()

    contract = company_full_profile("306138900")
    
    # 1. Le SIREN officiel est en cache
    cached_by_siren = get_cached_profile("306138900")
    assert cached_by_siren is not None
    assert cached_by_siren.result["siren"] == "306138900"

    # 2. Une clé textuelle brute ne doit JAMAIS exister dans le cache
    assert get_cached_profile("DECATHLON") is None
    assert get_cached_profile("MARTIN") is None

    # 3. Vérification directe dans le dictionnaire interne
    for key in _MEMORY_CACHE.keys():
        assert key.isdigit() and len(key) == 9, f"Clé non-SIREN illégale dans le cache : '{key}'"

def test_lazy_loading_prevents_n_plus_one_cascade():
    """ Faille 1 : Vérifie qu'aucun sous-lot récursif MERCURY n'est déclenché par défaut (Lazy Loading) """
    clear_engine_cache()

    # Appel par défaut : enrich_linked_financials=False
    contract = company_full_profile("306138900", force_refresh=True, enrich_linked_financials=False)
    res = contract.result
    
    # Vérifier que les personnes morales liées sont présentes nues sans sous-requête synchrone
    moral_execs = [e for e in res["executives"] if e.get("type_person") == "personne morale"]
    if moral_execs:
        # Le profil financier enrichi n'est pas chargé automatiquement pour préserver l'API
        assert "financial_profile" not in moral_execs[0]

def test_engines_status_reporting():
    """ Vérifie la traçabilité explicite du dictionnaire engines_status """
    contract = company_full_profile("306138900")
    res = contract.result
    assert "engines_status" in res
    status = res["engines_status"]
    assert set(status.keys()) == {"argus", "ariadne", "chamber", "mercury", "raven"}

def test_asset_stock_timeline_conservation_law():
    """ 
    Vérifie l'Équation Fondamentale de Conservation du Parc d'Actifs :
    Stock_N = Stock_{N-1} + Nouveaux_Sites_N - Fermetures_Totales_N - Relocalisations_N
    Valide qu'en 2008 la perte nette de 220 sites correspond exactement au pic de 225 fermetures.
    """
    contract = company_full_profile("306138900")
    nodes = contract.result.get("ownership_graph", {}).get("nodes", [])
    assert len(nodes) >= 380, "Doit contenir la moisson complète d'établissements"

    # Simulation de la fonction JavaScript isRelocationEstablishment
    def is_reloc(node, all_nodes):
        if not node or node.get("etat_administratif") != "F":
            return False
        details = node.get("details", {})
        if details.get("is_transfert") or details.get("is_relocation"):
            return True
        name_lower = (node.get("name") or "").lower()
        if "transfert" in name_lower or "déménagement" in name_lower:
            return True
        f_date = details.get("date_fermeture")
        if f_date and len(str(f_date)) >= 8:
            node_cp = str(details.get("code_postal") or "")
            node_dept = node_cp[:2] if len(node_cp) >= 2 else ""
            node_commune = str(details.get("commune") or "").lower().strip()
            for other in all_nodes:
                if other is node:
                    continue
                o_details = other.get("details", {})
                if o_details.get("date_creation") == f_date:
                    o_cp = str(o_details.get("code_postal") or "")
                    o_dept = o_cp[:2] if len(o_cp) >= 2 else ""
                    o_commune = str(o_details.get("commune") or "").lower().strip()
                    if (node_dept and o_dept == node_dept) or (node_commune and o_commune == node_commune):
                        return True
        return False

    years = list(range(1977, 2027))
    direct_stocks = []
    opens = []
    closes = []
    relocs = []

    for y in years:
        o, c, r, s = 0, 0, 0, 0
        for node in nodes:
            details = node.get("details", {})
            c_date = details.get("date_creation")
            f_date = details.get("date_fermeture")
            c_year = int(str(c_date)[:4]) if c_date and len(str(c_date)) >= 4 else node.get("creation_year")
            f_year = int(str(f_date)[:4]) if f_date and len(str(f_date)) >= 4 else node.get("fermeture_year")

            if c_year == y:
                o += 1
            if c_year and c_year <= y:
                if not f_year or f_year > y:
                    s += 1
            if f_year == y:
                if is_reloc(node, nodes):
                    r += 1
                else:
                    c += 1

        opens.append(o)
        closes.append(c)
        relocs.append(r)
        direct_stocks.append(s)

    # 1. Vérification de l'équation de conservation pour TOUTES les années
    for i in range(1, len(years)):
        y = years[i]
        delta_stock = direct_stocks[i] - direct_stocks[i - 1]
        flow = opens[i] - (closes[i] + relocs[i])
        assert delta_stock == flow, (
            f"Violation équation conservation en {y}: DeltaStock={delta_stock} vs Flow={flow} "
            f"(Stock {years[i-1]}={direct_stocks[i-1]}, Stock {y}={direct_stocks[i]}, "
            f"Opens={opens[i]}, Closes={closes[i]}, Relocs={relocs[i]})"
        )

    # 2. Vérification spécifique de la cassure 2008 (Anomalie de l'audit)
    idx_2007 = years.index(2007)
    idx_2008 = years.index(2008)

    stock_2007 = direct_stocks[idx_2007]
    stock_2008 = direct_stocks[idx_2008]
    closes_2008 = closes[idx_2008]
    opens_2008 = opens[idx_2008]
    relocs_2008 = relocs[idx_2008]

    # En 2008, 225 fermetures sèches doivent être constatées
    assert closes_2008 == 225, f"Doit identifier 225 fermetures fermes en 2008, obtenu {closes_2008}"
    assert relocs_2008 == 0, f"Zéro fausse relocalisation en 2008, obtenu {relocs_2008}"
    assert opens_2008 == 5, f"5 ouvertures en 2008, obtenu {opens_2008}"
    assert stock_2007 - stock_2008 == 220, f"Perte nette de stock = 220 (287 - 67), obtenu {stock_2007 - stock_2008}"
    assert stock_2008 == stock_2007 + opens_2008 - closes_2008 - relocs_2008
