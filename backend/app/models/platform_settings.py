from typing import Optional
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class PlatformSettings(Base):
    """
    Global singleton configuration for the catering restaurant / outreach platform.

    Represents the restaurant identity, sender details, and messaging defaults
    used to personalise AI-generated outreach emails platform-wide.

    MVP design: exactly ONE record is expected in this table.

    Future-ready: a `restaurant_id` foreign key can be added here to support
    multi-restaurant / multi-brand deployments without schema redesign.
    """

    # -------------------------------------------------------------------------
    # Restaurant Identity
    # -------------------------------------------------------------------------
    restaurant_name: Mapped[str] = mapped_column(
        String(255), nullable=False,
        doc="Legal trading name of the catering restaurant."
    )
    restaurant_location: Mapped[str] = mapped_column(
        String(255), nullable=False,
        doc="City, area or address used to establish local credibility in emails."
    )

    # -------------------------------------------------------------------------
    # Sender Identity
    # -------------------------------------------------------------------------
    sender_name: Mapped[str] = mapped_column(
        String(255), nullable=False,
        doc="Full name of the person whose identity signs all outreach emails."
    )
    reply_email: Mapped[str] = mapped_column(
        String(255), nullable=False,
        doc="Reply-to email address that leads should respond to."
    )

    # -------------------------------------------------------------------------
    # Messaging Defaults
    # -------------------------------------------------------------------------
    offer: Mapped[str] = mapped_column(
        Text, nullable=False,
        doc="Core value proposition included in all outreach (e.g. 'corporate catering packages')."
    )
    call_to_action: Mapped[str] = mapped_column(
        Text, nullable=False,
        doc="Default CTA injected at the end of every email (e.g. 'Schedule a free tasting')."
    )
    brand_voice: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True,
        doc="Optional tone / persona guidance for the AI (e.g. 'Friendly and professional, never pushy')."
    )
