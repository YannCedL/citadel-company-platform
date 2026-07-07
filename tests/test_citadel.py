from citadel_company_platform import company_full_profile

def test_company_full_profile():
    c = company_full_profile("383474814")
    assert c.result["siren"] == "383474814"
    assert "argus" in c.result["engines_used"]
    assert c.confidence > 0.9
