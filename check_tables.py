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

print(f"Connecting to: {url}")
try:
    supabase: Client = create_client(url, key)
    # We can't directly list tables via the client easily without RPC or standard query
    # But we can try to guess or use a common table to see if it exists
    tables_to_check = ["designs", "card_designs", "profiles", "orders", "users"]
    for table in tables_to_check:
        try:
            res = supabase.table(table).select("count", count="exact").limit(1).execute()
            print(f"Table '{table}': EXISTS (Count: {res.count})")
        except Exception as e:
            if "not found" in str(e).lower() or "does not exist" in str(e).lower():
                print(f"Table '{table}': MISSING")
            else:
                print(f"Table '{table}': ERROR ({e})")
except Exception as e:
    print(f"General Failure: {e}")
