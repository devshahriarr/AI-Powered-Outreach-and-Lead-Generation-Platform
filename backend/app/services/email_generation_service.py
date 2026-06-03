import logging
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.exceptions import ConfigurationError, CateringAppException
from app.models.campaign import Campaign
from app.models.lead import Lead
from app.models.platform_settings import PlatformSettings
from app.schemas.outreach_message import GeneratedEmailContent

logger = logging.getLogger("app.services.email_generation")

# Supported sequence positions with human-readable context labels
MESSAGE_TYPE_CONTEXT: dict[str, str] = {
    "cold_outreach": (
        "This is the very first email. Introduce the restaurant briefly and lead with value. "
        "Do not reference any prior contact."
    ),
    "followup_1": (
        "This is the first follow-up. The lead has not responded yet. "
        "Be friendly, reference the earlier email briefly, and add a new value point."
    ),
    "followup_2": (
        "This is the second follow-up. Keep it short. "
        "Add urgency or a fresh angle (e.g. a seasonal promotion or limited slots)."
    ),
    "final_followup": (
        "This is the final follow-up. Keep it very brief. "
        "Acknowledge it may not be the right time and leave the door open for future contact."
    ),
}

# OpenAI model used for generation
DEFAULT_MODEL = "gpt-4o"


class EmailGenerationService:
    """
    AI-powered email generation service using OpenAI structured outputs.

    Generates professional, personalised cold outreach and follow-up emails
    for catering leads. All outputs are bound to the `GeneratedEmailContent`
    Pydantic schema via OpenAI's `parse()` method for guaranteed JSON structure.

    Uses the platform-wide `PlatformSettings` singleton for sender identity and
    restaurant context — no per-campaign settings required.
    """

    def __init__(self) -> None:
        self._client: AsyncOpenAI | None = None

    def _get_client(self) -> AsyncOpenAI:
        """Lazily initialises and returns the OpenAI async client."""
        if not settings.OPENAI_API_KEY:
            raise ConfigurationError(
                "OPENAI_API_KEY is not set. Configure it in .env to enable email generation."
            )
        if self._client is None:
            self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return self._client

    def _build_system_prompt(self, ps: PlatformSettings) -> str:
        """Constructs the system-level persona, tone, and constraint prompt."""
        brand_voice_note = (
            f"Tone guidance: {ps.brand_voice}" if ps.brand_voice
            else "Tone: warm, professional, concise — never pushy or salesy."
        )
        return (
            f"You are {ps.sender_name}, a sales representative for {ps.restaurant_name}, "
            f"a professional catering company based in {ps.restaurant_location}. "
            f"Your task is to write a concise B2B outreach or follow-up email "
            f"to a business decision-maker.\n\n"
            f"{brand_voice_note}\n\n"
            "Hard requirements:\n"
            "- Body must be 150 words or fewer\n"
            "- Professional, warm — no spam triggers\n"
            "- Personalise using the recipient's business name\n"
            "- No excessive exclamation marks or buzzwords\n"
            "- End with a single, clear call-to-action\n"
            "- Do NOT include a sign-off (e.g. 'Best regards') — added separately\n"
        )

    def _build_user_prompt(
        self,
        lead: Lead,
        campaign: Campaign,
        ps: PlatformSettings,
        message_type: str,
    ) -> str:
        """Constructs the user-level generation prompt with full personalisation context."""
        context = MESSAGE_TYPE_CONTEXT.get(message_type, MESSAGE_TYPE_CONTEXT["cold_outreach"])
        business_name = lead.name or "your company"
        business_type = lead.business_type or "business"
        location = lead.address or ps.restaurant_location

        return (
            f"Write an outreach email with the following context:\n\n"
            f"Sequence: {message_type.replace('_', ' ').title()}\n"
            f"Context note: {context}\n\n"
            f"Recipient Business: {business_name}\n"
            f"Business Type: {business_type}\n"
            f"Business Location: {location}\n\n"
            f"Our Platform Offer: {ps.offer}\n"
            f"Call to Action: {ps.call_to_action}\n"
            f"Campaign Goal: {campaign.offer}\n\n"
            "Generate: a subject line, body (≤150 words), and a clear CTA sentence."
        )

    async def generate(
        self,
        lead: Lead,
        campaign: Campaign,
        platform_settings: PlatformSettings,
        message_type: str = "cold_outreach",
        model: str = DEFAULT_MODEL,
    ) -> tuple[GeneratedEmailContent, str]:
        """
        Generates a structured outreach email using OpenAI structured outputs.

        Args:
            lead: The target lead record.
            campaign: The campaign this message belongs to.
            platform_settings: Global restaurant/sender configuration singleton.
            message_type: Sequence position (cold_outreach / followup_*).
            model: OpenAI model name override.

        Returns:
            Tuple of (GeneratedEmailContent, model_name_used).

        Raises:
            ConfigurationError: OPENAI_API_KEY missing.
            CateringAppException: OpenAI API error or empty response.
        """
        client = self._get_client()
        system_prompt = self._build_system_prompt(platform_settings)
        user_prompt = self._build_user_prompt(lead, campaign, platform_settings, message_type)

        logger.info(
            "Generating '%s' email for lead '%s' (campaign %d) using model '%s'",
            message_type, lead.name, campaign.id, model,
        )

        try:
            response = await client.beta.chat.completions.parse(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                response_format=GeneratedEmailContent,
                temperature=0.7,
                max_tokens=512,
            )

            parsed = response.choices[0].message.parsed
            if parsed is None:
                raise CateringAppException(
                    "OpenAI returned an empty structured response. Please retry.",
                    status_code=502,
                )

            logger.info(
                "Email generated successfully for lead '%s' (type: %s)",
                lead.name, message_type,
            )
            return parsed, model

        except CateringAppException:
            raise
        except Exception as exc:
            logger.error("OpenAI API error during email generation: %s", str(exc))
            raise CateringAppException(
                f"Email generation failed: {str(exc)}",
                status_code=502,
            ) from exc


# Singleton service instance
email_generation_service = EmailGenerationService()
