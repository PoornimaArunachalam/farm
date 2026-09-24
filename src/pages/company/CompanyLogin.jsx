import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Lock, Mail, AlertCircle, LogIn, Sprout } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function CompanyLogin() {
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
      if (res.role === "company") {
        navigate("/company/dashboard");
      } else if (res.role === "farmer") {
        setError("This account is registered as a Farmer. Please use the Farmer Login portal.");
      } else if (res.role === "admin") {
        setError("This account is an Administrator. Please use the Admin Login portal.");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Invalid company email or password.");
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
          className="py-2 px-2.5 rounded-xl text-xs font-bold text-center text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-1.5"
        >
          <span>Farmer</span>
        </Link>
        <Link
          to="/company/login"
          className="py-2 px-2.5 rounded-xl text-xs font-bold text-center bg-white text-amber-900 shadow-sm border border-slate-200/80 flex items-center justify-center gap-1.5"
        >
          <Building2 className="w-3.5 h-3.5 text-amber-600" />
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
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2.5 shadow-md shadow-amber-600/10">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Company & Buyer Sign In</h2>
        <p className="mt-1 text-xs text-slate-500">
          Access bulk procurement requirements, search verified farmers, and manage purchase deals.
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
          <label className="block text-xs font-bold text-slate-700 mb-1">Company Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. procure@abcfoods.com"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
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
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md shadow-slate-900/30 transition flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4 text-amber-400" />
          <span>{loading ? "Verifying..." : "Sign In to Company Portal"}</span>
        </button>
      </form>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
        <span>
          New enterprise?{" "}
          <Link to="/register?role=company" className="font-bold text-amber-800 hover:underline">
            Register Company
          </Link>
        </span>
        <Link to="/farmer/login" className="font-bold text-slate-600 hover:text-slate-900">
          Farmer Login →
        </Link>
      </div>
    </div>
  );
}
