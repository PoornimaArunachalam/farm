import React, { useState } from "react";
import { TrendingUp, SlidersHorizontal, MapPin, Search } from "lucide-react";
import { useQuery } from "../../context/ConvexClientContext";
import DemandCard from "../../components/DemandCard";
import MakeOfferModal from "../../components/MakeOfferModal";
import EmptyState from "../../components/EmptyState";

export default function CompanyDemands() {
  const [searchTerm, setSearchTerm] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");

  const [selectedDemand, setSelectedDemand] = useState(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const demands =
    useQuery("demands:getAllActive", {
      cropName: searchTerm,
      district: districtFilter,
      state: stateFilter,
      minPrice: minPrice ? Number(minPrice) : undefined,
    }) || [];

  const handleMakeOffer = (demand) => {
    setSelectedDemand(demand);
    setIsOfferModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <h1 className="text-2xl font-extrabold text-slate-900">Live Company Crop Demands</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Explore real-time crop procurement requirements posted by verified food processors, exporters, and retailers.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search demands by crop name (e.g. Tomato, Onion, Chilli)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-agri-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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
              <option value="Tirunelveli">Tirunelveli</option>
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
              <option value="Andhra Pradesh">Andhra Pradesh</option>
            </select>

            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min ₹ Price"
              className="w-28 px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
            />
          </div>
        </div>
      </div>

      {/* Demands Grid */}
      {demands.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No demands match your filters"
          description="Try broadening your search term or clearing the district filter."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm("");
            setDistrictFilter("all");
            setStateFilter("all");
            setMinPrice("");
          }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {demands.map((demand) => (
            <DemandCard
              key={demand._id}
              demand={demand}
              onMakeOffer={handleMakeOffer}
            />
          ))}
        </div>
      )}

      {/* Offer Modal */}
      {isOfferModalOpen && (
        <MakeOfferModal
          isOpen={isOfferModalOpen}
          onClose={() => {
            setIsOfferModalOpen(false);
            setSelectedDemand(null);
          }}
          demandContext={selectedDemand}
        />
      )}
    </div>
  );
}
