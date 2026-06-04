from typing import List
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.lead_campaign_assignment import LeadCampaignAssignment
from app.repositories.base_repository import BaseRepository

class CampaignAssignmentRepository(BaseRepository[LeadCampaignAssignment]):
    """
    Handles database operations for the LeadCampaignAssignment join table.
    """
    
    async def get_by_campaign_and_lead(
        self, db: AsyncSession, *, campaign_id: int, lead_id: int
    ) -> LeadCampaignAssignment | None:
        """Fetch a specific assignment by campaign and lead ID."""
        stmt = select(LeadCampaignAssignment).where(
            and_(
                LeadCampaignAssignment.campaign_id == campaign_id,
                LeadCampaignAssignment.lead_id == lead_id
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_campaign(
        self, db: AsyncSession, *, campaign_id: int
    ) -> List[LeadCampaignAssignment]:
        """Get all assignments for a campaign."""
        stmt = select(LeadCampaignAssignment).where(
            LeadCampaignAssignment.campaign_id == campaign_id
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def bulk_create(
        self, db: AsyncSession, *, assignments: List[dict]
    ) -> List[LeadCampaignAssignment]:
        """Bulk create assignments."""
        db_objs = [LeadCampaignAssignment(**a) for a in assignments]
        db.add_all(db_objs)
        await db.commit()
        for obj in db_objs:
            await db.refresh(obj)
        return db_objs

campaign_assignment_repository = CampaignAssignmentRepository(LeadCampaignAssignment)
