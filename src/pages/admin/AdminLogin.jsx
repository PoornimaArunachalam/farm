import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Mail, AlertCircle, LogIn, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function AdminLogin() {
  const [email, setEmail] = useState("poornima@gmail.com");
  const [password, setPassword] = useState("poornima");
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
      if (res.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        setError("Access Denied: This account does not possess administrator privileges.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Invalid administrator credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-slate-900/30">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Admin Portal Login</h2>
        <p className="mt-1 text-xs text-slate-500">
          Sign in to access platform governance, user records, farmer data, and company listings.
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
          <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
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
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md shadow-slate-900/30 transition flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4 text-emerald-400" />
          <span>{loading ? "Verifying..." : "Sign In to Admin Dashboard"}</span>
        </button>
      </form>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <Link to="/login" className="font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Farmer / Company Login</span>
        </Link>
        <Link to="/" className="font-semibold text-agri-700 hover:underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
