import logging
from fastapi import APIRouter, Depends, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db_session
from app.models.campaign import Campaign
from app.models.lead import Lead
from app.models.lead_outreach_message import LeadOutreachMessage
from app.models.enums import LeadStatus, MessageStatus

router = APIRouter()
logger = logging.getLogger("app.api.stats")


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    summary="Platform Analytics",
    description=(
        "Returns aggregate platform-wide statistics including lead counts, "
        "campaign totals, and outreach message status breakdown."
    ),
)
async def get_stats(db: AsyncSession = Depends(get_db_session)) -> dict:
    """
    Executes efficient aggregate COUNT queries for each metric.
    All queries run in a single async session for minimal latency.
    """

    # --- Lead counts ---
    total_leads_result = await db.execute(select(func.count()).select_from(Lead))
    total_leads: int = total_leads_result.scalar_one()

    qualified_result = await db.execute(
        select(func.count()).select_from(Lead).where(Lead.status == LeadStatus.QUALIFIED)
    )
    qualified_leads: int = qualified_result.scalar_one()

    review_required_result = await db.execute(
        select(func.count()).select_from(Lead).where(Lead.status == LeadStatus.REVIEW_REQUIRED)
    )
    review_required: int = review_required_result.scalar_one()

    contacted_result = await db.execute(
        select(func.count()).select_from(Lead).where(Lead.status == LeadStatus.CONTACTED)
    )
    contacted_leads: int = contacted_result.scalar_one()

    rejected_result = await db.execute(
        select(func.count()).select_from(Lead).where(Lead.status == LeadStatus.REJECTED)
    )
    rejected_leads: int = rejected_result.scalar_one()

    # --- Campaign count ---
    campaigns_result = await db.execute(select(func.count()).select_from(Campaign))
    campaigns: int = campaigns_result.scalar_one()

    # --- Outreach message counts ---
    emails_generated_result = await db.execute(
        select(func.count()).select_from(LeadOutreachMessage)
    )
    emails_generated: int = emails_generated_result.scalar_one()

    approved_result = await db.execute(
        select(func.count())
        .select_from(LeadOutreachMessage)
        .where(LeadOutreachMessage.status == MessageStatus.APPROVED)
    )
    approved_messages: int = approved_result.scalar_one()

    sent_result = await db.execute(
        select(func.count())
        .select_from(LeadOutreachMessage)
        .where(LeadOutreachMessage.status == MessageStatus.SENT)
    )
    sent_messages: int = sent_result.scalar_one()

    replied_result = await db.execute(
        select(func.count())
        .select_from(LeadOutreachMessage)
        .where(LeadOutreachMessage.status == MessageStatus.REPLIED)
    )
    replied_messages: int = replied_result.scalar_one()

    return {
        "leads": {
            "total": total_leads,
            "discovered": total_leads - qualified_leads - review_required - contacted_leads,
            "qualified": qualified_leads,
            "review_required": review_required,
            "contacted": contacted_leads,
            "rejected": rejected_leads,
        },
        "campaigns": {
            "total": campaigns,
        },
        "outreach_messages": {
            "total": emails_generated,
            "approved": approved_messages,
            "sent": sent_messages,
            "replied": replied_messages,
        },
    }
