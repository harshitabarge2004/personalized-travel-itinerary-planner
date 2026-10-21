// frontend/src/pages/Landing.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Compass,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  IndianRupee,
  Utensils,
  CheckCircle2,
  Users,
  Luggage,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAppStore, formatINR } from "../store";

interface DestinationCard {
  title: string;
  state: string;
  image: string;
  tag: string;
  days: number;
  avgBudget: number;
  highlights: string[];
}

const POPULAR_DESTINATIONS: DestinationCard[] = [
  {
    title: "Indore & Ujjain",
    state: "Madhya Pradesh",
    image: "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=800&q=80",
    tag: "Culinary & Spiritual",
    days: 3,
    avgBudget: 7500,
    highlights: ["Sarafa Night Food Market", "Mahakaleshwar Jyotirlinga", "Rajwada Palace", "Chappan Dukan"],
  },
  {
    title: "Jaipur & Udaipur",
    state: "Rajasthan",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80",
    tag: "Royal Forts & Heritage",
    days: 4,
    avgBudget: 14000,
    highlights: ["Amer Fort & Sheesh Mahal", "Hawa Mahal", "Lake Pichola Sunset Boat", "City Palace"],
  },
  {
    title: "Goa Coastal Circuit",
    state: "Goa",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    tag: "Beaches & Latin Quarter",
    days: 4,
    avgBudget: 16500,
    highlights: ["Fontainhas Latin Quarter", "Aguada Fort", "Anjuna Shacks", "Basilica of Bom Jesus"],
  },
  {
    title: "Manali & Solang Valley",
    state: "Himachal Pradesh",
    image: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80",
    tag: "Himalayan Adventure",
    days: 4,
    avgBudget: 15000,
    highlights: ["Solang Ropeway", "Atal Tunnel & Sissu", "Hadimba Temple", "Old Manali Cafes"],
  },
  {
    title: "Varanasi & Sarnath",
    state: "Uttar Pradesh",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
    tag: "Ghats & Ancient Culture",
    days: 3,
    avgBudget: 6800,
    highlights: ["Dashashwamedh Ganga Aarti", "Subah-e-Banaras Boat Ride", "Kashi Vishwanath", "Sarnath Stupa"],
  },
  {
    title: "Bhopal & Sanchi Stupa",
    state: "Madhya Pradesh",
    image: "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=800&q=80",
    tag: "Lakes & UNESCO Wonder",
    days: 2,
    avgBudget: 5500,
    highlights: ["UNESCO Great Stupa of Sanchi", "Upper Lake Boating", "Taj-ul-Masajid", "Tribal Museum"],
  },
];

const QUICK_CHIPS = [
  "Indore, Madhya Pradesh",
  "Jaipur, Rajasthan",
  "Ujjain, Madhya Pradesh",
  "Goa",
  "Manali, Himachal Pradesh",
  "Varanasi, Uttar Pradesh",
  "Bhopal, Madhya Pradesh",
  "Mumbai, Maharashtra",
  "Kochi, Kerala",
  "Rishikesh, Uttarakhand",
];

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const setSelectedDestination = useAppStore((s) => s.setSelectedDestination);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dest = searchInput.trim() || "Indore, Madhya Pradesh";
    setSelectedDestination(dest);
    navigate(`/builder?dest=${encodeURIComponent(dest)}`);
  };

  const handleChipClick = (dest: string) => {
    setSelectedDestination(dest);
    navigate(`/builder?dest=${encodeURIComponent(dest)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Decorative background gradients */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-600/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs sm:text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>AI-Powered Travel Planning for Incredible India & Beyond</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Personalized Day-by-Day Itineraries <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
              Tailored to Your Vibe & Budget
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal">
            Effortlessly plan your dream vacation with realistic transit times, iconic attractions, hidden local food gems, and realistic estimates in Indian Rupees (₹).
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl mx-auto bg-white rounded-2xl p-2 sm:p-2.5 shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-slate-200"
          >
            <div className="flex items-center flex-1 w-full px-3 py-2 text-slate-700">
              <MapPin className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Where to? (e.g. Indore, Jaipur, Goa, Manali, Varanasi...)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none text-sm sm:text-base"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center space-x-2 flex-shrink-0"
            >
              <span>Generate Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Select Chips */}
          <div className="mt-6 max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-medium mr-1">Trending:</span>
            {QUICK_CHIPS.slice(0, 7).map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-orange-600/30 hover:border-orange-500/50 border border-slate-700 text-slate-300 transition-colors"
              >
                {chip.split(",")[0]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Value Pillars Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Sensible Daily Schedules</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sequenced without backtracking. Morning, afternoon, and evening slots designed around realistic distances.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-1">INR (₹) Budget Breakdowns</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Itemized estimates for stays, food, sightseeing, and local transport so you always stay within budget.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Authentic Local Flavours</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Curated recommendations from famous street food alleys (Sarafa, Chappan Dukan) to iconic regional thalis.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <Luggage className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Edit & Save Anytime</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cloud persistence with Supabase and browser caching. Reorder, add stops, print, and regenerate with ease.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">Handcrafted Experiences</span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Explore Popular Indian Circuits</h2>
              <p className="text-sm text-slate-600 mt-2 max-w-xl">
                Ready-to-build itinerary templates featuring cultural heritage, authentic cuisines, and breathtaking scenery.
              </p>
            </div>
            <Link
              to="/builder"
              className="mt-4 md:mt-0 inline-flex items-center text-sm font-semibold text-orange-600 hover:text-orange-700"
            >
              <span>Build Custom Destination</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {POPULAR_DESTINATIONS.map((item, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-slate-800 shadow-sm">
                    {item.tag}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-white flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-orange-400" />
                    <span>{item.days} Days</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>{item.state}</span>
                      <span className="text-orange-600 font-bold">Est. {formatINR(item.avgBudget)}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                      {item.title}
                    </h3>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {item.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleChipClick(`${item.title}, ${item.state}`)}
                    className="mt-6 w-full py-2.5 px-4 bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white font-semibold text-xs rounded-xl border border-orange-200 hover:border-transparent transition-all flex items-center justify-center space-x-1.5"
                  >
                    <span>Plan This Trip</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">Simple & Fast</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">How YatraAI Works</h2>
          <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
            From rough idea to a comprehensive, executable day-by-day travel plan in under 30 seconds.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 text-left">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-bold flex items-center justify-center text-base mb-4">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Set Your Preferences</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Choose any destination, your dates, group size, budget tier in INR, and travel interests (heritage, food, temples, nature).
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 text-left">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-bold flex items-center justify-center text-base mb-4">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">AI Builds Your Schedule</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our engine schedules morning, afternoon, and evening activities without backtracking, factoring in local transit and dining.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 text-left">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-bold flex items-center justify-center text-base mb-4">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Save, Edit & Explore</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Adjust activities, review budget breakdowns, print for offline reference, or save directly to your account.
              </p>
            </div>
          </div>

          <div className="mt-12">
            <Link
              to="/builder"
              className="inline-flex items-center px-8 py-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-600/25 active:scale-95 transition"
            >
              <span>Build Your Personalized Itinerary</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
