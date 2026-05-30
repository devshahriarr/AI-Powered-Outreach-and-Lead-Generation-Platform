from unittest.mock import AsyncMock
import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_health_endpoint_connected(
    async_client: AsyncClient, mock_db_session: AsyncMock
) -> None:
    """
    Verifies that the /health endpoint reports 'connected' when the
    database responds successfully to basic ping checks.
    """
    # Mocking standard successful query return
    mock_db_session.execute.return_value = AsyncMock()

    response = await async_client.get("/api/v1/health")
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"
    assert "app_name" in data
    assert "environment" in data
    assert "timestamp" in data


@pytest.mark.anyio
async def test_health_endpoint_db_disconnected(
    async_client: AsyncClient, mock_db_session: AsyncMock
) -> None:
    """
    Verifies that the /health endpoint safely catches internal database
    exceptions and gracefully reports the database is 'unhealthy'.
    """
    # Force database call to raise an exception
    mock_db_session.execute.side_effect = Exception("Connection Refused")

    response = await async_client.get("/api/v1/health")
    assert response.status_code == 200  # Return code remains 200 to allow load-balancer parsing
    
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "unhealthy"
    assert "timestamp" in data
