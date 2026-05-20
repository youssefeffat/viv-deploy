from typing import Optional
from config import SUPABASE_URL, SUPABASE_KEY
from Gamification.Repositories.Implementations.SupaBase.supaBase_gamificationRepository import SupaBaseGamificationRepository

_repo_instance: Optional[SupaBaseGamificationRepository] = None

def get_gamification_repo() -> SupaBaseGamificationRepository:
    global _repo_instance
    if _repo_instance is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise RuntimeError("Supabase credentials not configured in config.py")
        _repo_instance = SupaBaseGamificationRepository(SUPABASE_URL, SUPABASE_KEY)
    return _repo_instance
