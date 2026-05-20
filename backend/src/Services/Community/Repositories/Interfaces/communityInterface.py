from typing import Protocol, List, Dict, Any, Optional

class CommunityRepositoryInterface(Protocol):
    def get_leaderboard_stats(self) -> List[Dict[str, Any]]:
        """Fetch user_stats joined with users table, sorted by total_points DESC."""
        ...
        
    def get_user_friends(self, user_id: str) -> List[Dict[str, Any]]:
        """Fetch all friendships involving user_id."""
        ...
        
    def get_friendship(self, user_id: str, friend_id: str) -> Optional[Dict[str, Any]]:
        """Check if a friendship exists between two users."""
        ...
        
    def upsert_friendship(self, user_id: str, friend_id: str, status: str) -> None:
        """Create or update a friendship status."""
        ...
        
    def delete_friendship(self, user_id: str, friend_id: str) -> None:
        """Delete a friendship between two users."""
        ...
