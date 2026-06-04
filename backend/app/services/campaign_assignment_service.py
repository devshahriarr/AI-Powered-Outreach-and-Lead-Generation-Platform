import logging
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.lead_campaign_assignment import LeadCampaignAssignment
from app.models.lead import Lead
from app.repositories.campaign_assignment_repository import campaign_assignment_repository
from app.services.lead_service import lead_service
from app.services.campaign_service import campaign_service
from app.core.exceptions import EntityNotFoundError, CateringAppException

logger = logging.getLogger("app.services.campaign_assignment_service")

class CampaignAssignmentService:
    """
    Business logic for Lead-to-Campaign assignments.
    """
    
    async def assign_leads(
        self, db: AsyncSession, *, campaign_id: int, lead_ids: List[int]
    ) -> List[LeadCampaignAssignment]:
        """Assign multiple leads to a campaign. Ignores leads already assigned."""
        
        campaign = await campaign_service.get_by_id(db, campaign_id)
        if not campaign:
            raise EntityNotFoundError("Campaign", campaign_id)
            
        assignments_to_create = []
        for lead_id in lead_ids:
            lead = await lead_service.get_by_id(db, lead_id)
            if not lead:
                continue # Skip invalid leads
            
            # Check if already assigned
            existing = await campaign_assignment_repository.get_by_campaign_and_lead(
                db, campaign_id=campaign_id, lead_id=lead_id
            )
            
            if not existing:
                assignments_to_create.append({
                    "campaign_id": campaign_id,
                    "lead_id": lead_id
                })
                
        if not assignments_to_create:
            return []
            
        created = await campaign_assignment_repository.bulk_create(db, assignments=assignments_to_create)
        logger.info(f"Assigned {len(created)} leads to campaign {campaign_id}")
        return created

    async def get_campaign_leads(self, db: AsyncSession, *, campaign_id: int) -> List[Lead]:
        """Fetch actual Lead objects assigned to a campaign."""
        assignments = await campaign_assignment_repository.get_by_campaign(db, campaign_id=campaign_id)
        leads = []
        for a in assignments:
            lead = await lead_service.get_by_id(db, a.lead_id)
            if lead:
                leads.append(lead)
        return leads
        
    async def remove_lead(self, db: AsyncSession, *, campaign_id: int, lead_id: int) -> None:
        """Remove a lead from a campaign."""
        assignment = await campaign_assignment_repository.get_by_campaign_and_lead(
            db, campaign_id=campaign_id, lead_id=lead_id
        )
        if not assignment:
            raise EntityNotFoundError("LeadCampaignAssignment", f"{campaign_id}-{lead_id}")
            
        await campaign_assignment_repository.remove(db, id=assignment.id)
        logger.info(f"Removed lead {lead_id} from campaign {campaign_id}")

campaign_assignment_service = CampaignAssignmentService()
