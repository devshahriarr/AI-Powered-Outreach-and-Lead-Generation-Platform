from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.campaign import Campaign
from app.repositories.base_repository import BaseRepository


class CampaignRepository(BaseRepository[Campaign]):
    """
    Repository handling raw SQLAlchemy operations for the Campaign model.
    """

    def __init__(self) -> None:
        super().__init__(Campaign)

    async def get_by_status(
        self, db: AsyncSession, *, status: str, skip: int = 0, limit: int = 100
    ) -> List[Campaign]:
        """Fetches campaigns filtered by their lifecycle status."""
        query = (
            select(self.model)
            .where(self.model.status == status)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_by_target_business_type(
        self, db: AsyncSession, *, business_type: str, skip: int = 0, limit: int = 100
    ) -> List[Campaign]:
        """Fetches campaigns targeting a specific business type."""
        query = (
            select(self.model)
            .where(self.model.target_business_type == business_type)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return list(result.scalars().all())


# Singleton instances
campaign_repository = CampaignRepository()
