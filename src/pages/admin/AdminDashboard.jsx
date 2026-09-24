import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  Sprout,
  TrendingUp,
  FileCheck2,
  Flag,
  MessageSquare,
  ShieldCheck,
  Search,
  Download,
  Eye,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useQuery, useMutation } from "../../context/ConvexClientContext";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("farmers"); // "farmers" | "companies"
  const [searchTerm, setSearchTerm] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [inspectingEntity, setInspectingEntity] = useState(null); // Farmer or Company detail modal

  const stats = useQuery("admin:getStats", { token });
  const allUsers = useQuery("admin:getAllUsers", { token }) || [];
  const allCrops = useQuery("admin:getAllCrops", { token }) || [];
  const allDemands = useQuery("admin:getAllDemands", { token }) || [];
  const allDeals = useQuery("deals:getMyDeals", { token }) || [];
  const toggleUserStatus = useMutation("admin:toggleUserStatus");

  // Separate Farmer & Company records and enrich with their live crops/demands
  const farmers = allUsers
    .filter((u) => u.role === "farmer")
    .map((u) => {
      const userCrops = allCrops.filter((c) => c.farmerId === u._id);
      const totalAvailableQty = userCrops
        .filter((c) => c.status === "available")
        .reduce((acc, c) => acc + Number(c.quantity || 0), 0);
      const userDeals = allDeals.filter((d) => d.farmerId === u._id);
      return {
        ...u,
        crops: userCrops,
        totalAvailableQty,
        deals: userDeals,
      };
    });

  const companies = allUsers
    .filter((u) => u.role === "company")
    .map((u) => {
      const userDemands = allDemands.filter((d) => d.companyId === u._id);
      const activeDemandsCount = userDemands.filter((d) => d.status === "active").length;
      const userDeals = allDeals.filter((d) => d.companyId === u._id);
      return {
        ...u,
        demands: userDemands,
        activeDemandsCount,
        deals: userDeals,
      };
    });

  // Filtered lists
  const filteredFarmers = farmers.filter((f) => {
    const name = f.profile?.fullName || "";
    const email = f.email || "";
    const district = f.profile?.district || "";
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = districtFilter === "all" || district.toLowerCase() === districtFilter.toLowerCase();
    return matchesSearch && matchesDistrict;
  });

  const filteredCompanies = companies.filter((c) => {
    const name = c.profile?.companyName || "";
    const email = c.email || "";
    const type = c.profile?.companyType || "";
    const district = c.profile?.district || "";
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = districtFilter === "all" || district.toLowerCase() === districtFilter.toLowerCase();
    return matchesSearch && matchesDistrict;
  });

  const handleToggleStatus = async (userId) => {
    try {
      await toggleUserStatus({ token, userId });
    } catch (e) {
      alert(e.message || "Failed to update status");
    }
  };

  const exportCSV = (type) => {
    let dataToExport = [];
    let filename = "";

    if (type === "farmers") {
      filename = "agriconnect_registered_farmers";
      dataToExport = farmers.map((f) => ({
        ID: f._id,
        FullName: f.profile?.fullName || "Farmer",
        Email: f.email,
        Phone: f.phone,
        Village: f.profile?.village || "",
        District: f.profile?.district || "",
        State: f.profile?.state || "",
        FarmSize: `${f.profile?.farmSize || 0} ${f.profile?.farmSizeUnit || "Acres"}`,
        ListedCropsCount: f.crops?.length || 0,
        AvailableStockKg: f.totalAvailableQty || 0,
        Status: f.isActive ? "Active" : "Deactivated",
      }));
    } else if (type === "companies") {
      filename = "agriconnect_registered_companies";
      dataToExport = companies.map((c) => ({
        ID: c._id,
        CompanyName: c.profile?.companyName || "Company",
        Type: c.profile?.companyType || "",
        Email: c.email,
        Phone: c.phone,
        Address: c.profile?.address || "",
        District: c.profile?.district || "",
        State: c.profile?.state || "",
        ActiveDemandsCount: c.activeDemandsCount || 0,
        Status: c.isActive ? "Active" : "Deactivated",
      }));
    }

    if (dataToExport.length === 0) return;
    const headers = Object.keys(dataToExport[0]).join(",");
    const rows = dataToExport.map((obj) =>
      Object.values(obj)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Admin Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-xs font-bold mb-3 border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Master Governance Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            Live overview of all registered farmers, corporate buyers, active crop inventory, procurement demands, and closed trade agreements.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => exportCSV(activeTab)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export {activeTab === "farmers" ? "Farmers" : "Companies"} CSV</span>
          </button>
          <Link
            to="/admin/reports"
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
          >
            <Flag className="w-4 h-4" />
            <span>Reports ({stats?.pendingReports || 0})</span>
          </Link>
        </div>
      </div>

      {/* Convex Cloud Connection Status Panel */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700 text-white shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold tracking-wide uppercase text-slate-300">
                Convex Cloud Database
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE & SYNCED
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1 font-mono">
              <span className="flex items-center gap-1">
                <span className="text-slate-500">Cloud URL:</span>
                <a
                  href="https://mellow-toad-933.convex.cloud"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>https://mellow-toad-933.convex.cloud</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-slate-500">Site URL:</span>
                <a
                  href="https://mellow-toad-933.convex.site"
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-400 hover:underline flex items-center gap-1"
                >
                  <span>https://mellow-toad-933.convex.site</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://dashboard.convex.dev"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <span>Convex Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Farmers</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">{stats?.totalFarmers || 0}</span>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Companies</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">{stats?.totalCompanies || 0}</span>
            <Building2 className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Crops</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">{stats?.activeCrops || 0}</span>
            <Sprout className="w-5 h-5 text-agri-600" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Demands</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">{stats?.activeDemands || 0}</span>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Closed Deals</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-700">{stats?.totalDeals || 0}</span>
            <FileCheck2 className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trade Volume</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900">
              ₹{(stats?.totalTradeValue || 0).toLocaleString()}
            </span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Main Section: Complete Farmer & Company Explorer */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Tab & Search Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("farmers");
                setSearchTerm("");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "farmers"
                  ? "bg-agri-600 text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>All Registered Farmers ({farmers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("companies");
                setSearchTerm("");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "companies"
                  ? "bg-agri-600 text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>All Registered Companies ({companies.length})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${activeTab === "farmers" ? "farmer name, crop, email..." : "company name, type, email..."}`}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>

            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
            >
              <option value="all">All Districts</option>
              <option value="Virudhunagar">Virudhunagar</option>
              <option value="Madurai">Madurai</option>
              <option value="Thoothukudi">Thoothukudi</option>
              <option value="Tenkasi">Tenkasi</option>
            </select>
          </div>
        </div>

        {/* Tab 1: Farmers Detailed View */}
        {activeTab === "farmers" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Farmer Profile</th>
                  <th className="py-3.5 px-4">Phone / Contact</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Landholding</th>
                  <th className="py-3.5 px-4">Active Listed Crops</th>
                  <th className="py-3.5 px-4">Total Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFarmers.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            f.profile?.profileImage ||
                            "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=100"
                          }
                          alt={f.profile?.fullName}
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            {f.profile?.fullName || "Farmer"}
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          </p>
                          <p className="text-[11px] text-slate-400">{f.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{f.phone}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {f.profile?.village ? `${f.profile.village}, ` : ""}
                      {f.profile?.district || "-"}, {f.profile?.state || "-"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {f.profile?.farmSize || "-"} {f.profile?.farmSizeUnit || "Acres"}
                    </td>
                    <td className="py-3.5 px-4">
                      {f.crops && f.crops.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {f.crops.slice(0, 2).map((crop) => (
                            <span
                              key={crop._id}
                              className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold text-[11px] border border-emerald-200"
                            >
                              {crop.cropName} ({crop.quantity} {crop.unit} @ ₹{crop.expectedPrice})
                            </span>
                          ))}
                          {f.crops.length > 2 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">
                              +{f.crops.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No crops listed</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-800">
                      {f.totalAvailableQty.toLocaleString()} kg
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          f.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {f.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setInspectingEntity({ type: "farmer", data: f })}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(f._id)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition shadow-sm ${
                            f.isActive
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          }`}
                        >
                          {f.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Companies Detailed View */}
        {activeTab === "companies" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Company Entity</th>
                  <th className="py-3.5 px-4">Business Category</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4">Plant Location</th>
                  <th className="py-3.5 px-4">Active Crop Demands</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompanies.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            c.profile?.logo ||
                            "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=100"
                          }
                          alt={c.profile?.companyName}
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            {c.profile?.companyName || "Company"}
                            <ShieldCheck className="w-3.5 h-3.5 text-agri-600" />
                          </p>
                          <p className="text-[11px] text-slate-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-semibold border border-amber-200">
                        {c.profile?.companyType || "Enterprise"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{c.phone}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {c.profile?.district || "-"}, {c.profile?.state || "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      {c.demands && c.demands.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {c.demands.slice(0, 2).map((dem) => (
                            <span
                              key={dem._id}
                              className="px-2 py-0.5 rounded-md bg-agri-50 text-agri-900 font-semibold text-[11px] border border-agri-200"
                            >
                              {dem.cropName} ({dem.requiredQuantity} {dem.unit} @ ₹{dem.offeredPriceMin}-₹{dem.offeredPriceMax})
                            </span>
                          ))}
                          {c.demands.length > 2 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">
                              +{c.demands.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No demands posted</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          c.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {c.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setInspectingEntity({ type: "company", data: c })}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(c._id)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition shadow-sm ${
                            c.isActive
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          }`}
                        >
                          {c.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Entity Inspection Detail Modal */}
      {inspectingEntity && (
        <Modal
          isOpen={!!inspectingEntity}
          onClose={() => setInspectingEntity(null)}
          title={`${inspectingEntity.type === "farmer" ? "Farmer" : "Company"} Detailed Audit Profile`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <img
                src={
                  inspectingEntity.type === "farmer"
                    ? inspectingEntity.data.profile?.profileImage
                    : inspectingEntity.data.profile?.logo
                }
                alt="Entity Profile"
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900">
                    {inspectingEntity.type === "farmer"
                      ? inspectingEntity.data.profile?.fullName
                      : inspectingEntity.data.profile?.companyName}
                  </h3>
                  <StatusBadge
                    status={inspectingEntity.data.isActive ? "active" : "inactive"}
                    size="sm"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  User ID: <code className="font-mono bg-white px-1 py-0.5 rounded border">{inspectingEntity.data._id}</code>
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {inspectingEntity.data.phone}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {inspectingEntity.data.email}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {inspectingEntity.data.profile?.district}, {inspectingEntity.data.profile?.state}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {inspectingEntity.data.profile?.description && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Bio / Business Overview
                </span>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {inspectingEntity.data.profile.description}
                </p>
              </div>
            )}

            {/* Entity Listings */}
            {inspectingEntity.type === "farmer" ? (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  All Listed Crops ({inspectingEntity.data.crops?.length || 0})
                </span>
                {inspectingEntity.data.crops?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No crops currently listed.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {inspectingEntity.data.crops.map((c) => (
                      <div
                        key={c._id}
                        className="p-3 rounded-xl border border-slate-100 bg-white flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{c.cropName}</span>
                          <span className="text-slate-400 ml-1">({c.variety || "Standard"})</span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Harvest: {c.harvestDate} • {c.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-emerald-600 block">
                            ₹{c.expectedPrice}/{c.priceUnit}
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            {c.quantity} {c.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  All Published Demands ({inspectingEntity.data.demands?.length || 0})
                </span>
                {inspectingEntity.data.demands?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No demands posted.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {inspectingEntity.data.demands.map((d) => (
                      <div
                        key={d._id}
                        className="p-3 rounded-xl border border-slate-100 bg-white flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{d.cropName}</span>
                          <span className="text-slate-400 ml-1">({d.variety})</span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Required: {d.requiredDate} • {d.deliveryLocation}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-emerald-600 block">
                            ₹{d.offeredPriceMin}-₹{d.offeredPriceMax}/{d.priceUnit}
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            {d.requiredQuantity} {d.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Confirmed Deals */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Trade Agreements ({inspectingEntity.data.deals?.length || 0})
              </span>
              {inspectingEntity.data.deals?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No closed deals on record.</p>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {inspectingEntity.data.deals.map((deal) => (
                    <div
                      key={deal._id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{deal.cropName}</span>
                        <span className="text-[11px] text-slate-500 ml-1">
                          #{deal._id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="font-extrabold text-emerald-700">
                          ₹{deal.totalAmount.toLocaleString()}
                        </span>
                        <StatusBadge status={deal.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleToggleStatus(inspectingEntity.data._id);
                  setInspectingEntity(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  inspectingEntity.data.isActive
                    ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                {inspectingEntity.data.isActive ? "Deactivate Account" : "Activate Account"}
              </button>
              <button
                type="button"
                onClick={() => setInspectingEntity(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
