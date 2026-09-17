# contradiction preserved, never deleted
"""
Contradiction and Preserved Claim models.
Ensures conflicting claims from multiple sources are preserved, never silently deleted.
"""

from typing import Any, List, Optional
from pydantic import BaseModel, Field
from .epistemology import EpistemicStatus

class Claim(BaseModel):
    claim_id: str = Field(..., description="Unique claim identifier")
    subject: str = Field(..., description="Subject of the claim")
    predicate: str = Field(..., description="Attribute being claimed")
    value: Any = Field(..., description="Value claimed")
    source: str = Field(..., description="Source of the claim")
    timestamp: str = Field(..., description="Observation timestamp")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    status: EpistemicStatus = Field(default=EpistemicStatus.OBSERVATION)

class PreservedContradiction(BaseModel):
    contradiction_id: str = Field(..., description="Unique contradiction identifier")
    subject: str = Field(..., description="Subject with conflicting data")
    predicate: str = Field(..., description="Attribute in dispute")
    claims: List[Claim] = Field(..., min_length=2, description="List of conflicting claims")
    resolved: bool = Field(default=False, description="Whether contradiction has been resolved")
    resolution_notes: Optional[str] = Field(None, description="Explanation if resolved")


def verifier_contradictions(claims: List[Claim]) -> List[PreservedContradiction]:
    # fonction simple pour trouver si 2 sources disent pas la meme chose
    contradictions = []
    # grouper par sujet et attribut
    groupes = {}
    for c in claims:
        cle = f"{c.subject}:{c.predicate}"
        if cle not in groupes:
            groupes[cle] = []
        groupes[cle].append(c)
    
    # si les valeurs different pour la meme cle, c'est une contradiction
    compteur = 1
    for cle, liste_claims in groupes.items():
        if len(liste_claims) >= 2:
            premiere_valeur = liste_claims[0].value
            a_desaccord = any(c.value != premiere_valeur for c in liste_claims)
            if a_desaccord:
                sujet, attribut = cle.split(":", 1)
                contradictions.append(PreservedContradiction(
                    contradiction_id=f"contra_{compteur:03d}",
                    subject=sujet,
                    predicate=attribut,
                    claims=liste_claims,
                    resolved=False
                ))
                compteur += 1

    return contradictions


