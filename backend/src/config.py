"""Centralized configuration loader for environment variables.

Other modules should import values from here (e.g. `from config import PORT`).
"""

from dotenv import load_dotenv
from pathlib import Path
import os


# Look for a .env file in the backend folder (one level above src)
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
ENV_PATH = PROJECT_ROOT / ".env"

if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
else:
    # fallback to default search locations
    load_dotenv()


PORT = int(os.getenv("PORT", 8000))
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
DATABASE_URL = os.getenv("DATABASE_URL")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# JWT configuration (required for auth feature)
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is not set in environment; set JWT_SECRET in your .env file")

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Missing Supabase configuration in environment variables!")

def get_allowed_origins():
    return ALLOWED_ORIGINS
