from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    leads,
    outreach_messages,
    campaigns,
    campaign_settings,
    stats,
)

api_router = APIRouter()

# Core system
api_router.include_router(health.router, prefix="/health", tags=["system"])

# Lead management
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])

# Campaign management
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])

# Platform settings (global singleton)
api_router.include_router(
    campaign_settings.router, prefix="/campaign-settings", tags=["campaign-settings"]
)

# Outreach messages (email generation + workflow)
# Note: outreach_messages router uses full paths (/leads/{id}/generate-email,
#       /outreach-messages/*, /outreach-messages/{id}/*) — registered without prefix.
api_router.include_router(outreach_messages.router, tags=["outreach"])

# Analytics
api_router.include_router(stats.router, prefix="/stats", tags=["analytics"])
