from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database.db import (get_challenge_quota,
create_challenge_quota, reset_quota_if_needed, create_challenge, get_user_challenges
    )
from ..ai_generator import generate_challenge_with_ai
from ..utils import authenticate_and_get_user_details
from ..database.models import get_db
import json
from datetime import datetime, timedelta

router = APIRouter()

class ChallengeRequest(BaseModel):
    difficulty: str

    class Config:
        json_schema_extra = {
            "example": {
                "difficulty": "easy"
            }
        }

@router.post("/create")
async def generate_challenge(
    request: ChallengeRequest, 
    request_obj: Request,
    db: Session = Depends(get_db)
):
    try:
        user_details = authenticate_and_get_user_details(request_obj)
        
        user_id = user_details.get("user_id") 

        quota = get_challenge_quota(db, user_id)
        if not quota:
            create_challenge_quota(db, user_id)
        
        quota = reset_quota_if_needed(db, quota)

        if quota.quota_remaining <= 0:
            raise HTTPException(
                status_code=429, 
                detail="You have exhausted your challenge quota. Please try again later."
            )
        
        challenge_data = generate_challenge_with_ai(request.difficulty)

        new_challenge = create_challenge(
            db, 
            difficulty=request.difficulty,
            created_by=user_id,
            title=challenge_data["query"],
            options=json.dumps(challenge_data["options"]),
            correct_answer_id=challenge_data["correct_answer_id"],
            explanation=challenge_data["explanation"]
        )

        quota.quota_remaining -= 1

        db.commit()

        return {
            "id": new_challenge.id,
            "difficulty": new_challenge.difficulty,
            "title": new_challenge.title,
            "options": json.loads(new_challenge.options),
            "correct_answer_id": new_challenge.correct_answer_id,
            "explanation": new_challenge.explanation,
            "timestamp": new_challenge.date_created.isoformat(),
        } 
    

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occurred while generating the challenge: {str(e)}"
        ) 

@router.get("/history")
async def my_history(request:Request, db: Session = Depends(get_db)):
    
    user_details = authenticate_and_get_user_details(request)

    user_id = user_details.get("user_id")

    challenges = get_user_challenges(db, user_id)
    return {"challenges": challenges}

@router.get("/quota")
async def get_quota(request: Request, db: Session = Depends(get_db)):
    user_details = authenticate_and_get_user_details(request)

    user_id = user_details.get("user_id")

    quota = get_challenge_quota(db, user_id)

    if not quota:
        return {
            "user_id": user_id,
            "quota_remaining": 0,
            "last_reset_date": datetime.now()
        }

    quota = reset_quota_if_needed(db, quota)

    return quota




