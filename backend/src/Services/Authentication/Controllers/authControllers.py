"""Authentication controllers: business logic for register/login.

Controllers do not talk directly to the database; they call repository
interfaces and raise HTTPExceptions on errors.
"""

from datetime import datetime, timedelta
from typing import Dict, Any

from fastapi import HTTPException, status
from jose import jwt
import bcrypt
import hashlib

from config import JWT_SECRET, ACCESS_TOKEN_EXPIRE_MINUTES
from Authentication.Schemas.authSchemas import (
    SignUpRequest,
    SignUpResponse,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
)
from Authentication.Repositories.Interfaces.authInterface import AuthRepositoryInterface


ALGORITHM = "HS256"


def _hash_password(password: str) -> str:
    # Pre-hash with SHA-256 to avoid bcrypt 72-byte limit, then bcrypt the digest
    digest = hashlib.sha256(password.encode("utf-8")).digest()
    hashed = bcrypt.hashpw(digest, bcrypt.gensalt())
    return hashed.decode("utf-8")


def _verify_password(password: str, hashed: str) -> bool:
    digest = hashlib.sha256(password.encode("utf-8")).digest()
    try:
        return bcrypt.checkpw(digest, hashed.encode("utf-8"))
    except Exception:
        return False


def _create_access_token(subject: str, expires_minutes: int | None = None) -> str:
    if expires_minutes is None:
        expires_minutes = ACCESS_TOKEN_EXPIRE_MINUTES
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    # Pass the datetime object directly. jose will properly convert it to UTC timestamp.
    payload = {"sub": str(subject), "exp": expire}
    token = jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)
    return token


def register_user(payload: SignUpRequest, repo: AuthRepositoryInterface) -> SignUpResponse:
    if len(payload.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long",
        )

    # Check uniqueness
    if repo.get_user_by_email(payload.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")
    if repo.get_user_by_username(payload.user_name):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already in use")

    hashed = _hash_password(payload.password)
    user_payload: Dict[str, Any] = {
        "email": payload.email,
        "user_name": payload.user_name,
        "password": hashed,
    }

    try:
        created = repo.create_user(user_payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    return SignUpResponse(id=created.get("id"), email=created.get("email"), user_name=created.get("user_name"))


def login_user(payload: LoginRequest, repo: AuthRepositoryInterface) -> LoginResponse:
    user = repo.get_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    hashed = user.get("password")
    if not hashed or not _verify_password(payload.password, hashed):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = _create_access_token(subject=user.get("id"))
    return LoginResponse(access_token=token, token_type="bearer")


def logout_user() -> LogoutResponse:
    # Since we are using stateless JWTs without a server-side blacklist,
    # logout is handled by the client discarding the token.
    # Here we just acknowledge the logout request.
    return LogoutResponse(message="Successfully logged out")
