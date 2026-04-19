from scholarly import scholarly
import time

SCHOLAR_ID = "Y42jUgYAAAAJ"

author = scholarly.search_author_id(SCHOLAR_ID)
time.sleep(5)

# Step 1: Basic info
author = scholarly.fill(author, sections=["basics"])

print("Name:", author.get("name"))
print("Affiliation:", author.get("affiliation"))
print("Citations:", author.get("citedby"))

# Step 2: Fetch ONLY a few publications
time.sleep(5)
author = scholarly.fill(
    author,
    sections=["publications"],
    publication_limit=10   # SAFE LIMIT
)

print("Total publications fetched:", len(author["publications"]))