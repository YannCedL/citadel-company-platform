"""
Temporal validity metadata wrapper for point-in-time historical reconstruction.
"""

from typing import Generic, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")

class TemporalValidity(BaseModel, Generic[T]):
    data: T = Field(..., description="Target data object")
    valid_from: Optional[str] = Field(None, description="ISO timestamp from which data is valid")
    valid_to: Optional[str] = Field(None, description="ISO timestamp until which data is valid (None = current)")
    recorded_at: str = Field(..., description="ISO timestamp when recorded into system")
