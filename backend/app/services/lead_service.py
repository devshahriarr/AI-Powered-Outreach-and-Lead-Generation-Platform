import logging
from urllib.parse import urlparse
from typing import Any, Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.models.lead import Lead
from app.repositories.lead_repository import lead_repository, LeadRepository
from app.services.base_service import BaseService
from app.services.google_places import google_places_service, GooglePlacesService

logger = logging.getLogger("app.services.lead_service")


class LeadService(BaseService[Lead]):
    """
    Lead Service pipeline coordinating Google Places lookups,
    duplicate prevention, contact resolution, and database commits.
    """

    def __init__(
        self,
        repository: LeadRepository = lead_repository,
        places_service: GooglePlacesService = google_places_service
    ) -> None:
        super().__init__(repository)
        self.repository = repository
        self.places_service = places_service

    async def discover_and_ingest_leads(
        self,
        db: AsyncSession,
        *,
        location: Optional[str] = None,
        radius_miles: Optional[float] = None,
        category: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Ingestion pipeline mapping Places searches, verifying duplicates,
        resolving contact emails, and registering new leads.
        """
        # Load core configuration defaults if overrides are not provided
        search_location = location or settings.DEFAULT_SEARCH_LOCATION
        search_radius = radius_miles or settings.DEFAULT_SEARCH_RADIUS_MILES
        
        # Determine categories to search: single target or complete target list
        target_categories = [category] if category else settings.TARGET_BUSINESS_CATEGORIES

        scanned_count = 0
        ingested_count = 0
        duplicates_skipped = 0
        ingested_leads = []

        logger.info(
            "Starting Lead Ingestion Pipeline. Center: '%s', Radius: %.1f miles. Target categories: %s",
            search_location, search_radius, target_categories
        )

        for cat in target_categories:
            # Build search string query
            search_query = f"{cat} near {search_location}"
            logger.info("Executing places search for query: '%s'", search_query)
            
            places = await self.places_service.search_places(search_query)
            scanned_count += len(places)

            for place in places:
                place_id = place.get("place_id")
                if not place_id:
                    continue

                # 1. Duplicate Prevention check
                existing_lead = await self.repository.get_by_google_place_id(db, place_id)
                if existing_lead:
                    duplicates_skipped += 1
                    logger.debug("Lead with google_place_id '%s' already exists. Skipping.", place_id)
                    continue

                # 2. Fetch extended details (phone, website, coordinates)
                details = await self.places_service.get_place_details(place_id)
                if not details:
                    # Fallback to standard place fields if details lookup fails
                    details = place

                # 3. Resolve target business email for primary email outreach
                website = details.get("website")
                email = self._resolve_outreach_email(details.get("name", "business"), website)

                # 4. Construct DB creation payload
                lead_data = {
                    "google_place_id": place_id,
                    "name": details.get("name", place.get("name", "Unknown Business")),
                    "business_type": cat,
                    "address": details.get("formatted_address", place.get("formatted_address")),
                    "phone_number": details.get("formatted_phone_number"),
                    "website": website,
                    "email": email,
                    "rating": details.get("rating", place.get("rating")),
                    "user_ratings_total": details.get("user_ratings_total", place.get("user_ratings_total")),
                    "latitude": details.get("geometry", {}).get("location", {}).get("lat"),
                    "longitude": details.get("geometry", {}).get("location", {}).get("lng"),
                    "status": "discovered",
                    "notes": f"Ingested via Place Search for: '{search_query}'"
                }

                # 5. Commit record safely using the repository
                try:
                    new_lead = await self.repository.create(db, obj_in=lead_data)
                    ingested_count += 1
                    ingested_leads.append(new_lead)
                    logger.info("Successfully ingested new lead: '%s' (%s)", new_lead.name, place_id)
                except Exception as exc:
                    logger.error("Failed to commit lead '%s' to database: %s", lead_data["name"], str(exc))
                    # Continue pipeline despite single insert failures
                    continue

        return {
            "search_center": search_location,
            "radius_miles": search_radius,
            "categories_searched": target_categories,
            "total_scanned": scanned_count,
            "new_leads_ingested": ingested_count,
            "duplicates_skipped": duplicates_skipped,
            "leads": [
                {"id": l.id, "name": l.name, "email": l.email, "business_type": l.business_type}
                for l in ingested_leads
            ]
        }

    def _resolve_outreach_email(self, business_name: str, website: Optional[str]) -> Optional[str]:
        """
        Formulates a clean contact email address based on corporate domain names.
        If no website is resolved, creates a standardized target matching the business initials.
        """
        if website:
            try:
                parsed_url = urlparse(website)
                domain = parsed_url.netloc
                # Remove common prefixes
                if domain.startswith("www."):
                    domain = domain[4:]
                return f"info@{domain}"
            except Exception:
                pass
                
        # Fallback based on business name formatting
        clean_name = "".join(c for c in business_name if c.isalnum()).lower()
        if not clean_name:
            clean_name = "business"
        return f"contact@{clean_name}.com"


# Singleton service instance
lead_service = LeadService()
