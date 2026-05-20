from supabase import Client, create_client

from config import SUPABASE_KEY, SUPABASE_URL

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def test_supabase_connection():
    """
    Simple test query to verify Supabase connection.
    It attempts to fetch a single row from the 'users' table.
    """
    try:
        _ = supabase.table("users").select("*").limit(1).execute()
        print("✅ Supabase connection OK.")
        return True
    except Exception as e:
        print("❌ Failed to connect to Supabase!")
        print(f"Error: {e}")
        return False


def get_supabase() -> Client:
    return supabase
