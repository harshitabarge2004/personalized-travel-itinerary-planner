# Architecture Overview

## System Diagram

```mermaid
flowchart LR
    subgraph Frontend[React Frontend (Vite)]
        FE[UI Components]
        State[Zustand / Context]
        Router[React Router]
        API[Axios Calls]
    end
    subgraph Backend[FastAPI Backend]
        BE[FastAPI App]
        Routers[API Routers]
        Services[Business Services]
        ML[ML Models Loader]
        Prompt[Prompt Builder]
        LLM[LLM API Client]
        DB[Supabase Client]
    end
    subgraph Supabase[Supabase]
        Auth[Auth (PostgreSQL)]
        PG[PostgreSQL DB]
    end
    FE -->|HTTP/HTTPS| API --> BE
    BE --> Routers
    Routers --> Services
    Services --> DB
    Services --> ML
    Services --> Prompt
    Prompt --> LLM
    LLM -->|LLM Response| Prompt
    Prompt --> Services
    DB --> Auth
    DB --> PG
```

## Data Flow for Itinerary Generation

```mermaid
sequenceDiagram
    participant U as User (Frontend)
    participant F as Frontend UI
    participant B as Backend Service
    participant M as ML Recommendation Engine
    participant P as Prompt Builder
    participant L as LLM API
    participant D as Supabase DB

    U->>F: Fill preferences wizard
    F->>B: POST /api/preferences
    B->>D: Store preferences
    F->>B: POST /api/recommendations (pref vector)
    B->>M: Get ranked recommendations
    M-->>B: Recommendations JSON
    Note over B: Combine preferences + top recommendations
    B->>P: Build system + user prompt
    P->>L: Call LLM (Groq / OpenAI)
    L-->>P: Structured itinerary JSON
    P->>B: Return itinerary
    B->>D: Persist itinerary (trips, days, items)
    B-->>F: Itinerary payload
    F->>U: Render interactive itinerary view
```

---

*The diagrams above capture the high‑level components and the step‑by‑step flow from user input to a generated travel itinerary.*