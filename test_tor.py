import time
import random
import stem.process  # We use stem to launch Tor safely
from scholarly import scholarly, ProxyGenerator

print("Booting up Tor proxy... (This usually takes 30-60 seconds)")

tor_path = r"D:\tor\tor\tor.exe"

try:
    # 1. Launch Tor securely with Cookie Authentication turned on
    tor_process = stem.process.launch_tor_with_config(
        tor_cmd=tor_path,
        config={
            'SocksPort': '9050',
            'ControlPort': '9051',
            'CookieAuthentication': '1', # This completely fixes the security error!
        },
        take_ownership=True # This ensures Tor closes when your script finishes
    )
except Exception as e:
    print(f"❌ Failed to start Tor: {e}")
    exit()

# 2. Tell scholarly to connect to the Tor instance we just launched
pg = ProxyGenerator()
pg.Tor_External(tor_sock_port=9050, tor_control_port=9051, tor_password="dummy")
scholarly.use_proxy(pg)

print("✅ Tor connected! IP will rotate automatically if blocked.")

# --- Your AUTHOR_IDS list goes below here ---

# 2. Your Author IDs (Set removes duplicates)
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

print(f"\nStarting scrape for {len(AUTHOR_IDS)} unique authors...")

for author_id in AUTHOR_IDS:
    print(f"\n--- Fetching: {author_id} ---")

    try:
        # Search for the author by their exact ID
        author_query = scholarly.search_author_id(author_id)
        
        # 'fill' executes the deeper scrape to grab citations and publications
        # We only ask for what we need to save time and reduce request load
        author = scholarly.fill(author_query, sections=['basics', 'indices', 'publications'])
        
        print("Name:", author.get("name"))
        print("Affiliation:", author.get("affiliation"))
        print("Total Citations:", author.get("citedby", 0))

        # Publications
        articles = author.get("publications", [])
        print(f"Found {len(articles)} articles:")
        
        for article in articles[:5]:
            # Publication metadata is stored inside the 'bib' dictionary
            bib = article.get("bib", {})
            title = bib.get("title", "Unknown Title")
            year = bib.get("pub_year", "N/A")
            citations = article.get("num_citations", 0)
            
            print(f"  • {title} | Year: {year} | Citations: {citations}")

    except Exception as e:
        print(f"❌ Error fetching author {author_id}: {e}")

    # Throttling: Even with Tor rotating IPs, delays prevent the network from choking
    sleep_time = random.uniform(3, 7)
    print(f"Waiting {sleep_time:.1f}s before next request...")
    time.sleep(sleep_time)

print("\nScrape complete.")  