from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.lead import Lead
from app.models.enums import LeadStatus
from app.repositories.base_repository import BaseRepository


class LeadRepository(BaseRepository[Lead]):
    """
    Lead Repository exposing database transaction methods.
    Isolates raw SQLAlchemy operations on Lead entries.
    """

    def __init__(self) -> None:
        super().__init__(Lead)

    async def get_by_google_place_id(
        self, db: AsyncSession, google_place_id: str
    ) -> Optional[Lead]:
        """
        Fetches a lead by its unique Google Place ID.
        Used by the ingestion pipeline to prevent recording duplicate leads.
        """
        query = select(self.model).where(self.model.google_place_id == google_place_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_status(
        self, db: AsyncSession, *, status: str, skip: int = 0, limit: int = 100
    ) -> List[Lead]:
        """Fetches leads filtered by their unified lifecycle status."""
        query = (
            select(self.model)
            .where(self.model.status == status)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_by_business_type(
        self, db: AsyncSession, *, business_type: str, skip: int = 0, limit: int = 100
    ) -> List[Lead]:
        """Fetches a list of leads filtered by their business category."""
        query = (
            select(self.model)
            .where(self.model.business_type == business_type)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_unprocessed_leads(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 1000
    ) -> List[Lead]:
        """
        Fetches leads that have not yet been evaluated by the qualification pipeline.
        After the lifecycle refactor, 'unprocessed' means status == DISCOVERED.
        """
        query = (
            select(self.model)
            .where(self.model.status == LeadStatus.DISCOVERED)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_by_review_status(
        self, db: AsyncSession, *, review_status: str, skip: int = 0, limit: int = 100
    ) -> List[Lead]:
        """
        Fetches leads filtered by lifecycle status.
        Parameter kept as 'review_status' for call-site backward compatibility;
        internally this now filters the unified `status` column.
        """
        query = (
            select(self.model)
            .where(self.model.status == review_status)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return list(result.scalars().all())


# Singleton instance mapping standard transactions injection
lead_repository = LeadRepository()
