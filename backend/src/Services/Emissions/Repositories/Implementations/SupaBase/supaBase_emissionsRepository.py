import requests
from typing import List, Dict, Any, Optional

from Emissions.Repositories.Interfaces.emissionsInterface import EmissionsRepositoryInterface


class SupaBaseEmissionsRepository(EmissionsRepositoryInterface):
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

    def get_all_questions(self) -> List[Dict[str, Any]]:
        # Join onboarding_questions with onboarding_answers
        params = {"select": "*,onboarding_answers(*)"}
        resp = requests.get(self._endpoint("onboarding_questions"), headers=self.headers, params=params)
        if resp.status_code == 200:
            return resp.json()
        return []

    def save_onboarding_results(self, data: Dict[str, Any]) -> Dict[str, Any]:
        # POST to onboarding_results. We want it to return the inserted representation.
        headers = self.headers.copy()
        headers["Prefer"] = "return=representation"
        
        resp = requests.post(self._endpoint("onboarding_results"), headers=headers, json=data)
        if resp.status_code in (200, 201):
            res_data = resp.json()
            if res_data and len(res_data) > 0:
                return res_data[0]
        
        # If it fails, raise ValueError to be handled by controller
        raise ValueError(f"Failed to save emissions data: {resp.text}")

    def get_latest_onboarding_results(self, user_id: str) -> Optional[Dict[str, Any]]:
        params = {
            "user_id": f"eq.{user_id}",
            "order": "created_at.desc",
            "limit": "1",
            "select": "*"
        }
        resp = requests.get(self._endpoint("onboarding_results"), headers=self.headers, params=params)
        if resp.status_code == 200:
            data = resp.json()
            if data and len(data) > 0:
                return data[0]
        return None
