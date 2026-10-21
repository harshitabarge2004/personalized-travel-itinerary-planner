-- Supabase PostgreSQL schema for Personalized Travel Itinerary Planner
-- Target schema: public (exposed by default in Supabase PostgREST API)

-- 1. profiles (linked to auth.users if auth is used, or standalone)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name text NOT NULL,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. preferences
CREATE TABLE IF NOT EXISTS public.preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    interests text[] NOT NULL,
    travel_style text NOT NULL,
    pace text NOT NULL,
    budget_level text NOT NULL,
    accommodation_type text NOT NULL,
    dietary_prefs text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. trips
CREATE TABLE IF NOT EXISTS public.trips (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id text NOT NULL DEFAULT 'guest',
    title text NOT NULL,
    destination text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    budget numeric,
    currency text DEFAULT 'INR',
    group_size integer DEFAULT 1,
    travel_style text,
    pace text,
    status text DEFAULT 'planned',
    total_estimated_cost numeric,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. itinerary_days
CREATE TABLE IF NOT EXISTS public.itinerary_days (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,
    day_number integer NOT NULL,
    date date,
    summary text,
    estimated_cost numeric,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 5. itinerary_items
CREATE TABLE IF NOT EXISTS public.itinerary_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id uuid REFERENCES public.itinerary_days(id) ON DELETE CASCADE,
    time_slot text,
    type text CHECK (type IN ('attraction','dining','stay','transport','activity')) NOT NULL,
    title text NOT NULL,
    description text,
    location text,
    lat double precision,
    lng double precision,
    cost numeric,
    duration_min integer,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_preferences_user ON public.preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_owner ON public.trips(owner_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_days_trip ON public.itinerary_days(trip_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_day ON public.itinerary_items(day_id);

-- Enable RLS with public access policies for anon key
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;

-- Allow anon/public reads and writes so client and backend can store and retrieve trips
CREATE POLICY "Allow public read trips" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Allow public insert trips" ON public.trips FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update trips" ON public.trips FOR UPDATE USING (true);
CREATE POLICY "Allow public delete trips" ON public.trips FOR DELETE USING (true);

CREATE POLICY "Allow public read itinerary_days" ON public.itinerary_days FOR SELECT USING (true);
CREATE POLICY "Allow public insert itinerary_days" ON public.itinerary_days FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update itinerary_days" ON public.itinerary_days FOR UPDATE USING (true);
CREATE POLICY "Allow public delete itinerary_days" ON public.itinerary_days FOR DELETE USING (true);

CREATE POLICY "Allow public read itinerary_items" ON public.itinerary_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert itinerary_items" ON public.itinerary_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update itinerary_items" ON public.itinerary_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete itinerary_items" ON public.itinerary_items FOR DELETE USING (true);

CREATE POLICY "Allow public read preferences" ON public.preferences FOR SELECT USING (true);
CREATE POLICY "Allow public insert preferences" ON public.preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update preferences" ON public.preferences FOR UPDATE USING (true);
