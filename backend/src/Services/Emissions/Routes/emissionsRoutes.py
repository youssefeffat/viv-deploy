from fastapi import APIRouter, Depends, status
from typing import List

from Authentication.dependencies import get_current_user
from Emissions.dependencies import get_emissions_repo
from Emissions.Repositories.Interfaces.emissionsInterface import EmissionsRepositoryInterface

from Emissions.Schemas.emissionsSchemas import (
    QuizQuestion,
    EmissionsSaveRequest,
    EmissionsSaveResponse,
    CategoryUpdateRequest,
    CategoryUpdateResponse
)

from Emissions.Controllers.emissionsControllers import (
    get_all_questions_controller,
    save_emissions_controller,
    update_category_emissions_controller
)

# We define the router with a prefix so we don't need it in main.py
# Note that API.md mixes prefixes for this service: /api/quiz and /api/emissions
# We'll use prefix="/api" here, and define sub-paths explicitly.
router = APIRouter(prefix="/api", tags=["emissions"])


@router.get(
    "/quiz/questions",
    response_model=List[QuizQuestion],
    status_code=status.HTTP_200_OK,
    summary="Get all quiz questions",
    description="Returns the full list of onboarding quiz questions and their options. Publicly accessible."
)
async def get_quiz_questions(repo: EmissionsRepositoryInterface = Depends(get_emissions_repo)):
    return get_all_questions_controller(repo)


@router.post(
    "/emissions/save",
    response_model=EmissionsSaveResponse,
    status_code=status.HTTP_200_OK,
    summary="Save user footprint predictions",
    description="Calculates the true footprint based on submitted answers and saves it."
)
async def save_emissions(
    payload: EmissionsSaveRequest,
    user_id: str = Depends(get_current_user),
    repo: EmissionsRepositoryInterface = Depends(get_emissions_repo)
):
    return save_emissions_controller(user_id, payload, repo)


@router.put(
    "/emissions/category",
    response_model=CategoryUpdateResponse,
    status_code=status.HTTP_200_OK,
    summary="Recalculate a specific category footprint",
    description="Calculates a new total for a specific category and maintains history."
)
async def update_category_emissions(
    payload: CategoryUpdateRequest,
    user_id: str = Depends(get_current_user),
    repo: EmissionsRepositoryInterface = Depends(get_emissions_repo)
):
    return update_category_emissions_controller(user_id, payload, repo)
