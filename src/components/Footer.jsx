import React from "react";
import { Link } from "react-router-dom";
import {
  Sprout,
  Building2,
  ShieldCheck,
  Globe,
  Database,
  CheckCircle2,
  ExternalLink,
  Heart,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export default function Footer() {
  const convexCloudUrl = import.meta.env.VITE_CONVEX_URL || "https://mellow-toad-933.convex.cloud";
  const convexSiteUrl = import.meta.env.VITE_CONVEX_SITE_URL || "https://mellow-toad-933.convex.site";

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Col 1: Brand & Cloud Status */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group inline-flex">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-agri-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center">
                  Agri<span className="text-emerald-400">Connect</span>
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-emerald-400 -mt-1">
                  Live Agricultural Marketplace
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed pr-6">
              Next-generation live trading network connecting verified growers directly with commercial processors, exporters, and wholesale buyers across India with zero intermediary margins.
            </p>

            {/* Live Database & Cloud Badge */}
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/70 max-w-md space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-slate-200 flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    Convex Cloud Backend
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                  Live & Connected
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Cloud API:</span>
                  <a
                    href={convexCloudUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1 truncate max-w-[200px]"
                  >
                    <span>{convexCloudUrl.replace("https://", "")}</span>
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">HTTP Actions:</span>
                  <a
                    href={convexSiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-400 hover:underline flex items-center gap-1 truncate max-w-[200px]"
                  >
                    <span>{convexSiteUrl.replace("https://", "")}</span>
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: For Farmers */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span>For Farmers</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/farmer/login" className="hover:text-emerald-400 transition">
                  Farmer Sign In
                </Link>
              </li>
              <li>
                <Link to="/register?role=farmer" className="hover:text-emerald-400 transition">
                  Create Farmer Profile
                </Link>
              </li>
              <li>
                <Link to="/farmer/demands" className="hover:text-emerald-400 transition">
                  Browse Active Demands
                </Link>
              </li>
              <li>
                <Link to="/farmer/add-crop" className="hover:text-emerald-400 transition">
                  List Harvest / Produce
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Companies */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>For Companies</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/company/login" className="hover:text-amber-400 transition">
                  Company Sign In
                </Link>
              </li>
              <li>
                <Link to="/register?role=company" className="hover:text-amber-400 transition">
                  Register Enterprise
                </Link>
              </li>
              <li>
                <Link to="/company/farmers" className="hover:text-amber-400 transition">
                  Available Crop Market
                </Link>
              </li>
              <li>
                <Link to="/company/add-demand" className="hover:text-amber-400 transition">
                  Post Procurement Demand
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Governance */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Governance</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/admin/login" className="hover:text-blue-400 transition">
                  Admin Portal Login
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Encrypted Deal Contracts</span>
              </li>
              <li>
                <span className="text-slate-500">Live Dispute Resolution</span>
              </li>
              <li>
                <span className="text-slate-500">Fair Trade & Price Index</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AgriConnect Platform Inc. All rights reserved.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <span>100% Real-Time Synchronized</span>
            <span>•</span>
            <span>Zero Brokerage</span>
            <span>•</span>
            <span>Convex Reactive Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
