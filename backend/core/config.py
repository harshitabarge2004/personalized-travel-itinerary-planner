import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DEBUG: bool = False
    ALLOWED_ORIGINS: str = "*"
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    LLM_API_KEY: str = ""
    LLM_PROVIDER: str = "groq"  # groq, together, openai, gemini, mock
    LLM_MODEL: str = "openai/gpt-oss-120b"


settings = Settings()
