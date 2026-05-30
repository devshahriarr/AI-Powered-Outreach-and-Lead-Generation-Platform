from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging
from app.db.session import engine
from app.middlewares.logging import RequestLoggingMiddleware

# Configure logging at application import
setup_logging()
logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Context manager defining startup and shutdown lifecycle events.
    Guarantees cleanup of active connection pools.
    """
    logger.info("Catering Outreach Backend starting up...")
    yield
    logger.info("Catering Outreach Backend shutting down...")
    # Safe cleanup of the asynchronous connection pool
    await engine.dispose()
    logger.info("Database connection pools closed.")


# Initialize the core FastAPI Application
app = FastAPI(
    title=settings.APP_NAME,
    description="Catering Lead Generation & Outreach Agent (Agent 2) API Services Backend",
    version="0.1.0",
    debug=settings.DEBUG,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
)

# 1. Mount Custom Performance and Latency Auditing Request Logger Middleware
app.add_middleware(RequestLoggingMiddleware)

# 2. Register CORS Policies (Cross-Origin Resource Sharing)
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# 3. Attach Central Exception Handlers (Security & Input validation mapping)
register_exception_handlers(app)

# 4. Include Unified Router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", include_in_schema=False)
async def root_redirect():
    """Simple API root redirection metadata info."""
    return {
        "project": settings.APP_NAME,
        "version": "0.1.0",
        "documentation": "/docs",
        "status": "online"
    }
