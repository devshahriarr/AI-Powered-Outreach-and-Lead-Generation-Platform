from typing import Any, Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.campaign import Campaign
from app.repositories.campaign_repository import (
    campaign_repository,
    CampaignRepository,
)
from app.services.base_service import BaseService


class CampaignService(BaseService[Campaign]):
    """
    Service layer for Campaign lifecycle management.
    Provides creation, retrieval, update and settings handling.
    """

    def __init__(
        self,
        repository: CampaignRepository = campaign_repository,
    ) -> None:
        super().__init__(repository)
        self.repository = repository

    async def get_by_status(
        self, db: AsyncSession, *, status: str, skip: int = 0, limit: int = 100
    ) -> List[Campaign]:
        """Returns campaigns filtered by their lifecycle status."""
        return await self.repository.get_by_status(db, status=status, skip=skip, limit=limit)

    async def create_campaign(
        self, db: AsyncSession, *, obj_in: Dict[str, Any]
    ) -> Campaign:
        """Creates a new campaign record."""
        return await self.repository.create(db, obj_in=obj_in)

    async def update_campaign(
        self, db: AsyncSession, *, db_obj: Campaign, obj_in: Dict[str, Any]
    ) -> Campaign:
        """Applies partial update to an existing campaign."""
        return await self.repository.update(db, db_obj=db_obj, obj_in=obj_in)




# Singleton service instance
campaign_service = CampaignService()
