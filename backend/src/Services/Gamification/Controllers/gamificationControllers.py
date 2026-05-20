from typing import List
from fastapi import HTTPException, status
from datetime import datetime

from Gamification.Schemas.gamificationSchemas import (
    ChallengeResponse,
    ToggleChallengeRequest,
    ToggleChallengeResponse,
    CreateChallengeRequest,
    CreateChallengeResponse
)
from Gamification.Repositories.Interfaces.gamificationInterface import GamificationRepositoryInterface

def get_recommendations_controller(user_id: str, repo: GamificationRepositoryInterface) -> List[ChallengeResponse]:
    all_challenges = repo.get_all_challenges()
    completed_ids = set(repo.get_user_completed_challenges(user_id))

    # Read the persisted batch offset from DB (defaults to 0 for new users)
    stats = repo.get_user_stats(user_id) or {}
    offset = int(stats.get("challenge_batch_offset") or 0)

    # Always return the same fixed batch for this offset
    batch = all_challenges[offset: offset + 10]

    result = []
    for c in batch:
        c_id = str(c["id"])
        result.append(ChallengeResponse(
            id=c_id,
            title=c.get("title", "Sans titre"),
            points=c.get("points", 0),
            category=c.get("domain", "Général"),
            completed=(c_id in completed_ids)  # show real completion status
        ))
    return result

def unlock_next_batch_controller(user_id: str, repo: GamificationRepositoryInterface) -> dict:
    all_challenges = repo.get_all_challenges()
    stats = repo.get_user_stats(user_id) or {}
    current_offset = int(stats.get("challenge_batch_offset") or 0)

    # Verify the current batch is fully completed before advancing
    completed_ids = set(repo.get_user_completed_challenges(user_id))
    current_batch = all_challenges[current_offset: current_offset + 10]
    all_done = all(str(c["id"]) in completed_ids for c in current_batch)

    if not all_done:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Terminez tous les défis actuels avant de débloquer la prochaine série."
        )

    new_offset = current_offset + 10
    # If no more challenges, wrap around to 0
    if new_offset >= len(all_challenges):
        new_offset = 0

    repo.advance_challenge_batch(user_id, new_offset)

    # Build and return the new batch directly to avoid a second request
    new_batch = all_challenges[new_offset: new_offset + 10]
    challenges = []
    for c in new_batch:
        c_id = str(c["id"])
        challenges.append({
            "id": c_id,
            "title": c.get("title", "Sans titre"),
            "points": c.get("points", 0),
            "category": c.get("domain", "Général"),
            "completed": False
        })

    return {"success": True, "newOffset": new_offset, "challenges": challenges}


def toggle_challenge_controller(
    user_id: str, 
    challenge_id: str, 
    payload: ToggleChallengeRequest, 
    repo: GamificationRepositoryInterface
) -> ToggleChallengeResponse:
    
    all_challenges = repo.get_all_challenges()
    target_challenge = next((c for c in all_challenges if str(c["id"]) == challenge_id), None)
    
    if not target_challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
        
    challenge_points = target_challenge.get("points", 0)
    completed_ids = set(repo.get_user_completed_challenges(user_id))
    is_currently_completed = challenge_id in completed_ids
    
    points_delta = 0
    if payload.completed and not is_currently_completed:
        points_delta = challenge_points
    elif not payload.completed and is_currently_completed:
        points_delta = -challenge_points
        
    # Get current stats
    stats = repo.get_user_stats(user_id) or {"total_points": 0, "trees_planted": 0}
    current_points = stats.get("total_points") or 0
    
    new_total_points = current_points + points_delta
    # Prevent negative points
    if new_total_points < 0:
        new_total_points = 0
        
    new_trees_planted = new_total_points // 1000
    tree_progress = (new_total_points % 1000) // 10
    
    # Save only if there's a change
    if points_delta != 0:
        repo.toggle_user_challenge(user_id, challenge_id, payload.completed)
        repo.update_user_stats(user_id, new_total_points, new_trees_planted)
        
    return ToggleChallengeResponse(
        success=True,
        challengeId=challenge_id,
        completed=payload.completed,
        pointsDelta=points_delta,
        totalPoints=new_total_points,
        treesPlanted=new_trees_planted,
        treeProgress=tree_progress
    )

def create_challenge_controller(payload: CreateChallengeRequest, repo: GamificationRepositoryInterface) -> CreateChallengeResponse:
    db_payload = {
        "title": payload.title,
        "domain": payload.category,
        "points": payload.points
    }
    
    try:
        created = repo.create_challenge(db_payload)
        return CreateChallengeResponse(
            success=True,
            challenge={
                "id": str(created.get("id")),
                "title": created.get("title"),
                "category": created.get("domain"),
                "points": created.get("points"),
                "completed": False
            }
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
