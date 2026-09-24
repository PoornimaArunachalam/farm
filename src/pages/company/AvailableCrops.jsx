import React, { useState } from "react";
import { Sprout, Search, SlidersHorizontal, MapPin } from "lucide-react";
import { useQuery } from "../../context/ConvexClientContext";
import CropCard from "../../components/CropCard";
import MakeOfferModal from "../../components/MakeOfferModal";
import EmptyState from "../../components/EmptyState";

export default function AvailableCrops() {
  const [searchTerm, setSearchTerm] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [qualityFilter, setQualityFilter] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [minQty, setMinQty] = useState("");

  const [selectedCrop, setSelectedCrop] = useState(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const crops =
    useQuery("crops:getAllAvailable", {
      cropName: searchTerm,
      district: districtFilter,
      state: stateFilter,
      quality: qualityFilter,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minQuantity: minQty ? Number(minQty) : undefined,
    }) || [];

  const handleMakeOffer = (crop) => {
    setSelectedCrop(crop);
    setIsOfferModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <h1 className="text-2xl font-extrabold text-slate-900">Available Farmer Crops Marketplace</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Explore real-time harvest listings from verified regional farmers. Negotiate rates and lock deals directly.
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
              placeholder="Search crops by name or variety (e.g. Tomato, Onion, Chilli)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-agri-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={qualityFilter}
              onChange={(e) => setQualityFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
            >
              <option value="all">All Grades</option>
              <option value="Grade A">Grade A</option>
              <option value="Grade B">Grade B</option>
              <option value="Organic Certified">Organic Certified</option>
              <option value="Standard">Standard</option>
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

            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max ₹ Rate"
              className="w-28 px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
            />
          </div>
        </div>
      </div>

      {/* Crops Grid */}
      {crops.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="No crops match your filters"
          description="Try modifying search keywords or resetting price and quality filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm("");
            setDistrictFilter("all");
            setStateFilter("all");
            setQualityFilter("all");
            setMaxPrice("");
            setMinQty("");
          }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {crops.map((crop) => (
            <CropCard
              key={crop._id}
              crop={crop}
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
            setSelectedCrop(null);
          }}
          cropContext={selectedCrop}
        />
      )}
    </div>
  );
}
