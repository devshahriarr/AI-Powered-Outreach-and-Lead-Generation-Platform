from typing import Optional
from sqlalchemy import Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class Lead(Base):
    """
    SQLAlchemy Model representing a Lead acquired through Place discovery.
    Includes unique tracking parameters, geographic locations, and pipeline states.
    """

    # Unique Google Place Reference (Principal key for duplicate check logic)
    google_place_id: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )

    # Core Business Identifiers
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    business_type: Mapped[str] = mapped_column(String(100), index=True, nullable=False)

    # Physical Address
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Contact Details (Primary outreach channels)
    phone_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    email: Mapped[Optional[str]] = mapped_column(Text, index=True, nullable=True)

    # Business Ratings
    rating: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    user_ratings_total: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Geographic Coordinates
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Operational Outreach Pipeline State
    # discovered, contacted, replied, in_pipeline, converted, ignored
    status: Mapped[str] = mapped_column(
        String(50), default="discovered", index=True, nullable=False
    )

    # Operational remarks or system metadata notes
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
