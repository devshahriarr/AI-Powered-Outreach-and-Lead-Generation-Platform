from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.lead_outreach_message import LeadOutreachMessage
from app.repositories.base_repository import BaseRepository


class OutreachMessageRepository(BaseRepository[LeadOutreachMessage]):
    """
    Repository handling SQLAlchemy CRUD operations for LeadOutreachMessage.
    """

    def __init__(self) -> None:
        super().__init__(LeadOutreachMessage)

    async def get_by_lead_id(
        self, db: AsyncSession, *, lead_id: int, skip: int = 0, limit: int = 100
    ) -> List[LeadOutreachMessage]:
        """Fetches all outreach messages generated for a specific lead."""
        query = (
            select(self.model)
            .where(self.model.lead_id == lead_id)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_by_campaign_id(
        self, db: AsyncSession, *, campaign_id: int, skip: int = 0, limit: int = 100
    ) -> List[LeadOutreachMessage]:
        """Fetches all outreach messages belonging to a specific campaign."""
        query = (
            select(self.model)
            .where(self.model.campaign_id == campaign_id)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_by_lead_and_campaign(
        self, db: AsyncSession, *, lead_id: int, campaign_id: int, message_type: str
    ) -> Optional[LeadOutreachMessage]:
        """
        Fetches the most recent message for a specific lead+campaign+type combination.
        Used to prevent duplicate generation for the same sequence position.
        """
        query = (
            select(self.model)
            .where(
                self.model.lead_id == lead_id,
                self.model.campaign_id == campaign_id,
                self.model.message_type == message_type,
            )
            .order_by(self.model.created_at.desc())
            .limit(1)
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_status(
        self, db: AsyncSession, *, status: str, skip: int = 0, limit: int = 100
    ) -> List[LeadOutreachMessage]:
        """Fetches messages filtered by their lifecycle status."""
        query = (
            select(self.model)
            .where(self.model.status == status)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_filtered(
        self,
        db: AsyncSession,
        *,
        status: Optional[str] = None,
        lead_id: Optional[int] = None,
        campaign_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[LeadOutreachMessage]:
        """
        Flexible filtered query supporting any combination of status, lead_id,
        and campaign_id. Returns paginated results ordered by creation time desc.
        """
        from sqlalchemy import and_
        conditions = []
        if status is not None:
            conditions.append(self.model.status == status)
        if lead_id is not None:
            conditions.append(self.model.lead_id == lead_id)
        if campaign_id is not None:
            conditions.append(self.model.campaign_id == campaign_id)

        query = select(self.model)
        if conditions:
            query = query.where(and_(*conditions))
        query = query.order_by(self.model.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())


# Singleton instance
outreach_message_repository = OutreachMessageRepository()
