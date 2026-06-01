import re
from typing import Dict, Any, Optional
from app.models.lead import Lead

class LeadCleanupService:
    POOR_NAME_KEYWORDS = [
        "head office", "building", "road", "tower", "area", "unknown", "unnamed"
    ]
    
    POOR_DOMAINS = [
        "facebook.com", "booking.com", "gmail.com", "yahoo.com", "hotmail.com"
    ]

    def clean_lead(self, lead: Lead) -> Dict[str, Any]:
        """
        Cleans lead contact information and evaluates baseline quality.
        Returns a dictionary with cleaned fields and rejection status.
        """
        # 1. Normalization
        cleaned_email = self._normalize_email(lead.email)
        cleaned_website = self._normalize_website(lead.website)
        cleaned_phone = self._normalize_phone(lead.phone_number)

        # 2. Rejection Rules
        # Rule A: Poor business name
        name_lower = (lead.name or "").lower()
        for kw in self.POOR_NAME_KEYWORDS:
            if kw in name_lower:
                return self._rejection_result(
                    f"Poor business name keyword detected: '{kw}'", 
                    cleaned_email, cleaned_website, cleaned_phone
                )

        # Rule B: Poor email domain
        if cleaned_email:
            for domain in self.POOR_DOMAINS:
                if domain in cleaned_email:
                    return self._rejection_result(
                        f"Poor email domain detected: '{domain}'",
                        cleaned_email, cleaned_website, cleaned_phone
                    )

        # Rule C: No usable contact info
        if not cleaned_email and not cleaned_website and not cleaned_phone:
            return self._rejection_result(
                "No usable contact information (phone, email, website)",
                cleaned_email, cleaned_website, cleaned_phone
            )

        # Passed cleanup
        return {
            "cleaned_email": cleaned_email,
            "cleaned_website": cleaned_website,
            "cleaned_phone": cleaned_phone,
            "is_rejected": False,
            "rejection_reason": None
        }

    def _rejection_result(self, reason: str, email: Optional[str], website: Optional[str], phone: Optional[str]) -> Dict[str, Any]:
        return {
            "cleaned_email": email,
            "cleaned_website": website,
            "cleaned_phone": phone,
            "is_rejected": True,
            "rejection_reason": reason
        }

    def _normalize_email(self, email: Optional[str]) -> Optional[str]:
        if not email:
            return None
        return email.strip().lower()

    def _normalize_website(self, website: Optional[str]) -> Optional[str]:
        if not website:
            return None
        website = website.strip()
        # Remove protocol and www
        website = re.sub(r"^https?://(www\.)?", "", website)
        # Remove trailing slash
        website = website.rstrip("/")
        return website.lower()

    def _normalize_phone(self, phone: Optional[str]) -> Optional[str]:
        if not phone:
            return None
        # Keep digits and a plus sign for international formatting
        cleaned = re.sub(r"[^\d+]", "", phone)
        return cleaned if cleaned else None


lead_cleanup_service = LeadCleanupService()
