from typing import List
from Community.Schemas.communitySchemas import LeaderboardEntry
from Community.Repositories.Interfaces.communityInterface import CommunityRepositoryInterface

def get_leaderboard_controller(repo: CommunityRepositoryInterface) -> List[LeaderboardEntry]:
    stats = repo.get_leaderboard_stats()
    
    if not stats:
        return []
        
    result = []
    # Since it's already sorted by total_points DESC, the first item has max points
    max_points = max(stats[0].get("total_points", 0), 1) # Prevent div by 0
    
    for i, stat in enumerate(stats):
        user_info = stat.get("users") or {}
        
        # Determine name
        first_name = user_info.get("first_name") or ""
        last_name = user_info.get("last_name") or ""
        full_name = f"{first_name} {last_name}".strip()
        
        if not full_name:
            full_name = user_info.get("user_name", "Anonyme")
            
        # Determine avatar or initials
        avatar_url = user_info.get("avatar_url")
        if avatar_url:
            avatar = avatar_url
        else:
            # Generate initials
            parts = [p for p in full_name.split() if p]
            if len(parts) >= 2:
                avatar = (parts[0][0] + parts[1][0]).upper()
            elif len(parts) == 1:
                avatar = parts[0][:2].upper()
            else:
                avatar = "AN"
                
        points = stat.get("total_points", 0)
        trees = stat.get("trees_planted", 0)
        percentage = round((points / max_points) * 100)
        
        result.append(LeaderboardEntry(
            rank=i + 1,
            name=full_name,
            avatar=avatar,
            points=points,
            trees=trees,
            percentage=percentage
        ))
        
    return result
