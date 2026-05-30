from datetime import datetime, timezone
from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, mapped_column


class Base(DeclarativeBase):
    """
    SQLAlchemy 2.0 Base Class with production-grade conventions.
    Automatically assigns table names based on snake_case class names,
    and supports timezone-aware audit timestamps.
    """
    
    # Enable automatic snake_case table name generation
    @declared_attr.directive
    def __tablename__(cls) -> str:
        # Convert CamelCase class name to snake_case table name
        name = cls.__name__
        parts = []
        for i, char in enumerate(name):
            if char.isupper() and i > 0 and not name[i-1].isupper():
                parts.append("_")
            parts.append(char.lower())
        return "".join(parts)

    # Base attributes
    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc)
    )
    
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        default=lambda: datetime.now(timezone.utc)
    )
