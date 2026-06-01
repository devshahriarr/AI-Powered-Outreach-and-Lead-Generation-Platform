from typing import Dict, Any, Tuple
from app.models.lead import Lead
from app.core.config import settings

class LeadQualificationService:
    def qualify_lead(self, lead: Lead, cleanup_data: Dict[str, Any]) -> Tuple[int, bool, str, str]:
        """
        Applies scoring logic to a lead based on its cleaned data.
        Returns: (lead_score, is_qualified, qualification_reason, review_status)
        """
        if cleanup_data.get("is_rejected"):
            return 0, False, cleanup_data["rejection_reason"], "rejected"

        score = 0
        reasons = []

        if cleanup_data.get("cleaned_email"):
            score += 25
            reasons.append("Email exists (+25)")
        
        if cleanup_data.get("cleaned_website"):
            score += 20
            reasons.append("Website exists (+20)")
        
        if cleanup_data.get("cleaned_phone"):
            score += 15
            reasons.append("Phone exists (+15)")
            
        if lead.business_type in settings.TARGET_BUSINESS_CATEGORIES:
            score += 20
            reasons.append("Valid business type (+20)")
            
        # Address or Lat/Lng exists -> valid location
        if lead.address or (lead.latitude is not None and lead.longitude is not None):
            score += 20
            reasons.append("Valid location (+20)")
            
        reason_str = ", ".join(reasons)
        
        if score >= 70:
            return score, True, reason_str, "qualified"
        elif score >= 40:
            return score, False, reason_str, "needs_review"
        else:
            return score, False, "Score too low: " + reason_str, "rejected"


lead_qualification_service = LeadQualificationService()
