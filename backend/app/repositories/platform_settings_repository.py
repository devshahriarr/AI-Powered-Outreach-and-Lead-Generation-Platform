from typing import Any, Dict, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.platform_settings import PlatformSettings
from app.repositories.base_repository import BaseRepository


class PlatformSettingsRepository(BaseRepository[PlatformSettings]):
    """
    Repository for the global PlatformSettings singleton.

    Only one record is expected in this table for MVP.
    All mutations go through `create_or_update` to enforce the singleton pattern.
    """

    def __init__(self) -> None:
        super().__init__(PlatformSettings)

    async def get_singleton(self, db: AsyncSession) -> Optional[PlatformSettings]:
        """
        Returns the single platform settings record, or None if not yet configured.
        Always fetches the record with the lowest ID (oldest / primary record).
        """
        query = select(self.model).order_by(self.model.id.asc()).limit(1)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def create_or_update(
        self, db: AsyncSession, *, obj_in: Dict[str, Any]
    ) -> PlatformSettings:
        """
        Upserts the singleton platform settings record.
        Creates one if none exists; updates the existing record if one is found.
        """
        existing = await self.get_singleton(db)
        if existing:
            return await self.update(db, db_obj=existing, obj_in=obj_in)
        return await self.create(db, obj_in=obj_in)


# Singleton repository instance
platform_settings_repository = PlatformSettingsRepository()
