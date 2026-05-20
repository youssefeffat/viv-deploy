import requests
from typing import List, Dict, Any, Optional

from Community.Repositories.Interfaces.communityInterface import CommunityRepositoryInterface

class SupaBaseCommunityRepository(CommunityRepositoryInterface):
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase_url = supabase_url.rstrip("/")
        self.headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def _endpoint(self, table: str) -> str:
        return f"{self.supabase_url}/rest/v1/{table}"

    def get_leaderboard_stats(self) -> List[Dict[str, Any]]:
        # Join user_stats with users
        params = {
            "select": "total_points,trees_planted,users(first_name,last_name,user_name,avatar_url)",
            "order": "total_points.desc",
            "limit": "100" # Limit to top 100 for performance
        }
        resp = requests.get(self._endpoint("user_stats"), headers=self.headers, params=params)
        
        if resp.status_code == 200:
            return resp.json()
        return []

    def get_user_friends(self, user_id: str) -> List[Dict[str, Any]]:
        params = {
            "or": f"(user_id.eq.{user_id},friend_id.eq.{user_id})"
        }
        resp = requests.get(self._endpoint("friends"), headers=self.headers, params=params)
        if resp.status_code == 200:
            return resp.json()
        return []
        
    def get_friendship(self, user_id: str, friend_id: str) -> Optional[Dict[str, Any]]:
        params = {
            "or": f"(and(user_id.eq.{user_id},friend_id.eq.{friend_id}),and(user_id.eq.{friend_id},friend_id.eq.{user_id}))"
        }
        resp = requests.get(self._endpoint("friends"), headers=self.headers, params=params)
        if resp.status_code == 200:
            data = resp.json()
            if data and len(data) > 0:
                return data[0]
        return None
        
    def upsert_friendship(self, user_id: str, friend_id: str, status: str) -> None:
        existing = self.get_friendship(user_id, friend_id)
        if existing:
            patch_params = {"id": f"eq.{existing['id']}"}
            payload = {"status": status}
            requests.patch(self._endpoint("friends"), headers=self.headers, params=patch_params, json=payload)
        else:
            payload = {
                "user_id": user_id,
                "friend_id": friend_id,
                "status": status
            }
            requests.post(self._endpoint("friends"), headers=self.headers, json=payload)
            
    def delete_friendship(self, user_id: str, friend_id: str) -> None:
        params = {
            "or": f"(and(user_id.eq.{user_id},friend_id.eq.{friend_id}),and(user_id.eq.{friend_id},friend_id.eq.{user_id}))"
        }
        requests.delete(self._endpoint("friends"), headers=self.headers, params=params)

    # Helper method for controllers to fetch batch user profiles/stats
    def get_users_by_ids(self, user_ids: List[str]) -> List[Dict[str, Any]]:
        if not user_ids:
            return []
        ids_str = ",".join(user_ids)
        params = {
            "id": f"in.({ids_str})"
        }
        resp = requests.get(self._endpoint("users"), headers=self.headers, params=params)
        return resp.json() if resp.status_code == 200 else []
        
    def get_stats_by_ids(self, user_ids: List[str]) -> List[Dict[str, Any]]:
        if not user_ids:
            return []
        ids_str = ",".join(user_ids)
        params = {
            "user_id": f"in.({ids_str})"
        }
        resp = requests.get(self._endpoint("user_stats"), headers=self.headers, params=params)
        return resp.json() if resp.status_code == 200 else []
