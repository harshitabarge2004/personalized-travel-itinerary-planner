import json
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any, Optional

from backend.services import recommendation as rec_module
from backend.services.prompts import build_prompt
from backend.services.llm_client import llm_client, clean_json_text
from backend.db.client import get_supabase

router = APIRouter()

# In-memory store fallback when Supabase tables are not yet migrated
_MEMORY_TRIPS: Dict[str, Dict[str, Any]] = {}


class ItineraryItem(BaseModel):
    time_slot: str
    type: str = "attraction"
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    cost: Optional[float] = None
    duration_min: Optional[int] = None
    order_index: int = 1

    @field_validator("type", mode="before")
    @classmethod
    def normalize_type(cls, v: Any) -> str:
        val = str(v).lower().strip()
        if val in ("attraction", "monument", "sightseeing", "place"):
            return "attraction"
        if val in ("dining", "restaurant", "food", "cafe", "meal"):
            return "dining"
        if val in ("stay", "hotel", "resort", "accommodation"):
            return "stay"
        if val in ("transport", "transit", "flight", "train", "cab", "bus"):
            return "transport"
        return "activity"


class ItineraryDay(BaseModel):
    day_number: int
    date: str
    summary: Optional[str] = None
    estimated_cost: Optional[float] = None
    items: List[ItineraryItem] = []


class BudgetBreakdown(BaseModel):
    stay: Optional[float] = 0
    food: Optional[float] = 0
    sightseeing: Optional[float] = 0
    transport: Optional[float] = 0
    miscellaneous: Optional[float] = 0


class ItineraryResponse(BaseModel):
    trip_id: Optional[str] = None
    destination: Optional[str] = None
    total_estimated_cost: Optional[float] = None
    currency: str = "INR"
    budget_breakdown: Optional[BudgetBreakdown] = None
    days: List[ItineraryDay] = []
    created_at: Optional[str] = None


class TripGenerationPayload(BaseModel):
    destination: str
    start_date: str
    end_date: str
    group_size: int = 1
    budget_level: str = "medium"
    travel_style: str = "balanced"
    pace: str = "balanced"
    interests: List[str] = []
    dietary_prefs: List[str] = []


def calculate_days_count(start_date: str, end_date: str) -> int:
    try:
        d1 = datetime.strptime(start_date, "%Y-%m-%d")
        d2 = datetime.strptime(end_date, "%Y-%m-%d")
        diff = (d2 - d1).days + 1
        return max(1, min(diff, 14))
    except Exception:
        return 2


@router.post("/generate", response_model=ItineraryResponse)
async def generate_itinerary(payload: TripGenerationPayload):
    # 1. Recommendation engine context
    if rec_module.recommendation_engine is None:
        rec_module.recommendation_engine = rec_module.RecommendationEngine()
    recs = await rec_module.recommendation_engine.recommend(payload.dict())

    # 2. Build prompt
    system_prompt, user_prompt = build_prompt(payload.dict(), recs)

    # 3. Calculate target days count
    days_cnt = calculate_days_count(payload.start_date, payload.end_date)

    # 4. Generate via LLM (with smart fallback)
    raw_response = llm_client.generate(
        system_prompt, user_prompt, destination=payload.destination, days_count=days_cnt
    )

    # 5. Parse and validate JSON
    try:
        cleaned = clean_json_text(raw_response)
        parsed = json.loads(cleaned)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to parse LLM response: {exc}",
        )

    # Ensure required fields
    trip_id = str(uuid.uuid4())
    parsed["trip_id"] = trip_id
    if not parsed.get("destination"):
        parsed["destination"] = payload.destination
    if not parsed.get("currency"):
        parsed["currency"] = "INR"

    # Compute total estimated cost if missing
    if not parsed.get("total_estimated_cost"):
        total = 0
        for day in parsed.get("days", []):
            total += day.get("estimated_cost", 0) or sum(it.get("cost", 0) or 0 for it in day.get("items", []))
        parsed["total_estimated_cost"] = total

    itinerary = ItineraryResponse(**parsed)
    # Save to memory store as well
    _MEMORY_TRIPS[trip_id] = parsed

    # Optional: Persist to Supabase if configured & tables exist
    supabase = get_supabase()
    if supabase:
        try:
            supabase.table("trips").insert({
                "id": trip_id,
                "owner_id": "guest",
                "title": f"Trip to {payload.destination}",
                "destination": payload.destination,
                "start_date": payload.start_date,
                "end_date": payload.end_date,
                "group_size": payload.group_size,
                "travel_style": payload.travel_style,
                "pace": payload.pace,
                "currency": "INR",
                "total_estimated_cost": parsed.get("total_estimated_cost", 0),
            }).execute()
        except Exception:
            # Table might not exist yet; fail gracefully
            pass

    return itinerary


@router.post("/save", response_model=Dict[str, Any])
async def save_trip(itinerary: ItineraryResponse):
    trip_id = itinerary.trip_id or str(uuid.uuid4())
    data = itinerary.dict()
    data["trip_id"] = trip_id
    data["updated_at"] = datetime.utcnow().isoformat()
    _MEMORY_TRIPS[trip_id] = data

    supabase = get_supabase()
    if supabase:
        try:
            supabase.table("trips").upsert({
                "id": trip_id,
                "title": f"Trip to {itinerary.destination or 'Destination'}",
                "destination": itinerary.destination or "India",
                "currency": "INR",
                "total_estimated_cost": itinerary.total_estimated_cost or 0,
            }).execute()
        except Exception:
            pass

    return {"status": "saved", "trip_id": trip_id, "data": data}


@router.get("/", response_model=List[Dict[str, Any]])
async def list_trips():
    """List all saved itineraries."""
    supabase = get_supabase()
    if supabase:
        try:
            res = supabase.table("trips").select("*").order("created_at", desc=True).execute()
            if res.data and len(res.data) > 0:
                return res.data
        except Exception:
            pass
    # Fallback to in-memory trips
    return list(_MEMORY_TRIPS.values())


@router.get("/{trip_id}", response_model=Dict[str, Any])
async def get_trip(trip_id: str):
    if trip_id in _MEMORY_TRIPS:
        return _MEMORY_TRIPS[trip_id]
    supabase = get_supabase()
    if supabase:
        try:
            res = supabase.table("trips").select("*").eq("id", trip_id).single().execute()
            if res.data:
                return res.data
        except Exception:
            pass
    raise HTTPException(status_code=404, detail="Trip not found")


@router.delete("/{trip_id}")
async def delete_trip(trip_id: str):
    if trip_id in _MEMORY_TRIPS:
        del _MEMORY_TRIPS[trip_id]
    supabase = get_supabase()
    if supabase:
        try:
            supabase.table("trips").delete().eq("id", trip_id).execute()
        except Exception:
            pass
    return {"status": "deleted", "trip_id": trip_id}
