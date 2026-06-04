from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import List

class CampaignAssignmentBase(BaseModel):
    lead_id: int
    campaign_id: int

class CampaignAssignmentCreate(BaseModel):
    lead_ids: List[int]

class CampaignAssignmentResponse(CampaignAssignmentBase):
    id: int
    assigned_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
