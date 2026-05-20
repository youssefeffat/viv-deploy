from typing import List, Dict, Any
from datetime import datetime
from fastapi import HTTPException, status

from Emissions.Schemas.emissionsSchemas import (
    QuizQuestion,
    QuizOption,
    EmissionsSaveRequest,
    EmissionsSaveResponse,
    QuizResultResponse,
    CategoryUpdateRequest,
    CategoryUpdateResponse
)
from Emissions.Repositories.Interfaces.emissionsInterface import EmissionsRepositoryInterface


# Map standard DB domains to frontend expected categories
CATEGORY_MAP = {
    "transport": "Transport",
    "food": "Alimentation",
    "energy": "Énergie",
    "consumption": "Consommation",
    "alimentation": "Alimentation",
    "energie": "Énergie",
    "consommation": "Consommation"
}

def _get_category_name(domain: str) -> str:
    domain_lower = domain.lower()
    return CATEGORY_MAP.get(domain_lower, domain.capitalize())

def _get_db_column(category: str) -> str:
    # Reverse map for database columns
    cat_lower = category.lower()
    if cat_lower == "transport": return "transport_co2"
    if cat_lower == "alimentation" or cat_lower == "food": return "food_co2"
    if cat_lower == "énergie" or cat_lower == "energie" or cat_lower == "energy": return "energy_co2"
    if cat_lower == "consommation" or cat_lower == "consumption": return "consumption_co2"
    return "consumption_co2" # Fallback


def get_all_questions_controller(repo: EmissionsRepositoryInterface) -> List[QuizQuestion]:
    db_questions = repo.get_all_questions()
    result = []
    
    for q in db_questions:
        options = []
        for ans in q.get("onboarding_answers", []):
            # Map max_value or min_value to value
            val = ans.get("max_value")
            if val is None:
                val = ans.get("min_value", 0)
                
            options.append(QuizOption(
                label=ans.get("label", ""),
                value=float(val),
                co2=float(ans.get("co2_value", 0.0))
            ))
            
        result.append(QuizQuestion(
            id=str(q.get("id")),
            category=_get_category_name(q.get("domain", "")),
            question=q.get("question", ""),
            options=options
        ))
        
    return result


def save_emissions_controller(user_id: str, payload: EmissionsSaveRequest, repo: EmissionsRepositoryInterface) -> EmissionsSaveResponse:
    # 1. Fetch all questions to map question_id -> category
    questions = repo.get_all_questions()
    q_to_category = {str(q.get("id")): _get_category_name(q.get("domain", "")) for q in questions}
    
    # 2. Recalculate totals
    category_emissions = {
        "Transport": 0.0,
        "Alimentation": 0.0,
        "Énergie": 0.0,
        "Consommation": 0.0
    }
    
    for q_id, answer in payload.quizResult.answers.items():
        # Answers in DB/on frontend use CO2 values in kilograms. Convert to tonnes.
        category = q_to_category.get(q_id, "Consommation") # Fallback to Consommation
        if category not in category_emissions:
            category_emissions[category] = 0.0
        try:
            co2_value = float(answer.co2) / 1000.0
        except Exception:
            co2_value = 0.0
        category_emissions[category] += co2_value
        
    total_co2 = sum(category_emissions.values())
    
    # 3. Save to database
    db_payload = {
        "user_id": user_id,
        "total_co2": total_co2,
        "transport_co2": category_emissions.get("Transport", 0.0),
        "food_co2": category_emissions.get("Alimentation", 0.0),
        "energy_co2": category_emissions.get("Énergie", 0.0),
        "consumption_co2": category_emissions.get("Consommation", 0.0),
        "flexibility_domains": payload.userPredictions.flexibility
    }
    
    saved_data = repo.save_onboarding_results(db_payload)
    
    return EmissionsSaveResponse(
        success=True,
        emissionId=str(saved_data.get("id")),
        quizResult=QuizResultResponse(
            totalInTons=total_co2,
            categoryBreakdown=category_emissions
        ),
        categoryEmissions=category_emissions,
        targetCO2=total_co2 * 0.9, # Arbitrary target reduction of 10%
        savedAt=datetime.utcnow()
    )


def update_category_emissions_controller(user_id: str, payload: CategoryUpdateRequest, repo: EmissionsRepositoryInterface) -> CategoryUpdateResponse:
    # 1. Fetch the latest footprint to preserve other categories
    latest = repo.get_latest_onboarding_results(user_id)
    if not latest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No existing footprint found to update.")
        
    category_emissions = {
        "Transport": latest.get("transport_co2", 0.0),
        "Alimentation": latest.get("food_co2", 0.0),
        "Énergie": latest.get("energy_co2", 0.0),
        "Consommation": latest.get("consumption_co2", 0.0)
    }
    
    # 2. Recalculate JUST the updated category
    # Answers use kg units; convert to tonnes for storage and responses
    new_category_total = 0.0
    try:
        new_category_total = sum(float(ans.co2) / 1000.0 for ans in payload.answers.values())
    except Exception:
        new_category_total = 0.0
    target_category = _get_category_name(payload.category)
    
    # Apply to map
    category_emissions[target_category] = new_category_total
    new_total_co2 = sum(category_emissions.values())
    
    # 3. Insert new row to maintain history
    db_payload = {
        "user_id": user_id,
        "total_co2": new_total_co2,
        "transport_co2": category_emissions.get("Transport", 0.0),
        "food_co2": category_emissions.get("Alimentation", 0.0),
        "energy_co2": category_emissions.get("Énergie", 0.0),
        "consumption_co2": category_emissions.get("Consommation", 0.0),
        "flexibility_domains": latest.get("flexibility_domains", [])
    }
    
    saved_data = repo.save_onboarding_results(db_payload)
    
    return CategoryUpdateResponse(
        success=True,
        category=target_category,
        newCategoryTotal=new_category_total,
        categoryEmissions=category_emissions,
        updatedTotalInTons=new_total_co2,
        savedAt=datetime.utcnow()
    )
