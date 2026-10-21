// frontend/src/components/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Compass, Heart, Sparkles, MapPin } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 text-white font-extrabold text-xl mb-3">
              <Compass className="w-6 h-6 text-orange-500" />
              <span>Yatra<span className="text-orange-500">AI</span></span>
            </div>
            <p className="text-sm leading-relaxed max-w-md text-slate-300">
              Personalized AI Travel Itinerary Planner crafted for travelers exploring Incredible India and worldwide destinations.
              Instant day-by-day schedules, realistic travel times, local dining gems, and precise rupee (₹) budget estimates.
            </p>
            <div className="mt-4 flex items-center space-x-2 text-xs text-orange-400 bg-orange-950/40 border border-orange-800/50 px-3 py-1.5 rounded-lg w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Powered by Groq Generative AI & Supabase Cloud</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3 tracking-wide">Popular Indian Circuits</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/builder?dest=Indore, Madhya Pradesh" className="hover:text-orange-400 transition-colors">Indore & Ujjain Mahakal</Link></li>
              <li><Link to="/builder?dest=Jaipur, Rajasthan" className="hover:text-orange-400 transition-colors">Jaipur Pink City & Forts</Link></li>
              <li><Link to="/builder?dest=Goa" className="hover:text-orange-400 transition-colors">Goa Beaches & Heritage</Link></li>
              <li><Link to="/builder?dest=Manali, Himachal Pradesh" className="hover:text-orange-400 transition-colors">Manali & Rohtang Pass</Link></li>
              <li><Link to="/builder?dest=Varanasi, Uttar Pradesh" className="hover:text-orange-400 transition-colors">Varanasi Ghats & Sarnath</Link></li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3 tracking-wide">Quick Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Home & Destinations</Link></li>
              <li><Link to="/builder" className="hover:text-orange-400 transition-colors">Trip Builder Wizard</Link></li>
              <li><Link to="/dashboard" className="hover:text-orange-400 transition-colors">My Saved Itineraries</Link></li>
              <li><span className="text-xs text-slate-500">All prices shown in INR (₹) as estimates.</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300">
          <p>© {new Date().getFullYear()} YatraAI • Personalized Travel Itinerary Planner.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 mx-1 fill-rose-500" /> for travelers exploring India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
