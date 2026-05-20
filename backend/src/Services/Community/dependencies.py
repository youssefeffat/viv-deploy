from typing import Optional
from config import SUPABASE_URL, SUPABASE_KEY
from Community.Repositories.Implementations.SupaBase.supaBase_communityRepository import SupaBaseCommunityRepository

_repo_instance: Optional[SupaBaseCommunityRepository] = None

def get_community_repo() -> SupaBaseCommunityRepository:
    global _repo_instance
    if _repo_instance is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise RuntimeError("Supabase credentials not configured in config.py")
        _repo_instance = SupaBaseCommunityRepository(SUPABASE_URL, SUPABASE_KEY)
    return _repo_instance
