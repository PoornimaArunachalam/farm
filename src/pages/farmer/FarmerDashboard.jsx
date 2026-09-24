import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sprout,
  TrendingUp,
  MessageSquare,
  FileCheck2,
  PlusCircle,
  ArrowRight,
  Package,
  Layers,
  Building2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "../../context/ConvexClientContext";
import CropCard from "../../components/CropCard";
import DemandCard from "../../components/DemandCard";
import MakeOfferModal from "../../components/MakeOfferModal";

export default function FarmerDashboard() {
  const { profile, token } = useAuth();
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const stats = useQuery("farmers:getStats", { token });
  const myCrops = useQuery("crops:getMyCrops", { token }) || [];
  const recommendedDemands = useQuery("demands:getMatchingDemandsForFarmer", { token }) || [];
  const latestDemands = useQuery("demands:getAllActive", {}) || [];

  const handleSupplyDemand = (demand) => {
    setSelectedDemand(demand);
    setIsOfferModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-agri-800 via-agri-700 to-emerald-700 text-white shadow-lg shadow-agri-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold backdrop-blur-md mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Farmer Workspace Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {profile?.fullName || "Farmer"} 👋
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Here is your live agriculture marketplace activity. See matching company demands, track your crops, and negotiate directly.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            to="/farmer/add-crop"
            className="px-5 py-3 rounded-2xl bg-white text-agri-900 hover:bg-emerald-50 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-agri-700" />
            <span>List New Crop</span>
          </Link>
          <Link
            to="/farmer/demands"
            className="px-5 py-3 rounded-2xl bg-agri-900/40 hover:bg-agri-900/60 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Browse Demands</span>
          </Link>
        </div>
      </div>

      {/* Key Metrics Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">My Crops</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-800">{stats?.totalCrops || 0}</span>
            <Sprout className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available Stock</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-800">
              {(stats?.totalQuantity || 0).toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-400">kg</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Company Demands</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-800">{stats?.activeDemandsCount || 0}</span>
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trade Offers</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-purple-700">{stats?.pendingOffers || 0}</span>
            <Layers className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Deals</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-700">{stats?.activeDeals || 0}</span>
            <FileCheck2 className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unread Messages</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-blue-700">{stats?.unreadMessagesCount || 0}</span>
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Recommended Demands for this Farmer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-lg font-bold text-slate-900">Recommended Demands Matching Your Crops</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Companies actively looking to purchase crops you cultivate
            </p>
          </div>
          <Link
            to="/farmer/demands"
            className="text-xs font-bold text-agri-700 hover:text-agri-800 flex items-center gap-1 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendedDemands.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
            No matching demands found right now. Check back as companies post new requirements.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedDemands.slice(0, 3).map((demand) => (
              <DemandCard key={demand._id} demand={demand} onMakeOffer={handleSupplyDemand} />
            ))}
          </div>
        )}
      </div>

      {/* My Current Crops Listings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Listed Crops</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your produce visible to verified company buyers</p>
          </div>
          <Link
            to="/farmer/my-crops"
            className="text-xs font-bold text-agri-700 hover:text-agri-800 flex items-center gap-1 transition"
          >
            <span>Manage My Crops</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {myCrops.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
            <Sprout className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">You haven't listed any crops yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your current harvest with quantity and expected price so food processors and buyers can make offers.
            </p>
            <Link
              to="/farmer/add-crop"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-agri-600 text-white font-bold text-xs shadow-sm hover:bg-agri-700 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Your First Crop</span>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {myCrops.slice(0, 3).map((crop) => (
              <CropCard key={crop._id} crop={crop} />
            ))}
          </div>
        )}
      </div>

      {/* Make Offer Modal */}
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
