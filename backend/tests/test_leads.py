from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import AsyncClient
from app.models.lead import Lead


@pytest.fixture
def mock_lead_instance() -> Lead:
    """Returns a mock Lead instance for repository mock matching."""
    lead = Lead(
        id=42,
        google_place_id="mock_place_id_law_offices_1",
        name="Banani Law Chambers",
        business_type="Law offices",
        address="Road No. 11, House 12, Banani, Dhaka, Bangladesh",
        phone_number="+880 2-987654",
        website="https://www.bananilaw.com",
        email="info@bananilaw.com",
        rating=4.7,
        user_ratings_total=35,
        latitude=23.7940,
        longitude=90.4043,
        status="discovered",
        notes="Sandbox ingestion details",
        lead_score=0,
        is_qualified=False,
        qualification_reason=None,
        cleaned_email=None,
        cleaned_website=None,
        cleaned_phone=None,
        review_status=None
    )
    # Mock SQLAlchemy internal attributes so Pydantic serialization doesn't fail
    lead.created_at = datetime.now(timezone.utc)
    lead.updated_at = datetime.now(timezone.utc)
    return lead


@pytest.mark.anyio
@patch("app.services.lead_service.lead_service.repository")
async def test_discover_leads_endpoint(
    mock_repo: MagicMock,
    async_client: AsyncClient,
    mock_db_session: AsyncMock
) -> None:
    """Verifies that POST /discover endpoints execute Places searches and ingest new leads."""
    # Define repository mock methods explicitly as AsyncMocks to prevent 'awaited' errors
    mock_repo.get_by_google_place_id = AsyncMock(return_value=None)
    
    mock_lead = Lead(id=1, name="Mock Place Ingested", business_type="Law offices")
    mock_lead.created_at = datetime.now(timezone.utc)
    mock_lead.updated_at = datetime.now(timezone.utc)
    mock_repo.create = AsyncMock(return_value=mock_lead)

    # POST payload targeting Dhaka locations defaults
    payload = {
        "location": "Banani, Dhaka, Bangladesh",
        "radius_miles": 10.0,
        "category": "Law offices"
    }

    response = await async_client.post("/api/v1/leads/discover", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["search_center"] == "Banani, Dhaka, Bangladesh"
    assert data["radius_miles"] == 10.0
    assert data["new_leads_ingested"] > 0
    assert len(data["leads"]) > 0


@pytest.mark.anyio
@patch("app.services.lead_service.lead_service.repository")
async def test_list_leads_endpoint(
    mock_repo: MagicMock,
    async_client: AsyncClient,
    mock_db_session: AsyncMock,
    mock_lead_instance: Lead
) -> None:
    """Verifies that GET /leads returns lists of parsed lead responses."""
    # Mock repository listing methods as AsyncMocks
    mock_repo.get_multi = AsyncMock(return_value=[mock_lead_instance])

    response = await async_client.get("/api/v1/leads")
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["id"] == 42
    assert data[0]["name"] == "Banani Law Chambers"
    assert data[0]["email"] == "info@bananilaw.com"
    assert data[0]["status"] == "discovered"


@pytest.mark.anyio
@patch("app.services.lead_service.lead_service.repository")
async def test_get_lead_by_id_success(
    mock_repo: MagicMock,
    async_client: AsyncClient,
    mock_db_session: AsyncMock,
    mock_lead_instance: Lead
) -> None:
    """Verifies retrieval of a single existing lead detail by key ID."""
    mock_repo.get = AsyncMock(return_value=mock_lead_instance)

    response = await async_client.get("/api/v1/leads/42")
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == 42
    assert data["name"] == "Banani Law Chambers"


@pytest.mark.anyio
@patch("app.services.lead_service.lead_service.repository")
async def test_get_lead_by_id_not_found(
    mock_repo: MagicMock,
    async_client: AsyncClient,
    mock_db_session: AsyncMock
) -> None:
    """Verifies that requesting a non-existent lead ID returns a structured 404 error response."""
    mock_repo.get = AsyncMock(return_value=None)

    response = await async_client.get("/api/v1/leads/999")
    assert response.status_code == 404
    
    data = response.json()
    assert data["error_code"] == "EntityNotFoundError"
    assert "999" in data["detail"]


@pytest.mark.anyio
@patch("app.services.lead_service.lead_service.repository")
async def test_patch_lead_pipeline_status(
    mock_repo: MagicMock,
    async_client: AsyncClient,
    mock_db_session: AsyncMock,
    mock_lead_instance: Lead
) -> None:
    """Verifies that updating fields via PATCH correctly transitions status in the database."""
    mock_repo.get = AsyncMock(return_value=mock_lead_instance)
    
    # Configure update return mapping
    updated_lead = mock_lead_instance
    updated_lead.status = "in_pipeline"
    updated_lead.notes = "Contacted client via email."
    mock_repo.update = AsyncMock(return_value=updated_lead)

    payload = {
        "status": "in_pipeline",
        "notes": "Contacted client via email."
    }

    response = await async_client.patch("/api/v1/leads/42", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == 42
    assert data["status"] == "in_pipeline"
    assert data["notes"] == "Contacted client via email."


@pytest.mark.anyio
@patch("app.services.lead_service.lead_service.repository")
async def test_delete_lead_endpoint(
    mock_repo: MagicMock,
    async_client: MagicMock,
    mock_db_session: AsyncMock,
    mock_lead_instance: Lead
) -> None:
    """Verifies lead deletion removes the record and yields the deleted object back."""
    mock_repo.get = AsyncMock(return_value=mock_lead_instance)
    mock_repo.remove = AsyncMock(return_value=mock_lead_instance)

    response = await async_client.delete("/api/v1/leads/42")
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == 42
    assert data["name"] == "Banani Law Chambers"
