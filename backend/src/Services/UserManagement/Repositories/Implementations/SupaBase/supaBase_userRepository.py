"""Supabase-backed user repository implementation."""

from typing import Optional, Dict, Any
import requests

from UserManagement.Repositories.Interfaces.userInterface import UserRepositoryInterface


class SupaBaseUserRepository(UserRepositoryInterface):
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase_url = supabase_url.rstrip("/")
        self.supabase_key = supabase_key
        self.headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def _endpoint(self, table: str) -> str:
        return f"{self.supabase_url}/rest/v1/{table}"

    def get_user_dashboard_data(self, user_id: str) -> Optional[Dict[str, Any]]:
        # Use PostgREST syntax to join users with user_stats and onboarding_results
        params = {
            "id": f"eq.{user_id}",
            "select": "*,user_stats(*),onboarding_results(*)"
        }
        
        resp = requests.get(self._endpoint("users"), headers=self.headers, params=params)
        
        if resp.status_code == 200:
            data = resp.json()
            if data and len(data) > 0:
                user_data = data[0]
                
                # Sort onboarding_results by created_at desc manually
                if "onboarding_results" in user_data and isinstance(user_data["onboarding_results"], list):
                    user_data["onboarding_results"].sort(key=lambda x: x.get("created_at", ""), reverse=True)
                
                return user_data
                
        return None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        params = {"id": f"eq.{user_id}"}
        resp = requests.get(self._endpoint("users"), headers=self.headers, params=params)
        if resp.status_code == 200:
            data = resp.json()
            if data: return data[0]
        return None
        
    def update_user_password(self, user_id: str, hashed_password: str) -> bool:
        params = {"id": f"eq.{user_id}"}
        resp = requests.patch(self._endpoint("users"), headers=self.headers, params=params, json={"password": hashed_password})
        return resp.status_code in (200, 204)
        
    def soft_delete_user(self, user_id: str) -> bool:
        params = {"id": f"eq.{user_id}"}
        resp = requests.patch(self._endpoint("users"), headers=self.headers, params=params, json={"is_deleted": True})
        return resp.status_code in (200, 204)
        
    def hard_delete_user(self, user_id: str) -> bool:
        params = {"id": f"eq.{user_id}"}
        resp = requests.delete(self._endpoint("users"), headers=self.headers, params=params)
        return resp.status_code in (200, 204)
        
    def get_advanced_stats(self, user_id: str) -> Dict[str, Any]:
        result = {
            "co2ThisYear": 0.0,
            "co2LastYear": 0.0,
            "co2ReducedThisYear": 0.0,
            "challengesCompleted": 0,
            "bestStreak": 0,
            "currentStreak": 0,
            "badges": []
        }
        
        # 1. CO2
        params = {"user_id": f"eq.{user_id}", "order": "created_at.desc", "limit": "2"}
        ob_resp = requests.get(self._endpoint("onboarding_results"), headers=self.headers, params=params)
        if ob_resp.status_code == 200:
            ob_data = ob_resp.json()
            if len(ob_data) >= 1:
                result["co2ThisYear"] = ob_data[0].get("total_co2", 0.0)
            if len(ob_data) >= 2:
                result["co2LastYear"] = ob_data[1].get("total_co2", 0.0)
                result["co2ReducedThisYear"] = max(0, result["co2LastYear"] - result["co2ThisYear"])
                
        # 2. Challenges Completed
        params = {"user_id": f"eq.{user_id}", "completed": "eq.true", "select": "id"}
        c_resp = requests.get(self._endpoint("user_challenges"), headers=self.headers, params=params)
        if c_resp.status_code == 200:
            result["challengesCompleted"] = len(c_resp.json())
            
        # 3. Streaks
        params = {"user_id": f"eq.{user_id}", "select": "streak,best_streak"}
        s_resp = requests.get(self._endpoint("user_stats"), headers=self.headers, params=params)
        if s_resp.status_code == 200 and s_resp.json():
            result["currentStreak"] = s_resp.json()[0].get("streak", 0)
            result["bestStreak"] = s_resp.json()[0].get("best_streak", 0)
            
        # 4. Badges / Achievements
        params = {"user_id": f"eq.{user_id}", "select": "achievements(title)"}
        a_resp = requests.get(self._endpoint("user_achievements"), headers=self.headers, params=params)
        if a_resp.status_code == 200:
            for item in a_resp.json():
                if item.get("achievements") and "title" in item["achievements"]:
                    result["badges"].append(item["achievements"]["title"])
                    
        return result
        
    def unlock_achievement(self, user_id: str, achievement_id: str) -> bool:
        payload = {"user_id": user_id, "achievement_id": achievement_id}
        # Upsert
        headers = self.headers.copy()
        headers["Prefer"] = "resolution=merge-duplicates"
        resp = requests.post(self._endpoint("user_achievements"), headers=headers, json=payload)
        return resp.status_code in (200, 201)