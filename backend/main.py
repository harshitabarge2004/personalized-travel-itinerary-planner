from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Settings
from backend.core.config import settings

# Routers
from backend.api.routers import preferences, recommendations, itineraries

# Recommendation engine singleton
from backend.services.recommendation import RecommendationEngine, recommendation_engine

app = FastAPI(title="Personalized Travel Itinerary Planner API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(preferences.router, prefix="/api/preferences", tags=["preferences"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(itineraries.router, prefix="/api/itineraries", tags=["itineraries"])

# Lifespan – initialise recommendation engine once
@app.on_event("startup")
async def startup_event():
    global recommendation_engine
    recommendation_engine = RecommendationEngine()
    # Future: initialise LLM client, cache, etc.

# Simple health check
@app.get("/health")
async def health_check():
    return {"status": "ok"}
