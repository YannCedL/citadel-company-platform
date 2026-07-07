# moteur principal de la plateforme CITADEL combinant les 4 moteurs de la tranche Corporate

from datetime import datetime, timezone
from genesis_core import ResultContract, Evidence, EpistemicStatus
from argus_company_research.client import search_company
from ariadne_corporate_graph.graph import build_company_graph
from chamber_executive_network.search import search_executives
from mercury_financial_intel.parser import get_financials

def company_full_profile(siren_or_name: str) -> ResultContract:
    # orchestre l'interrogation d'argus, ariadne, chamber et mercury pour produire un profil 360
    now_iso = datetime.now(timezone.utc).isoformat()
    contract = ResultContract(engine_version="1.0.0", observed_at=now_iso)
    
    # 1. Profil legal via Argus
    argus_res = search_company(siren_or_name)
    company_info = argus_res.result
    clean_siren = company_info.get("siren") or siren_or_name
    
    # 2. Graphe d'actionnariat via Ariadne
    ariadne_res = build_company_graph(clean_siren)
    graph_info = ariadne_res.result
    
    # 3. Dirigeants via Chamber
    chamber_res = search_executives(clean_siren)
    execs_info = chamber_res.result
    
    # 4. Finances via Mercury
    mercury_res = get_financials(clean_siren)
    financials_info = mercury_res.result
    
    # Fusion dans la fiche 360
    contract.result = {
        "siren": clean_siren,
        "name": company_info.get("name"),
        "legal_profile": company_info,
        "ownership_graph": graph_info,
        "executives": execs_info.get("executives", []),
        "financials": financials_info,
        "engines_used": ["argus", "ariadne", "chamber", "mercury"],
        "status": "profil_360_complet"
    }
    
    # Consolidation de toutes les preuves
    for ev in argus_res.evidence + ariadne_res.evidence + chamber_res.evidence + mercury_res.evidence:
        contract.add_evidence(ev)
        
    return contract
