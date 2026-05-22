from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "scholar_db"
    SERPAPI_KEY: str = ""
    API_SECRET_KEY: str = "change-this-in-production"  # used to protect /scrape/trigger
    SCRAPER_SCRIPT_PATH: str = "../DCSE-scrapper/test_serpapi.py"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
