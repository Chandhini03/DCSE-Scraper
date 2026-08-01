import pandas as pd
import requests
import time
import urllib.parse
import sys

def fill_missing_fields(input_file, output_file):
    print(f"Reading {input_file}...")
    df = pd.read_excel(input_file)
    
    # Ensure columns exist
    if 'Author Names' not in df.columns:
        df.insert(2, 'Author Names', '')
    if 'Name of the Journal' not in df.columns:
        df.insert(3, 'Name of the Journal', '')
        
    total = len(df)
    print(f"Found {total} records. Fetching data from CrossRef...")
    
    session = requests.Session()
    # Be nice to CrossRef by providing a user-agent
    session.headers.update({'User-Agent': 'mailto:sneha@example.com'})

    for index, row in df.iterrows():
        title = str(row['Title'])
        if not title or title == 'nan':
            continue
            
        print(f"[{index+1}/{total}] {title[:60]}...")
        
        # Prepare query
        query_title = urllib.parse.quote_plus(title)
        url = f"https://api.crossref.org/works?query.title={query_title}&select=title,author,container-title&rows=1"
        
        try:
            r = session.get(url, timeout=10)
            if r.status_code == 200:
                data = r.json()
                items = data.get('message', {}).get('items', [])
                if items:
                    item = items[0]
                    # We might get a slightly different paper if the title is very generic, but it's usually correct for exact matches
                    
                    # Extract authors
                    author_list = []
                    for auth in item.get('author', []):
                        given = auth.get('given', '')
                        family = auth.get('family', '')
                        name = f"{given} {family}".strip()
                        if name:
                            author_list.append(name)
                    authors_str = ", ".join(author_list)
                    
                    # Extract journal
                    journal = ""
                    containers = item.get('container-title', [])
                    if containers:
                        journal = containers[0]
                        
                    df.at[index, 'Author Names'] = authors_str
                    df.at[index, 'Name of the Journal'] = journal
                    
                    if authors_str:
                        print(f"  -> Authors: {authors_str[:50]}")
                    if journal:
                        print(f"  -> Journal: {journal[:50]}")
                else:
                    print("  -> Not found in CrossRef")
            else:
                print(f"  -> API Error: {r.status_code}")
                
        except Exception as e:
            print(f"  -> Error: {e}")
            
        # Small delay to respect rate limits
        time.sleep(0.2)
        
        # Save incrementally
        if index % 20 == 0:
            df.to_excel(output_file, index=False)

    df.to_excel(output_file, index=False)
    print(f"Done! Saved to {output_file}")

if __name__ == "__main__":
    fill_missing_fields('publications_export (3) (1).xlsx', 'publications_export_filled.xlsx')
