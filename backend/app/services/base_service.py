from typing import Any, Generic, List, Optional, TypeVar
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.base import Base
from app.repositories.base_repository import BaseRepository

ModelType = TypeVar("ModelType", bound=Base)


class BaseService(Generic[ModelType]):
    """
    Generic Base Service representing business logic boundaries.
    Interfaces directly with their corresponding repository.
    """

    def __init__(self, repository: BaseRepository[ModelType]):
        self.repository = repository

    async def get_by_id(self, db: AsyncSession, id: Any) -> Optional[ModelType]:
        """Business logic wrapper for fetching a resource by ID."""
        return await self.repository.get(db, id)

    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Business logic wrapper for paginated listing of resources."""
        return await self.repository.get_multi(db, skip=skip, limit=limit)
