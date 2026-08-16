# Moteur d'Agrégation Asynchrone Enterprise/OSINT pour CITADEL PLATFORM (Hub 1)
# Résolution stricte du SIREN, Enrichissement Réel des Entités Liées, Cache LRU Unifié & Double Schéma

import asyncio
import time
import re
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from genesis_core import ResultContract, Evidence, EpistemicStatus

from argus_company_research.client import search_company_async
from ariadne_corporate_graph.graph import build_company_graph_async
from chamber_executive_network.search import search_executives_async
from mercury_financial_intel.parser import get_financials_async
from raven_corporate_monitor.watcher import watch_company_async

logger = logging.getLogger(__name__)

CACHE_TTL_SECONDS = 3600  # 1 heure
MAX_CACHE_ENTRIES = 1000  # Jusqu'à 1000 profils 360° en mémoire
_MEMORY_CACHE: Dict[str, Dict[str, Any]] = {}

def extract_siren_key(siren_or_key: str) -> Optional[str]:
    """ Extrait un numéro SIREN officiel propre à 9 chiffres si valide """
    if not siren_or_key:
        return None
    cleaned = re.sub(r'\s+', '', siren_or_key.strip())
    if re.match(r'^\d{9}$', cleaned):
        return cleaned
    return None

def get_cached_profile(siren_or_key: str) -> Optional[ResultContract]:
    """ Récupère un profil en cache in-memory STRICTEMENT indexé par SIREN """
    siren = extract_siren_key(siren_or_key)
    if not siren:
        return None
    if siren in _MEMORY_CACHE:
        entry = _MEMORY_CACHE[siren]
        if time.time() - entry["timestamp"] < CACHE_TTL_SECONDS:
            return entry["contract"]
        else:
            del _MEMORY_CACHE[siren]
    return None

def set_cached_profile(siren_or_key: str, contract: ResultContract):
    """ Enregistre un profil en cache in-memory avec éviction LRU, STRICTEMENT indexé par SIREN """
    siren = extract_siren_key(siren_or_key)
    if not siren:
        # Sécurité Zéro Poisoning : Ne jamais insérer de chaîne textuelle libre dans le cache 360°
        return
    if len(_MEMORY_CACHE) >= MAX_CACHE_ENTRIES:
        oldest_key = min(_MEMORY_CACHE.keys(), key=lambda k: _MEMORY_CACHE[k]["timestamp"])
        del _MEMORY_CACHE[oldest_key]
    _MEMORY_CACHE[siren] = {
        "contract": contract,
        "timestamp": time.time()
    }

def clear_engine_cache():
    """ Purge intégrale du cache de la plateforme """
    _MEMORY_CACHE.clear()

async def company_full_profile_async(
    siren_or_name: str, 
    force_refresh: bool = False,
    enrich_linked_financials: bool = False
) -> ResultContract:
    """
    Orchestrateur Asynchrone 360° Résilient de Niveau Production :
    1. Vérification rapide du cache si la requête est un SIREN officiel.
    2. Résout la requête auprès d'Argus pour certifier le SIREN officiel d'État (Zéro Collision Homonymes).
    3. Lance les 4 autres microservices en parallèle via asyncio.gather avec return_exceptions=True (Dégradation gracieuse).
    4. Lazy Loading des personnes morales liées (enrich_linked_financials=False par défaut pour éradiquer l'effet N+1).
    5. Construit la Master Timeline chronologique, documente engines_status et renvoie le double schéma.
    6. Indexe le profil STRICTEMENT sous le SIREN d'État (Zéro Empoisonnement de Cache).
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    raw_query = siren_or_name.strip()
    direct_siren = extract_siren_key(raw_query)

    # 1. Vérification immédiate du cache si la requête est déjà un SIREN valide
    if direct_siren and not force_refresh:
        cached_contract = get_cached_profile(direct_siren)
        if cached_contract:
            return cached_contract

    # 2. Résolution certifiée de l'identité et du SIREN officiel via Argus
    argus_res = await search_company_async(raw_query)
    company_info = argus_res.result or {}

    clean_siren = company_info.get("siren")
    if not clean_siren or not re.match(r'^\d{9}$', str(clean_siren)):
        match = re.search(r'\b\d{9}\b', raw_query.replace(" ", ""))
        if match:
            clean_siren = match.group(0)
        else:
            clean_siren = raw_query

    # Si le SIREN a été résolu par ARGUS, vérifier si le profil 360° est déjà en cache
    if clean_siren and re.match(r'^\d{9}$', str(clean_siren)) and not force_refresh:
        cached_contract = get_cached_profile(clean_siren)
        if cached_contract:
            return cached_contract

    # 3. Interrogation asynchrone concurrente et résiliente des 4 autres microservices (return_exceptions=True)
    ariadne_task = asyncio.create_task(build_company_graph_async(clean_siren))
    chamber_task = asyncio.create_task(search_executives_async(clean_siren))
    mercury_task = asyncio.create_task(get_financials_async(clean_siren))
    raven_task = asyncio.create_task(watch_company_async(clean_siren))

    gathered_results = await asyncio.gather(
        ariadne_task, chamber_task, mercury_task, raven_task,
        return_exceptions=True
    )
    ariadne_res, chamber_res, mercury_res, raven_res = gathered_results

    engines_status: Dict[str, str] = {
        "argus": "OK" if company_info else "DEGRADED"
    }

    # Traitement avec Dégradation Gracieuse de chaque moteur
    if isinstance(ariadne_res, ResultContract) and ariadne_res.result:
        graph_info = ariadne_res.result
        engines_status["ariadne"] = "OK"
    else:
        logger.warning("Dégradation gracieuse : échec d'Ariadne pour %s: %s", clean_siren, ariadne_res)
        graph_info = {"siren": clean_siren, "total_nodes": 0, "nodes": [], "edges": [], "error": str(ariadne_res)}
        engines_status["ariadne"] = "DEGRADED"

    if isinstance(chamber_res, ResultContract) and chamber_res.result:
        execs_info = chamber_res.result
        engines_status["chamber"] = "OK"
    else:
        logger.warning("Dégradation gracieuse : échec de Chamber pour %s: %s", clean_siren, chamber_res)
        execs_info = {"company_siren": clean_siren, "executives": [], "total_executives": 0, "error": str(chamber_res)}
        engines_status["chamber"] = "DEGRADED"

    if isinstance(mercury_res, ResultContract) and mercury_res.result:
        financials_info = mercury_res.result
        engines_status["mercury"] = "OK"
    else:
        logger.warning("Dégradation gracieuse : échec de Mercury pour %s: %s", clean_siren, mercury_res)
        financials_info = {"company_siren": clean_siren, "financials_published": False, "error": str(mercury_res)}
        engines_status["mercury"] = "DEGRADED"

    if isinstance(raven_res, ResultContract) and raven_res.result:
        raven_info = raven_res.result
        engines_status["raven"] = "OK"
    else:
        logger.warning("Dégradation gracieuse : échec de Raven pour %s: %s", clean_siren, raven_res)
        raven_info = {"siren": clean_siren, "events": [], "total_alerts": 0, "error": str(raven_res)}
        engines_status["raven"] = "DEGRADED"

    # 4. Lazy Loading : Enrichissement Financier des Personnes Morales Liées uniquement si demandé
    # Éradication du problème N+1 : par défaut, le chargement différé côté frontend préserve les quotas d'API
    if enrich_linked_financials:
        linked_sirens = set()
        for exec_item in execs_info.get("executives", []):
            s_ent = exec_item.get("siren_entity")
            if s_ent and re.match(r'^\d{9}$', str(s_ent)) and str(s_ent) != str(clean_siren):
                linked_sirens.add(str(s_ent))

        for n in graph_info.get("nodes", []):
            n_s = n.get("siren")
            if n_s and re.match(r'^\d{9}$', str(n_s)) and str(n_s) != str(clean_siren):
                linked_sirens.add(str(n_s))

        target_linked_sirens = list(linked_sirens)[:5]
        if target_linked_sirens:
            try:
                linked_fin_tasks = [get_financials_async(s) for s in target_linked_sirens]
                linked_fin_results = await asyncio.gather(*linked_fin_tasks, return_exceptions=True)
                fin_map = {}
                for s, res in zip(target_linked_sirens, linked_fin_results):
                    if isinstance(res, ResultContract) and res.result:
                        fin_map[s] = res.result

                for exec_item in execs_info.get("executives", []):
                    s_ent = str(exec_item.get("siren_entity") or "")
                    if s_ent in fin_map:
                        exec_item["financial_profile"] = {
                            "siren": s_ent,
                            "financials_published": fin_map[s_ent].get("financials_published", False),
                            "latest_balance_sheet": fin_map[s_ent].get("latest_balance_sheet"),
                            "altman_z_score": fin_map[s_ent].get("ratios", {}).get("altman_z_score"),
                            "altman_status": fin_map[s_ent].get("ratios", {}).get("altman_status", "N/D")
                        }
            except Exception as exc:
                logger.warning("Information: Erreur lors de l'enrichissement des entités liées: %s", exc)

    # 5. Fusion de la Frise Chronologique Master 360°
    master_timeline_by_year: Dict[str, Dict[str, Any]] = {}

    def get_or_create_year_entry(y_key: str):
        if y_key not in master_timeline_by_year:
            master_timeline_by_year[y_key] = {
                "year": y_key, "milestones": [], "governance_events": [],
                "legal_notices": [], "network_establishments": [], "financial_statements": []
            }
        return master_timeline_by_year[y_key]

    creation_date = company_info.get("registration_date") or graph_info.get("root_node", {}).get("creation_date")
    if creation_date:
        creation_year = str(creation_date.split("-")[0])
        get_or_create_year_entry(creation_year)["milestones"].append({
            "date": creation_date, "event": f"Immatriculation officielle SIREN {clean_siren}"
        })

    for y_str, list_data in (company_info.get("yearly_establishment_timeline") or graph_info.get("yearly_network_expansion") or {}).items():
        if isinstance(list_data, list):
            get_or_create_year_entry(y_str)["network_establishments"].extend(list_data)

    for y_str, list_data in (execs_info.get("yearly_governance_history") or {}).items():
        if isinstance(list_data, list):
            get_or_create_year_entry(y_str)["governance_events"].extend(list_data)

    for y_str, list_data in (raven_info.get("yearly_legal_notices_history") or {}).items():
        if isinstance(list_data, list):
            get_or_create_year_entry(y_str)["legal_notices"].extend(list_data)

    for y_str, fin_data in (financials_info.get("yearly_financial_timeline") or {}).items():
        get_or_create_year_entry(y_str)["financial_statements"].append(fin_data)

    sorted_years = sorted(master_timeline_by_year.keys(), key=lambda k: (k == "Non daté", k), reverse=True)

    contract = ResultContract(engine_version="2.0.0_enterprise_async", observed_at=now_iso)
    contract.result = {
        "siren": clean_siren,
        "name": company_info.get("name") or graph_info.get("root_name") or siren_or_name,
        "company_name": company_info.get("name") or graph_info.get("root_name") or siren_or_name,
        "date_creation_origine": creation_date,
        "age_in_years": company_info.get("age_in_years"),
        "engines_used": ["argus", "ariadne", "chamber", "mercury", "raven"],
        "engines_status": engines_status,
        # Schéma direct (templates/index.html & API REST)
        "legal_profile": company_info,
        "ownership_graph": graph_info,
        "executives": execs_info.get("executives", []),
        "financials": financials_info,
        "legal_monitor_events": raven_info.get("events", []),
        "master_360_chronological_timeline": master_timeline_by_year,
        "chronological_years_covered": sorted_years,
        "total_years_tracked": len(sorted_years),
        # Schéma structuré (frontend/src/App.vue)
        "profile": {
            "argus": company_info,
            "ariadne": graph_info,
            "chamber": {"executives": execs_info.get("executives", [])},
            "mercury": financials_info,
            "raven": {"events": raven_info.get("events", [])}
        }
    }

    all_evidences = []
    for res_obj in [argus_res, ariadne_res, chamber_res, mercury_res, raven_res]:
        if isinstance(res_obj, ResultContract):
            all_evidences.extend(res_obj.evidence)

    for ev in all_evidences:
        contract.add_evidence(ev)

    # 6. Indexation STRICTEMENT par numéro SIREN d'État (Zéro Poisoning & Zéro Cache Dégradé)
    if clean_siren and re.match(r'^\d{9}$', str(clean_siren)) and company_info.get("name"):
        set_cached_profile(clean_siren, contract)

    return contract

async def compare_companies_async(sirens_or_names: List[str]) -> ResultContract:
    """ Service BI de Comparaison Financière Multi-Entreprises en Parallèle """
    now_iso = datetime.now(timezone.utc).isoformat()
    contract = ResultContract(engine_version="2.0.0_bi_comparison", observed_at=now_iso)

    tasks = [get_financials_async(target) for target in sirens_or_names if target.strip()]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    comparison_matrix = []
    for target_query, res in zip(sirens_or_names, results):
        if isinstance(res, ResultContract) and res.result:
            fin = res.result
            latest_bs = fin.get("latest_balance_sheet") or {}
            ratios = fin.get("ratios") or {}
            comparison_matrix.append({
                "query": target_query,
                "siren": fin.get("company_siren"),
                "name": fin.get("company_name", target_query),
                "financials_published": fin.get("financials_published", False),
                "latest_year": latest_bs.get("year"),
                "revenue": latest_bs.get("revenue"),
                "net_income": latest_bs.get("net_income"),
                "total_assets": latest_bs.get("total_assets"),
                "equity": latest_bs.get("equity"),
                "altman_z_score": ratios.get("altman_z_score"),
                "altman_status": ratios.get("altman_status", "N/D"),
                "timeline_5y": fin.get("yearly_financial_timeline", {})
            })
            for ev in res.evidence:
                contract.add_evidence(ev)
        else:
            comparison_matrix.append({
                "query": target_query,
                "siren": target_query,
                "name": target_query,
                "financials_published": False,
                "error": str(res) if res else "Données indisponibles"
            })

    contract.result = {
        "total_compared": len(comparison_matrix),
        "sirens_queries": sirens_or_names,
        "comparison_matrix": comparison_matrix
    }
    return contract

def compare_companies(sirens_or_names: List[str]) -> ResultContract:
    """ Wrapper synchrone sécurisé pour compare_companies_async """
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            return executor.submit(asyncio.run, compare_companies_async(sirens_or_names)).result()
    return asyncio.run(compare_companies_async(sirens_or_names))

def company_full_profile(
    siren_or_name: str, 
    force_refresh: bool = False, 
    enrich_linked_financials: bool = False
) -> ResultContract:
    """ Wrapper synchrone sécurisé pour company_full_profile_async """
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            return executor.submit(
                asyncio.run, 
                company_full_profile_async(siren_or_name, force_refresh, enrich_linked_financials)
            ).result()
    return asyncio.run(company_full_profile_async(siren_or_name, force_refresh, enrich_linked_financials))

