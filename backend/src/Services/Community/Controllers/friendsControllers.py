from typing import List
from fastapi import HTTPException, status

from Community.Schemas.communitySchemas import FriendResponse, FriendActionResponse
from Community.Repositories.Interfaces.communityInterface import CommunityRepositoryInterface

def _get_name_and_avatar(user_info: dict):
    first_name = user_info.get("first_name") or ""
    last_name = user_info.get("last_name") or ""
    full_name = f"{first_name} {last_name}".strip()
    
    if not full_name:
        full_name = user_info.get("user_name", "Anonyme")
        
    avatar_url = user_info.get("avatar_url")
    if avatar_url:
        avatar = avatar_url
    else:
        parts = [p for p in full_name.split() if p]
        if len(parts) >= 2:
            avatar = (parts[0][0] + parts[1][0]).upper()
        elif len(parts) == 1:
            avatar = parts[0][:2].upper()
        else:
            avatar = "AN"
            
    return full_name, avatar

def get_friends_controller(user_id: str, repo: CommunityRepositoryInterface) -> List[FriendResponse]:
    friendships = repo.get_user_friends(user_id)
    if not friendships:
        return []
        
    # Extract the IDs of the OTHER user in each relationship
    friend_mapping = {}
    for f in friendships:
        other_id = str(f["friend_id"]) if str(f["user_id"]) == user_id else str(f["user_id"])
        # If the other person sent a request to us, status is "pending".
        # We might want to be specific, but let's just return the DB status.
        friend_mapping[other_id] = f.get("status", "pending")
        
    other_ids = list(friend_mapping.keys())
    if not other_ids:
        return []
        
    # Fetch profiles and stats in batch
    users = repo.get_users_by_ids(other_ids)
    stats = repo.get_stats_by_ids(other_ids)
    
    stats_dict = {str(s["user_id"]): s for s in stats}
    
    result = []
    for u in users:
        u_id = str(u["id"])
        name, avatar = _get_name_and_avatar(u)
        user_stat = stats_dict.get(u_id, {})
        
        result.append(FriendResponse(
            id=u_id,
            name=name,
            avatar=avatar,
            points=user_stat.get("total_points", 0),
            trees=user_stat.get("trees_planted", 0),
            status=friend_mapping.get(u_id, "unknown")
        ))
        
    return result

def send_friend_request_controller(user_id: str, friend_id: str, repo: CommunityRepositoryInterface) -> FriendActionResponse:
    if user_id == friend_id:
        raise HTTPException(status_code=400, detail="Cannot send friend request to yourself")
        
    existing = repo.get_friendship(user_id, friend_id)
    new_status = "pending"
    
    if existing:
        current_status = existing.get("status")
        if current_status == "accepted":
            new_status = "friends"
        elif current_status == "pending":
            # If the friend already sent a request to this user, auto accept
            if str(existing["user_id"]) == friend_id:
                repo.upsert_friendship(user_id, friend_id, "accepted")
                new_status = "friends"
            else:
                new_status = "requested"
    else:
        repo.upsert_friendship(user_id, friend_id, "pending")
        new_status = "requested"
        
    # Count friends
    all_friends = repo.get_user_friends(user_id)
    accepted_count = sum(1 for f in all_friends if f.get("status") == "accepted")
        
    return FriendActionResponse(
        success=True,
        status=new_status,
        friendId=friend_id,
        totalFriends=accepted_count
    )

def accept_friend_request_controller(user_id: str, friend_id: str, repo: CommunityRepositoryInterface) -> FriendActionResponse:
    existing = repo.get_friendship(user_id, friend_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Request not found")
        
    repo.upsert_friendship(user_id, friend_id, "accepted")
    
    all_friends = repo.get_user_friends(user_id)
    accepted_count = sum(1 for f in all_friends if f.get("status") == "accepted")
    
    return FriendActionResponse(
        success=True,
        status="friends",
        friendId=friend_id,
        totalFriends=accepted_count
    )

def decline_friend_request_controller(user_id: str, friend_id: str, repo: CommunityRepositoryInterface) -> FriendActionResponse:
    repo.delete_friendship(user_id, friend_id)
    return FriendActionResponse(
        success=True,
        status="declined",
        friendId=friend_id
    )

def delete_friend_controller(user_id: str, friend_id: str, repo: CommunityRepositoryInterface) -> FriendActionResponse:
    repo.delete_friendship(user_id, friend_id)
    
    all_friends = repo.get_user_friends(user_id)
    accepted_count = sum(1 for f in all_friends if f.get("status") == "accepted")
    
    return FriendActionResponse(
        success=True,
        status="removed",
        friendId=friend_id,
        totalFriends=accepted_count
    )
