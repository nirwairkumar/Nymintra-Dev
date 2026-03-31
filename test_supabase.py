import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Try to load .env from current dir or parent backend dir
load_dotenv("backend/.env")

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: Missing SUPABASE_URL or SUPABASE_KEY in environment/backend/.env")
    sys.exit(1)

print(f"Connecting to: {url}")
try:
    supabase: Client = create_client(url, key)
    # Try to fetch from designs table
    response = supabase.table("designs").select("count", count="exact").execute()
    print(f"Connection Successful! Total designs in DB: {response.count}")
except Exception as e:
    print(f"Connection Failed: {e}")
