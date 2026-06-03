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

    # One-to-one relationship to campaign-level sender/offer settings
    settings: Mapped[Optional["CampaignSettings"]] = relationship(
        "CampaignSettings",
        back_populates="campaign",
        uselist=False,
        cascade="all, delete-orphan"
    )

    # One-to-many: all outreach messages generated under this campaign
    outreach_messages: Mapped[list["LeadOutreachMessage"]] = relationship(  # type: ignore[name-defined]
        "LeadOutreachMessage",
        back_populates="campaign",
        cascade="all, delete-orphan"
    )


class CampaignSettings(Base):
    """
    Sender identity and messaging context for a Campaign.
    Provides the personalization tokens injected into AI-generated emails.
    """

    # Foreign key binding to parent campaign
    campaign_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("campaign.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )

    # Name of the catering restaurant making the outreach
    restaurant_name: Mapped[str] = mapped_column(String(255), nullable=False)

    # Location of the restaurant (used to establish local credibility)
    restaurant_location: Mapped[str] = mapped_column(String(255), nullable=False)

    # Name of the person sending the email
    sender_name: Mapped[str] = mapped_column(String(255), nullable=False)

    # Reply-to email address for responses
    reply_email: Mapped[str] = mapped_column(String(255), nullable=False)

    # The specific offer to highlight in the email body
    offer: Mapped[str] = mapped_column(Text, nullable=False)

    # Clear call-to-action (e.g. 'Schedule a free tasting')
    call_to_action: Mapped[str] = mapped_column(Text, nullable=False)

    # Optional tone guidance for AI generation (e.g. 'Friendly, professional, concise')
    brand_voice: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Back-reference to parent campaign
    campaign: Mapped["Campaign"] = relationship("Campaign", back_populates="settings")


# Resolve forward reference for LeadOutreachMessage
from app.models.lead_outreach_message import LeadOutreachMessage  # noqa: E402, F401
