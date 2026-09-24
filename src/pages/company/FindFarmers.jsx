import React, { useState } from "react";
import { Users, Search, SlidersHorizontal } from "lucide-react";
import { useQuery } from "../../context/ConvexClientContext";
import FarmerCard from "../../components/FarmerCard";
import EmptyState from "../../components/EmptyState";

export default function FindFarmers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [cropFilter, setCropFilter] = useState("all");

  const farmers =
    useQuery("farmers:search", {
      query: searchQuery,
      district: districtFilter,
      state: stateFilter,
      crop: cropFilter !== "all" ? cropFilter : undefined,
    }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Discover Verified Farmers</h1>
        <p className="text-xs text-slate-500 mt-1">
          Search local growers, browse current harvest lots, and start direct procurement discussions.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search farmers by name, village, district..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-agri-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
            >
              <option value="all">Any Crop Cultivated</option>
              <option value="Tomato">Tomato</option>
              <option value="Onion">Onion</option>
              <option value="Chilli">Chilli</option>
              <option value="Rice">Rice</option>
              <option value="Cotton">Cotton</option>
              <option value="Banana">Banana</option>
              <option value="Potato">Potato</option>
            </select>

            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
            >
              <option value="all">All Districts</option>
              <option value="Virudhunagar">Virudhunagar</option>
              <option value="Madurai">Madurai</option>
              <option value="Thoothukudi">Thoothukudi</option>
              <option value="Tenkasi">Tenkasi</option>
            </select>

            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
            >
              <option value="all">All States</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Kerala">Kerala</option>
              <option value="Karnataka">Karnataka</option>
            </select>
          </div>
        </div>
      </div>

      {/* Farmers Grid */}
      {farmers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No farmers match your filters"
          description="Try broadening your search query or selecting 'All Districts'."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery("");
            setDistrictFilter("all");
            setStateFilter("all");
            setCropFilter("all");
          }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {farmers.map((farmer) => (
            <FarmerCard key={farmer._id} farmer={farmer} />
          ))}
        </div>
      )}
    </div>
  );
}
