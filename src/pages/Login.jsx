import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, AlertCircle, Sprout, Building2, ShieldCheck, Lock, Mail } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
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
      if (res.role === "farmer") navigate("/farmer/dashboard");
      else if (res.role === "company") navigate("/company/dashboard");
      else if (res.role === "admin") navigate("/admin/dashboard");
      else navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Portal Switcher */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100/90 rounded-2xl">
        <Link
          to="/farmer/login"
          className="py-2.5 px-2 rounded-xl text-xs font-bold text-center bg-white text-emerald-800 shadow-sm border border-slate-200/80 hover:bg-emerald-50 transition flex items-center justify-center gap-1.5"
        >
          <Sprout className="w-4 h-4 text-emerald-600" />
          <span>Farmer</span>
        </Link>
        <Link
          to="/company/login"
          className="py-2.5 px-2 rounded-xl text-xs font-bold text-center bg-white text-amber-900 shadow-sm border border-slate-200/80 hover:bg-amber-50 transition flex items-center justify-center gap-1.5"
        >
          <Building2 className="w-4 h-4 text-amber-600" />
          <span>Company</span>
        </Link>
        <Link
          to="/admin/login"
          className="py-2.5 px-2 rounded-xl text-xs font-bold text-center bg-white text-slate-800 shadow-sm border border-slate-200/80 hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
        >
          <ShieldCheck className="w-4 h-4 text-slate-600" />
          <span>Admin</span>
        </Link>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-slate-900">Sign in to AgriConnect</h2>
        <p className="mt-1 text-xs text-slate-500">
          Select your portal above or enter your account credentials below.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
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
          <span>{loading ? "Signing In..." : "Sign In to Workspace"}</span>
        </button>
      </form>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
        <span>
          Don't have an account?{" "}
          <Link to="/register" className="font-bold text-agri-700 hover:underline">
            Register
          </Link>
        </span>
        <Link
          to="/admin/login"
          className="font-bold text-slate-800 hover:text-agri-700 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg transition"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
          <span>Admin Portal</span>
        </Link>
      </div>
    </div>
  );
}
