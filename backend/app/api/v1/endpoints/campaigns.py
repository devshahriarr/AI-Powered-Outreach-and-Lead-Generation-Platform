import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import EntityNotFoundError
from app.db.session import get_db_session
from app.schemas.campaign import CampaignCreate, CampaignResponse, CampaignUpdate
from app.services.campaign_service import campaign_service

router = APIRouter()
logger = logging.getLogger("app.api.campaigns")


@router.post(
    "",
    response_model=CampaignResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Campaign",
    description="Creates a new outreach campaign.",
)
async def create_campaign(
    payload: CampaignCreate,
    db: AsyncSession = Depends(get_db_session),
) -> CampaignResponse:
    campaign = await campaign_service.create_campaign(db, obj_in=payload.model_dump())
    logger.info("Campaign '%s' created (id=%d)", campaign.name, campaign.id)
    return campaign


@router.get(
    "",
    response_model=List[CampaignResponse],
    status_code=status.HTTP_200_OK,
    summary="List Campaigns",
    description="Returns all campaigns, optionally filtered by status.",
)
async def list_campaigns(
    status: Optional[str] = Query(None, description="Filter by campaign status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db_session),
) -> List[CampaignResponse]:
    if status:
        return await campaign_service.get_by_status(db, status=status, skip=skip, limit=limit)
    return await campaign_service.get_all(db, skip=skip, limit=limit)


@router.get(
    "/{campaign_id}",
    response_model=CampaignResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Campaign",
    description="Retrieves a single campaign by its primary key ID.",
)
async def get_campaign(
    campaign_id: int,
    db: AsyncSession = Depends(get_db_session),
) -> CampaignResponse:
    campaign = await campaign_service.get_by_id(db, campaign_id)
    if not campaign:
        raise EntityNotFoundError("Campaign", campaign_id)
    return campaign


@router.patch(
    "/{campaign_id}",
    response_model=CampaignResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Campaign",
    description="Partially updates an existing campaign.",
)
async def update_campaign(
    campaign_id: int,
    payload: CampaignUpdate,
    db: AsyncSession = Depends(get_db_session),
) -> CampaignResponse:
    campaign = await campaign_service.get_by_id(db, campaign_id)
    if not campaign:
        raise EntityNotFoundError("Campaign", campaign_id)
    updated = await campaign_service.update_campaign(
        db, db_obj=campaign, obj_in=payload.model_dump(exclude_unset=True)
    )
    return updated


@router.delete(
    "/{campaign_id}",
    response_model=CampaignResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete Campaign",
    description="Deletes a campaign and all associated messages (cascade).",
)
async def delete_campaign(
    campaign_id: int,
    db: AsyncSession = Depends(get_db_session),
) -> CampaignResponse:
    campaign = await campaign_service.get_by_id(db, campaign_id)
    if not campaign:
        raise EntityNotFoundError("Campaign", campaign_id)
    deleted = await campaign_service.repository.remove(db, id=campaign_id)
    logger.info("Campaign %d deleted.", campaign_id)
    return deleted
