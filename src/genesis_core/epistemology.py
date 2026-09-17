# added more details
"""
Epistemological categorization and standard result contract.
Enforces strict distinction between FACT, OBSERVATION, CORRELATION, INFERENCE, and HYPOTHESIS.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class EpistemicStatus(str, Enum):
    FACT = "fact"
    OBSERVATION = "observation"
    CORRELATION = "correlation"
    INFERENCE = "inference"
    HYPOTHESIS = "hypothesis"

class Evidence(BaseModel):
    subject: str = Field(..., description="Subject or entity ID")
    predicate: str = Field(..., description="Attribute or relationship type")
    value: Any = Field(..., description="Value or target object")
    source: str = Field(..., description="Source name or URL")
    observed_at: str = Field(..., description="ISO timestamp of observation")
    collection_method: str = Field(default="api", description="Method used to collect data")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    status: EpistemicStatus = Field(..., description="Epistemic status of this evidence")

class ResultContract(BaseModel):
    """
    Standard Result Contract specified in 00_MASTER_CONTEXT.md:
    {
      "result": {},
      "evidence": [],
      "sources": [],
      "confidence": 0.0,
      "observed_at": "",
      "processed_at": "",
      "engine_version": ""
    }
    """
    result: Dict[str, Any] = Field(default_factory=dict, description="Structured result data")
    evidence: List[Evidence] = Field(default_factory=list, description="List of supporting evidence items")
    sources: List[str] = Field(default_factory=list, description="Unique source URLs or identifiers")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Overall result confidence")
    observed_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    processed_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    engine_version: str = Field(default="1.0.0", description="Engine version string")

    def add_evidence(self, item: Evidence) -> None:
        # ajoute une preuve si elle y est pas deja
        self.evidence.append(item)
        if item.source not in self.sources:
            self.sources.append(item.source)
        # met a jour la confiance globale basique
        self.recalculer_confiance()

    def recalculer_confiance(self) -> float:
        # calcule la moyenne des confiances des preuves
        if not self.evidence:
            return self.confidence
        total = sum(e.confidence for e in self.evidence)
        self.confidence = round(total / len(self.evidence), 2)
        return self.confidence

    def convertir_en_dict(self) -> Dict[str, Any]:
        # permet de recuperer facilement les donnees sous forme de dictionnaire
        return self.model_dump()

