import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("backend/.env")

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: Missing SUPABASE_URL or SUPABASE_KEY")
    sys.exit(1)

try:
    supabase: Client = create_client(url, key)
    res = supabase.table("card_designs").select("id, name, slug, is_active").execute()
    print(f"Found {len(res.data)} designs:")
    for design in res.data:
        print(f" - {design['name']} ({design['slug']}): is_active={design['is_active']}")
except Exception as e:
    print(f"Failure: {e}")
