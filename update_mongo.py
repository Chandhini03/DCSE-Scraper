import pandas as pd
from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "scholar_db")

client = MongoClient(MONGO_URI)
db = client[MONGO_DB_NAME]

df = pd.read_excel('publications_export_filled.xlsx')

updated_count = 0

for index, row in df.iterrows():
    author_name = str(row['Author'])
    title = str(row['Title'])
    authors = str(row['Author Names'])
    journal = str(row['Name of the Journal'])
    
    # We use regex to match title safely
    query = {
        "author_name": author_name,
        "title": title
    }
    
    update_data = {
        "$set": {
            "authors": authors if authors != 'nan' else "",
            "journal": journal if journal != 'nan' else ""
        }
    }
    
    result = db.publications.update_many(query, update_data)
    updated_count += result.modified_count

print(f"Updated {updated_count} documents in MongoDB!")
client.close()
