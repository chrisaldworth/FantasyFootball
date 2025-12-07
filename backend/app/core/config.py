from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "FPL Companion API"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite:///./fpl_companion.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # FPL API
    FPL_BASE_URL: str = "https://fantasy.premierleague.com/api"
    
    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    
    # VAPID keys for push notifications (generate with: npx web-push generate-vapid-keys)
    VAPID_PUBLIC_KEY: str = ""
    VAPID_PRIVATE_KEY: str = ""
    VAPID_EMAIL: str = "admin@fplassistant.com"
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

