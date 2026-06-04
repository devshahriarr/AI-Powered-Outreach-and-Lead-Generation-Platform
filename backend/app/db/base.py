# ==============================================================================
# Database Model Registry
# Import all database models here so Alembic migration scripts discover them.
# ==============================================================================

from app.models.base import Base  # noqa: F401
from app.models.lead import Lead  # noqa: F401
from app.models.lead_outreach_message import LeadOutreachMessage  # noqa: F401
from app.models.campaign import Campaign  # noqa: F401
from app.models.lead_campaign_assignment import LeadCampaignAssignment  # noqa: F401
from app.models.platform_settings import PlatformSettings  # noqa: F401
