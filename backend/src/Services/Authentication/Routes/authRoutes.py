"""Authentication routes.

Thin FastAPI routes that validate input and delegate to Controllers.
Each route includes detailed documentation and example bodies.
"""

from fastapi import APIRouter, Depends, status

from Authentication.Schemas.authSchemas import (
    SignUpRequest,
    SignUpResponse,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
)
from Authentication.Controllers.authControllers import register_user, login_user, logout_user
from Authentication.dependencies import get_auth_repo
from Authentication.Repositories.Interfaces.authInterface import AuthRepositoryInterface


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/signup",
    response_model=SignUpResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user account",
    description="Create a new user with `email`, `user_name` and `password`. Returns the created user (no password).",
)
async def signup(payload: SignUpRequest, repo: AuthRepositoryInterface = Depends(get_auth_repo)):
    """Register a new user.

    - **email**: valid email address
    - **user_name**: unique username
    - **password**: at least 8 characters
    """
    return register_user(payload, repo)


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="Login and receive a JWT",
    description="Authenticate with `email` and `password`. Returns an access token on success.",
)
async def login(payload: LoginRequest, repo: AuthRepositoryInterface = Depends(get_auth_repo)):
    """Authenticate a user and return a JWT access token."""
    return login_user(payload, repo)


@router.post(
    "/logout",
    response_model=LogoutResponse,
    status_code=status.HTTP_200_OK,
    summary="Logout user",
    description="Logout the current user. Note: Since we use stateless JWTs, the client must discard the token.",
)
async def logout():
    """Logout endpoint."""
    return logout_user()
