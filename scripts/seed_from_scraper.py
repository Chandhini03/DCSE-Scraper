"""
scripts/seed_from_scraper.py

Run this once to bulk-import any data already collected by test_serpapi.py
into MongoDB, if your scraper saved results to a JSON file.

Usage:
    python scripts/seed_from_scraper.py --file path/to/results.json

Expected JSON format (list of author objects):
[
  {
    "author_id": "y0NGrRgAAAAJ",
    "name": "Chitrakala S",
    "affiliation": "Professor, ...",
    "citations": {"all": 1354, "since_2021": 941},
    "articles": [
      {"title": "...", "year": 2017, "cited_by": 377, "link": "..."},
      ...
    ]
  },
  ...
]
"""
import json
import argparse
from datetime import datetime
from pymongo import MongoClient, UpdateOne
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB_NAME", "scholar_db")


def infer_type(title: str) -> str:
    """Rough heuristic — improve once your scraper returns type info."""
    title_lower = title.lower()
    if any(w in title_lower for w in ["conference", "proceedings", "workshop", "symposium"]):
        return "conference"
    if any(w in title_lower for w in ["journal", "transactions", "letters", "review"]):
        return "journal"
    return "unknown"


def seed(filepath: str):
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB]

    with open(filepath) as f:
        authors_data = json.load(f)

    author_ops = []
    pub_ops = []

    for author in authors_data:
        author_id = author["author_id"]
        citations = author.get("citations", {})

        author_ops.append(UpdateOne(
            {"_id": author_id},
            {"$set": {
                "_id": author_id,
                "name": author.get("name", ""),
                "affiliation": author.get("affiliation", ""),
                "total_citations": citations.get("all", 0) if isinstance(citations, dict) else int(citations),
                "citations_since_2021": citations.get("since_2021", 0) if isinstance(citations, dict) else 0,
                "total_publications": len(author.get("articles", [])),
                "scraped_at": datetime.utcnow(),
            }},
            upsert=True,
        ))

        for article in author.get("articles", []):
            pub_ops.append(UpdateOne(
                {"author_id": author_id, "title": article.get("title", "")},
                {"$set": {
                    "author_id": author_id,
                    "author_name": author.get("name", ""),
                    "title": article.get("title", ""),
                    "year": article.get("year"),
                    "cited_by": article.get("cited_by", 0),
                    "pub_type": article.get("type") or infer_type(article.get("title", "")),
                    "link": article.get("link"),
                    "scraped_at": datetime.utcnow(),
                }},
                upsert=True,
            ))

    if author_ops:
        result = db.authors.bulk_write(author_ops)
        print(f"Authors: {result.upserted_count} inserted, {result.modified_count} updated")

    if pub_ops:
        result = db.publications.bulk_write(pub_ops)
        print(f"Publications: {result.upserted_count} inserted, {result.modified_count} updated")

    client.close()
    print("Seed complete.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", required=True, help="Path to JSON results file from scraper")
    args = parser.parse_args()
    seed(args.file)
