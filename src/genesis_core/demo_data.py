"""
Genesis OSINT - Offline Demonstration Dataset
Provides fallback realistic data for offline presentations and instant demos.
"""

MOCK_COMPANIES = {
    "552032534": {
        "siren": "552032534",
        "siret": "55203253400850",
        "name": "TOTALENERGIES SE",
        "legal_form": "Société européenne",
        "address": "2 PL JEAN MILLIER 92400 COURBEVOIE",
        "activity_code": "70.10Z",
        "activity_label": "Activités des sièges sociaux",
        "executives": [
            {"name": "POUYANNE Patrick", "role": "Président-Directeur Général"},
            {"name": "GARCIA-NINET Hélène", "role": "Administrateur"}
        ],
        "solvency_score": 92.5,
        "revenue_m_eur": 237000,
    },
    "400394306": {
        "siren": "400394306",
        "siret": "40039430600019",
        "name": "LVMH MOET HENNESSY LOUIS VUITTON",
        "legal_form": "Société européenne",
        "address": "22 AV MONTAIGNE 75008 PARIS",
        "activity_code": "70.10Z",
        "activity_label": "Activités des sièges sociaux",
        "executives": [
            {"name": "ARNAULT Bernard", "role": "Président-Directeur Général"},
            {"name": "ARNAULT Delphine", "role": "Administrateur"}
        ],
        "solvency_score": 96.0,
        "revenue_m_eur": 86200,
    }
}

MOCK_AIRCRAFTS = [
    {
        "icao24": "39b1a0",
        "callsign": "AFR012",
        "origin_country": "France",
        "latitude": 48.8566,
        "longitude": 2.3522,
        "altitude_m": 10500,
        "velocity_kmh": 870
    },
    {
        "icao24": "39b1a1",
        "callsign": "TVF442",
        "origin_country": "France",
        "latitude": 43.6047,
        "longitude": 1.4442,
        "altitude_m": 8200,
        "velocity_kmh": 720
    }
]

def get_demo_company(siren: str):
    return MOCK_COMPANIES.get(siren, MOCK_COMPANIES["552032534"])

def get_demo_flights():
    return MOCK_AIRCRAFTS
