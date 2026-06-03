from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, Field
from app.models.enums import MessageStatus

# Valid message sequence types
MessageType = Literal["cold_outreach", "followup_1", "followup_2", "final_followup"]

# Valid outreach message status literals (sourced from MessageStatus enum)
OutreachMessageStatus = Literal[
    "draft", "generated", "edited", "approved", "sent", "failed", "replied"
]


# =============================================================================
# Input Schemas
# =============================================================================

class GenerateEmailRequest(BaseModel):
    """Input payload when requesting AI email generation for a lead."""
    campaign_id: int = Field(..., description="Campaign to associate this message with")
    message_type: MessageType = Field(
        "cold_outreach",
        description="Sequence position: cold_outreach, followup_1, followup_2, final_followup"
    )


# =============================================================================
# OpenAI Structured Output Schema
# =============================================================================

class GeneratedEmailContent(BaseModel):
    """
    Pydantic schema used as the structured output contract with OpenAI.
    All fields are required to be returned by the model.
    """
    subject: str = Field(..., description="Concise, engaging email subject line")
    body: str = Field(..., description="Professional email body under 150 words")
    cta: str = Field(..., description="Clear call-to-action sentence")


# =============================================================================
# Update Schema (for PATCH /outreach-messages/{id})
# =============================================================================

class OutreachMessageUpdate(BaseModel):
    """
    Partial update schema for human editing of a generated message.
    Editing any content field transitions status to 'edited'.
    """
    subject: Optional[str] = Field(None, description="Override generated subject line")
    body: Optional[str] = Field(None, description="Override generated body text")
    cta: Optional[str] = Field(None, description="Override generated call-to-action")
    review_notes: Optional[str] = Field(None, description="Reviewer notes or comments")


# =============================================================================
# Response Schemas
# =============================================================================

class OutreachMessageResponse(BaseModel):
    """Full outreach message response for API consumers."""
    id: int
    lead_id: int
    campaign_id: int
    message_type: str
    subject: str
    body: str
    cta: str
    generated_by: str
    model_name: str
    status: str
    review_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ApproveMessageRequest(BaseModel):
    """Optional payload for approving a message (may include reviewer notes)."""
    review_notes: Optional[str] = Field(None, description="Optional approval notes")


class RejectMessageRequest(BaseModel):
    """Payload for rejecting a message with a reason."""
    review_notes: Optional[str] = Field(None, description="Reason for rejection")
