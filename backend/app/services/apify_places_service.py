"""
apify_places_service.py
-----------------------
Drop-in replacement for google_places.GooglePlacesService.

Calls the Apify Google Maps Scraper actor (compass/crawler-google-places)
via the Apify REST API, then normalises the actor's output into the same
dict shape that lead_service already consumes:

  search_places()   → List[Dict]  – same keys as Google Places Text Search
  get_place_details()→ Dict       – same keys as Google Places Details

Provider is activated when LEAD_PROVIDER=apify in the environment.
"""

import asyncio
import logging
import time
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger("app.services.apify_places")

# ---------------------------------------------------------------------------
# Apify actor identifier
# ---------------------------------------------------------------------------
ACTOR_ID = "compass~crawler-google-places"
APIFY_BASE = "https://api.apify.com/v2"

# How long (seconds) to wait for an Apify run to finish before giving up
RUN_TIMEOUT_SECONDS = 120
# Polling interval while waiting for the run to finish
POLL_INTERVAL_SECONDS = 3


class ApifyPlacesService:
    """
    Wraps the Apify Google Maps Scraper actor and exposes the same two methods
    that GooglePlacesService provides, so lead_service works unchanged.
    """

    def __init__(self) -> None:
        self.api_token = settings.APIFY_API_TOKEN
        if self.api_token and (
            "your-apify" in self.api_token
            or self.api_token == "placeholder"
            or not self.api_token.strip()
        ):
            self.api_token = None

    # ------------------------------------------------------------------
    # Public interface – mirrors GooglePlacesService
    # ------------------------------------------------------------------

    async def search_places(self, query: str) -> List[Dict[str, Any]]:
        """
        Run the Apify Google Maps Scraper for *query* and return a list of
        place dicts using the same key schema as Google Places Text Search:

          place_id, name, formatted_address, geometry.location.{lat,lng},
          rating, user_ratings_total, types
        """
        if not self.api_token:
            logger.error(
                "APIFY_API_TOKEN is not configured. "
                "Cannot fetch real data from Apify. Returning empty list."
            )
            return []

        logger.info("Apify search_places: starting actor run for query '%s'", query)

        # Build actor input – extract the location portion of the query so we
        # can pass it as locationQuery while the category becomes the search term.
        search_string, location = self._split_query(query)

        actor_input: Dict[str, Any] = {
            "searchStringsArray": [search_string],
            "locationQuery": location,
            "maxCrawledPlacesPerSearch": 20,
            "language": "en",
            "includeReviews": False,
            "maxReviews": 0,
            "scrapeSocialMediaProfiles": {
                "facebooks": False,
                "instagrams": False,
                "linkedins": False,
                "twitters": False,
                "youtubes": False,
                "tiktoks": False,
            },
            "maximumLeadsEnrichmentRecords": 0,
        }

        try:
            raw_items = await self._run_actor_and_get_items(actor_input)
        except Exception as exc:
            logger.error("Apify actor run failed for query '%s': %s", query, exc, exc_info=True)
            return []

        # Normalise to the Google Places shape
        normalised: List[Dict[str, Any]] = []
        for item in raw_items:
            mapped = self._map_search_item(item)
            if mapped:
                normalised.append(mapped)

        logger.info(
            "Apify search_places: got %d results for query '%s'", len(normalised), query
        )
        return normalised

    async def get_place_details(self, place_id: str) -> Optional[Dict[str, Any]]:
        """
        Apify returns all detail fields (phone, website, coordinates) already
        in the search results, so we cache them on the place dict itself and
        retrieve them here from a simple in-memory store populated during
        search_places().

        If the place is not in the cache (e.g. place_id was fetched earlier),
        we return None and lead_service will fall back to the search result.
        """
        cached = _detail_cache.get(place_id)
        if cached:
            logger.debug("Apify get_place_details: cache hit for '%s'", place_id)
            return cached

        # No cached entry – return None so lead_service falls back to the
        # top-level place dict (which already has all fields we need).
        logger.debug(
            "Apify get_place_details: no cache entry for '%s', returning None", place_id
        )
        return None

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _split_query(self, query: str):
        """
        Splits 'Law offices near Banani, Dhaka, Bangladesh' into
        ('Law offices', 'Banani, Dhaka, Bangladesh').
        Falls back to using the full query as the search term with the
        configured default location.
        """
        lower = query.lower()
        for separator in [" near ", " in ", ", "]:
            idx = lower.find(separator)
            if idx != -1:
                search = query[:idx].strip()
                location = query[idx + len(separator):].strip()
                return search, location

        # No separator found – use the full query as search string and the
        # configured default location.
        return query.strip(), settings.DEFAULT_SEARCH_LOCATION

    async def _run_actor_and_get_items(
        self, actor_input: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        1. Starts an Apify actor run (synchronous-wait endpoint with 120s timeout)
        2. Reads all dataset items from the finished run
        Returns the raw list of actor output items.
        """
        run_url = (
            f"{APIFY_BASE}/acts/{ACTOR_ID}/runs"
            f"?token={self.api_token}&waitForFinish={RUN_TIMEOUT_SECONDS}"
        )

        async with httpx.AsyncClient(timeout=RUN_TIMEOUT_SECONDS + 30) as client:
            logger.debug("Apify: POST %s", run_url)
            run_resp = await client.post(run_url, json=actor_input)

        if run_resp.status_code not in (200, 201):
            logger.error(
                "Apify actor start failed. HTTP %d: %s",
                run_resp.status_code,
                run_resp.text[:500],
            )
            return []

        run_data = run_resp.json()
        run_info = run_data.get("data", {})
        run_status = run_info.get("status", "UNKNOWN")
        dataset_id = run_info.get("defaultDatasetId")

        logger.info(
            "Apify actor run finished. Status: %s, datasetId: %s",
            run_status,
            dataset_id,
        )

        if run_status != "SUCCEEDED":
            logger.error(
                "Apify actor did not succeed. Final status: %s", run_status
            )
            return []

        if not dataset_id:
            logger.error("Apify actor run returned no dataset ID.")
            return []

        # Fetch the dataset items
        items_url = (
            f"{APIFY_BASE}/datasets/{dataset_id}/items"
            f"?token={self.api_token}&format=json&clean=true"
        )
        async with httpx.AsyncClient(timeout=60) as client:
            items_resp = await client.get(items_url)

        if items_resp.status_code != 200:
            logger.error(
                "Apify dataset fetch failed. HTTP %d: %s",
                items_resp.status_code,
                items_resp.text[:500],
            )
            return []

        items = items_resp.json()
        if not isinstance(items, list):
            logger.error("Apify dataset response is not a list: %r", type(items))
            return []

        return items

    def _map_search_item(self, item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Maps a single Apify Google Maps Scraper output item to the Google
        Places Text Search result shape consumed by lead_service.

        Apify field → Google Places field:
          title               → name
          placeId             → place_id
          address             → formatted_address
          location.lat/lng    → geometry.location.lat/lng
          totalScore          → rating
          reviewsCount        → user_ratings_total
          categoryName        → types[0]
          phone               → (stored in detail cache)
          website             → (stored in detail cache)
        """
        place_id = item.get("placeId") or item.get("id")
        name = item.get("title") or item.get("name")

        if not place_id or not name:
            logger.debug("Skipping Apify item with missing placeId or title: %r", item)
            return None

        location = item.get("location") or {}
        lat = location.get("lat")
        lng = location.get("lng")

        category = item.get("categoryName") or item.get("category") or "establishment"

        mapped: Dict[str, Any] = {
            "place_id": place_id,
            "name": name,
            "formatted_address": item.get("address") or item.get("fullAddress") or "",
            "geometry": {
                "location": {
                    "lat": lat,
                    "lng": lng,
                }
            },
            "rating": item.get("totalScore"),
            "user_ratings_total": item.get("reviewsCount"),
            "types": [category.lower(), "establishment", "point_of_interest"],
        }

        # ------------------------------------------------------------------
        # Pre-populate the details cache with phone/website so that
        # get_place_details() can serve them without a second API call.
        # ------------------------------------------------------------------
        detail_entry: Dict[str, Any] = {
            "name": name,
            "formatted_address": mapped["formatted_address"],
            "formatted_phone_number": item.get("phone"),
            "website": item.get("website"),
            "geometry": mapped["geometry"],
            "rating": mapped["rating"],
            "user_ratings_total": mapped["user_ratings_total"],
        }
        _detail_cache[place_id] = detail_entry

        return mapped


# ---------------------------------------------------------------------------
# Module-level detail cache  (place_id → detail dict)
# Populated by search_places(), consumed by get_place_details().
# ---------------------------------------------------------------------------
_detail_cache: Dict[str, Dict[str, Any]] = {}


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------
apify_places_service = ApifyPlacesService()
