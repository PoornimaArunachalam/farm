import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Sprout,
  PlusCircle,
  TrendingUp,
  Building2,
  Users,
  MessageSquare,
  FileCheck2,
  Bell,
  UserCircle,
  ShieldCheck,
  Flag,
  BarChart3,
  Search,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import { useQuery } from "../context/ConvexClientContext";

export default function Sidebar() {
  const { role, token } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const conversations = useQuery("conversations:list", { token }) || [];
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const farmerNavItems = [
    { label: "Dashboard", path: "/farmer/dashboard", icon: LayoutDashboard },
    { label: "My Crops", path: "/farmer/my-crops", icon: Sprout },
    { label: "Add New Crop", path: "/farmer/add-crop", icon: PlusCircle },
    { label: "Company Demands", path: "/farmer/demands", icon: TrendingUp },
    { label: "Find Companies", path: "/farmer/companies", icon: Building2 },
    {
      label: "Live Messages",
      path: "/farmer/messages",
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null,
    },
    { label: "Active Deals", path: "/farmer/deals", icon: FileCheck2 },
    {
      label: "Notifications",
      path: "/farmer/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { label: "Farmer Profile", path: "/farmer/profile", icon: UserCircle },
  ];

  const companyNavItems = [
    { label: "Dashboard", path: "/company/dashboard", icon: LayoutDashboard },
    { label: "My Demands", path: "/company/my-demands", icon: TrendingUp },
    { label: "Post New Demand", path: "/company/add-demand", icon: PlusCircle },
    { label: "Available Crops", path: "/company/farmers", icon: Sprout },
    { label: "Find Farmers", path: "/company/find-farmers", icon: Users },
    {
      label: "Live Messages",
      path: "/company/messages",
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null,
    },
    { label: "Trade Deals", path: "/company/deals", icon: FileCheck2 },
    {
      label: "Notifications",
      path: "/company/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { label: "Company Profile", path: "/company/profile", icon: Building2 },
  ];

  const adminNavItems = [
    { label: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Manage Farmers", path: "/admin/farmers", icon: Users },
    { label: "Manage Companies", path: "/admin/companies", icon: Building2 },
    { label: "All Crops", path: "/admin/crops", icon: Sprout },
    { label: "All Demands", path: "/admin/demands", icon: TrendingUp },
    { label: "Platform Deals", path: "/admin/deals", icon: FileCheck2 },
    { label: "Reports & Logs", path: "/admin/reports", icon: Flag },
  ];

  const items =
    role === "farmer"
      ? farmerNavItems
      : role === "company"
      ? companyNavItems
      : role === "admin"
      ? adminNavItems
      : [];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          {role === "farmer" ? "Farmer Workspace" : role === "company" ? "Company Workspace" : "System Admin"}
        </div>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? "bg-agri-600 text-white shadow-sm shadow-agri-600/30"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-white text-agri-700" : "bg-agri-100 text-agri-800"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs">
        <div className="flex items-center gap-2 text-slate-800 font-bold mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Sync Active</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Database reacts automatically to market listings, messages, and trade offers.
        </p>
      </div>
    </aside>
  );
}
