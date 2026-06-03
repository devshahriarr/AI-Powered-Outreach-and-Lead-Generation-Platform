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


# =============================================================================
# CampaignSettings Schemas
# =============================================================================

class CampaignSettingsBase(BaseModel):
    """Shared fields for campaign sender/offer configuration."""
    restaurant_name: str = Field(..., description="Name of the catering restaurant")
    restaurant_location: str = Field(..., description="City or area of the restaurant")
    sender_name: str = Field(..., description="Name of the person sending outreach")
    reply_email: str = Field(..., description="Reply-to email address for responses")
    offer: str = Field(..., description="Specific offer highlighted in this campaign")
    call_to_action: str = Field(..., description="Desired CTA (e.g. 'Schedule a free tasting')")
    brand_voice: Optional[str] = Field(None, description="AI tone guidance for email generation")


class CampaignSettingsCreate(CampaignSettingsBase):
    """Input schema for creating campaign settings."""
    campaign_id: int = Field(..., description="Parent campaign ID")


class CampaignSettingsUpdate(BaseModel):
    """Partial update schema for campaign settings."""
    restaurant_name: Optional[str] = Field(None)
    restaurant_location: Optional[str] = Field(None)
    sender_name: Optional[str] = Field(None)
    reply_email: Optional[str] = Field(None)
    offer: Optional[str] = Field(None)
    call_to_action: Optional[str] = Field(None)


class CampaignSettingsResponse(CampaignSettingsBase):
    """Full campaign settings response."""
    id: int
    campaign_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
