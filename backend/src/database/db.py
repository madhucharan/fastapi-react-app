from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from . import models

def get_challenge_quota(db:Session, user_id: str):
    """
    Retrieve the challenge quota for a specific user.
    If the user does not exist, create a new entry with default values.
    """
    return (db.query(models.ChallengeQuota)
    .filter(models.ChallengeQuota.user_id == user_id)
    .first())

def create_challenge_quota(db: Session, user_id: str):
    """
    Create a new challenge quota entry for a user with default values.
    """
    new_quota = models.ChallengeQuota(
        user_id=user_id
    )
    db.add(new_quota)
    db.commit()
    db.refresh(new_quota)
    return new_quota

def reset_quota_if_needed(db: Session, quota: models.ChallengeQuota):
    """
    Reset the user's challenge quota if the last reset date is more than 24 hours ago.
    """
    now = datetime.now()

    if now - quota.last_reset_date > timedelta(hours=24):
        quota.quota_remaining = 50
        quota.last_reset_date = now
        db.commit()
        db.refresh(quota)
    
    return quota

def create_challenge(
    db:Session, 
    difficulty: str, 
    created_by:str, 
    title: str, 
    options: str, 
    correct_answer_id: int, 
    explanation: str):
    """
    Create a new challenge in the database.
    """
    new_challenge = models.Challenge(
        difficulty=difficulty,
        created_by=created_by,
        title=title,
        options=options,
        correct_answer_id=correct_answer_id,
        explanation=explanation
    )
    db.add(new_challenge)
    db.commit()
    db.refresh(new_challenge)
    return new_challenge

def get_user_challenges(db: Session, user_id: str):
    """
    Retrieve all challenges created by a specific user.
    """
    return (db.query(models.Challenge)
            .filter(models.Challenge.created_by == user_id)
            .all())