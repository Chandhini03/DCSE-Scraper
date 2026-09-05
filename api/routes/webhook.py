"""
Webhook endpoints used exclusively by the GitHub Actions matrix scraper.

POST /webhook/ingest
    Receives a JSON array of scraped author objects and bulk-upserts them
    into the same MongoDB collections used by the rest of the API.
    Authenticated via the X-Webhook-Secret header.

POST /webhook/pending
    Accepts {"author_ids": [...]} and returns {"pending_ids": [...]}
    — the subset of those IDs whose last successful scrape is older than
    SCRAPE_STALENESS_HOURS (or have never been scraped).  The scraper
    uses this to skip authors that are still fresh so it does minimal
    work on each run.
"""

from fastapi import APIRouter, HTTPException, Header, Request
from typing import Optional
from datetime import datetime, timezone, timedelta
from pymongo import UpdateOne

from api.core.database import get_db
from api.core.config import settings

router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _auth(secret: Optional[str]) -> None:
    """Raise 403 if the provided secret doesn't match the configured one."""
    if secret != settings.WEBHOOK_SECRET:
        raise HTTPException(
            status_code=403,
            detail="Invalid or missing X-Webhook-Secret header.",
        )


def _infer_pub_type_from_venue(venue_string: str) -> str:
    """Mirror of the same helper in the GitHub Actions scraper."""
    if not venue_string:
        return "unknown"

    text = venue_string.lower()

    conference_keywords = [
        "conference", "proceedings", "proc.", "workshop", "symposium",
        "icml", "neurips", "cvpr", "iccv", "eccv", "aaai", "ijcai",
        "acl", "emnlp", "naacl", "sigmod", "vldb", "icde", "kdd",
        "www", "chi", "uist", "infocom", "globecom", "icdcs",
    ]
    journal_keywords = [
        "journal", "transactions", "trans.", "letters", "review",
        "magazine", "ieee access", "plos", "nature", "science",
        "lancet", "annals", "archives", "bulletin",
    ]
    book_keywords = ["book", "springer", "wiley", "elsevier", "chapter"]

    if any(kw in text for kw in conference_keywords):
        return "conference"
    if any(kw in text for kw in journal_keywords):
        return "journal"
    if any(kw in text for kw in book_keywords):
        return "book"
    return "unknown"


# ---------------------------------------------------------------------------
# POST /webhook/ingest
# ---------------------------------------------------------------------------

@router.post("/ingest")
async def ingest(
    request: Request,
    x_webhook_secret: Optional[str] = Header(None),
):
    """
    Receive scraped data from the GitHub Actions matrix scraper and
    upsert it into MongoDB.

    Expected body: a JSON array of author objects, each shaped like:
    [
      {
        "author_id": "...",
        "name": "...",
        "affiliation": "...",
        "total_citations": 123,
        "citations_since_2021": 45,
        "articles": [
          {
            "title": "...",
            "year": 2023,
            "cited_by": 10,
            "pub_type": "journal",
            "link": "https://...",
            "venue": "...",
            "all_authors": "Author A and Author B"
          }
        ]
      }
    ]
    """
    _auth(x_webhook_secret)

    try:
        authors_data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Request body must be valid JSON.")

    if not isinstance(authors_data, list):
        raise HTTPException(status_code=400, detail="Expected a JSON array of author objects.")

    if len(authors_data) == 0:
        return {"status": "ok", "message": "Empty payload — nothing to ingest."}

    db = get_db()
    now = datetime.now(timezone.utc)

    author_ops = []
    pub_ops = []

    for author in authors_data:
        author_id = author.get("author_id")
        if not author_id:
            continue  # skip malformed entries silently

        # Build the author upsert
        author_ops.append(UpdateOne(
            {"_id": author_id},
            {
                "$set": {
                    "name": author.get("name", "Unknown"),
                    "affiliation": author.get("affiliation", ""),
                    "total_citations": author.get("total_citations", 0),
                    "citations_since_2021": author.get("citations_since_2021", 0),
                    "total_publications": len(author.get("articles", [])),
                    "scraped_at": now,
                }
            },
            upsert=True,
        ))

        for article in author.get("articles", []):
            title = article.get("title", "")
            if not title:
                continue

            # If the scraper didn't infer the type, try from venue
            pub_type = article.get("pub_type", "unknown")
            venue = article.get("venue")
            if pub_type == "unknown" and venue:
                pub_type = _infer_pub_type_from_venue(venue)

            pub_ops.append(UpdateOne(
                {"author_id": author_id, "title": title},
                {
                    "$set": {
                        "author_id": author_id,
                        "author_name": author.get("name", "Unknown"),
                        "all_authors": article.get("all_authors"),
                        "title": title,
                        "year": article.get("year"),
                        "cited_by": article.get("cited_by", 0),
                        "pub_type": pub_type,
                        "venue": venue,
                        "link": article.get("link"),
                        "scraped_at": now,
                    }
                },
                upsert=True,
            ))

    # Run bulk upserts
    authors_upserted = authors_modified = 0
    pubs_upserted = pubs_modified = 0

    if author_ops:
        result = await db.authors.bulk_write(author_ops)
        authors_upserted = result.upserted_count
        authors_modified = result.modified_count

    if pub_ops:
        result = await db.publications.bulk_write(pub_ops)
        pubs_upserted = result.upserted_count
        pubs_modified = result.modified_count

    return {
        "status": "ok",
        "authors": {"upserted": authors_upserted, "modified": authors_modified},
        "publications": {"upserted": pubs_upserted, "modified": pubs_modified},
        "ingested_at": now.isoformat(),
    }


# ---------------------------------------------------------------------------
# POST /webhook/pending
# ---------------------------------------------------------------------------

@router.post("/pending")
async def pending(
    request: Request,
    x_webhook_secret: Optional[str] = Header(None),
):
    """
    Given a list of author IDs, return those that haven't been scraped
    within the configured staleness window (SCRAPE_STALENESS_HOURS).

    Request body:  {"author_ids": ["id1", "id2", ...]}
    Response body: {"pending_ids": ["id1", ...], "stale_after_hours": 44}

    The GitHub Actions scraper calls this first so it only scrapes
    authors whose data is actually stale — keeping the run fast and
    well below GitHub's abuse thresholds.
    """
    _auth(x_webhook_secret)

    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Request body must be valid JSON.")

    all_ids: list = body.get("author_ids", [])
    if not all_ids:
        return {"pending_ids": [], "stale_after_hours": settings.SCRAPE_STALENESS_HOURS}

    db = get_db()
    stale_cutoff = datetime.now(timezone.utc) - timedelta(hours=settings.SCRAPE_STALENESS_HOURS)

    # Find authors who were scraped recently (still fresh)
    fresh_cursor = db.authors.find(
        {
            "_id": {"$in": all_ids},
            "scraped_at": {"$gte": stale_cutoff},
        },
        {"_id": 1},
    )
    fresh_docs = await fresh_cursor.to_list(None)
    fresh_ids = {doc["_id"] for doc in fresh_docs}

    # Everyone not in fresh_ids needs to be scraped
    pending_ids = [aid for aid in all_ids if aid not in fresh_ids]

    return {
        "pending_ids": pending_ids,
        "stale_after_hours": settings.SCRAPE_STALENESS_HOURS,
        "total_requested": len(all_ids),
        "fresh_count": len(fresh_ids),
        "pending_count": len(pending_ids),
    }
