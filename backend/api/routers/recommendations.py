from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any

# Import the singleton recommendation engine initialized at startup
from backend.services.recommendation import recommendation_engine, RecommendationEngine

router = APIRouter()

class PreferencePayload(BaseModel):
    interests: List[str]
    travel_style: str
    pace: str
    budget_level: str
    accommodation_type: str
    dietary_prefs: List[str] = []

class RecommendationResponse(BaseModel):
    attractions: List[Dict[str, Any]]
    dining: List[Dict[str, Any]]
    accommodations: List[Dict[str, Any]]
    transport: List[Dict[str, Any]]

@router.post("/", response_model=RecommendationResponse)
async def get_recommendations(preferences: PreferencePayload):
    # Ensure the engine is initialized – lazy fallback for safety
    global recommendation_engine
    if recommendation_engine is None:
        recommendation_engine = RecommendationEngine()
    recs = await recommendation_engine.recommend(preferences.dict())
    return RecommendationResponse(**recs)
