# test d'agregation 360 de la plateforme Citadel
from citadel_company_platform.engine import company_full_profile

def test_profil_360_entreprise():
    contract = company_full_profile("airbus")
    assert contract is not None
    assert contract.result["name"] is not None
    assert contract.result["ownership_graph"]["total_nodes"] >= 1
    assert len(contract.result["executives"]) >= 1
    assert contract.result["financials"]["balance_sheet"]["revenue"] > 0
    assert len(contract.evidence) >= 4
