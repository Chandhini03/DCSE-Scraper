from fastapi import APIRouter, HTTPException, Header
from typing import Optional
import subprocess
import os
from datetime import datetime

from api.core.config import settings

router = APIRouter()

# Track the last triggered time in-memory (good enough for a small internal tool)
_last_triggered: Optional[datetime] = None
_scraper_path = os.environ.get("SCRAPER_SCRIPT_PATH", "../DCSE-scrapper/test_serpapi.py")


@router.post("/trigger")
async def trigger_scrape(x_api_key: Optional[str] = Header(None)):
    """
    Trigger the scraper manually.
    Requires X-API-Key header matching API_SECRET_KEY in .env.

    The scraper script path is set via the SCRAPER_SCRIPT_PATH env var,
    defaulting to ../DCSE-scrapper/test_serpapi.py (sibling repo layout).
    """
    if x_api_key != settings.API_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Invalid or missing API key")

    if not os.path.exists(_scraper_path):
        raise HTTPException(
            status_code=500,
            detail=f"Scraper script not found at: {_scraper_path}. Set SCRAPER_SCRIPT_PATH in .env",
        )

    global _last_triggered
    _last_triggered = datetime.utcnow()

    # Fire-and-forget: scraper runs in background, API returns immediately
    subprocess.Popen(
        ["python", _scraper_path],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    return {
        "status": "started",
        "triggered_at": _last_triggered.isoformat(),
        "script": _scraper_path,
    }


@router.get("/status")
async def scrape_status():
    """Return the last time a scrape was triggered via this API."""
    return {
        "last_triggered": _last_triggered.isoformat() if _last_triggered else None,
    }
