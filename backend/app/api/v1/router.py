from fastapi import APIRouter
from app.api.v1.endpoints import health, leads

api_router = APIRouter()

# Register endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["system"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
