from typing import List, Dict, Optional, Union
from pydantic import BaseModel, Field, validator
from datetime import datetime


class QuizOption(BaseModel):
    label: str
    value: float
    co2: float


class QuizQuestion(BaseModel):
    id: str  # Note: API.md uses int but DB uses UUID. Keep as str.
    category: str
    question: str
    options: List[QuizOption]


class AnswerItem(BaseModel):
    label: str
    value: float
    co2: float


class QuizResultPayload(BaseModel):
    # frontend sends totalInTons as string or float
    totalInTons: Union[str, float]
    # keys are question IDs
    answers: Dict[str, AnswerItem]


class UserPredictions(BaseModel):
    highestConsumption: Optional[List[str]] = None
    flexibility: List[str]

    @validator('flexibility')
    def validate_flexibility(cls, v):
        if not (1 <= len(v) <= 3):
            raise ValueError("Flexibility must contain 1..3 items")
        return v


class EmissionsSaveRequest(BaseModel):
    quizResult: QuizResultPayload
    userPredictions: UserPredictions


class QuizResultResponse(BaseModel):
    totalInTons: float
    categoryBreakdown: Dict[str, float]


class EmissionsSaveResponse(BaseModel):
    success: bool = True
    emissionId: str
    quizResult: QuizResultResponse
    categoryEmissions: Dict[str, float]
    targetCO2: float
    savedAt: datetime


class CategoryUpdateRequest(BaseModel):
    category: str
    answers: Dict[str, AnswerItem]


class CategoryUpdateResponse(BaseModel):
    success: bool = True
    category: str
    newCategoryTotal: float
    categoryEmissions: Dict[str, float]
    updatedTotalInTons: float
    savedAt: datetime
