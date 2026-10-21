import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Itinerary, TripPayload } from "./api";

// Initialize Supabase client cleanly outside Zustand state
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://fdqomibulhqklsxcrfet.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_NerBXD6F_S-N2Zc1geYelw_cz1sPzhv";

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface SavedTripRecord {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  group_size: number;
  travel_style: string;
  pace: string;
  budget_level: string;
  total_estimated_cost: number;
  currency: string;
  created_at: string;
  itinerary: Itinerary;
  notes?: string;
}

interface AppState {
  user: UserProfile | null;
  savedTrips: SavedTripRecord[];
  currentItinerary: Itinerary | null;
  currentPayload: TripPayload | null;
  selectedDestination: string;
  theme: "light" | "dark";
  setUser: (user: UserProfile | null) => void;
  setCurrentItinerary: (itinerary: Itinerary | null) => void;
  setCurrentPayload: (payload: TripPayload | null) => void;
  setSelectedDestination: (dest: string) => void;
  saveTrip: (itinerary: Itinerary, payload?: TripPayload) => SavedTripRecord;
  deleteTrip: (tripId: string) => void;
  updateTrip: (tripId: string, updated: Partial<SavedTripRecord>) => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: {
        id: "guest-user",
        email: "traveler@bharat.in",
        name: "Travel Explorer",
      },
      savedTrips: [],
      currentItinerary: null,
      currentPayload: null,
      selectedDestination: "Indore, Madhya Pradesh",
      theme: "light",

      setUser: (user) => set({ user }),
      setCurrentItinerary: (itinerary) => set({ currentItinerary: itinerary }),
      setCurrentPayload: (payload) => set({ currentPayload: payload }),
      setSelectedDestination: (dest) => set({ selectedDestination: dest }),

      saveTrip: (itinerary, payload) => {
        const tripId = itinerary.trip_id || `trip-${Date.now()}`;
        const newRecord: SavedTripRecord = {
          id: tripId,
          destination: itinerary.destination || payload?.destination || "Incredible India",
          start_date: payload?.start_date || itinerary.days?.[0]?.date || new Date().toISOString().split("T")[0],
          end_date: payload?.end_date || itinerary.days?.[itinerary.days.length - 1]?.date || new Date().toISOString().split("T")[0],
          group_size: payload?.group_size || 2,
          travel_style: payload?.travel_style || "balanced",
          pace: payload?.pace || "balanced",
          budget_level: payload?.budget_level || "medium",
          total_estimated_cost: itinerary.total_estimated_cost || 0,
          currency: itinerary.currency || "INR",
          created_at: new Date().toISOString(),
          itinerary: { ...itinerary, trip_id: tripId },
        };

        const existing = get().savedTrips.filter((t) => t.id !== tripId);
        const updatedList = [newRecord, ...existing];
        set({ savedTrips: updatedList, currentItinerary: newRecord.itinerary });

        // Sync with Supabase asynchronously without blocking
        try {
          supabase.table("trips").upsert({
            id: tripId,
            owner_id: get().user?.id || "guest",
            title: `Trip to ${newRecord.destination}`,
            destination: newRecord.destination,
            start_date: newRecord.start_date,
            end_date: newRecord.end_date,
            group_size: newRecord.group_size,
            currency: "INR",
            total_estimated_cost: newRecord.total_estimated_cost,
          }).then(() => {});
        } catch {
          // ignore background sync errors
        }

        return newRecord;
      },

      deleteTrip: (tripId) => {
        const remaining = get().savedTrips.filter((t) => t.id !== tripId);
        set({ savedTrips: remaining });
        if (get().currentItinerary?.trip_id === tripId) {
          set({ currentItinerary: remaining[0]?.itinerary || null });
        }
        try {
          supabase.table("trips").delete().eq("id", tripId).then(() => {});
        } catch {}
      },

      updateTrip: (tripId, updated) => {
        const list = get().savedTrips.map((t) => (t.id === tripId ? { ...t, ...updated } : t));
        set({ savedTrips: list });
      },

      toggleTheme: () => {
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" }));
      },
    }),
    {
      name: "travel-planner-store",
      partialize: (state) => ({
        user: state.user,
        savedTrips: state.savedTrips,
        currentItinerary: state.currentItinerary,
        currentPayload: state.currentPayload,
        selectedDestination: state.selectedDestination,
        theme: state.theme,
      }),
    }
  )
);

// Currency formatter utility with Indian number formatting (en-IN, INR)
export function formatINR(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}
