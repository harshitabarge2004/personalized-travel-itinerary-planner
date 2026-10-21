// frontend/src/components/Navbar.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Compass, MapPin, Calendar, Heart, ShieldCheck } from "lucide-react";
import { useAppStore } from "../store";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const savedTrips = useAppStore((s) => s.savedTrips);
  const user = useAppStore((s) => s.user);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
                Yatra<span className="text-orange-600">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full">
                India Edition 🇮🇳
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/")
                  ? "text-orange-600 bg-orange-50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Explore
            </Link>

            <Link
              to="/builder"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/builder")
                  ? "text-orange-600 bg-orange-50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Plan Trip
            </Link>

            <Link
              to="/dashboard"
              className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/dashboard")
                  ? "text-orange-600 bg-orange-50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span>My Itineraries</span>
              {savedTrips.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold bg-orange-600 text-white rounded-full">
                  {savedTrips.length}
                </span>
              )}
            </Link>

            {/* Currency indicator badge */}
            <div className="hidden md:flex items-center pl-2 pr-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
              <span className="text-orange-600 font-bold mr-1">₹</span> INR
            </div>

            {/* CTA button */}
            <Link
              to="/builder"
              className="ml-2 inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-orange-600 text-white shadow-sm hover:bg-orange-700 active:scale-95 transition"
            >
              <Calendar className="w-4 h-4 mr-1.5" />
              <span>Create Plan</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
