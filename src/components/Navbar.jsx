import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Sprout,
  Building2,
  User,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Search,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, role, profile, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getDashboardLink = () => {
    if (role === "farmer") return "/farmer/dashboard";
    if (role === "company") return "/company/dashboard";
    if (role === "admin") return "/admin/dashboard";
    return "/";
  };

  const displayName =
    role === "farmer"
      ? profile?.fullName || "Farmer"
      : role === "company"
      ? profile?.companyName || "Company"
      : role === "admin"
      ? "Administrator"
      : user?.email || "Guest";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-agri-700 via-agri-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-agri-600/30 group-hover:scale-105 transition">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center">
                  Agri<span className="text-agri-600">Connect</span>
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-emerald-700 -mt-1">
                  Live Market
                </span>
              </div>
            </Link>

            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/farmer/demands"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  location.pathname.includes("/demands")
                    ? "bg-agri-50 text-agri-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Company Demands
              </Link>
              <Link
                to="/company/farmers"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  location.pathname.includes("/farmers")
                    ? "bg-agri-50 text-agri-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Available Crops
              </Link>
            </nav>
          </div>

          {/* Right: User actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />

                <Link
                  to={getDashboardLink()}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-agri-600 hover:bg-agri-700 text-white text-xs font-bold shadow-sm shadow-agri-600/30 transition"
                >
                  <span>Dashboard</span>
                </Link>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="hidden lg:block text-right">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                      {displayName}
                    </p>
                    <span className="text-[10px] font-semibold text-agri-700 uppercase">
                      {role}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-agri-700 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-xl bg-agri-600 hover:bg-agri-700 text-white text-xs font-bold shadow-sm shadow-agri-600/30 transition"
                >
                  Join Now
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-3 space-y-1">
            <Link
              to={getDashboardLink()}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-agri-50"
            >
              My Dashboard
            </Link>
            <Link
              to="/farmer/demands"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-agri-50"
            >
              Company Demands
            </Link>
            <Link
              to="/company/farmers"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-agri-50"
            >
              Farmer Crops Marketplace
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
