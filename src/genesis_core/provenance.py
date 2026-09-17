# track where data comes from
"""
Provenance metadata tracking schema.
"""

from typing import Optional
from pydantic import BaseModel, Field

class Provenance(BaseModel):
    source_id: str = Field(..., description="Unique source identifier or URL")
    source_type: str = Field(..., description="Type of source: official_registry, public_api, news, document, etc.")
    collection_date: str = Field(..., description="ISO timestamp when collected")
    publication_date: Optional[str] = Field(None, description="ISO timestamp when published by source")
    method: str = Field(default="api_request", description="Collection method used")
    license_status: str = Field(default="public_domain", description="Legal license or usage status")
    transformation_applied: Optional[str] = Field(None, description="Description of any transformations applied")
    model_version: Optional[str] = Field(None, description="ML/LLM model version if model-backed")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)

