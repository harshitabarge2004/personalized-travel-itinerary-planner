"""Seed script for the Travel Itinerary Planner.

Running this script will:
  1. Ensure the Supabase tables exist (run the SQL migration manually first).
  2. Insert a demo user (via Supabase Auth is out‑of‑scope here – we assume a user UUID).
  3. Insert a sample preferences record and a dummy trip with one day and one item.

Usage:
    python -m backend.db.seed
"""

import uuid
from datetime import date, datetime
from backend.db.client import supabase

# Helper to insert if not exists
def upsert(table: str, payload: dict, unique_field: str):
    existing = (
        supabase.table(table).select("*").eq(unique_field, payload[unique_field]).single().execute()
    )
    if existing.data:
        print(f"{table} already has record with {unique_field}={payload[unique_field]}")
        return existing.data
    res = supabase.table(table).insert(payload).execute()
    print(f"Inserted into {table}: {res.data}")
    return res.data[0]

def main():
    # Demo user id – replace with a real auth.users.id from your Supabase project
    demo_user_id = "00000000-0000-0000-0000-000000000001"

    # Insert profile (optional – depends on auth.users existing)
    try:
        upsert(
            "profiles",
            {"id": demo_user_id, "full_name": "Demo User", "avatar_url": None},
            "id",
        )
    except Exception as e:
        print(f"Profile insert error (ignore if user already exists): {e}")

    # Insert preferences
    pref_payload = {
        "user_id": demo_user_id,
        "interests": ["culture", "food", "nature"],
        "travel_style": "balanced",
        "pace": "moderate",
        "budget_level": "mid",
        "accommodation_type": "hotel",
        "dietary_prefs": ["vegetarian"],
    }
    upsert("preferences", pref_payload, "user_id")

    # Insert a dummy trip
    trip_id = str(uuid.uuid4())
    trip_payload = {
        "id": trip_id,
        "owner_id": demo_user_id,
        "title": "Sample Trip to Kyoto",
        "destination": "Kyoto, Japan",
        "start_date": date(2024, 4, 10),
        "end_date": date(2024, 4, 15),
        "budget": 1500,
        "currency": "USD",
        "group_size": 2,
        "status": "draft",
    }
    upsert("trips", trip_payload, "id")

    # One itinerary day
    day_id = str(uuid.uuid4())
    day_payload = {
        "id": day_id,
        "trip_id": trip_id,
        "day_number": 1,
        "date": date(2024, 4, 10),
        "summary": "Arrival and first explorations",
        "estimated_cost": 200,
    }
    upsert("itinerary_days", day_payload, "id")

    # One itinerary item
    item_payload = {
        "day_id": day_id,
        "time_slot": "09:00:00",
        "type": "attraction",
        "title": "Kinkaku-ji Temple",
        "description": "Visit the Golden Pavilion.",
        "location": "Kinkaku-ji, Kyoto",
        "lat": 35.0394,
        "lng": 135.7292,
        "cost": 10,
        "duration_min": 120,
        "order_index": 1,
    }
    upsert("itinerary_items", item_payload, "day_id")

if __name__ == "__main__":
    main()
