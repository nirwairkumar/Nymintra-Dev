from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nymintra API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "SUPER_SECRET_KEY_FOR_JWT_PLEASE_CHANGE_IN_PROD"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # SUPABASE CREDENTIALS
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # FRONTEND
    FRONTEND_URL: str = "http://localhost:3000"
    
    # RAZORPAY
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
