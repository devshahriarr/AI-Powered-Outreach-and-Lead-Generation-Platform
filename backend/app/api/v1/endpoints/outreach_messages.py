import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import EntityNotFoundError, CateringAppException
from app.db.session import get_db_session
from app.models.enums import MessageStatus
from app.repositories.outreach_message_repository import outreach_message_repository
from app.schemas.outreach_message import (
    ApproveMessageRequest,
    GenerateEmailRequest,
    OutreachMessageResponse,
    OutreachMessageUpdate,
)
from app.services.campaign_service import campaign_service
from app.services.email_generation_service import email_generation_service
from app.services.lead_service import lead_service
from app.services.platform_settings_service import platform_settings_service

router = APIRouter()
logger = logging.getLogger("app.api.outreach_messages")


# =============================================================================
# Lead-scoped: Email Generation
# =============================================================================

@router.post(
    "/leads/{lead_id}/generate-email",
    response_model=OutreachMessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate AI Outreach Email",
    description=(
        "Generates a personalised outreach email for a lead using platform settings "
        "as the sender/restaurant context. The message is stored with status=generated "
        "and must be reviewed and approved before sending."
    ),
)
async def generate_email_for_lead(
    lead_id: int,
    payload: GenerateEmailRequest,
    db: AsyncSession = Depends(get_db_session),
) -> OutreachMessageResponse:
    # 1. Validate lead exists
    lead = await lead_service.get_by_id(db, lead_id)
    if not lead:
        raise EntityNotFoundError("Lead", lead_id)

    # 2. Validate campaign exists
    campaign = await campaign_service.get_by_id(db, payload.campaign_id)
    if not campaign:
        raise EntityNotFoundError("Campaign", payload.campaign_id)

    # 3. Validate platform settings are configured (singleton)
    ps = await platform_settings_service.get_singleton(db)
    if not ps:
        raise CateringAppException(
            "Platform settings are not configured. "
            "Set them up via PATCH /api/v1/campaign-settings before generating emails.",
            status_code=400,
        )

    # 4. Invoke AI generation service with platform settings context
    generated, model_name = await email_generation_service.generate(
        lead=lead,
        campaign=campaign,
        platform_settings=ps,
        message_type=payload.message_type,
    )

    # 5. Persist the generated message
    message_data = {
        "lead_id": lead_id,
        "campaign_id": payload.campaign_id,
        "message_type": payload.message_type,
        "subject": generated.subject,
        "body": generated.body,
        "cta": generated.cta,
        "generated_by": "openai",
        "model_name": model_name,
        "status": MessageStatus.GENERATED,
    }
    new_message = await outreach_message_repository.create(db, obj_in=message_data)

    logger.info(
        "Outreach message %d created for lead %d (campaign %d, type: %s)",
        new_message.id, lead_id, payload.campaign_id, payload.message_type,
    )
    return new_message


# =============================================================================
# Message Collection: List with Filters
# =============================================================================

@router.get(
    "/outreach-messages",
    response_model=List[OutreachMessageResponse],
    status_code=status.HTTP_200_OK,
    summary="List Outreach Messages",
    description="Returns outreach messages with optional filters for status, lead, and campaign.",
)
async def list_outreach_messages(
    status: Optional[str] = Query(None, description="Filter by message status"),
    lead_id: Optional[int] = Query(None, description="Filter by lead ID"),
    campaign_id: Optional[int] = Query(None, description="Filter by campaign ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db_session),
) -> List[OutreachMessageResponse]:
    return await outreach_message_repository.get_filtered(
        db,
        status=status,
        lead_id=lead_id,
        campaign_id=campaign_id,
        skip=skip,
        limit=limit,
    )


# =============================================================================
# Single Message: Retrieve / Edit / Regenerate / Approve
# =============================================================================

@router.get(
    "/outreach-messages/{message_id}",
    response_model=OutreachMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve Outreach Message",
    description="Fetches a single outreach message by its primary key ID.",
)
async def get_outreach_message(
    message_id: int,
    db: AsyncSession = Depends(get_db_session),
) -> OutreachMessageResponse:
    message = await outreach_message_repository.get(db, message_id)
    if not message:
        raise EntityNotFoundError("OutreachMessage", message_id)
    return message


@router.patch(
    "/outreach-messages/{message_id}",
    response_model=OutreachMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Edit Outreach Message",
    description=(
        "Allows human editing of a generated message. "
        "Editing any content field (subject, body, cta) sets status to 'edited'."
    ),
)
async def edit_outreach_message(
    message_id: int,
    payload: OutreachMessageUpdate,
    db: AsyncSession = Depends(get_db_session),
) -> OutreachMessageResponse:
    message = await outreach_message_repository.get(db, message_id)
    if not message:
        raise EntityNotFoundError("OutreachMessage", message_id)

    if message.status == MessageStatus.SENT:
        raise CateringAppException(
            "Cannot edit a message that has already been sent.", status_code=409
        )

    update_data = payload.model_dump(exclude_unset=True)
    # If any content field was changed, mark the message as edited
    content_fields = {"subject", "body", "cta"}
    if content_fields.intersection(update_data.keys()):
        update_data["status"] = MessageStatus.EDITED

    updated = await outreach_message_repository.update(db, db_obj=message, obj_in=update_data)
    return updated


@router.post(
    "/outreach-messages/{message_id}/regenerate",
    response_model=OutreachMessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Regenerate Outreach Email",
    description=(
        "Generates a fresh email using the same lead, campaign, and message_type. "
        "Stored as a new independent record with status=generated."
    ),
)
async def regenerate_outreach_message(
    message_id: int,
    db: AsyncSession = Depends(get_db_session),
) -> OutreachMessageResponse:
    existing = await outreach_message_repository.get(db, message_id)
    if not existing:
        raise EntityNotFoundError("OutreachMessage", message_id)

    lead = await lead_service.get_by_id(db, existing.lead_id)
    if not lead:
        raise EntityNotFoundError("Lead", existing.lead_id)

    campaign = await campaign_service.get_by_id(db, existing.campaign_id)
    if not campaign:
        raise EntityNotFoundError("Campaign", existing.campaign_id)

    ps = await platform_settings_service.get_singleton(db)
    if not ps:
        raise CateringAppException(
            "Platform settings not configured. Cannot regenerate.", status_code=400
        )

    generated, model_name = await email_generation_service.generate(
        lead=lead,
        campaign=campaign,
        platform_settings=ps,
        message_type=existing.message_type,
    )

    message_data = {
        "lead_id": existing.lead_id,
        "campaign_id": existing.campaign_id,
        "message_type": existing.message_type,
        "subject": generated.subject,
        "body": generated.body,
        "cta": generated.cta,
        "generated_by": "openai",
        "model_name": model_name,
        "status": MessageStatus.GENERATED,
    }
    new_message = await outreach_message_repository.create(db, obj_in=message_data)
    logger.info(
        "Regenerated message %d → new message %d (lead %d)",
        message_id, new_message.id, existing.lead_id,
    )
    return new_message


@router.post(
    "/outreach-messages/{message_id}/approve",
    response_model=OutreachMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Approve Outreach Message",
    description="Marks an outreach message as approved and ready for sending.",
)
async def approve_outreach_message(
    message_id: int,
    payload: ApproveMessageRequest = ApproveMessageRequest(),
    db: AsyncSession = Depends(get_db_session),
) -> OutreachMessageResponse:
    message = await outreach_message_repository.get(db, message_id)
    if not message:
        raise EntityNotFoundError("OutreachMessage", message_id)

    if message.status == MessageStatus.SENT:
        raise CateringAppException(
            "Cannot approve a message that has already been sent.", status_code=409
        )

    update_data: dict = {"status": MessageStatus.APPROVED}
    if payload.review_notes:
        update_data["review_notes"] = payload.review_notes

    updated = await outreach_message_repository.update(db, db_obj=message, obj_in=update_data)
    logger.info("Outreach message %d approved.", message_id)
    return updated
