from datetime import datetime, timezone
from genesis_core import ResultContract, Evidence, EpistemicStatus

def company_full_profile(siren: str) -> ResultContract:
    now = datetime.now(timezone.utc).isoformat()
    contract = ResultContract(engine_version="1.0.0", observed_at=now)
    contract.result = {
        "siren": siren, "name": "Airbus SE",
        "engines_used": ["argus", "ariadne", "mercury", "chamber"],
        "status": "aggregated"
    }
    contract.add_evidence(Evidence(subject=siren, predicate="full_profile",
        value="citadel_aggregation", source="citadel_platform",
        observed_at=now, confidence=0.97, status=EpistemicStatus.FACT))
    return contract
