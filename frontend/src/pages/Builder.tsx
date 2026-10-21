// frontend/src/pages/Builder.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Compass,
  Utensils,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Check,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { generateItinerary, TripPayload } from "../api";
import { useAppStore, formatINR } from "../store";

const INDIAN_CITIES_SUGGESTIONS = [
  "Indore, Madhya Pradesh",
  "Ujjain, Madhya Pradesh",
  "Bhopal, Madhya Pradesh",
  "Jaipur, Rajasthan",
  "Udaipur, Rajasthan",
  "Goa",
  "Manali, Himachal Pradesh",
  "Varanasi, Uttar Pradesh",
  "Mumbai, Maharashtra",
  "Bengaluru, Karnataka",
  "Delhi, NCR",
  "Rishikesh, Uttarakhand",
  "Kochi, Kerala",
  "Darjeeling, West Bengal",
];

const INTERESTS_OPTIONS = [
  "Historical Forts & Palaces",
  "Street Food & Local Dhabas",
  "Spiritual Temples & Aartis",
  "Nature, Lakes & Mountains",
  "Bazaars & Traditional Handicrafts",
  "Museums & Art Galleries",
  "Wildlife Safari",
  "Sunset Viewpoints & Photography",
  "Beaches & Water Sports",
  "Cafes & Nightlife",
];

const DIETARY_OPTIONS = [
  "Pure Vegetarian",
  "Jain (No Onion / Garlic)",
  "Vegan",
  "Halal",
  "Local Non-Veg & Seafood",
  "No Dietary Restrictions",
];

const TRAVEL_STYLES = [
  { id: "cultural", label: "Cultural & Heritage", desc: "Monuments, history, architecture & guided walks" },
  { id: "foodie", label: "Food & Culinary Trail", desc: "Iconic local food, street eats & authentic thalis" },
  { id: "spiritual", label: "Spiritual & Pilgrimage", desc: "Holy shrines, temple corridors & serene ghats" },
  { id: "adventure", label: "Nature & Mountain Escape", desc: "Scenic vistas, hills, trekking & fresh air" },
  { id: "relaxation", label: "Relaxation & Leisure", desc: "Laid-back vibes, resorts, cafes & scenic sunsets" },
];

const BUDGET_TIERS = [
  { id: "low", label: "Budget", perDay: 1500, desc: "Homestays, hostels, dhabas, autos & buses" },
  { id: "medium", label: "Comfort / Moderate", perDay: 3500, desc: "3-star hotels, cabs, popular eateries & cafes" },
  { id: "luxury", label: "Premium / Luxury", perDay: 8000, desc: "Heritage resorts, private chauffeur, fine dining" },
];

const Builder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const saveTrip = useAppStore((s) => s.saveTrip);
  const setCurrentPayload = useAppStore((s) => s.setCurrentPayload);

  // Read URL query params if any
  const searchParams = new URLSearchParams(location.search);
  const initialDest = searchParams.get("dest") || "Indore, Madhya Pradesh";

  // Form states
  const [destination, setDestination] = useState(initialDest);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split("T")[0];
  });
  const [groupSize, setGroupSize] = useState(2);
  const [budgetTier, setBudgetTier] = useState("medium");
  const [travelStyle, setTravelStyle] = useState("cultural");
  const [pace, setPace] = useState("balanced");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Historical Forts & Palaces",
    "Street Food & Local Dhabas",
    "Spiritual Temples & Aartis",
  ]);
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>(["Pure Vegetarian"]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);

  // Sync destination if prop/url changes
  useEffect(() => {
    const d = searchParams.get("dest");
    if (d) setDestination(d);
  }, [location.search]);

  // Calculate days count
  const calculateDays = () => {
    try {
      const d1 = new Date(startDate);
      const d2 = new Date(endDate);
      const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) + 1;
      return Math.max(1, Math.min(10, diff));
    } catch {
      return 3;
    }
  };

  const tripDays = calculateDays();
  const selectedBudgetObj = BUDGET_TIERS.find((b) => b.id === budgetTier) || BUDGET_TIERS[1];
  const estimatedTotal = selectedBudgetObj.perDay * tripDays * groupSize;

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleDiet = (diet: string) => {
    setDietaryPrefs((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      setError("Please specify a travel destination.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    setLoading(true);
    setError("");

    const payload: TripPayload = {
      destination: destination.trim(),
      start_date: startDate,
      end_date: endDate,
      group_size: groupSize,
      budget_level: budgetTier,
      travel_style: travelStyle,
      pace: pace,
      interests: selectedInterests,
      dietary_prefs: dietaryPrefs,
    };

    setCurrentPayload(payload);

    // Dynamic loading messages
    const timer1 = setTimeout(() => setLoadingStep(1), 1200);
    const timer2 = setTimeout(() => setLoadingStep(2), 2600);

    try {
      const itinerary = await generateItinerary(payload);
      clearTimeout(timer1);
      clearTimeout(timer2);

      // Save to Zustand and Supabase
      saveTrip(itinerary, payload);
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to generate itinerary. Please try again.");
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
            AI Trip Planning Wizard
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
            Build Your Personalized Itinerary
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
            Customized for Indian cities, pilgrimage corridors, hill stations, and global destinations.
            All estimates calculated in Indian Rupees (₹).
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Generation Notice</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Destination */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm">
              <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center">
                <MapPin className="w-4 h-4 text-orange-600 mr-2" />
                Where do you want to travel?
              </label>

              <input
                type="text"
                required
                placeholder="Enter city or region (e.g. Indore, Ujjain, Jaipur, Goa, Manali, Varanasi...)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 text-base"
              />

              <div className="mt-3">
                <span className="text-xs text-slate-500 font-medium mr-2">Popular suggestions:</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {INDIAN_CITIES_SUGGESTIONS.map((city) => (
                    <button
                      type="button"
                      key={city}
                      onClick={() => setDestination(city)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                        destination.toLowerCase() === city.toLowerCase()
                          ? "bg-orange-600 text-white border-orange-600"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {city.split(",")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Dates & Group Size */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
                <Calendar className="w-4 h-4 text-orange-600 mr-2" />
                Trip Dates & Group Size
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Travellers</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={groupSize}
                      onChange={(e) => setGroupSize(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="text-xs text-slate-500 whitespace-nowrap">
                      {groupSize === 1 ? "Solo" : groupSize === 2 ? "Couple" : "Group"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Budget Tier */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center">
                <IndianRupee className="w-4 h-4 text-orange-600 mr-2" />
                Budget Tier (in Indian Rupees ₹)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Estimates include daily stay, meals, local transport, and monument entry tickets.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BUDGET_TIERS.map((tier) => (
                  <button
                    type="button"
                    key={tier.id}
                    onClick={() => setBudgetTier(tier.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      budgetTier === tier.id
                        ? "border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 text-sm">{tier.label}</span>
                      {budgetTier === tier.id && <Check className="w-4 h-4 text-orange-600" />}
                    </div>
                    <div className="text-xs font-extrabold text-orange-600">
                      Approx. {formatINR(tier.perDay)} / day / person
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{tier.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Travel Style & Pace */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
                <Compass className="w-4 h-4 text-orange-600 mr-2" />
                Travel Style & Pace
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {TRAVEL_STYLES.map((style) => (
                  <button
                    type="button"
                    key={style.id}
                    onClick={() => setTravelStyle(style.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      travelStyle === style.id
                        ? "border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm">{style.label}</span>
                      {travelStyle === style.id && <Check className="w-3.5 h-3.5 text-orange-600" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{style.desc}</p>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">Trip Pace</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "relaxed", label: "Relaxed", sub: "2-3 leisurely stops" },
                    { id: "balanced", label: "Balanced", sub: "3-4 curated stops" },
                    { id: "packed", label: "Fast-Paced", sub: "5+ packed stops" },
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPace(p.id)}
                      className={`p-2.5 rounded-lg border text-center transition ${
                        pace === p.id
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-xs font-bold">{p.label}</div>
                      <div className={`text-[10px] ${pace === p.id ? "text-slate-300" : "text-slate-400"}`}>
                        {p.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 5: Interests & Dietary Preferences */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
                <Utensils className="w-4 h-4 text-orange-600 mr-2" />
                Interests & Dietary Preferences
              </h3>

              <div className="mb-5">
                <span className="block text-xs font-semibold text-slate-700 mb-2">
                  Select your interests (click to toggle):
                </span>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS_OPTIONS.map((interest) => (
                    <button
                      type="button"
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedInterests.includes(interest)
                          ? "bg-orange-600 text-white border-orange-600"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-2">
                  Dietary preferences (Indian food context):
                </span>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((diet) => (
                    <button
                      type="button"
                      key={diet}
                      onClick={() => toggleDiet(diet)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        dietaryPrefs.includes(diet)
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Summary Card (1 Col) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white p-6 rounded-2xl border border-slate-200 shadow-lg space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-semibold text-orange-600 uppercase">Trip Summary</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {destination || "Select Destination"}
                </h3>
                <div className="flex items-center text-xs text-slate-500 mt-1 space-x-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{tripDays} Days ({startDate} to {endDate})</span>
                </div>
              </div>

              {/* Price Estimation */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Estimated Total Budget</span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  {formatINR(estimatedTotal)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  for {groupSize} {groupSize === 1 ? "traveller" : "travellers"} • {selectedBudgetObj.label} tier
                </div>
                <div className="mt-2 text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  * All prices are realistic estimates in INR and not live booking guarantees.
                </div>
              </div>

              {/* Selections preview */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Pace:</span>
                  <span className="font-semibold text-slate-800 capitalize">{pace}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Style:</span>
                  <span className="font-semibold text-slate-800 capitalize">{travelStyle}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Diet:</span>
                  <span className="font-semibold text-slate-800">{dietaryPrefs.join(", ") || "Any"}</span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-700 active:scale-95 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-orange-600/20 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Planning Your Trip...</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Itinerary</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-[11px] text-slate-400">
                  Powered by Generative AI with realistic Indian timing & transit.
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Loading Modal Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Compass className="w-8 h-8 animate-spin-slow" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 mb-2">
              Generating Itinerary for {destination}
            </h3>

            <div className="space-y-2 mt-4 text-xs text-slate-500">
              <p className={loadingStep >= 0 ? "text-orange-600 font-semibold" : ""}>
                • Sequencing attractions & avoiding unnecessary backtracking...
              </p>
              <p className={loadingStep >= 1 ? "text-orange-600 font-semibold" : ""}>
                • Selecting authentic local food spots & regional specialities...
              </p>
              <p className={loadingStep >= 2 ? "text-orange-600 font-semibold" : ""}>
                • Calculating category budget in Indian Rupees (₹)...
              </p>
            </div>

            <div className="mt-6 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-orange-600 h-full animate-pulse rounded-full w-3/4" />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Builder;
