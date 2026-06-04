from datetime import datetime, timezone
from sqlalchemy import ForeignKey, DateTime, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class LeadCampaignAssignment(Base):
    """
    Association model mapping Leads to Campaigns.
    """
    __tablename__ = "lead_campaign_assignments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    lead_id: Mapped[int] = mapped_column(ForeignKey("lead.id", ondelete="CASCADE"), nullable=False, index=True)
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaign.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())

    lead: Mapped["Lead"] = relationship("Lead", back_populates="campaign_assignments")
    campaign: Mapped["Campaign"] = relationship("Campaign", back_populates="lead_assignments")
