import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import EntityNotFoundError
from app.db.session import get_db_session
from app.schemas.lead import LeadDiscoverRequest, LeadResponse, LeadUpdate
from app.services.lead_service import lead_service

router = APIRouter()
logger = logging.getLogger("app.api.leads")


@router.post(
    "/discover",
    status_code=status.HTTP_200_OK,
    summary="Trigger Lead Discovery & Ingestion",
    description="Invokes the Google Places search engine (or Dhaka Sandbox Mock) to find and ingest leads."
)
async def discover_leads(
    payload: Optional[LeadDiscoverRequest] = None,
    db: AsyncSession = Depends(get_db_session)
) -> dict:
    # Set standard empty payload if body is not supplied
    body = payload or LeadDiscoverRequest()
    
    # Trigger place search and lead mapping ingestion pipeline
    summary = await lead_service.discover_and_ingest_leads(
        db,
        location=body.location,
        radius_miles=body.radius_miles,
        category=body.category
    )
    
    return summary


@router.get(
    "",
    response_model=List[LeadResponse],
    status_code=status.HTTP_200_OK,
    summary="List Paginated Leads",
    description="Retrieves a list of leads, supporting filtering by pipeline status and business type."
)
async def list_leads(
    status: Optional[str] = Query(None, description="Filter leads by pipeline status"),
    business_type: Optional[str] = Query(None, description="Filter leads by business type"),
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Max number of items to return"),
    db: AsyncSession = Depends(get_db_session)
) -> List[LeadResponse]:
    # Query database depending on active search parameters
    if status:
        leads = await lead_service.repository.get_by_status(db, status=status, skip=skip, limit=limit)
    elif business_type:
        leads = await lead_service.repository.get_by_business_type(db, business_type=business_type, skip=skip, limit=limit)
    else:
        leads = await lead_service.get_all(db, skip=skip, limit=limit)
        
    return leads


@router.get(
    "/{lead_id}",
    response_model=LeadResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve Lead Details",
    description="Fetches a single lead record using its primary key ID."
)
async def get_lead(
    lead_id: int,
    db: AsyncSession = Depends(get_db_session)
) -> LeadResponse:
    lead = await lead_service.get_by_id(db, lead_id)
    if not lead:
        raise EntityNotFoundError("Lead", lead_id)
    return lead


@router.patch(
    "/{lead_id}",
    response_model=LeadResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Lead Parameters",
    description="Partially updates an existing lead (e.g. moving outreach stages, updating contacts, adding notes)."
)
async def update_lead(
    lead_id: int,
    payload: LeadUpdate,
    db: AsyncSession = Depends(get_db_session)
) -> LeadResponse:
    # 1. Check if lead exists
    db_lead = await lead_service.get_by_id(db, lead_id)
    if not db_lead:
        raise EntityNotFoundError("Lead", lead_id)
        
    # 2. Commit updates safely using the repository CRUD interface
    updated = await lead_service.repository.update(db, db_obj=db_lead, obj_in=payload)
    return updated


@router.delete(
    "/{lead_id}",
    response_model=LeadResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete Lead Record",
    description="Deletes a lead from the database using its primary key ID."
)
async def delete_lead(
    lead_id: int,
    db: AsyncSession = Depends(get_db_session)
) -> LeadResponse:
    # Verify lead exists before removing
    db_lead = await lead_service.get_by_id(db, lead_id)
    if not db_lead:
        raise EntityNotFoundError("Lead", lead_id)
        
    deleted = await lead_service.repository.remove(db, id=lead_id)
    return deleted
