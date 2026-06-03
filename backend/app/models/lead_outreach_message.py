from typing import Optional
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class LeadOutreachMessage(Base):
    """
    Stores AI-generated outreach email messages for a lead within a campaign.
    Tracks full generation context including the model used and lifecycle status.
    """

    # The target lead this message was written for
    lead_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("lead.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # The campaign this message belongs to
    campaign_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("campaign.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Sequence type: cold_outreach, followup_1, followup_2, final_followup
    message_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    # Generated email subject line
    subject: Mapped[str] = mapped_column(Text, nullable=False)

    # Full email body text
    body: Mapped[str] = mapped_column(Text, nullable=False)

    # Call-to-action extracted from generation
    cta: Mapped[str] = mapped_column(Text, nullable=False)

    # How the message was generated (e.g., 'openai')
    generated_by: Mapped[str] = mapped_column(String(100), nullable=False, default="openai")

    # OpenAI model name used (e.g., 'gpt-4o')
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)

    # Lifecycle: generated, approved, rejected, sent
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="generated", index=True
    )

    # Optional reviewer notes or rejection reason
    review_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ORM relationships
    lead: Mapped["Lead"] = relationship("Lead")  # type: ignore[name-defined]
    campaign: Mapped["Campaign"] = relationship(  # type: ignore[name-defined]
        "Campaign", back_populates="outreach_messages"
    )
