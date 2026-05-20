from typing import Protocol, Optional, Dict, Any


class UserRepositoryInterface(Protocol):
    def get_user_dashboard_data(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch user profile, latest onboarding results, and user stats.
        Returns a dictionary with raw data to be formatted by the controller.
        """
        ...
        
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        ...
        
    def update_user_password(self, user_id: str, hashed_password: str) -> bool:
        ...
        
    def soft_delete_user(self, user_id: str) -> bool:
        ...
        
    def hard_delete_user(self, user_id: str) -> bool:
        ...
        
    def get_advanced_stats(self, user_id: str) -> Dict[str, Any]:
        ...
        
    def unlock_achievement(self, user_id: str, achievement_id: str) -> bool:
        ...
