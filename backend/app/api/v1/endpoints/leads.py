import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import EntityNotFoundError
from app.db.session import get_db_session
from app.models.enums import LeadStatus
from app.schemas.lead import LeadDiscoverRequest, LeadResponse, LeadUpdate, LeadQualifyResponse
from app.services.lead_service import lead_service

router = APIRouter()
logger = logging.getLogger("app.api.leads")


@router.post(
    "/discover",
    status_code=status.HTTP_200_OK,
    summary="Trigger Lead Discovery & Ingestion",
    description="Invokes the Apify search engine to find and ingest leads."
)
async def discover_leads(
    payload: Optional[LeadDiscoverRequest] = None,
    db: AsyncSession = Depends(get_db_session)
) -> dict:
    body = payload or LeadDiscoverRequest()
    summary = await lead_service.discover_and_ingest_leads(
        db,
        location=body.location,
        radius_miles=body.radius_miles,
        category=body.category
    )
    return summary


@router.post(
    "/qualify",
    response_model=LeadQualifyResponse,
    status_code=status.HTTP_200_OK,
    summary="Run Lead Qualification Pipeline",
    description=(
        "Processes all DISCOVERED leads through the cleanup and scoring pipeline. "
        "Updates each lead's unified status to QUALIFIED, REVIEW_REQUIRED, or REJECTED."
    )
)
async def qualify_leads(db: AsyncSession = Depends(get_db_session)) -> dict:
    from app.services.lead_cleanup_service import lead_cleanup_service
    from app.services.lead_qualification_service import lead_qualification_service

    unprocessed = await lead_service.repository.get_unprocessed_leads(db)

    processed_count = 0
    qualified_count = 0
    rejected_count = 0
    review_required_count = 0

    for lead in unprocessed:
        cleanup_data = lead_cleanup_service.clean_lead(lead)
        score, reason, lead_status = lead_qualification_service.qualify_lead(lead, cleanup_data)

        update_data = {
            # Contact normalisation
            "cleaned_email": cleanup_data.get("cleaned_email"),
            "cleaned_website": cleanup_data.get("cleaned_website"),
            "cleaned_phone": cleanup_data.get("cleaned_phone"),
            # Scoring
            "lead_score": score,
            "qualification_reason": reason,
            # Unified lifecycle status
            "status": lead_status.value,
            # Backward-compat fields (soft-deprecated)
            "is_qualified": lead_status == LeadStatus.QUALIFIED,
            "review_status": lead_status.value,
        }

        await lead_service.repository.update(db, db_obj=lead, obj_in=update_data)
        processed_count += 1

        if lead_status == LeadStatus.QUALIFIED:
            qualified_count += 1
        elif lead_status == LeadStatus.REJECTED:
            rejected_count += 1
        elif lead_status == LeadStatus.REVIEW_REQUIRED:
            review_required_count += 1

    logger.info(
        "Qualification run: %d processed, %d qualified, %d review, %d rejected",
        processed_count, qualified_count, review_required_count, rejected_count,
    )

    return {
        "processed": processed_count,
        "qualified": qualified_count,
        "rejected": rejected_count,
        "review_required": review_required_count,
    }


@router.get(
    "/qualified",
    response_model=List[LeadResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Qualified Leads",
    description="Returns all leads with status=QUALIFIED, ready for outreach.",
)
async def get_qualified_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db_session)
) -> List[LeadResponse]:
    return await lead_service.repository.get_by_status(
        db, status=LeadStatus.QUALIFIED, skip=skip, limit=limit
    )


@router.get(
    "/rejected",
    response_model=List[LeadResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Rejected Leads",
    description="Returns all leads with status=REJECTED (low quality data or failed cleanup).",
)
async def get_rejected_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db_session)
) -> List[LeadResponse]:
    return await lead_service.repository.get_by_status(
        db, status=LeadStatus.REJECTED, skip=skip, limit=limit
    )


@router.get(
    "/review",
    response_model=List[LeadResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Leads Needing Review",
    description="Returns leads with status=REVIEW_REQUIRED (borderline score, needs human judgement).",
)
async def get_review_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db_session)
) -> List[LeadResponse]:
    return await lead_service.repository.get_by_status(
        db, status=LeadStatus.REVIEW_REQUIRED, skip=skip, limit=limit
    )


@router.get(
    "",
    response_model=List[LeadResponse],
    status_code=status.HTTP_200_OK,
    summary="List Paginated Leads",
    description="Retrieves paginated leads, optionally filtered by status or business type.",
)
async def list_leads(
    status: Optional[str] = Query(None, description="Filter by LeadStatus value"),
    business_type: Optional[str] = Query(None, description="Filter by business type"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db_session)
) -> List[LeadResponse]:
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
)
async def update_lead(
    lead_id: int,
    payload: LeadUpdate,
    db: AsyncSession = Depends(get_db_session)
) -> LeadResponse:
    db_lead = await lead_service.get_by_id(db, lead_id)
    if not db_lead:
        raise EntityNotFoundError("Lead", lead_id)
    updated = await lead_service.repository.update(db, db_obj=db_lead, obj_in=payload)
    return updated


@router.delete(
    "/{lead_id}",
    response_model=LeadResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete Lead Record",
)
async def delete_lead(
    lead_id: int,
    db: AsyncSession = Depends(get_db_session)
) -> LeadResponse:
    db_lead = await lead_service.get_by_id(db, lead_id)
    if not db_lead:
        raise EntityNotFoundError("Lead", lead_id)
    deleted = await lead_service.repository.remove(db, id=lead_id)
    return deleted
