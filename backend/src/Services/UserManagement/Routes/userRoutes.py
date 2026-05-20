"""User management routes."""

from fastapi import APIRouter, Depends, status

from UserManagement.Schemas.userSchemas import (
    UserProfileDashboardResponse,
    PasswordChangeRequest,
    AdvancedUserStatsResponse,
    GenericActionResponse
)
from UserManagement.Controllers.userControllers import (
    get_user_dashboard,
    change_password_controller,
    delete_user_controller,
    get_advanced_stats_controller,
    recalculate_stats_controller,
    unlock_achievement_controller
)
from UserManagement.dependencies import get_user_repo
from UserManagement.Repositories.Interfaces.userInterface import UserRepositoryInterface
from Authentication.dependencies import get_current_user

# Note: The router is included in main.py. We can use prefix="" or just define the route.
# API.md expects /api/users/me. main.py doesn't prefix, so we prefix here.
router = APIRouter(prefix="/api/users", tags=["users"])


@router.get(
    "/me",
    response_model=UserProfileDashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user dashboard data",
    description="Returns user profile, total emissions, category breakdown, points, and achievements.",
)
async def get_me(
    user_id: str = Depends(get_current_user),
    repo: UserRepositoryInterface = Depends(get_user_repo)
):
    """Get the current user's full dashboard profile."""
    return get_user_dashboard(user_id, repo)

@router.put(
    "/me/password",
    response_model=GenericActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Change user password"
)
async def change_password(
    payload: PasswordChangeRequest,
    user_id: str = Depends(get_current_user),
    repo: UserRepositoryInterface = Depends(get_user_repo)
):
    return change_password_controller(user_id, payload, repo)

@router.delete(
    "/me",
    response_model=GenericActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete user account"
)
async def delete_user(
    hard: bool = False,
    user_id: str = Depends(get_current_user),
    repo: UserRepositoryInterface = Depends(get_user_repo)
):
    return delete_user_controller(user_id, hard, repo)

@router.get(
    "/me/stats",
    response_model=AdvancedUserStatsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get advanced user stats"
)
async def get_advanced_stats(
    user_id: str = Depends(get_current_user),
    repo: UserRepositoryInterface = Depends(get_user_repo)
):
    return get_advanced_stats_controller(user_id, repo)

@router.post(
    "/me/stats/recalculate",
    response_model=GenericActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Force recalculate stats"
)
async def recalculate_stats(
    user_id: str = Depends(get_current_user),
    repo: UserRepositoryInterface = Depends(get_user_repo)
):
    return recalculate_stats_controller(user_id, repo)

@router.post(
    "/me/achievements/{achievementId}/unlock",
    response_model=GenericActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Manually unlock an achievement"
)
async def unlock_achievement(
    achievementId: str,
    user_id: str = Depends(get_current_user),
    repo: UserRepositoryInterface = Depends(get_user_repo)
):
    return unlock_achievement_controller(user_id, achievementId, repo)

