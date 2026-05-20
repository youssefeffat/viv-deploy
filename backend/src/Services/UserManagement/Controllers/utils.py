"""User management utilities (moved from Service to Controllers)."""

def normalize_username(username: str) -> str:
    return username.strip()
