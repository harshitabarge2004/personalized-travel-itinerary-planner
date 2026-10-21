# Recommendation engine for travel planning
"""Backend recommendation service.

- Attempts to load three TensorFlow/Keras models located in
  `backend/ml/models/` (attraction, dining, accommodation).
- If the model files are missing or TensorFlow cannot be imported, the
  service falls back to a simple rule‑based mock that returns static
  suggestions.
- The service is instantiated once at FastAPI startup (see
  `backend/main.py`).
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, List

logger = logging.getLogger(__name__)

# Types for the returned recommendation payload
RecommendationPayload = Dict[str, List[Dict[str, Any]]]


class RecommendationEngine:
    """Load ML models (or use mock) and provide a unified recommendation API.

    The three lightweight transformer models are expected to be saved as
    Keras `.keras` files together with their token‑vocab pickles.  The
    directory layout is:

    ```
    backend/ml/models/
        attraction.keras, attraction_vocab.pkl
        dining.keras, dining_vocab.pkl
        accommodation.keras, accommodation_vocab.pkl
    ```

    If any of those files are missing, the engine degrades gracefully to
    a deterministic mock implementation – this guarantees the UI works
    even without a GPU or training data.
    """

    def __init__(self) -> None:
        self._models: Dict[str, Any] = {}
        self._available: bool = False
        self._load_models()

    # ---------------------------------------------------------------------
    # Model loading
    # ---------------------------------------------------------------------
    def _load_models(self) -> None:
        """Attempt to import TensorFlow and load the three model files.

        The method sets ``self._available`` to ``True`` only when *all*
        three models are successfully loaded.
        """
        try:
            import tensorflow as tf  # type: ignore
        except Exception as exc:
            logger.warning("TensorFlow not available – falling back to mock recommendations: %s", exc)
            self._available = False
            return

        models_dir = Path(__file__).parent.parent / "ml" / "models"
        expected = {
            "attraction": "attraction.keras",
            "dining": "dining.keras",
            "accommodation": "accommodation.keras",
        }
        missing = []
        for key, filename in expected.items():
            path = models_dir / filename
            if not path.is_file():
                missing.append(str(path))
                continue
            try:
                self._models[key] = tf.keras.models.load_model(str(path))
                logger.info("Loaded %s model from %s", key, path)
            except Exception as exc:
                logger.error("Failed to load %s model: %s", key, exc)
                missing.append(str(path))
        if missing:
            logger.warning("Model files missing or failed to load: %s", ", ".join(missing))
            self._available = False
        else:
            self._available = True

    # ---------------------------------------------------------------------
    # Public API
    # ---------------------------------------------------------------------
    async def recommend(self, preferences: Dict[str, Any]) -> RecommendationPayload:
        """Return ranked recommendations based on ``preferences``.

        The implementation is deliberately lightweight – for a real‑world
        product you would encode ``preferences`` into a numeric vector,
        run it through the three transformer models, and post‑process the
        outputs.  Here we provide a fast deterministic fallback.
        """
        if self._available:
            # Placeholder for real inference – currently we simply return
            # empty lists because the model signatures are undefined.
            # The async signature keeps the API compatible with future
            # async TensorFlow serving.
            logger.debug("Running inference with loaded models – not implemented yet.")
            return {"attractions": [], "dining": [], "accommodations": [], "transport": []}
        else:
            return self._mock_recommendations(preferences)

    def _mock_recommendations(self, preferences: Dict[str, Any]) -> RecommendationPayload:
        """Generate deterministic mock recommendations.

        The mock uses the ``interests`` list (if present) to pick a few
        example items; otherwise a generic set is returned.
        """
        interests = preferences.get("interests", [])
        # Simple mapping from interest keyword to a mock suggestion
        mock_map = {
            "culture": {
                "title": "National Museum",
                "description": "Explore the country's heritage.",
                "type": "attraction",
            },
            "food": {
                "title": "Local Street Food Market",
                "description": "Taste authentic dishes.",
                "type": "dining",
            },
            "nature": {
                "title": "Scenic Hiking Trail",
                "description": "Enjoy panoramic views.",
                "type": "attraction",
            },
            "adventure": {
                "title": "River Rafting",
                "description": "Thrilling white‑water experience.",
                "type": "attraction",
            },
            "nightlife": {
                "title": "Rooftop Bar",
                "description": "Evening cocktails with city lights.",
                "type": "dining",
            },
        }
        # Build lists
        attractions, dining, accommodations, transport = [], [], [], []
        for interest in interests:
            entry = mock_map.get(interest.lower())
            if entry:
                if entry["type"] == "attraction":
                    attractions.append(entry)
                elif entry["type"] == "dining":
                    dining.append(entry)
        # Fill with generic items if lists are empty
        if not attractions:
            attractions.append({"title": "City Center Tour", "description": "Guided walking tour.", "type": "attraction"})
        if not dining:
            dining.append({"title": "Family Restaurant", "description": "Comfort food for all ages.", "type": "dining"})
        # Mock accommodation & transport (static)
        accommodations.append({"title": "Mid‑range Hotel", "description": "Convenient location.", "type": "accommodation"})
        transport.append({"title": "Airport Shuttle", "description": "Door‑to‑door service.", "type": "transport"})

        return {
            "attractions": attractions,
            "dining": dining,
            "accommodations": accommodations,
            "transport": transport,
        }

# Global singleton – instantiated in FastAPI lifespan
recommendation_engine: RecommendationEngine | None = None
