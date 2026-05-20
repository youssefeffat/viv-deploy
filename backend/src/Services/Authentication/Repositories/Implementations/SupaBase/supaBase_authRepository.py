"""Supabase-backed auth repository implementation using PostgREST (HTTP)."""

from typing import Optional, Dict, Any
import requests


class SupaBaseAuthRepository:
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase_url = supabase_url.rstrip("/")
        self.supabase_key = supabase_key
        self.table = "users"
        self.headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def _endpoint(self) -> str:
        return f"{self.supabase_url}/rest/v1/{self.table}"

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        params = {"email": f"eq.{email}", "select": "*"}
        resp = requests.get(self._endpoint(), headers=self.headers, params=params)
        if resp.status_code == 200:
            data = resp.json()
            if data:
                return data[0]
        return None

    def get_user_by_username(self, user_name: str) -> Optional[Dict[str, Any]]:
        params = {"user_name": f"eq.{user_name}", "select": "*"}
        resp = requests.get(self._endpoint(), headers=self.headers, params=params)
        if resp.status_code == 200:
            data = resp.json()
            if data:
                return data[0]
        return None

    def create_user(self, user: Dict[str, Any]) -> Dict[str, Any]:
        # Ask PostgREST to return the created row
        headers = self.headers.copy()
        headers["Prefer"] = "return=representation"
        resp = requests.post(self._endpoint(), headers=headers, json=user)
        if resp.status_code in (200, 201):
            data = resp.json()
            if isinstance(data, list):
                return data[0]
            return data
        # Bubble up useful error info for controllers to convert
        raise ValueError(f"Failed to create user: {resp.status_code} - {resp.text}")
