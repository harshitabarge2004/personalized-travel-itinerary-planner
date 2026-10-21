// frontend/src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Compass, Sparkles, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useAppStore, supabase } from "../store";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAppStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleGuestLogin = () => {
    setUser({
      id: "traveler-" + Date.now(),
      email: email.trim() || "explorer@yatra.in",
      name: name.trim() || "Guest Traveler",
    });
    navigate(from, { replace: true });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sign in or create session
      setUser({
        id: "user-" + Date.now(),
        email: email.trim(),
        name: name.trim() || email.split("@")[0],
      });
      navigate(from, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl relative z-10 border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Welcome to YatraAI</h2>
          <p className="text-xs text-slate-500 mt-1">
            Personalized AI Itinerary Planner for India & Beyond
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
            <input
              type="text"
              placeholder="e.g. Harshita Barge"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. traveler@bharat.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm shadow-md transition active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>Continue with Email</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-slate-400">or explore instantly</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
        >
          Continue as Guest Explorer
        </button>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-orange-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
