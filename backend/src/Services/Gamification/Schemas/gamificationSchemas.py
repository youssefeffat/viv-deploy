from typing import List, Optional
from pydantic import BaseModel, Field, validator
from datetime import datetime

class ChallengeResponse(BaseModel):
    id: str
    title: str
    points: int
    category: str
    completed: bool

class ToggleChallengeRequest(BaseModel):
    completed: bool

class ToggleChallengeResponse(BaseModel):
    success: bool = True
    challengeId: str
    completed: bool
    pointsDelta: int
    totalPoints: int
    treesPlanted: int
    treeProgress: int

class CreateChallengeRequest(BaseModel):
    title: str
    category: str
    points: int

    @validator('points')
    def validate_points(cls, v):
        if not (5 <= v <= 500):
            raise ValueError("Points must be between 5 and 500")
        return v

class CreateChallengeResponse(BaseModel):
    success: bool = True
    challenge: dict
