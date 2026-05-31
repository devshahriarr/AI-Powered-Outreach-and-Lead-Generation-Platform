from typing import List, Literal
from pydantic import Field, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Core App Configs
    APP_NAME: str = "Catering Outreach Platform"
    APP_ENV: Literal["development", "staging", "production"] = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "placeholder-secret-key-change-in-production"

    # Database Configuration
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/catering_outreach"

    # Lead Provider Selection: 'apify' (default) or 'google'
    LEAD_PROVIDER: Literal["apify", "google"] = "apify"

    # Third-Party API Keys
    GOOGLE_MAPS_API_KEY: str | None = None
    APIFY_API_TOKEN: str | None = None
    OPENAI_API_KEY: str | None = None
    SENDGRID_API_KEY: str | None = None
    TWILIO_ACCOUNT_SID: str | None = None
    TWILIO_AUTH_TOKEN: str | None = None

    # Catering Lead Gen Default Assumptions
    DEFAULT_SEARCH_LOCATION: str = "Banani, Dhaka, Bangladesh"
    DEFAULT_SEARCH_RADIUS_MILES: float = 10.0

    # Configurable Target Business Categories
    TARGET_BUSINESS_CATEGORIES: List[str] = [
        "Law offices",
        "Schools",
        "Production studios",
        "Insurance offices",
        "Corporate offices",
        "Businesses with multiple employees",
    ]

    # Configurable Outreach Priorities
    PRIMARY_OUTREACH_CHANNEL: Literal["email", "sms"] = "email"
    SUPPORTED_OUTREACH_CHANNELS: List[str] = ["email", "sms"]

    # CORS Allow Origins
    CORS_ORIGINS: List[str] = ["*"]

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str | None) -> str:
        if not v:
            raise ValueError("DATABASE_URL environment variable is required.")
        # Ensure it uses postgresql+asyncpg
        if v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v


# Initialize settings instance
settings = Settings()
