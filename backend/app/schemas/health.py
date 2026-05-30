from datetime import datetime
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """
    Pydantic schema mapping the application and database health statuses.
    """
    status: str = Field(..., description="Application state status (e.g., 'ok')")
    database: str = Field(..., description="Database connection health status (e.g., 'connected')")
    app_name: str = Field(..., description="Name of the application running")
    environment: str = Field(..., description="Active runtime context environment")
    timestamp: datetime = Field(..., description="Time of status reporting in UTC")
