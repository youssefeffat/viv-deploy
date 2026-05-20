from typing import Protocol, List, Dict, Any, Optional

class EmissionsRepositoryInterface(Protocol):
    def get_all_questions(self) -> List[Dict[str, Any]]:
        """Fetch all onboarding questions with their associated answers/options."""
        ...
        
    def save_onboarding_results(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Save a new onboarding result (footprint) for a user."""
        ...
        
    def get_latest_onboarding_results(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get the most recent onboarding result for a user."""
        ...
