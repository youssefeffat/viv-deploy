from typing import Optional
from config import SUPABASE_URL, SUPABASE_KEY
from Emissions.Repositories.Implementations.SupaBase.supaBase_emissionsRepository import SupaBaseEmissionsRepository

_repo_instance: Optional[SupaBaseEmissionsRepository] = None

def get_emissions_repo() -> SupaBaseEmissionsRepository:
    global _repo_instance
    if _repo_instance is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise RuntimeError("Supabase credentials not configured in config.py")
        _repo_instance = SupaBaseEmissionsRepository(SUPABASE_URL, SUPABASE_KEY)
    return _repo_instance
