from typing import AsyncGenerator
from unittest.mock import AsyncMock
import pytest
from httpx import ASGITransport, AsyncClient
from app.db.session import get_db_session
from app.main import app


@pytest.fixture
def anyio_backend() -> str:
    """Configures AnyIO backend for async pytest execution."""
    return "asyncio"


@pytest.fixture
def mock_db_session() -> AsyncMock:
    """
    Creates an asynchronous mock database session fixture.
    Allows simulating DB queries and connection statuses.
    """
    session = AsyncMock()
    # Mocking standard async context manager methods
    session.__aenter__.return_value = session
    session.__aexit__.return_value = None
    return session


@pytest.fixture(autouse=True)
def override_db_dependency(mock_db_session: AsyncMock) -> AsyncGenerator[None, None]:
    """
    Automatically overrides the real 'get_db_session' dependency injected into endpoints
    with our mocked DB session. Prevents testing from hitting the real PostgreSQL database.
    """
    app.dependency_overrides[get_db_session] = lambda: mock_db_session
    yield
    app.dependency_overrides.clear()


@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """
    Yields an asynchronous HTTP client configured to dispatch requests
    directly against the FastAPI application.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
        yield client
