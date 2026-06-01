from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field


class LeadBase(BaseModel):
    """Base fields shared across both create and update operations."""
    name: str = Field(..., description="Legal name of the business")
    business_type: str = Field(..., description="Target business category (e.g. 'Law office')")
    address: Optional[str] = Field(None, description="Physical street address")
    phone_number: Optional[str] = Field(None, description="Contact phone number")
    website: Optional[str] = Field(None, description="Corporate website URL")
    email: Optional[str] = Field(None, description="Contact email for outreach")
    rating: Optional[float] = Field(None, description="Google Maps star rating")
    user_ratings_total: Optional[int] = Field(None, description="Total Google Maps review count")
    latitude: Optional[float] = Field(None, description="Physical latitude coordinates")
    longitude: Optional[float] = Field(None, description="Physical longitude coordinates")
    status: str = Field("discovered", description="Pipeline state of outreach workflow")
    notes: Optional[str] = Field(None, description="Operational notes or system log details")
    lead_score: int = Field(0, description="Score based on data quality")
    is_qualified: bool = Field(False, description="Whether the lead passed qualification")
    qualification_reason: Optional[str] = Field(None, description="Reason for qualification result")
    cleaned_email: Optional[str] = Field(None, description="Normalized email")
    cleaned_website: Optional[str] = Field(None, description="Normalized website")
    cleaned_phone: Optional[str] = Field(None, description="Normalized phone")
    review_status: Optional[str] = Field(None, description="Manual review status queue")


class LeadCreate(LeadBase):
    """Schema parsed when registering a newly discovered place lead."""
    google_place_id: str = Field(..., description="Unique Google Places identifier reference")


class LeadUpdate(BaseModel):
    """Schema parsing patch updates. All attributes are optional to support partial updates."""
    name: Optional[str] = Field(None)
    business_type: Optional[str] = Field(None)
    address: Optional[str] = Field(None)
    phone_number: Optional[str] = Field(None)
    website: Optional[str] = Field(None)
    email: Optional[str] = Field(None)
    rating: Optional[float] = Field(None)
    user_ratings_total: Optional[int] = Field(None)
    latitude: Optional[float] = Field(None)
    longitude: Optional[float] = Field(None)
    status: Optional[str] = Field(None)
    notes: Optional[str] = Field(None)
    lead_score: Optional[int] = Field(None)
    is_qualified: Optional[bool] = Field(None)
    qualification_reason: Optional[str] = Field(None)
    cleaned_email: Optional[str] = Field(None)
    cleaned_website: Optional[str] = Field(None)
    cleaned_phone: Optional[str] = Field(None)
    review_status: Optional[str] = Field(None)


class LeadResponse(LeadBase):
    """Schema serializing active Lead instances retrieved from DB."""
    id: int = Field(..., description="Internal SQL Primary Key ID")
    google_place_id: str = Field(..., description="Unique Google Place ID")
    created_at: datetime = Field(..., description="Time of discovery")
    updated_at: datetime = Field(..., description="Time of last modification")

    # Enable pydantic serialization of standard SQLAlchemy objects (formerly orm_mode)
    model_config = {
        "from_attributes": True
    }


class LeadDiscoverRequest(BaseModel):
    """Schema parsed when triggering a manual Google Places discovery session."""
    location: Optional[str] = Field(
        None, description="Target search location name (e.g. 'Banani, Dhaka, Bangladesh')"
    )
    radius_miles: Optional[float] = Field(
        None, description="Target search coverage radius in miles"
    )
    category: Optional[str] = Field(
        None, description="Target business category (e.g., 'Law offices')"
    )

class LeadQualifyResponse(BaseModel):
    """Response schema for the qualify endpoint."""
    processed: int
    qualified: int
    rejected: int
    review_required: int
