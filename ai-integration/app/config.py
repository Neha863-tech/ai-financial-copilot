import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Groq configuration
    GROQ_API_KEY: str = "replace_with_real_groq_api_key"
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_FALLBACK_MODEL: str = "llama-3.1-8b-instant"
    GROQ_TEMPERATURE: float = 0.2
    GROQ_TIMEOUT_SECONDS: int = 25

    # Node.js backend integration
    NODE_BACKEND_URL: str = "http://localhost:5000"
    AI_SERVICE_API_KEY: str = "finsight_internal_ai_secret_key_2026"

    # Microservice configuration
    AI_SERVICE_PORT: int = 8001
    AI_SERVICE_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5000"
    UPLOAD_MAX_SIZE_MB: int = 15

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
