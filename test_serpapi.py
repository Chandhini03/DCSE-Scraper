import os
import time
import random
from dotenv import load_dotenv # Import the loader
from serpapi import GoogleSearch

# 1. Load the variables from .env
load_dotenv()

# 2. Access the key safely
API_KEY = os.getenv("SERPAPI_KEY")

# Check if the key was actually found
if not API_KEY:
    print("Error: Could not find SERPAPI_KEY in .env file!")
    exit()

# Using set() automatically removes duplicate IDs from your list
AUTHOR_IDS = list(set([
    "Y42jUgYAAAAJ", "edY878AAAAJ", "y0NGrRgAAAAJ", "RPHDOnsAAAAJ",
    "pF9wm40AAAAJ", "4SpY4AAAAJ", "8riYAkgAAAAJ", "YPWujJcAAAAJ",
    "396YCEAAAAJ", "i3FVasAAAAJ", "0TutxcMAAAAJ", "k2EOtu0AAAAJ",
    "uCuJG3YAAAAJ", "uCuJG3YAAAAJ", "0wVIpaAAAAAJ", "Yd3f0mAAAAAJ",
    "TvAVfI8AAAAJ", "WRNeYvEAAAAJ", "rKdOaxcAAAAJ", "P6ClPhUAAAAJ",
    "VxEJTEMAAAAJ", "ruIDwfwAAAAJ", "57HknNYAAAAJ", "0J0EAcAAAAJ",
    "VpqtaxIAAAAJ", "WHfVJW4AAAAJ", "whyjf5QAAAAJ", "iJi4uIEAAAAJ",
    "2CXYmosAAAAJ", "ArAPm7EAAAAJ", "Yb85BMsAAAAJ"
]))

print(f"Starting scrape for {len(AUTHOR_IDS)} unique authors...")

for author_id in AUTHOR_IDS:
    print(f"\n--- Fetching: {author_id} ---")

    params = {
        "engine": "google_scholar_author",
        "author_id": author_id,
        "api_key": API_KEY
    }

    try:
        search = GoogleSearch(params)
        results = search.get_dict()

        # Check if the response actually contains author data
        author = results.get("author")
        
        if not author or not author.get("name"):
            print(f"⚠️  ALERT: Author ID {author_id} returned no public data (Private or Invalid ID).")
            # Move to next author without trying to print articles
            continue

        # ---- Author info ----
        print("Name:", author.get("name"))
        print("Affiliation:", author.get("affiliations"))
        
        # Get total citations safely
        cited_by = results.get("cited_by", {})
        print("Total Citations:", cited_by.get("table", [{}])[0].get("citations", "0"))

        # ---- Publications ----
        articles = results.get("articles", [])
        print(f"Found {len(articles)} articles:")
        for article in articles[:5]:  # Printing first 5 to keep console clean
            citation_count = article.get("cited_by", {}).get("value", 0)
            print(f"  • {article.get('title')} | Year: {article.get('year')} | Citations: {citation_count}")

    except Exception as e:
        print(f"❌ Error fetching author {author_id}: {e}")

    # ---- Throttling ----
    # Reduced sleep time: SerpApi handles the heavy lifting, 
    # so a short delay is enough to avoid local network flags.
    sleep_time = random.uniform(2, 4)
    print(f"Waiting {sleep_time:.1f}s before next request...")
    time.sleep(sleep_time)

print("\nScrape complete.")