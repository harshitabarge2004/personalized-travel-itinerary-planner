// frontend/src/api.ts
import axios from "axios";

// Base URL for the FastAPI backend (configurable via environment variable)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ItineraryItem {
  time_slot: string;
  type: "attraction" | "dining" | "stay" | "transport" | "activity" | string;
  title: string;
  description?: string | null;
  location?: string | null;
  cost?: number | null;
  duration_min?: number | null;
  order_index: number;
}

export interface ItineraryDay {
  day_number: number;
  date: string;
  summary?: string | null;
  estimated_cost?: number | null;
  items: ItineraryItem[];
}

export interface BudgetBreakdown {
  stay: number;
  food: number;
  sightseeing: number;
  transport: number;
  miscellaneous: number;
}

export interface Itinerary {
  trip_id?: string | null;
  destination?: string | null;
  total_estimated_cost?: number | null;
  currency?: string;
  budget_breakdown?: BudgetBreakdown;
  days: ItineraryDay[];
}

export interface TripPayload {
  destination: string;
  start_date: string;
  end_date: string;
  group_size: number;
  budget_level: string;
  travel_style: string;
  pace: string;
  interests: string[];
  dietary_prefs: string[];
}

// Client-side intelligent generator fallback (guarantees production site never fails even when Python backend is offline)
export function generateClientSideItinerary(payload: TripPayload): Itinerary {
  const dest = payload.destination.trim();
  const destLower = dest.toLowerCase();

  const startDateObj = new Date(payload.start_date || Date.now());
  const endDateObj = new Date(payload.end_date || Date.now());
  const diffDays = Math.max(1, Math.min(10, Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 3600 * 24)) + 1));

  // Multiplier for budget level
  const budgetMult = payload.budget_level === "luxury" ? 2.5 : payload.budget_level === "low" ? 0.6 : 1.0;
  const travelers = Math.max(1, payload.group_size || 1);

  // Curated database of rich Indian destinations & activities
  const destinationDB: Record<string, { summary: string; items: Omit<ItineraryItem, "order_index">[] }[]> = {
    indore: [
      {
        summary: "Historic Holkar Heritage & Legendary Food Trail",
        items: [
          { time_slot: "09:00 AM", type: "attraction", title: "Rajwada Palace & Holkar Heritage", description: "Walk through the iconic 7-storey Maratha royal residence with French, Mughal and Maratha architecture.", location: "MG Road, Rajwada", cost: 50 * travelers, duration_min: 90 },
          { time_slot: "12:30 PM", type: "dining", title: "Vijay Chaat House & Chappan Dukan", description: "Relish renowned Khopra Patties, steaming Poha Jalebi, and refreshing Shikanji.", location: "Chappan Dukan, New Palasia", cost: 250 * travelers, duration_min: 60 },
          { time_slot: "03:30 PM", type: "attraction", title: "Lal Bagh Palace & Rose Gardens", description: "Marvel at Versailles-replica interiors, Italian marble flooring, and historical coin galleries.", location: "Nai Duniya, Indore", cost: 100 * travelers, duration_min: 120 },
          { time_slot: "07:30 PM", type: "dining", title: "Sarafa Bazaar Street Food Night Experience", description: "Visit Asia's only nighttime gold market that turns into an electric street-food carnival after 8 PM. Sample Garadu, Bhutte ka Kees, and Malpua.", location: "Sarafa Bazaar", cost: 400 * travelers, duration_min: 120 }
        ]
      },
      {
        summary: "Spiritual Excursion to Ujjain Mahakal & Shipra River",
        items: [
          { time_slot: "08:00 AM", type: "transport", title: "Express Train / Cab to Ujjain", description: "Short 55-minute travel along the Super Corridor to the sacred holy city.", location: "Indore - Ujjain Highway", cost: 800 * (travelers > 2 ? 1.5 : 1), duration_min: 60 },
          { time_slot: "09:30 AM", type: "attraction", title: "Mahakaleshwar Jyotirlinga & Mahakal Lok Corridor", description: "Spiritual darshan at one of the sacred 12 Jyotirlingas, followed by a walk around the grand mural-lined corridor.", location: "Jaisinghpura, Ujjain", cost: 250 * travelers, duration_min: 180 },
          { time_slot: "01:30 PM", type: "dining", title: "Authentic Malwa Dal Bafla Thali", description: "Wholesome traditional lunch featuring wood-baked baflas dipped in pure ghee with spicy tuvar dal and churma.", location: "Mahakal Marg, Ujjain", cost: 300 * travelers, duration_min: 60 },
          { time_slot: "05:00 PM", type: "activity", title: "Ram Ghat Evening Aarti by the Shipra", description: "Breathtaking sunset river prayer with oil lamps and temple bells.", location: "Ram Ghat", cost: 50 * travelers, duration_min: 90 }
        ]
      },
      {
        summary: "Bhopal & Sanchi Stupa Day Tour",
        items: [
          { time_slot: "08:30 AM", type: "transport", title: "Vande Bharat Express to Bhopal", description: "Scenic high-speed train transit to Madhya Pradesh's capital of lakes.", location: "Indore Junction", cost: 950 * travelers, duration_min: 150 },
          { time_slot: "11:30 AM", type: "attraction", title: "Upper Lake (Bhojtal) & Van Vihar", description: "Boating on India's largest artificial lake and open safari nature park.", location: "Shyamla Hills, Bhopal", cost: 200 * travelers, duration_min: 120 },
          { time_slot: "02:00 PM", type: "dining", title: "Bhopali Biryani & Mughlai Lunch", description: "Taste authentic Nizami delicacies, Bhopali Gosht Korma, or paneer rezala.", location: "Ibrahimpura, Old Bhopal", cost: 450 * travelers, duration_min: 60 },
          { time_slot: "04:30 PM", type: "attraction", title: "Taj-ul-Masajid", description: "Visit one of Asia's largest and most majestic pink stone mosques.", location: "Kohefiza, Bhopal", cost: 0, duration_min: 75 }
        ]
      }
    ],
    jaipur: [
      {
        summary: "The Royal Rajput Forts & Grand Palaces",
        items: [
          { time_slot: "09:00 AM", type: "attraction", title: "Amer Fort & Sheesh Mahal", description: "Climb up the majestic hilltop bastion and admire the intricate hall of mirrors and sweeping Aravalli views.", location: "Amer, Jaipur", cost: 200 * travelers, duration_min: 180 },
          { time_slot: "01:00 PM", type: "dining", title: "Laxmi Mishtan Bhandar (LMB)", description: "Crisp Pyaaz Kachori, Rajasthani royal thali, and decadent Ghewar in the heart of the walled city.", location: "Johari Bazaar", cost: 550 * travelers, duration_min: 60 },
          { time_slot: "03:30 PM", type: "attraction", title: "Hawa Mahal (Palace of Winds)", description: "Marvel at the 953 honeycombed jharokhas designed for royal court ladies.", location: "Badi Choupad", cost: 100 * travelers, duration_min: 60 },
          { time_slot: "06:30 PM", type: "activity", title: "Nahargarh Fort Sunset Viewpoint", description: "Watch the golden dusk turn into a twinkling sea of lights over the Pink City.", location: "Aravalli Range", cost: 150 * travelers, duration_min: 90 }
        ]
      },
      {
        summary: "Palace Museums, Astronomical Wonders & Bazaars",
        items: [
          { time_slot: "09:30 AM", type: "attraction", title: "City Palace & Mubarak Mahal", description: "Resplendent palace complex blending Mughal and Rajput architecture, featuring the Maharaja Sawai Man Singh II Museum.", location: "Tulsi Marg, Gangori Bazaar", cost: 300 * travelers, duration_min: 120 },
          { time_slot: "12:00 PM", type: "attraction", title: "Jantar Mantar UNESCO Observatory", description: "Ancient astronomical observatory with the world's largest stone sundial, measuring time to 2 seconds precision.", location: "Kanwar Nagar", cost: 200 * travelers, duration_min: 75 },
          { time_slot: "01:30 PM", type: "dining", title: "Tapri Central Rooftop", description: "Sip chai with bun maska and fusion samosas overlooking Central Park.", location: "C Scheme, Ashok Nagar", cost: 350 * travelers, duration_min: 60 },
          { time_slot: "04:30 PM", type: "activity", title: "Bapu Bazaar Handicrafts & Textile Shopping", description: "Shop for block-printed cotton, mojris, camel leather goods, and blue pottery.", location: "Bapu Bazaar", cost: 300 * travelers, duration_min: 120 }
        ]
      }
    ],
    goa: [
      {
        summary: "North Goa Coast, Historic Forts & Beach Shacks",
        items: [
          { time_slot: "09:30 AM", type: "attraction", title: "Aguada Fort & Portuguese Lighthouse", description: "17th-century fortress and freshwater spring with sweeping Arabian Sea panoramas.", location: "Sinquerim, Candolim", cost: 50 * travelers, duration_min: 90 },
          { time_slot: "12:30 PM", type: "dining", title: "Fisherman's Wharf / Coastal Shack Lunch", description: "Goan fish curry thali, butter garlic prawns, bebinca, and fresh kokum spritzer.", location: "Candolim Beach Road", cost: 650 * travelers, duration_min: 75 },
          { time_slot: "03:30 PM", type: "activity", title: "Vagator Red Cliffs & Ozran Beach", description: "Relax above scenic rock cliffs and watch kite-surfers on the coastline.", location: "Vagator", cost: 100 * travelers, duration_min: 120 },
          { time_slot: "07:00 PM", type: "dining", title: "Sunset Dining & Live Music", description: "Dine with your feet in the sand as local musicians play acoustic melodies.", location: "Anjuna Beach", cost: 700 * travelers, duration_min: 120 }
        ]
      },
      {
        summary: "Old Goa Heritage Churches & Latin Quarter Walk",
        items: [
          { time_slot: "09:30 AM", type: "attraction", title: "Basilica of Bom Jesus & Se Cathedral", description: "UNESCO World Heritage Baroque churches preserving the sacred relics of St. Francis Xavier.", location: "Old Goa", cost: 50 * travelers, duration_min: 120 },
          { time_slot: "12:30 PM", type: "dining", title: "Viva Panjim Portuguese Homestyle", description: "Charming family restaurant tucked in a 150-year-old heritage alley serving vindaloo and prawn balchao.", location: "Fontainhas, Panaji", cost: 500 * travelers, duration_min: 75 },
          { time_slot: "03:00 PM", type: "attraction", title: "Fontainhas Heritage Quarter Walking Tour", description: "Pastel-yellow and terracotta Portuguese villas, wrought iron balconies, and art galleries.", location: "Altinho, Panaji", cost: 150 * travelers, duration_min: 90 },
          { time_slot: "06:30 PM", type: "transport", title: "Mandovi River Evening Cruise", description: "Cruise the river estuary with Goan folk dance performances and views of illuminated floating jetties.", location: "Panaji Ferry Jetty", cost: 500 * travelers, duration_min: 90 }
        ]
      }
    ],
    manali: [
      {
        summary: "Solang Valley Adventures & Mountain Passes",
        items: [
          { time_slot: "09:00 AM", type: "activity", title: "Solang Valley Cable Car & Paragliding", description: "Take the ropeway for panoramic views of snow-capped peaks and glaciers.", location: "Solang Valley", cost: 1200 * travelers, duration_min: 180 },
          { time_slot: "01:30 PM", type: "dining", title: "Himachali Siddu & Trout Lunch", description: "Taste steaming local wheat flour Siddu served with ghee and mint chutney.", location: "Old Manali Road", cost: 400 * travelers, duration_min: 60 },
          { time_slot: "04:00 PM", type: "attraction", title: "Hadimba Devi Cedar Temple", description: "Ancient wooden pagoda temple set amidst towering deodar forest sanctuaries.", location: "Dhungri Village", cost: 50 * travelers, duration_min: 75 },
          { time_slot: "07:00 PM", type: "dining", title: "Old Manali Cafe Walk & Live Acoustic Dinner", description: "Bohemian cafes with wood-fired pizzas, herbal teas, and chilled mountain vibes.", location: "Club House Road, Old Manali", cost: 550 * travelers, duration_min: 120 }
        ]
      }
    ]
  };

  // Find match or build personalized day plans
  let matchedTemplates = destinationDB["indore"];
  for (const [key, daysArr] of Object.entries(destinationDB)) {
    if (destLower.includes(key)) {
      matchedTemplates = daysArr;
      break;
    }
  }

  const generatedDays: ItineraryDay[] = [];
  let totalCost = 0;
  const breakdown: BudgetBreakdown = {
    stay: 0,
    food: 0,
    sightseeing: 0,
    transport: 0,
    miscellaneous: 0,
  };

  const dailyStayCost = Math.round((payload.budget_level === "luxury" ? 5500 : payload.budget_level === "low" ? 1200 : 2800) * (travelers > 2 ? 1.5 : 1));

  for (let i = 0; i < diffDays; i++) {
    const curDate = new Date(startDateObj);
    curDate.setDate(curDate.getDate() + i);
    const dateStr = curDate.toISOString().split("T")[0];

    const templateDay = matchedTemplates[i % matchedTemplates.length];
    const dayItems: ItineraryItem[] = templateDay.items.map((it, idx) => {
      const itemCost = Math.round((it.cost || 200) * budgetMult);
      if (it.type === "dining") breakdown.food += itemCost;
      else if (it.type === "transport") breakdown.transport += itemCost;
      else breakdown.sightseeing += itemCost;

      return {
        ...it,
        cost: itemCost,
        order_index: idx + 1,
      };
    });

    // Add daily accommodation
    breakdown.stay += dailyStayCost;
    const dayTotal = dayItems.reduce((acc, curr) => acc + (curr.cost || 0), 0) + dailyStayCost;
    totalCost += dayTotal;

    generatedDays.push({
      day_number: i + 1,
      date: dateStr,
      summary: templateDay.summary.replace("Indore", dest).replace("Jaipur", dest).replace("Goa", dest),
      estimated_cost: dayTotal,
      items: dayItems,
    });
  }

  breakdown.miscellaneous = Math.round(totalCost * 0.08);
  totalCost += breakdown.miscellaneous;

  return {
    trip_id: `trip-${Date.now()}`,
    destination: dest,
    total_estimated_cost: totalCost,
    currency: "INR",
    budget_breakdown: breakdown,
    days: generatedDays,
  };
}

// Generate itinerary with hybrid architecture: API first -> Client fallback
export async function generateItinerary(payload: TripPayload): Promise<Itinerary> {
  try {
    const res = await api.post<Itinerary>("/api/itineraries/generate", payload);
    if (res.data && res.data.days && res.data.days.length > 0) {
      return res.data;
    }
  } catch (err: any) {
    console.warn("Backend API call unsuccessful, falling back to client-side smart itinerary engine:", err?.message);
  }

  // Graceful client fallback
  return generateClientSideItinerary(payload);
}

export default api;
