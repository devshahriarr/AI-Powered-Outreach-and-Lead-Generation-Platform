from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.config import settings

# Create async database engine with optimal connection pooling configurations
# suitable for modern async applications
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,  # Set to True for verbose SQLAlchemy queries logging in debugging
    pool_pre_ping=True,  # Proactively verify connections before dispatching to sessions
    pool_size=10,        # Number of connections to keep open
    max_overflow=20,     # Max extra temporary connections above pool_size
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,  # Prevents attribute expiry issues during async operations
    class_=AsyncSession,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency injection provider.
    Yields an active database transaction session and guarantees cleanup on finish.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
