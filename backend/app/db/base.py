# ==============================================================================
# Database Model Registry
# Import all database models here so Alembic migration scripts discover them.
# ==============================================================================

from app.models.base import Base  # noqa: F401
from app.models.lead import Lead  # noqa: F401
