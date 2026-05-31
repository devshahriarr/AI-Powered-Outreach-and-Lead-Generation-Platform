import logging
import random
from typing import Any, Dict, List, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("app.services.google_places")


class GooglePlacesService:
    """
    Service client for integrating Google Places API.
    Supports a fully automatic Sandbox generator if no Google API key is configured.
    """

    def __init__(self) -> None:
        self.api_key = settings.GOOGLE_MAPS_API_KEY
        # Treat template placeholders as disabled/None to activate Sandbox Mock automatically
        if self.api_key and ("your-google-maps" in self.api_key or self.api_key == "placeholder" or not self.api_key.strip()):
            self.api_key = None
        self.text_search_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        self.details_url = "https://maps.googleapis.com/maps/api/place/details/json"

    async def search_places(self, query: str) -> List[Dict[str, Any]]:
        """
        Executes a place lookup query using Google Places Text Search API.
        Automatically defaults to Sandbox Mock generator if API key is not present.
        """
        if not self.api_key:
            logger.warning(
                "GOOGLE_MAPS_API_KEY environment variable is not configured. "
                "Activating Local Sandbox Mock Generator for search query: '%s'", query
            )
            return self._generate_sandbox_search_results(query)

        try:
            params = {
                "query": query,
                "key": self.api_key
            }
            async with httpx.AsyncClient() as client:
                response = await client.get(self.text_search_url, params=params, timeout=10.0)
                
            if response.status_code != 200:
                logger.error(
                    "Google Places search API error. Status: %d, Response: %s", 
                    response.status_code, response.text
                )
                return []
                
            data = response.json()
            if data.get("status") not in ("OK", "ZERO_RESULTS"):
                logger.error("Google Places API error status returned: %s", data.get("status"))
                return []
                
            return data.get("results", [])
            
        except Exception as exc:
            logger.error("Exception raised querying Google Places search: %s", str(exc), exc_info=True)
            return []

    async def get_place_details(self, place_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetches contact details (phone, website, coordinates) for a specific Place ID.
        Automatically defaults to Sandbox Mock details generator if API key is not present.
        """
        if not self.api_key:
            logger.debug("Sandbox mode active: fetching details for place_id '%s'", place_id)
            return self._generate_sandbox_place_details(place_id)

        try:
            params = {
                "place_id": place_id,
                "fields": "name,formatted_address,formatted_phone_number,website,geometry,rating,user_ratings_total",
                "key": self.api_key
            }
            async with httpx.AsyncClient() as client:
                response = await client.get(self.details_url, params=params, timeout=10.0)
                
            if response.status_code != 200:
                logger.error(
                    "Google Places details API error. Status: %d, Response: %s",
                    response.status_code, response.text
                )
                return None
                
            data = response.json()
            if data.get("status") != "OK":
                logger.error("Google Places Details API error status returned: %s", data.get("status"))
                return None
                
            return data.get("result", {})
            
        except Exception as exc:
            logger.error("Exception raised querying Google Places details: %s", str(exc), exc_info=True)
            return None

    # ==============================================================================
    # Local Sandbox Generator Helper Engines
    # ==============================================================================

    def _generate_sandbox_search_results(self, query: str) -> List[Dict[str, Any]]:
        """Generates realistic business mock items in Banani, Dhaka."""
        # Detect the requested business type/category in query
        detected_category = "General Office"
        for cat in settings.TARGET_BUSINESS_CATEGORIES:
            if cat.lower()[:5] in query.lower():
                detected_category = cat
                break

        # Generate 4 to 8 mock businesses based on category
        results = []
        prefixes = ["Banani", "Dhaka", "Bengal", "Navana", "Delta", "Apex", "Prasad", "Symphony"]
        suffixes = {
            "Law offices": ["Law Chambers", "Legal Associates", "Partners & Co", "Corporate Advocates"],
            "Schools": ["International School", "Academy", "Preparatory School", "High School"],
            "Production studios": ["Media House", "Studios", "Creative Lab", "Broadcasting Co"],
            "Insurance offices": ["General Insurance", "Life Trust", "Alliance Assurance", "Bima Hub"],
            "Corporate offices": ["HQ", "Holdings", "Technologies", "Business Corporation"],
            "Businesses with multiple employees": ["Consulting", "Group Ltd", "Investments", "Enterprises"],
            "General Office": ["Services Ltd", "Holdings", "Partners", "Hub"]
        }

        # Seed titles based on category
        available_suffixes = suffixes.get(detected_category, suffixes["General Office"])
        
        # Fixed list size for predictable mock seed ingestion
        for i in range(1, 6):
            pref = prefixes[i % len(prefixes)]
            suff = available_suffixes[i % len(available_suffixes)]
            name = f"{pref} {suff}"
            place_id = f"mock_place_id_{detected_category.replace(' ', '_').lower()}_{i}"
            
            # Banani center coordinates (approx 23.7940° N, 90.4043° E)
            lat = 23.7940 + (random.uniform(-0.015, 0.015))
            lng = 90.4043 + (random.uniform(-0.015, 0.015))

            results.append({
                "place_id": place_id,
                "name": name,
                "formatted_address": f"Road No. {i * 2}, House {i + 12}, Banani, Dhaka, Bangladesh",
                "geometry": {
                    "location": {
                        "lat": lat,
                        "lng": lng
                    }
                },
                "rating": round(random.uniform(3.5, 4.9), 1),
                "user_ratings_total": random.randint(5, 120),
                "types": [detected_category.lower(), "establishment", "point_of_interest"]
            })
            
        return results

    def _generate_sandbox_place_details(self, place_id: str) -> Dict[str, Any]:
        """Generates realistic additional contact details for sandbox mock place IDs."""
        # Deconstruct place_id to find category details
        parts = place_id.split("_")
        name_part = " ".join(part.capitalize() for part in parts[3:]) if len(parts) > 3 else "Business Entity"
        
        # Phone numbers inside Bangladesh (Dhaka)
        phone = f"+880 2-98{random.randint(1000, 9999)}"
        # Clean domain website name
        clean_name = place_id.replace("mock_place_id_", "").replace("_", "")
        website = f"https://www.{clean_name}.com"
        
        return {
            "name": f"Mocked {name_part}",
            "formatted_address": "Road No. 11, Banani, Dhaka, Bangladesh",
            "formatted_phone_number": phone,
            "website": website,
            "geometry": {
                "location": {
                    "lat": 23.7940,
                    "lng": 90.4043
                }
            },
            "rating": 4.5,
            "user_ratings_total": 42
        }


# Singleton service client
google_places_service = GooglePlacesService()
