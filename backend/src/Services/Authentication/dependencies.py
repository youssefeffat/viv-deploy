"""Authentication dependency providers.

Provides DI helpers for routes (e.g., repository instances).
"""

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

from config import SUPABASE_URL, SUPABASE_KEY, JWT_SECRET
from Authentication.Repositories.Implementations.SupaBase.supaBase_authRepository import (
    SupaBaseAuthRepository,
)


_repo_instance: Optional[SupaBaseAuthRepository] = None


def get_auth_repo() -> SupaBaseAuthRepository:
    global _repo_instance
    if _repo_instance is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise RuntimeError("Supabase credentials not configured in config.py")
        _repo_instance = SupaBaseAuthRepository(SUPABASE_URL, SUPABASE_KEY)
    return _repo_instance


security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Decode JWT token and return the user ID (sub)."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return user_id
