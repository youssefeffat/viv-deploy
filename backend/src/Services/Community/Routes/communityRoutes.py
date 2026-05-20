from fastapi import APIRouter, Depends, status
from typing import List

from Authentication.dependencies import get_current_user
from Community.dependencies import get_community_repo
from Community.Repositories.Interfaces.communityInterface import CommunityRepositoryInterface

from Community.Schemas.communitySchemas import LeaderboardEntry
from Community.Controllers.communityControllers import get_leaderboard_controller

router = APIRouter(prefix="/api/community", tags=["community"])

@router.get(
    "/leaderboard",
    response_model=List[LeaderboardEntry],
    status_code=status.HTTP_200_OK,
    summary="Get Community Leaderboard",
    description="Returns the list of top users sorted by points, including their rank and calculated percentage for the podium."
)
async def get_leaderboard(
    user_id: str = Depends(get_current_user), # Optional or required based on business rule
    repo: CommunityRepositoryInterface = Depends(get_community_repo)
):
    return get_leaderboard_controller(repo)
