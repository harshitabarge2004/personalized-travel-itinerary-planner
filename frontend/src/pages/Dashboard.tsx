// frontend/src/pages/Dashboard.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Compass,
  Calendar,
  MapPin,
  Clock,
  IndianRupee,
  Share2,
  Printer,
  RotateCw,
  Plus,
  Trash2,
  Sparkles,
  Utensils,
  Car,
  Hotel,
  Ticket,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Eye,
  Info,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAppStore, formatINR, SavedTripRecord } from "../store";
import { generateItinerary, Itinerary, ItineraryItem } from "../api";

// Fallback sample Indian itinerary if user opens dashboard directly
const defaultIndianItinerary: Itinerary = {
  trip_id: "sample-indore",
  destination: "Indore & Ujjain, Madhya Pradesh",
  total_estimated_cost: 9200,
  currency: "INR",
  budget_breakdown: {
    stay: 4400,
    food: 2300,
    sightseeing: 1100,
    transport: 900,
    miscellaneous: 500,
  },
  days: [
    {
      day_number: 1,
      date: "2026-11-01",
      summary: "Holkar Royal Bastions & The Legendary Sarafa Night Food Market",
      estimated_cost: 4800,
      items: [
        {
          order_index: 1,
          time_slot: "09:00 AM",
          title: "Rajwada Palace & Holkar Dynasty Heritage Walk",
          type: "attraction",
          location: "Rajwada Chowk, Indore",
          cost: 100,
          duration_min: 90,
          description: "Admire the 7-storey palace blending Maratha, Mughal and French styles. Visit the inner temple and courtyards.",
        },
        {
          order_index: 2,
          time_slot: "12:30 PM",
          title: "Vijay Chaat House & Chappan Dukan",
          type: "dining",
          location: "Chappan Dukan, New Palasia",
          cost: 450,
          duration_min: 60,
          description: "Taste Indore's world-famous Khopra Patties, steaming Poha Jalebi, and Johnny Hot Dog (pioneer street food).",
        },
        {
          order_index: 3,
          time_slot: "03:30 PM",
          title: "Lal Bagh Palace & Rose Garden",
          type: "attraction",
          location: "Nai Duniya, Indore",
          cost: 150,
          duration_min: 120,
          description: "Tour the European-inspired palace featuring Buckingham Palace-replica gates and exquisite Italian marble chandeliers.",
        },
        {
          order_index: 4,
          time_slot: "08:00 PM",
          title: "Sarafa Night Food Market Experience",
          type: "dining",
          location: "Sarafa Bazaar, Old Indore",
          cost: 600,
          duration_min: 120,
          description: "Experience the bustling jewellery street turning into a late-night street food heaven. Savor Garadu, Bhutte ka Kees, and Rabdi Malpua.",
        },
      ],
    },
    {
      day_number: 2,
      date: "2026-11-02",
      summary: "Holy Mahakal Corridor Excursion & Ram Ghat Sunset Aarti",
      estimated_cost: 4400,
      items: [
        {
          order_index: 1,
          time_slot: "08:30 AM",
          title: "Express Cab / Vande Metro to Ujjain",
          type: "transport",
          location: "Indore - Ujjain Highway",
          cost: 900,
          duration_min: 60,
          description: "Scenic 1-hour drive through the Malwa countryside to the sacred city on the banks of Shipra.",
        },
        {
          order_index: 2,
          time_slot: "10:00 AM",
          title: "Mahakaleshwar Jyotirlinga & Grand Mahakal Lok Corridor",
          type: "attraction",
          location: "Jaisinghpura, Ujjain",
          cost: 350,
          duration_min: 180,
          description: "Sacred darshan at the south-facing Jyotirlinga, followed by walking through the magnificent 900-meter Mahakal Lok murals.",
        },
        {
          order_index: 3,
          time_slot: "01:30 PM",
          title: "Traditional Malwa Dal Bafla Lunch",
          type: "dining",
          location: "Mahakal Ghati, Ujjain",
          cost: 450,
          duration_min: 60,
          description: "Authentic oven-baked wheat baflas submerged in pure desi ghee, served with spicy tuvar dal, garlic chutney and sweet churma.",
        },
        {
          order_index: 4,
          time_slot: "05:30 PM",
          title: "Ram Ghat Evening Shipra River Aarti",
          type: "attraction",
          location: "Ram Ghat, Ujjain",
          cost: 50,
          duration_min: 90,
          description: "Witness the peaceful sunset prayer with oil diyas floating on the sacred river as temple chimes echo.",
        },
      ],
    },
  ],
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const currentItinerary = useAppStore((s) => s.currentItinerary);
  const currentPayload = useAppStore((s) => s.currentPayload);
  const savedTrips = useAppStore((s) => s.savedTrips);
  const saveTrip = useAppStore((s) => s.saveTrip);
  const deleteTrip = useAppStore((s) => s.deleteTrip);
  const setCurrentItinerary = useAppStore((s) => s.setCurrentItinerary);

  const [activeDayTab, setActiveDayTab] = useState<number | "all">("all");
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [regenerating, setRegenerating] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New activity form state
  const [newActivityDay, setNewActivityDay] = useState<number>(1);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<string>("attraction");
  const [newTime, setNewTime] = useState("02:00 PM");
  const [newCost, setNewCost] = useState("300");
  const [newLocation, setNewLocation] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const data: Itinerary = currentItinerary || defaultIndianItinerary;

  // Handle Save
  const handleSave = () => {
    saveTrip(data, currentPayload || undefined);
    setSaveStatus("Trip saved to your itineraries!");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  // Handle Share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Itinerary for ${data.destination}`,
        text: `Check out my personalized trip plan to ${data.destination}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSaveStatus("Link copied to clipboard!");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  // Handle Regenerate
  const handleRegenerate = async () => {
    if (!currentPayload) {
      navigate("/builder");
      return;
    }
    setRegenerating(true);
    try {
      const refreshed = await generateItinerary(currentPayload);
      setCurrentItinerary(refreshed);
      saveTrip(refreshed, currentPayload);
      setSaveStatus("Itinerary refreshed!");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  };

  // Handle Delete Activity
  const handleDeleteItem = (dayNumber: number, orderIndex: number) => {
    if (!data.days) return;
    const updatedDays = data.days.map((d) => {
      if (d.day_number === dayNumber) {
        return {
          ...d,
          items: d.items.filter((it) => it.order_index !== orderIndex),
        };
      }
      return d;
    });

    const updatedItinerary: Itinerary = {
      ...data,
      days: updatedDays,
    };
    setCurrentItinerary(updatedItinerary);
  };

  // Handle Add Activity
  const handleAddActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const updatedDays = data.days.map((d) => {
      if (d.day_number === newActivityDay) {
        const newItem: ItineraryItem = {
          order_index: d.items.length + 1,
          time_slot: newTime || "02:00 PM",
          type: newType,
          title: newTitle.trim(),
          description: newDesc.trim() || undefined,
          location: newLocation.trim() || undefined,
          cost: parseFloat(newCost) || 0,
          duration_min: 60,
        };
        return {
          ...d,
          items: [...d.items, newItem],
          estimated_cost: (d.estimated_cost || 0) + (newItem.cost || 0),
        };
      }
      return d;
    });

    const updatedItinerary: Itinerary = {
      ...data,
      days: updatedDays,
      total_estimated_cost: (data.total_estimated_cost || 0) + (parseFloat(newCost) || 0),
    };

    setCurrentItinerary(updatedItinerary);
    setShowAddModal(false);
    setNewTitle("");
    setNewDesc("");
    setNewLocation("");
  };

  // Type badge helper
  const renderTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "dining":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
            <Utensils className="w-3 h-3 mr-1" /> Dining
          </span>
        );
      case "transport":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
            <Car className="w-3 h-3 mr-1" /> Transit
          </span>
        );
      case "stay":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
            <Hotel className="w-3 h-3 mr-1" /> Stay
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800">
            <Ticket className="w-3 h-3 mr-1" /> Sightseeing
          </span>
        );
    }
  };

  const filteredDays =
    activeDayTab === "all"
      ? data.days
      : data.days.filter((d) => d.day_number === activeDayTab);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Notice Toast */}
        {saveStatus && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold">{saveStatus}</span>
            </div>
            <button onClick={() => setSaveStatus("")} className="text-emerald-700 hover:text-emerald-900 text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Trip Header Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                  Confirmed Itinerary
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {data.days.length} Days Planned
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {data.destination || "Personalized Itinerary"}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 mt-2">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 text-orange-600 mr-1.5" />
                  {data.days[0]?.date || "Day 1"} to {data.days[data.days.length - 1]?.date || `Day ${data.days.length}`}
                </span>
                <span className="flex items-center">
                  <IndianRupee className="w-4 h-4 text-orange-600 mr-1" />
                  Estimated Budget: <strong className="ml-1 text-slate-900 font-bold">{formatINR(data.total_estimated_cost)}</strong>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition active:scale-95 flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Trip</span>
              </button>

              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 transition active:scale-95 flex items-center space-x-1.5"
              >
                <RotateCw className={`w-4 h-4 ${regenerating ? "animate-spin" : ""}`} />
                <span>{regenerating ? "Refreshing..." : "Regenerate"}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 transition active:scale-95 flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print / PDF</span>
              </button>

              <button
                onClick={handleShare}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 transition active:scale-95 flex items-center space-x-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>

              <Link
                to="/builder"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition active:scale-95 flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>New Trip</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Budget Breakdown & Trip Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Budget Breakdown Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center">
                <IndianRupee className="w-4 h-4 text-orange-600 mr-2" />
                Category-wise Expense Breakdown (INR ₹)
              </h3>
              <span className="text-xs text-slate-400 font-medium">Realistic Estimates</span>
            </div>

            {data.budget_breakdown ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                  <div className="flex items-center text-blue-700 text-xs font-semibold mb-1">
                    <Hotel className="w-3.5 h-3.5 mr-1" /> Stay
                  </div>
                  <div className="text-base font-extrabold text-slate-900">
                    {formatINR(data.budget_breakdown.stay)}
                  </div>
                  <span className="text-[10px] text-slate-500">Accommodation</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <div className="flex items-center text-emerald-700 text-xs font-semibold mb-1">
                    <Utensils className="w-3.5 h-3.5 mr-1" /> Dining
                  </div>
                  <div className="text-base font-extrabold text-slate-900">
                    {formatINR(data.budget_breakdown.food)}
                  </div>
                  <span className="text-[10px] text-slate-500">Meals & Street Food</span>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100">
                  <div className="flex items-center text-purple-700 text-xs font-semibold mb-1">
                    <Ticket className="w-3.5 h-3.5 mr-1" /> Sightseeing
                  </div>
                  <div className="text-base font-extrabold text-slate-900">
                    {formatINR(data.budget_breakdown.sightseeing)}
                  </div>
                  <span className="text-[10px] text-slate-500">Entry & Tickets</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                  <div className="flex items-center text-amber-700 text-xs font-semibold mb-1">
                    <Car className="w-3.5 h-3.5 mr-1" /> Transit
                  </div>
                  <div className="text-base font-extrabold text-slate-900">
                    {formatINR(data.budget_breakdown.transport)}
                  </div>
                  <span className="text-[10px] text-slate-500">Cabs, Autos, Metro</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-100/70 border border-slate-200">
                  <div className="flex items-center text-slate-700 text-xs font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5 mr-1" /> Buffer
                  </div>
                  <div className="text-base font-extrabold text-slate-900">
                    {formatINR(data.budget_breakdown.miscellaneous)}
                  </div>
                  <span className="text-[10px] text-slate-500">Shopping & Misc</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Total estimated trip budget: {formatINR(data.total_estimated_cost)}</p>
            )}

            <div className="mt-4 flex items-center text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
              <Info className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <span>
                All amounts are realistic estimates tailored to the chosen budget tier. Real pricing may vary based on seasons, peak festivals, and actual bookings.
              </span>
            </div>
          </div>

          {/* Quick Travel Tips Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center">
                <Compass className="w-4 h-4 text-orange-600 mr-2" />
                Indian Travel Guidance
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2 font-bold">•</span>
                  <span><strong>Local Transport:</strong> Use auto-rickshaws, metro or app-based cabs (Ola/Uber) for hassle-free city transit.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2 font-bold">•</span>
                  <span><strong>Temples & Sacred Sites:</strong> Modest attire is recommended. Remove shoes before entering sanctums.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2 font-bold">•</span>
                  <span><strong>Street Food:</strong> Savor freshly prepared hot snacks at high-turnover food streets (like Sarafa or Chappan Dukan).</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 w-full py-2.5 px-4 bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold rounded-xl text-xs border border-orange-200 transition flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Stop / Activity</span>
            </button>
          </div>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveDayTab("all")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              activeDayTab === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            All Days ({data.days.length})
          </button>

          {data.days.map((d) => (
            <button
              key={d.day_number}
              onClick={() => setActiveDayTab(d.day_number)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                activeDayTab === d.day_number
                  ? "bg-orange-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Day {d.day_number}
            </button>
          ))}
        </div>

        {/* Days & Timeline Content */}
        <div className="space-y-8">
          {filteredDays.map((day) => (
            <div key={day.day_number} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-6">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-lg bg-orange-600 text-white text-xs font-black flex items-center justify-center">
                      D{day.day_number}
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      Day {day.day_number} • {day.date}
                    </h2>
                  </div>
                  {day.summary && (
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                      {day.summary}
                    </p>
                  )}
                </div>

                <div className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 self-start sm:self-auto">
                  Day Total: {formatINR(day.estimated_cost)}
                </div>
              </div>

              {/* Items Timeline */}
              <div className="relative pl-6 sm:pl-8 border-l-2 border-orange-200 space-y-6">
                {day.items
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((item, idx) => (
                    <div key={idx} className="relative group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-orange-500 shadow-sm group-hover:scale-110 transition-transform" />

                      <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:shadow-md transition">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">
                              {item.time_slot}
                            </span>
                            {renderTypeBadge(item.type)}
                            {item.duration_min && (
                              <span className="text-[11px] text-slate-400">
                                • {item.duration_min} mins
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-3">
                            {item.cost !== undefined && item.cost !== null && (
                              <span className="text-xs font-bold text-slate-800">
                                {formatINR(item.cost)} <span className="text-[10px] text-slate-400 font-normal">(est.)</span>
                              </span>
                            )}

                            <button
                              onClick={() => handleDeleteItem(day.day_number, item.order_index)}
                              className="text-slate-300 hover:text-rose-600 transition print:hidden"
                              title="Remove stop"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-base font-bold text-slate-900">{item.title}</h4>

                        {item.location && (
                          <div className="flex items-center text-xs text-slate-500 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
                            <span>{item.location}</span>
                          </div>
                        )}

                        {item.description && (
                          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Saved Trips Drawer / History */}
        {savedTrips.length > 0 && (
          <section className="mt-16 pt-8 border-t border-slate-200 print:hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
                  Your Vacations
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  Saved Itineraries ({savedTrips.length})
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTrips.map((trip) => (
                <div
                  key={trip.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    data.trip_id === trip.id
                      ? "border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {trip.travel_style || "Trip"}
                    </span>
                    <button
                      onClick={() => deleteTrip(trip.id)}
                      className="text-slate-400 hover:text-rose-600 transition"
                      title="Delete trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base mb-1 line-clamp-1">
                    {trip.destination}
                  </h4>

                  <p className="text-xs text-slate-500 mb-3">
                    {trip.start_date} to {trip.end_date} • {trip.group_size} travelers
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-orange-600">
                      Est. {formatINR(trip.total_estimated_cost)}
                    </span>

                    <button
                      onClick={() => {
                        setCurrentItinerary(trip.itinerary);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="inline-flex items-center text-xs font-semibold text-slate-900 hover:text-orange-600"
                    >
                      <span>View Plan</span>
                      <Eye className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Add Custom Stop Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <Plus className="w-5 h-5 text-orange-600 mr-2" />
              Add Custom Stop / Activity
            </h3>

            <form onSubmit={handleAddActivitySubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Day</label>
                  <select
                    value={newActivityDay}
                    onChange={(e) => setNewActivityDay(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  >
                    {data.days.map((d) => (
                      <option key={d.day_number} value={d.day_number}>
                        Day {d.day_number} ({d.date})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Activity Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  >
                    <option value="attraction">Sightseeing / Monument</option>
                    <option value="dining">Food & Dining</option>
                    <option value="transport">Transit / Travel</option>
                    <option value="stay">Hotel / Stay</option>
                    <option value="activity">Activity / Shopping</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title / Stop Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Visit Khajrana Ganesh Temple / Poha Jalebi Stop"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    placeholder="e.g. 04:30 PM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Cost (₹ INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 250"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Khajrana Road, Indore"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Helpful notes or tips for this visit..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                >
                  Add Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
