from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# =============================================================================
# Campaign Schemas
# =============================================================================

class CampaignBase(BaseModel):
    """Shared campaign fields used in create and response schemas."""
    name: str = Field(..., description="Human-readable campaign label")
    campaign_type: str = Field(..., description="Campaign category (e.g. 'cold_outreach')")
    target_business_type: str = Field(..., description="Target business vertical")
    offer: str = Field(..., description="Core value proposition for this campaign")
    status: str = Field("draft", description="Lifecycle status: draft, active, paused, completed, archived")


class CampaignCreate(CampaignBase):
    """Input schema for creating a new campaign."""
    pass


class CampaignUpdate(BaseModel):
    """Partial update schema for campaigns."""
    name: Optional[str] = Field(None)
    campaign_type: Optional[str] = Field(None)
    target_business_type: Optional[str] = Field(None)
    offer: Optional[str] = Field(None)
    status: Optional[str] = Field(None)


class CampaignResponse(CampaignBase):
    """Full campaign response including DB-assigned fields."""
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


