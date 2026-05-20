from typing import Optional
from config import SUPABASE_URL, SUPABASE_KEY
from UserManagement.Repositories.Implementations.SupaBase.supaBase_userRepository import SupaBaseUserRepository

_repo_instance: Optional[SupaBaseUserRepository] = None

def get_user_repo() -> SupaBaseUserRepository:
    global _repo_instance
    if _repo_instance is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise RuntimeError("Supabase credentials not configured in config.py")
        _repo_instance = SupaBaseUserRepository(SUPABASE_URL, SUPABASE_KEY)
    return _repo_instance
