"""
Genesis Core — Shared Epistemological & Provenance Models
"""

from .epistemology import EpistemicStatus, Evidence, ResultContract
from .provenance import Provenance
from .temporal import TemporalValidity
from .contradiction import Claim, PreservedContradiction, verifier_contradictions
from .inpi_client import InpiRneClient, inpi_client

__version__ = "1.0.0"

__all__ = [
    "EpistemicStatus",
    "Evidence",
    "ResultContract",
    "Provenance",
    "TemporalValidity",
    "Claim",
    "PreservedContradiction",
    "verifier_contradictions",
    "InpiRneClient",
    "inpi_client",
]


