from fastapi import APIRouter, Depends, status
from typing import List

from Authentication.dependencies import get_current_user
from Gamification.dependencies import get_gamification_repo
from Gamification.Repositories.Interfaces.gamificationInterface import GamificationRepositoryInterface

from Gamification.Schemas.gamificationSchemas import (
    ChallengeResponse,
    ToggleChallengeRequest,
    ToggleChallengeResponse,
    CreateChallengeRequest,
    CreateChallengeResponse
)

from Gamification.Controllers.gamificationControllers import (
    get_recommendations_controller,
    toggle_challenge_controller,
    create_challenge_controller,
    unlock_next_batch_controller
)

router = APIRouter(prefix="/api/challenges", tags=["gamification"])


@router.get(
    "/recommendations",
    response_model=List[ChallengeResponse],
    status_code=status.HTTP_200_OK,
    summary="Get recommended challenges",
    description="Returns a list of challenges recommended for the user, including completion status."
)
async def get_recommendations(
    user_id: str = Depends(get_current_user),
    repo: GamificationRepositoryInterface = Depends(get_gamification_repo)
):
    return get_recommendations_controller(user_id, repo)


@router.post(
    "/unlock-batch",
    status_code=status.HTTP_200_OK,
    summary="Unlock next challenge batch",
    description="Advances the user's challenge batch offset after completing all current challenges."
)
async def unlock_next_batch(
    user_id: str = Depends(get_current_user),
    repo: GamificationRepositoryInterface = Depends(get_gamification_repo)
):
    return unlock_next_batch_controller(user_id, repo)


@router.post(
    "",
    response_model=CreateChallengeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a custom challenge",
    description="Creates a new custom challenge. Points must be between 5 and 500."
)
async def create_challenge(
    payload: CreateChallengeRequest,
    user_id: str = Depends(get_current_user), # Just to ensure they are logged in
    repo: GamificationRepositoryInterface = Depends(get_gamification_repo)
):
    return create_challenge_controller(payload, repo)


@router.post(
    "/{challenge_id}/toggle",
    response_model=ToggleChallengeResponse,
    status_code=status.HTTP_200_OK,
    summary="Toggle a challenge completion",
    description="Marks a challenge as completed or uncompleted. Awards or removes points and updates tree planting progress."
)
async def toggle_challenge(
    challenge_id: str,
    payload: ToggleChallengeRequest,
    user_id: str = Depends(get_current_user),
    repo: GamificationRepositoryInterface = Depends(get_gamification_repo)
):
    return toggle_challenge_controller(user_id, challenge_id, payload, repo)

