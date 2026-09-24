import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Sprout } from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-amber-50/40 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-agri-700 via-agri-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-agri-600/30 group-hover:scale-105 transition">
            <Sprout className="w-7 h-7" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            Agri<span className="text-agri-600">Connect</span>
          </span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
