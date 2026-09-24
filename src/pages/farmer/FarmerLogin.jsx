import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout, Lock, Mail, AlertCircle, LogIn, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function FarmerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.role === "farmer") {
        navigate("/farmer/dashboard");
      } else if (res.role === "company") {
        setError("This account is registered as a Company. Please use the Company Login portal.");
      } else if (res.role === "admin") {
        setError("This account is an Administrator. Please use the Admin Login portal.");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Invalid farmer email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Navigation Switcher */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100/90 rounded-2xl">
        <Link
          to="/farmer/login"
          className="py-2 px-2.5 rounded-xl text-xs font-bold text-center bg-white text-emerald-800 shadow-sm border border-slate-200/80 flex items-center justify-center gap-1.5"
        >
          <Sprout className="w-3.5 h-3.5 text-emerald-600" />
          <span>Farmer</span>
        </Link>
        <Link
          to="/company/login"
          className="py-2 px-2.5 rounded-xl text-xs font-bold text-center text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-1.5"
        >
          <span>Company</span>
        </Link>
        <Link
          to="/admin/login"
          className="py-2 px-2.5 rounded-xl text-xs font-bold text-center text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-1.5"
        >
          <span>Admin</span>
        </Link>
      </div>

      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2.5 shadow-md shadow-emerald-600/10">
          <Sprout className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Farmer Sign In</h2>
        <p className="mt-1 text-xs text-slate-500">
          Access your farm produce listings, incoming company demands, and deals.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Farmer Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. raj.kumar@agriconnect.com"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-agri-600 hover:bg-agri-700 text-white font-bold text-sm shadow-md shadow-agri-600/30 transition flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>{loading ? "Verifying..." : "Sign In as Farmer"}</span>
        </button>
      </form>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
        <span>
          New grower?{" "}
          <Link to="/register?role=farmer" className="font-bold text-agri-700 hover:underline">
            Register Farmer Account
          </Link>
        </span>
        <Link to="/company/login" className="font-bold text-slate-600 hover:text-slate-900">
          Company Login →
        </Link>
      </div>
    </div>
  );
}
