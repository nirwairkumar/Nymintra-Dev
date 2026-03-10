from supabase import create_client, Client
from app.core.config import settings

# Initialize the Supabase Client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def get_supabase() -> Client:
    """Dependency for returning the Supabase client in FastAPI routes."""
    return supabase
