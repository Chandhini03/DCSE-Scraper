from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "scholar_db"
    SERPAPI_KEY: str = ""
    API_SECRET_KEY: str = "change-this-in-production"  # used to protect /scrape/trigger
    SCRAPER_SCRIPT_PATH: str = "../DCSE-scrapper/test_serpapi.py"

    # Shared secret used by the GitHub Actions scraper to authenticate webhook POSTs
    WEBHOOK_SECRET: str = "change-this-in-production"

    # Authors not scraped within this many hours are treated as "pending" by /webhook/pending
    SCRAPE_STALENESS_HOURS: int = 44  # once per 2-day cycle with a 4-hour grace window

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
