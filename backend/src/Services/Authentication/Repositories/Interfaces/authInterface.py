"""Authentication repository interface definitions."""

from typing import Protocol, Optional, Dict, Any


class AuthRepositoryInterface(Protocol):
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        ...

    def get_user_by_username(self, user_name: str) -> Optional[Dict[str, Any]]:
        ...

    def create_user(self, user: Dict[str, Any]) -> Dict[str, Any]:
        ...
