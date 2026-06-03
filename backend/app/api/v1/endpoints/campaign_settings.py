import logging
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import CateringAppException
from app.db.session import get_db_session
from app.schemas.platform_settings import (
    PlatformSettingsCreate,
    PlatformSettingsResponse,
    PlatformSettingsUpdate,
)
from app.services.platform_settings_service import platform_settings_service

router = APIRouter()
logger = logging.getLogger("app.api.campaign_settings")


@router.get(
    "",
    response_model=PlatformSettingsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Platform Settings",
    description=(
        "Returns the platform-wide restaurant and sender configuration. "
        "This singleton is used by the AI email generation engine for all outreach campaigns."
    ),
)
async def get_campaign_settings(
    db: AsyncSession = Depends(get_db_session),
) -> PlatformSettingsResponse:
    settings_record = await platform_settings_service.get_singleton(db)
    if not settings_record:
        raise CateringAppException(
            "Platform settings have not been configured yet. "
            "Use PATCH /api/v1/campaign-settings to set them up.",
            status_code=404,
        )
    return settings_record


@router.patch(
    "",
    response_model=PlatformSettingsResponse,
    status_code=status.HTTP_200_OK,
    summary="Upsert Platform Settings",
    description=(
        "Creates or updates the platform-wide configuration. "
        "If no settings record exists yet, one is created. "
        "Partial updates are supported — only provide the fields you want to change."
    ),
)
async def update_campaign_settings(
    payload: PlatformSettingsUpdate,
    db: AsyncSession = Depends(get_db_session),
) -> PlatformSettingsResponse:
    # Filter out unset fields for true partial-update semantics
    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        raise CateringAppException(
            "No fields provided for update. Supply at least one field to patch.",
            status_code=422,
        )

    result = await platform_settings_service.upsert(db, obj_in=update_data)
    logger.info("Platform settings updated (id=%d).", result.id)
    return result
