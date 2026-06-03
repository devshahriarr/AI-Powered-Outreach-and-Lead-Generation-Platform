from typing import Any, Dict, Tuple
from app.models.lead import Lead
from app.models.enums import LeadStatus
from app.core.config import settings


class LeadQualificationService:
    """
    Applies scoring logic to a cleaned lead and returns the unified LeadStatus.

    Scoring rubric (max 100 points):
      +25  Business email exists
      +20  Website exists
      +15  Phone exists
      +20  Business type matches allowed categories
      +20  Valid location (address or lat/lng)

    Result mapping:
      score ≥ 70  → LeadStatus.QUALIFIED
      score 40–69 → LeadStatus.REVIEW_REQUIRED
      score < 40  → LeadStatus.REJECTED
    """

    def qualify_lead(
        self, lead: Lead, cleanup_data: Dict[str, Any]
    ) -> Tuple[int, str, LeadStatus]:
        """
        Evaluates a lead after cleanup and produces a score + unified lifecycle status.

        Returns:
            (lead_score, qualification_reason, lead_status)
        """
        # Hard-reject if cleanup marked the lead as invalid
        if cleanup_data.get("is_rejected"):
            return 0, cleanup_data.get("rejection_reason", "Rejected during cleanup"), LeadStatus.REJECTED

        score = 0
        reasons: list[str] = []

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

        # Address or lat/lng → valid location
        if lead.address or (lead.latitude is not None and lead.longitude is not None):
            score += 20
            reasons.append("Valid location (+20)")

        reason_str = ", ".join(reasons) if reasons else "No qualifying signals found"

        if score >= 70:
            return score, reason_str, LeadStatus.QUALIFIED
        elif score >= 40:
            return score, reason_str, LeadStatus.REVIEW_REQUIRED
        else:
            return score, f"Score too low ({score}/100): {reason_str}", LeadStatus.REJECTED


lead_qualification_service = LeadQualificationService()
