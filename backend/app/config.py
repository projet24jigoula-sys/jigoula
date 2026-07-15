from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Loyalty Tunisia API"
    environment: str = "development"

    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db: str = "loyalty_pfe"

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 120

    frontend_origins: str = "http://localhost:5173,http://localhost:3000"
    public_frontend_url: str = "http://localhost:5173"

    scan_cooldown_minutes: int = 0

    admin_email: str = "admin@loyalty.tn"
    admin_password: str = "Admin123!"
    admin_full_name: str = "Administrateur Principal"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

    @property
    def cors_origins(self) -> list[str]:
        return ["*"]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()