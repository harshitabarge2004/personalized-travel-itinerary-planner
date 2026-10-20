# Personalized Travel Itinerary Planner

An AI‑powered web application that creates customized day‑by‑day travel itineraries based on user preferences, budget, and travel style.

## System Requirements
- **CPU**: Intel i5 / AMD Ryzen 5 or better
- **Memory**: 8 GB RAM (minimum)
- **Disk**: 2 GB free space (additional space needed for dataset/model files)
- **GPU**: Optional CUDA‑compatible GPU for faster local model inference
- **Internet**: Required for:
  - Fetching Google Fonts and other assets
  - Accessing LLM APIs (Groq/Together/OpenAI) when `LLM_API_KEY` is set
  - Supabase authentication and database access

## Project Structure
```
personalized-travel-itinerary-planner/
├─ backend/          # FastAPI server
├─ frontend/         # React + Vite UI
├─ docs/             # Architecture and docs
├─ .gitignore
├─ README.md         # ← You are here
└─ docker-compose.yml (to be added later)
```

The monorepo is set up with separate virtual environments for backend and frontend. See the individual `README.md` files in each sub‑folder for setup instructions.
