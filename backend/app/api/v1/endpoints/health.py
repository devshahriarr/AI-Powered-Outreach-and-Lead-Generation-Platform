from datetime import datetime, timezone
import logging
from fastapi import APIRouter, Depends, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.db.session import get_db_session
from app.schemas.health import HealthResponse

router = APIRouter()
logger = logging.getLogger("app.api.health")


@router.get(
    "",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Application and DB Health Check",
    description="Validates application state and verifies active PostgreSQL database connection pool."
)
async def check_health(db: AsyncSession = Depends(get_db_session)) -> HealthResponse:
    db_status = "unhealthy"
    try:
        # Run a simple, fast SQL query to verify the database connection
        # text() converts raw SQL to a safe executable statement
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as exc:
        logger.error(
            f"Database health check failed: {str(exc)}",
            exc_info=True
        )
        # Note: we don't raise an exception here because we want to yield a 
        # structured unhealthy response instead of raising a generic 500 error.
        # This assists load balancers in reporting structural details.

    return HealthResponse(
        status="ok",
        database=db_status,
        app_name=settings.APP_NAME,
        environment=settings.APP_ENV,
        timestamp=datetime.now(timezone.utc)
    )
