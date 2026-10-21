"""Backend prompt builder for the Travel Itinerary Planner with India-first context.

Constructs system and user prompts to produce realistic, structured day-by-day travel plans
with costs in Indian Rupees (INR / ₹) and realistic local transport and dining guidance.
"""

from typing import Dict, List, Tuple

SYSTEM_PROMPT = """You are an elite, highly knowledgeable Indian and International travel planner AI.
Your objective is to generate an authentic, personalized, realistic day-by-day travel itinerary.

CRITICAL REQUIREMENTS:
1. CURRENCY: All prices, expenses, and costs MUST be estimated in Indian Rupees (INR / ₹).
2. REALISTIC SCHEDULING: Schedule activities sequentially without unrealistic backtracking or rushed timings.
3. AUTHENTIC EXPERIENCES: Include iconic attractions, authentic local dining (dhabas, regional specialities, famous cafes), practical local transit (auto-rickshaw, metro, cabs, walking, local trains), and evening highlights.
4. ESTIMATES: Every cost must be a realistic estimate in INR for the given group size and budget level.
5. FORMAT: Output MUST be ONLY valid, parseable JSON conforming strictly to the requested schema. No markdown code blocks, no introductory greetings, and no explanatory text outside the JSON.
"""

def _format_recommendations(recs: Dict[str, List[Dict]]) -> str:
    lines: List[str] = []
    for category, items in recs.items():
        if not items:
            continue
        cat_name = category.replace("_", " ").title()
        lines.append(f"{cat_name}:")
        for itm in items:
            title = itm.get("title", "Untitled")
            desc = itm.get("description", "")
            lines.append(f"  - {title}: {desc}")
    return "\n".join(lines)

def build_prompt(preferences: Dict, recommendations: Dict) -> Tuple[str, str]:
    destination = preferences.get("destination", "India")
    start_date = preferences.get("start_date", "2026-11-01")
    end_date = preferences.get("end_date", "2026-11-03")
    group_size = preferences.get("group_size", 2)
    budget_level = preferences.get("budget_level", "medium")
    travel_style = preferences.get("travel_style", "balanced")
    pace = preferences.get("pace", "balanced")
    interests = ", ".join(preferences.get("interests", ["sightseeing", "food"]))
    dietary_prefs = ", ".join(preferences.get("dietary_prefs", ["any"]))

    user_parts: List[str] = [
        f"Trip Destination: {destination}",
        f"Dates: {start_date} to {end_date}",
        f"Number of Travellers: {group_size}",
        f"Budget Tier: {budget_level} (Estimate all expenses in INR / ₹)",
        f"Travel Style: {travel_style}",
        f"Pace: {pace}",
        f"Interests: {interests}",
        f"Dietary Preferences: {dietary_prefs}",
    ]

    rec_text = _format_recommendations(recommendations)
    if rec_text:
        user_parts.append(f"Context / Recommended Highlights:\n{rec_text}")

    user_parts.append(
        """Return a single JSON object with this EXACT structure:
{
  "destination": "<destination>",
  "total_estimated_cost": <number in INR>,
  "currency": "INR",
  "budget_breakdown": {
    "stay": <number in INR>,
    "food": <number in INR>,
    "sightseeing": <number in INR>,
    "transport": <number in INR>,
    "miscellaneous": <number in INR>
  },
  "days": [
    {
      "day_number": 1,
      "date": "<YYYY-MM-DD>",
      "summary": "<Short highlight of the day>",
      "estimated_cost": <number in INR>,
      "items": [
        {
          "time_slot": "09:00 AM",
          "type": "attraction",
          "title": "<Name of Attraction / Activity / Restaurant / Transit>",
          "description": "<Engaging 1-2 sentence tip and what to see or eat>",
          "location": "<Area or Landmark name>",
          "lat": <float or null>,
          "lng": <float or null>,
          "cost": <estimated cost in INR per person or group>,
          "duration_min": <duration in minutes, e.g. 90>,
          "order_index": 1
        }
      ]
    }
  ]
}

Note: `type` must be one of: "attraction", "dining", "stay", "transport", or "activity". Output pure JSON only."""
    )

    return SYSTEM_PROMPT, "\n\n".join(user_parts)
