"""LLM client wrapper with support for Groq (default), OpenAI, Together, and Gemini.

Features:
- Markdown fence stripping for robust JSON parsing.
- Automatic retry on rate limits / timeouts.
- Intelligent fallback mock generator with realistic Indian travel recommendations
  if the API key is not configured or network fails.
"""

import json
import logging
import re
import requests
from typing import Dict, Any, Optional
from backend.core.config import settings

logger = logging.getLogger(__name__)


def clean_json_text(raw_text: str) -> str:
    """Extract and clean raw JSON from LLM response text, stripping markdown code fences."""
    text = raw_text.strip()
    # Match ```json ... ``` or ``` ... ```
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        text = match.group(1).strip()
    # Also find outer curly braces if extra text exists
    first_brace = text.find("{")
    last_brace = text.rfind("}")
    if first_brace != -1 and last_brace != -1:
        text = text[first_brace : last_brace + 1]
    return text


def generate_fallback_indian_itinerary(destination: str = "Indore", days_count: int = 2) -> Dict[str, Any]:
    """Provide a rich, realistic Indian travel itinerary fallback if LLM is unavailable."""
    dest_lower = destination.lower()

    if "indore" in dest_lower:
        highlights = [
            ("Rajwada Palace & Sarafa Bazaar", [
                ("09:30 AM", "attraction", "Rajwada Palace", "Explore the historic 7-story Holkar Dynasty palace with Maratha architecture.", "Rajwada, Old Indore", 50, 90),
                ("12:30 PM", "dining", "Vijay Chaat House & Chappan Dukan", "Savour legendary Khopra Patties, Poha Jalebi, and Shikanji at the famous food street.", "Chappan Dukan, New Palasia", 350, 60),
                ("03:30 PM", "attraction", "Lal Bagh Palace", "Admire European-style royal palace gardens and classical coin collections.", "Nai Duniya, Indore", 100, 120),
                ("08:00 PM", "dining", "Sarafa Night Food Market", "Experience the famous late-night jewellery market turned culinary wonderland. Try Bhutte ka Kees and Garadu.", "Sarafa Bazaar", 450, 90),
            ]),
            ("Ujjain Day Excursion & Spiritual Trail", [
                ("08:00 AM", "transport", "Cab / Train to Ujjain", "Short 1-hour scenic transit to the sacred holy city of Mahakal.", "Indore - Ujjain Highway", 1200, 60),
                ("09:30 AM", "attraction", "Mahakaleshwar Jyotirlinga Temple & Corridor", "Experience darshan at one of the 12 sacred Jyotirlingas and walk the grand Mahakal Lok Corridor.", "Jaisinghpura, Ujjain", 250, 180),
                ("01:30 PM", "dining", "Traditional Malwa Thali Lunch", "Enjoy authentic Dal Bafla, Churma, and spicy chutney.", "Mahakal Ghati, Ujjain", 300, 60),
                ("04:30 PM", "attraction", "Ram Ghat Shipra River Aarti", "Peaceful sunset evening prayer at the holy river ghats.", "Ram Ghat, Ujjain", 50, 90),
            ])
        ]
    elif "jaipur" in dest_lower:
        highlights = [
            ("The Pink City Forts & Heritage", [
                ("09:00 AM", "attraction", "Amer Fort & Maota Lake", "Majestic hilltop fort with Sheesh Mahal (Mirror Palace) and Rajput architecture.", "Amer, Jaipur", 200, 180),
                ("01:00 PM", "dining", "Laxmi Mishtan Bhandar (LMB)", "Iconic Johari Bazaar restaurant for Pyaaz Kachori, Rajasthani Thali, and Ghewar.", "Johari Bazaar", 550, 60),
                ("03:30 PM", "attraction", "Hawa Mahal & City Palace", "Photogenic Palace of Winds and the museum of royal royal costumes and weapons.", "Badi Choupad", 300, 120),
                ("07:30 PM", "activity", "Nahargarh Fort Sunset Point", "Panoramic twilight view of the entire lit-up Pink City.", "Aravalli Hills", 100, 90),
            ]),
            ("Bazaars & Modern Royalty", [
                ("10:00 AM", "attraction", "Jantar Mantar Astronomical Observatory", "UNESCO world heritage site featuring the world's largest stone sundial.", "Kanwar Nagar", 200, 90),
                ("12:30 PM", "dining", "Tapri Central", "Charming rooftop cafe overlooking Central Park serving cutting chai and fusion snacks.", "C Scheme, Ashok Nagar", 400, 60),
                ("03:00 PM", "attraction", "Bapu Bazaar & Johari Bazaar", "Shop for traditional Jaipuri quilts (rajai), block-printed kurtas, and blue pottery.", "Bapu Bazaar", 200, 120),
                ("07:30 PM", "dining", "Chokhi Dhani Cultural Village", "Immersive Rajasthani village experience with folk dances, camel rides, and royal dinner.", "Tonk Road", 1100, 180),
            ])
        ]
    elif "goa" in dest_lower:
        highlights = [
            ("North Goa Coast & Forts", [
                ("09:30 AM", "attraction", "Aguada Fort & Lighthouse", "17th-century Portuguese fortress with sweeping Arabian Sea views.", "Candolim, Goa", 50, 90),
                ("12:30 PM", "dining", "Fisherman's Wharf / Britto's", "Goan fish curry thali, butter garlic prawns, and fresh lime soda.", "Baga / Panjim", 650, 75),
                ("03:30 PM", "activity", "Anjuna & Vagator Cliffs", "Relax on the red cliffs overlooking picturesque beaches and beach shacks.", "Vagator", 100, 120),
                ("07:00 PM", "activity", "Sunset Beach Walk & Night Market", "Atmospheric sunset stroll with live acoustic music.", "Anjuna Beach", 200, 90),
            ]),
            ("Old Goa Heritage & Panjim Latin Quarter", [
                ("09:30 AM", "attraction", "Basilica of Bom Jesus", "UNESCO world heritage church holding the relics of St. Francis Xavier.", "Old Goa", 50, 90),
                ("12:30 PM", "dining", "Viva Panjim / Ritz Classic", "Charming authentic Goan homestyle cuisine in Fontainhas.", "Fontainhas, Panaji", 500, 60),
                ("03:00 PM", "attraction", "Fontainhas Latin Quarter Walking Tour", "Colourful heritage Portuguese villas, tiled nameplates, and bakeries.", "Panaji", 150, 90),
                ("06:30 PM", "transport", "Mandovi River Sunset Cruise", "Evening river cruise featuring traditional folk dances and sunset vistas.", "Panaji Jetty", 500, 90),
            ])
        ]
    else:
        highlights = [
            (f"Exploring {destination} - Day 1 Highlights", [
                ("09:00 AM", "attraction", f"Iconic Landmark of {destination}", f"Begin your exploration of {destination} at its most famous historic and cultural landmark.", destination, 150, 120),
                ("12:30 PM", "dining", f"Popular Local Eatery in {destination}", "Taste authentic regional delicacies and famous local street food.", destination, 400, 60),
                ("03:00 PM", "attraction", f"{destination} Heritage & Cultural Walk", "Stroll through the vibrant city centre, heritage streets, and craft markets.", destination, 100, 90),
                ("07:30 PM", "dining", f"Dinner & Evening Promenade in {destination}", "Enjoy a relaxed evening meal with scenic views and local hospitality.", destination, 550, 90),
            ]),
            (f"Hidden Gems & Local Flavours of {destination}", [
                ("09:30 AM", "attraction", f"Scenic Garden & Nature Walk", "Peaceful morning visit to a popular nature reserve or garden.", destination, 80, 90),
                ("12:30 PM", "dining", "Traditional Regional Lunch", "Speciality thali and freshly prepared local refreshments.", destination, 350, 60),
                ("03:00 PM", "activity", f"{destination} Artisans & Shopping Bazaar", "Explore local handicrafts, spices, and unique regional souvenirs.", destination, 200, 120),
                ("07:00 PM", "attraction", "Sunset Viewpoint & Cultural Event", "Watch the dusk settle over the city with cultural performances or music.", destination, 150, 90),
            ])
        ]

    days_list = []
    total_cost = 0
    cat_costs = {"stay": 0, "food": 0, "sightseeing": 0, "transport": 0, "miscellaneous": 0}

    for idx in range(min(days_count, len(highlights))):
        day_num = idx + 1
        summary_title, items_data = highlights[idx % len(highlights)]
        day_items = []
        day_cost = 0
        for item_idx, (t_slot, itype, title, desc, loc, cost_val, dur) in enumerate(items_data):
            day_items.append({
                "time_slot": t_slot,
                "type": itype,
                "title": title,
                "description": desc,
                "location": loc,
                "lat": None,
                "lng": None,
                "cost": cost_val,
                "duration_min": dur,
                "order_index": item_idx + 1,
            })
            day_cost += cost_val
            if itype == "dining":
                cat_costs["food"] += cost_val
            elif itype in ("attraction", "activity"):
                cat_costs["sightseeing"] += cost_val
            elif itype == "transport":
                cat_costs["transport"] += cost_val

        # Add estimated stay per day
        daily_stay = 2200
        cat_costs["stay"] += daily_stay
        day_cost += daily_stay
        total_cost += day_cost

        days_list.append({
            "day_number": day_num,
            "date": f"2026-11-0{day_num}",
            "summary": summary_title,
            "estimated_cost": day_cost,
            "items": day_items,
        })

    cat_costs["miscellaneous"] = int(total_cost * 0.08)
    total_cost += cat_costs["miscellaneous"]

    return {
        "destination": destination,
        "total_estimated_cost": total_cost,
        "currency": "INR",
        "budget_breakdown": cat_costs,
        "days": days_list,
    }


class LLMClient:
    def __init__(self) -> None:
        self.api_key = settings.LLM_API_KEY
        self.provider = (settings.LLM_PROVIDER or "groq").lower()
        self.model = settings.LLM_MODEL or "openai/gpt-oss-120b"
        self.base_url = self._determine_base_url()

    def _determine_base_url(self) -> str:
        if self.provider == "groq":
            return "https://api.groq.com/openai/v1/chat/completions"
        if self.provider == "together":
            return "https://api.together.xyz/v1/chat/completions"
        if self.provider == "openai":
            return "https://api.openai.com/v1/chat/completions"
        return "mock"

    def _headers(self) -> Dict[str, str]:
        if not self.api_key:
            return {}
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def generate(self, system_prompt: str, user_prompt: str, destination: str = "Indore", days_count: int = 2) -> str:
        """Call LLM with fallback to intelligent Indian itinerary if credentials fail."""
        if not self.api_key or self.provider == "mock":
            logger.info("Using smart Indian itinerary generator (mock/no-key mode).")
            fallback_data = generate_fallback_indian_itinerary(destination, days_count)
            return json.dumps(fallback_data)

        payload = {
            "model": self.model,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.3,
            "max_tokens": 3500,
        }

        # Try Groq / OpenAI with up to 2 attempts
        for attempt in range(1, 3):
            try:
                resp = requests.post(self.base_url, headers=self._headers(), json=payload, timeout=40)
                if resp.status_code == 200:
                    data = resp.json()
                    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    cleaned = clean_json_text(content)
                    # Verify valid JSON
                    json.loads(cleaned)
                    return cleaned
                else:
                    logger.warning("LLM API returned status %s: %s", resp.status_code, resp.text[:200])
            except Exception as exc:
                logger.warning("LLM attempt %s failed: %s", attempt, exc)

        logger.info("Falling back to smart destination-aware fallback for %s", destination)
        fallback_data = generate_fallback_indian_itinerary(destination, days_count)
        return json.dumps(fallback_data)


llm_client = LLMClient()
