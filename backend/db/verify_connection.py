"""Utility script to verify Supabase client connectivity.

It attempts a lightweight query on the `profiles` table. If the
environment variables are not set, the script reports the missing
configuration instead of raising an exception.
"""

import sys
from backend.db.client import supabase
from supabase import Client

def main() -> None:
    try:
        # Simple test query – fetch at most one row
        res = supabase.table("profiles").select("id").limit(1).execute()
        if res.data:
            print("✅ Connected to Supabase – found profile IDs:", [row["id"] for row in res.data])
        else:
            print("✅ Connected to Supabase – `profiles` table is empty.")
    except Exception as e:
        print("❌ Supabase connection test failed:", e)
        sys.exit(1)

if __name__ == "__main__":
    main()
