import requests
from typing import List, Dict, Any, Optional
from datetime import datetime

from Gamification.Repositories.Interfaces.gamificationInterface import GamificationRepositoryInterface

class SupaBaseGamificationRepository(GamificationRepositoryInterface):
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

    def get_all_challenges(self) -> List[Dict[str, Any]]:
        resp = requests.get(self._endpoint("challenges"), headers=self.headers)
        if resp.status_code == 200:
            return resp.json()
        return []

    def get_user_completed_challenges(self, user_id: str) -> List[str]:
        params = {
            "user_id": f"eq.{user_id}",
            "completed": "eq.true",
            "select": "challenge_id"
        }
        resp = requests.get(self._endpoint("user_challenges"), headers=self.headers, params=params)
        if resp.status_code == 200:
            return [str(row["challenge_id"]) for row in resp.json()]
        return []

    def toggle_user_challenge(self, user_id: str, challenge_id: str, completed: bool) -> None:
        # Check if exists
        params = {
            "user_id": f"eq.{user_id}",
            "challenge_id": f"eq.{challenge_id}"
        }
        resp = requests.get(self._endpoint("user_challenges"), headers=self.headers, params=params)
        existing = resp.json() if resp.status_code == 200 else []

        completed_at = datetime.utcnow().isoformat() if completed else None

        if existing and len(existing) > 0:
            # Patch existing
            row_id = existing[0]["id"]
            patch_params = {"id": f"eq.{row_id}"}
            payload = {"completed": completed, "completed_at": completed_at}
            requests.patch(self._endpoint("user_challenges"), headers=self.headers, params=patch_params, json=payload)
        else:
            # Insert new
            payload = {
                "user_id": user_id,
                "challenge_id": challenge_id,
                "completed": completed,
                "completed_at": completed_at
            }
            requests.post(self._endpoint("user_challenges"), headers=self.headers, json=payload)

    def get_user_stats(self, user_id: str) -> Optional[Dict[str, Any]]:
        params = {"user_id": f"eq.{user_id}"}
        resp = requests.get(self._endpoint("user_stats"), headers=self.headers, params=params)
        if resp.status_code == 200:
            data = resp.json()
            if data and len(data) > 0:
                return data[0]
        return None

    def update_user_stats(self, user_id: str, new_points: int, new_trees: int) -> None:
        # Upsert via Prefer: resolution=merge-duplicates because user_id is PK
        headers = self.headers.copy()
        headers["Prefer"] = "resolution=merge-duplicates"
        
        payload = {
            "user_id": user_id,
            "total_points": new_points,
            "trees_planted": new_trees
        }
        requests.post(self._endpoint("user_stats"), headers=headers, json=payload)

    def advance_challenge_batch(self, user_id: str, new_offset: int) -> None:
        headers = self.headers.copy()
        headers["Prefer"] = "resolution=merge-duplicates"
        payload = {
            "user_id": user_id,
            "challenge_batch_offset": new_offset
        }
        requests.post(self._endpoint("user_stats"), headers=headers, json=payload)

    def create_challenge(self, data: Dict[str, Any]) -> Dict[str, Any]:
        headers = self.headers.copy()
        headers["Prefer"] = "return=representation"
        resp = requests.post(self._endpoint("challenges"), headers=headers, json=data)
        if resp.status_code in (200, 201):
            res_data = resp.json()
            if res_data and len(res_data) > 0:
                return res_data[0]
        raise ValueError(f"Failed to create challenge: {resp.text}")
