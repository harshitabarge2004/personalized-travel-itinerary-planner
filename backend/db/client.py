"""Supabase client wrapper for the Travel Planner backend.

Provides a singleton `supabase` object configured from environment
variables defined in `backend.core.config.Settings`.
"""

import logging
from typing import Optional
from supabase import create_client, Client
from backend.core.config import settings

logger = logging.getLogger(__name__)

supabase: Optional[Client] = None

try:
    if settings.SUPABASE_URL and settings.SUPABASE_KEY:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info("Supabase client initialized successfully.")
    else:
        logger.warning("Supabase URL or Key not set. Supabase client is not initialized.")
except Exception as exc:
    logger.error("Failed to initialize Supabase client: %s", exc)
    supabase = None

def get_supabase() -> Optional[Client]:
    """Return the initialized Supabase client, or None if unavailable."""
    return supabase

__all__ = ["supabase", "get_supabase"]
