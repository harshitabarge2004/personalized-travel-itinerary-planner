from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List

router = APIRouter()

class PreferenceCreate(BaseModel):
    user_id: str
    interests: List[str]
    travel_style: str
    pace: str
    budget_level: str
    accommodation_type: str
    dietary_prefs: List[str] = []

@router.post("/", response_model=PreferenceCreate, status_code=status.HTTP_201_CREATED)
async def create_preference(pref: PreferenceCreate):
    # Store in Supabase
    from backend.db.client import supabase
    try:
        data, count = supabase.table("preferences").insert(pref.dict()).execute().data, None
        # supabase SDK returns dict with 'data' key
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return pref

@router.get("/{user_id}", response_model=PreferenceCreate)
async def get_preference(user_id: str):
    from backend.db.client import supabase
    res = supabase.table("preferences").select("*").eq("user_id", user_id).single().execute()
    if res.data is None:
        raise HTTPException(status_code=404, detail="Not found")
    return PreferenceCreate(**res.data)

@router.put("/{user_id}", response_model=PreferenceCreate)
async def update_preference(user_id: str, pref: PreferenceCreate):
    from backend.db.client import supabase
    try:
        res = supabase.table("preferences").update(pref.dict()).eq("user_id", user_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return pref
