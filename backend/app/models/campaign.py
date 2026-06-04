from typing import Optional
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Campaign(Base):
    """
    Represents an outreach campaign targeting a specific business type.
    Links to CampaignSettings for sender and offer configuration.
    """

    # Human-readable label for this campaign
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    # Categorization of this campaign (e.g. 'cold_outreach', 'followup')
    campaign_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    # The business vertical this campaign targets (e.g. 'Law offices')
    target_business_type: Mapped[str] = mapped_column(String(255), nullable=False, index=True)

    # Core value proposition being communicated to leads
    offer: Mapped[str] = mapped_column(Text, nullable=False)

    # Lifecycle status: draft, active, paused, completed, archived
    status: Mapped[str] = mapped_column(
        String(50), default="draft", nullable=False, index=True
    )

    # One-to-many: all outreach messages generated under this campaign
    outreach_messages: Mapped[list["LeadOutreachMessage"]] = relationship(  # type: ignore[name-defined]
        "LeadOutreachMessage",
        back_populates="campaign",
        cascade="all, delete-orphan"
    )

    # Many-to-many relationship with leads
    lead_assignments: Mapped[list["LeadCampaignAssignment"]] = relationship(
        "LeadCampaignAssignment", back_populates="campaign", cascade="all, delete-orphan"
    )


# Resolve forward reference for LeadOutreachMessage and LeadCampaignAssignment
from app.models.lead_outreach_message import LeadOutreachMessage  # noqa: E402, F401
from app.models.lead_campaign_assignment import LeadCampaignAssignment  # noqa: E402, F401
