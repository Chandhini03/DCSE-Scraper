"""
scraper/scraper.py

Scrapes Google Scholar author profiles using Tor for IP rotation,
and stores results directly into MongoDB (same DB the API reads from).

Usage:
    python scraper/scraper.py

Requires:
    - Tor installed (set TOR_PATH in .env or defaults to tor on PATH)
    - MongoDB accessible (set MONGO_URI in .env)
"""

import time
import random
import os
from datetime import datetime, timezone

import stem.process
from scholarly import scholarly, ProxyGenerator
from pymongo import MongoClient, UpdateOne
from dotenv import load_dotenv

# Load environment variables from .env at project root
load_dotenv()

# --- Configuration ---

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "scholar_db")
TOR_PATH = os.getenv("TOR_PATH", r"D:\tor\tor\tor.exe")
TOR_SOCKS_PORT = int(os.getenv("TOR_SOCKS_PORT", "9050"))
TOR_CONTROL_PORT = int(os.getenv("TOR_CONTROL_PORT", "9051"))

# --- Author IDs to scrape ---

AUTHOR_IDS = list(set([
    "Y42jUgYAAAAJ", "edY878AAAAJ", "y0NGrRgAAAAJ", "RPHDOnsAAAAJ",
    "pF9wm40AAAAJ", "4SpY4AAAAJ", "8riYAkgAAAAJ", "YPWujJcAAAAJ",
    "396YCEAAAAJ", "i3FVasAAAAJ", "0TutxcMAAAAJ", "k2EOtu0AAAAJ",
    "uCuJG3YAAAAJ", "0wVIpaAAAAAJ", "Yd3f0mAAAAAJ", "TvAVfI8AAAAJ",
    "WRNeYvEAAAAJ", "rKdOaxcAAAAJ", "P6ClPhUAAAAJ", "VxEJTEMAAAAJ",
    "ruIDwfwAAAAJ", "57HknNYAAAAJ", "0J0EAcAAAAJ", "VpqtaxIAAAAJ",
    "WHfVJW4AAAAJ", "whyjf5QAAAAJ", "iJi4uIEAAAAJ", "2CXYmosAAAAJ",
    "ArAPm7EAAAAJ", "Yb85BMsAAAAJ"
]))


def infer_pub_type(title: str) -> str:
    title_lower = title.lower()
    if any(w in title_lower for w in ["conference", "proceedings", "workshop", "symposium"]):
        return "conference"
    if any(w in title_lower for w in ["journal", "transactions", "letters", "review"]):
        return "journal"
    if "book" in title_lower:
        return "book"
    return "unknown"


def start_tor():
    print("Booting up Tor proxy... (This usually takes 30-60 seconds)")
    try:
        tor_process = stem.process.launch_tor_with_config(
            tor_cmd=TOR_PATH,
            config={
                'SocksPort': str(TOR_SOCKS_PORT),
                'ControlPort': str(TOR_CONTROL_PORT),
                'CookieAuthentication': '1',
            },
            take_ownership=True,
        )
        return tor_process
    except Exception as e:
        print(f"Failed to start Tor: {e}")
        print("Continuing without Tor (may get rate-limited)...")
        return None


def setup_proxy():
    pg = ProxyGenerator()
    pg.Tor_External(
        tor_sock_port=TOR_SOCKS_PORT,
        tor_control_port=TOR_CONTROL_PORT,
        tor_password="dummy"
    )
    scholarly.use_proxy(pg)
    print("Tor connected. IP will rotate automatically if blocked.")


def save_to_mongodb(authors_data: list):
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB_NAME]

    author_ops = []
    pub_ops = []

    for author in authors_data:
        author_id = author["author_id"]

        author_ops.append(UpdateOne(
            {"_id": author_id},
            {"": {
                "_id": author_id,
                "name": author["name"],
                "affiliation": author.get("affiliation", ""),
                "total_citations": author.get("total_citations", 0),
                "citations_since_2021": author.get("citations_since_2021", 0),
                "total_publications": len(author.get("articles", [])),
                "scraped_at": datetime.now(timezone.utc),
            }},
            upsert=True,
        ))

        for article in author.get("articles", []):
            pub_ops.append(UpdateOne(
                {"author_id": author_id, "title": article["title"]},
                {"": {
                    "author_id": author_id,
                    "author_name": author["name"],
                    "title": article["title"],
                    "year": article.get("year"),
                    "cited_by": article.get("cited_by", 0),
                    "pub_type": article.get("pub_type", "unknown"),
                    "link": article.get("link"),
                    "scraped_at": datetime.now(timezone.utc),
                }},
                upsert=True,
            ))

    if author_ops:
        result = db.authors.bulk_write(author_ops)
        print(f"[DB] Authors: {result.upserted_count} inserted, {result.modified_count} updated")

    if pub_ops:
        result = db.publications.bulk_write(pub_ops)
        print(f"[DB] Publications: {result.upserted_count} inserted, {result.modified_count} updated")

    client.close()


def scrape_author(author_id: str):
    try:
        author_query = scholarly.search_author_id(author_id)
        author = scholarly.fill(author_query, sections=['basics', 'indices', 'publications'])

        name = author.get("name", "Unknown")
        affiliation = author.get("affiliation", "")
        total_citations = author.get("citedby", 0)

        cites_per_year = author.get("cites_per_year", {})
        citations_since_2021 = sum(
            v for k, v in cites_per_year.items() if int(k) >= 2021
        )

        articles = []
        for pub in author.get("publications", []):
            bib = pub.get("bib", {})
            title = bib.get("title", "Unknown Title")
            year_str = bib.get("pub_year", None)
            year = int(year_str) if year_str and str(year_str).isdigit() else None
            cited_by = pub.get("num_citations", 0)
            link = pub.get("pub_url", None)
            pub_type = infer_pub_type(title)

            articles.append({
                "title": title,
                "year": year,
                "cited_by": cited_by,
                "pub_type": pub_type,
                "link": link,
            })

        print(f"  Name: {name}")
        print(f"  Affiliation: {affiliation}")
        print(f"  Citations: {total_citations} (since 2021: {citations_since_2021})")
        print(f"  Publications: {len(articles)}")

        return {
            "author_id": author_id,
            "name": name,
            "affiliation": affiliation,
            "total_citations": total_citations,
            "citations_since_2021": citations_since_2021,
            "articles": articles,
        }

    except Exception as e:
        print(f"  Error: {e}")
        return None


def main():
    tor_process = start_tor()
    if tor_process:
        setup_proxy()

    print(f"\nStarting scrape for {len(AUTHOR_IDS)} unique authors...")
    print(f"Saving to MongoDB: {MONGO_DB_NAME}\n")

    all_authors = []

    for i, author_id in enumerate(AUTHOR_IDS, 1):
        print(f"\n[{i}/{len(AUTHOR_IDS)}] Fetching: {author_id}")

        result = scrape_author(author_id)
        if result:
            all_authors.append(result)

        sleep_time = random.uniform(3, 7)
        print(f"  Waiting {sleep_time:.1f}s...")
        time.sleep(sleep_time)

    if all_authors:
        print(f"\n{'='*50}")
        print(f"Scrape complete. Saving {len(all_authors)} authors to MongoDB...")
        save_to_mongodb(all_authors)
    else:
        print("\nNo data scraped. Nothing to save.")

    print("\nDone.")


if __name__ == "__main__":
    main()
