from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class PlatformSettingsBase(BaseModel):
    """Shared fields for the global platform settings record."""
    restaurant_name: str = Field(..., description="Legal trading name of the catering restaurant")
    restaurant_location: str = Field(..., description="City/area used for local credibility in emails")
    sender_name: str = Field(..., description="Full name of the person signing outreach emails")
    reply_email: str = Field(..., description="Reply-to address for lead responses")
    offer: str = Field(..., description="Core value proposition for outreach emails")
    call_to_action: str = Field(..., description="Default CTA (e.g. 'Schedule a free tasting')")
    brand_voice: Optional[str] = Field(
        None,
        description="AI tone guidance (e.g. 'Friendly and professional, never pushy')"
    )


class PlatformSettingsCreate(PlatformSettingsBase):
    """Input schema for initial platform settings creation."""
    pass


class PlatformSettingsUpdate(BaseModel):
    """Partial update schema — all fields optional for PATCH semantics."""
    restaurant_name: Optional[str] = Field(None)
    restaurant_location: Optional[str] = Field(None)
    sender_name: Optional[str] = Field(None)
    reply_email: Optional[str] = Field(None)
    offer: Optional[str] = Field(None)
    call_to_action: Optional[str] = Field(None)
    brand_voice: Optional[str] = Field(None)


class PlatformSettingsResponse(PlatformSettingsBase):
    """Full response including DB-assigned timestamps."""
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
