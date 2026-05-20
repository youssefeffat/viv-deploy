from typing import Optional
from pydantic import BaseModel

class LeaderboardEntry(BaseModel):
    rank: int
    name: str
    avatar: str
    points: int
    trees: int
    percentage: int

class FriendResponse(BaseModel):
    id: str
    name: str
    avatar: str
    points: int
    trees: int
    status: str

class FriendActionResponse(BaseModel):
    success: bool = True
    status: str
    friendId: str
    totalFriends: int = 0
