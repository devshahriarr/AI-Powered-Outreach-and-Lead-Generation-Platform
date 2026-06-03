from typing import Any, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.platform_settings import PlatformSettings
from app.repositories.platform_settings_repository import (
    platform_settings_repository,
    PlatformSettingsRepository,
)
from app.services.base_service import BaseService


class PlatformSettingsService(BaseService[PlatformSettings]):
    """
    Service layer for the global PlatformSettings singleton.
    Enforces the single-record invariant and provides clean get/upsert access.
    """

    def __init__(
        self,
        repository: PlatformSettingsRepository = platform_settings_repository,
    ) -> None:
        super().__init__(repository)
        self.repository = repository

    async def get_singleton(self, db: AsyncSession) -> Optional[PlatformSettings]:
        """Returns the platform settings record, or None if not yet configured."""
        return await self.repository.get_singleton(db)

    async def upsert(
        self, db: AsyncSession, *, obj_in: Dict[str, Any]
    ) -> PlatformSettings:
        """
        Creates the platform settings record if it doesn't exist; updates it otherwise.
        This enforces the singleton contract — there is always at most one record.
        """
        return await self.repository.create_or_update(db, obj_in=obj_in)


# Singleton service instance
platform_settings_service = PlatformSettingsService()
