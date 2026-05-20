from fastapi import APIRouter, Depends, status, Body
from typing import List, Optional

from Authentication.dependencies import get_current_user
from Community.dependencies import get_community_repo
from Community.Repositories.Interfaces.communityInterface import CommunityRepositoryInterface

from Community.Schemas.communitySchemas import FriendResponse, FriendActionResponse
from Community.Controllers.friendsControllers import (
    get_friends_controller,
    send_friend_request_controller,
    accept_friend_request_controller,
    decline_friend_request_controller,
    delete_friend_controller
)

# Note: The frontend API specifies these endpoints starting with /api/users
router = APIRouter(prefix="/api/users", tags=["friends"])

@router.get(
    "/me/friends",
    response_model=List[FriendResponse],
    status_code=status.HTTP_200_OK,
    summary="Get user's friends",
    description="Returns the list of friends for the currently authenticated user."
)
async def get_friends(
    user_id: str = Depends(get_current_user),
    repo: CommunityRepositoryInterface = Depends(get_community_repo)
):
    return get_friends_controller(user_id, repo)

@router.post(
    "/{friend_id}/friends",
    response_model=FriendActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Send a friend request",
    description="Sends a friend request to another user. If they already requested you, it auto-accepts."
)
async def send_friend_request(
    friend_id: str,
    message: Optional[str] = Body(None, embed=True), # Accept optional message body
    user_id: str = Depends(get_current_user),
    repo: CommunityRepositoryInterface = Depends(get_community_repo)
):
    return send_friend_request_controller(user_id, friend_id, repo)

@router.post(
    "/{friend_id}/friends/accept",
    response_model=FriendActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Accept a friend request"
)
async def accept_friend_request(
    friend_id: str,
    requestId: Optional[str] = Body(None),
    user_id: str = Depends(get_current_user),
    repo: CommunityRepositoryInterface = Depends(get_community_repo)
):
    return accept_friend_request_controller(user_id, friend_id, repo)

@router.post(
    "/{friend_id}/friends/decline",
    response_model=FriendActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Decline a friend request"
)
async def decline_friend_request(
    friend_id: str,
    reason: Optional[str] = Body(None),
    user_id: str = Depends(get_current_user),
    repo: CommunityRepositoryInterface = Depends(get_community_repo)
):
    return decline_friend_request_controller(user_id, friend_id, repo)

@router.delete(
    "/{friend_id}/friends",
    response_model=FriendActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Remove a friend or cancel request"
)
async def delete_friend(
    friend_id: str,
    user_id: str = Depends(get_current_user),
    repo: CommunityRepositoryInterface = Depends(get_community_repo)
):
    return delete_friend_controller(user_id, friend_id, repo)
