import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  TrendingUp,
  Sprout,
  MessageSquare,
  FileCheck2,
  PlusCircle,
  ArrowRight,
  Layers,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "../../context/ConvexClientContext";
import CropCard from "../../components/CropCard";
import DemandCard from "../../components/DemandCard";
import MakeOfferModal from "../../components/MakeOfferModal";

export default function CompanyDashboard() {
  const { profile, token } = useAuth();
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const stats = useQuery("companies:getStats", { token });
  const myDemands = useQuery("demands:getMyDemands", { token }) || [];
  const matchingCrops = useQuery("demands:getMatchingCropsForCompany", { token }) || [];
  const latestCrops = useQuery("crops:getAllAvailable", {}) || [];

  const handleMakeOffer = (crop) => {
    setSelectedCrop(crop);
    setIsOfferModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-agri-950 text-white shadow-lg shadow-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-300 text-xs font-semibold backdrop-blur-md mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Company Procurement Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {profile?.companyName || "Enterprise"} 👋
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Monitor real-time crop arrivals from verified farmers, manage your bulk procurement requirements, and close purchase agreements.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            to="/company/add-demand"
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Crop Demand</span>
          </Link>
          <Link
            to="/company/find-farmers"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Find Farmers</span>
          </Link>
        </div>
      </div>

      {/* Key Metrics Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Demands</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-800">{stats?.activeDemands || 0}</span>
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available Crops</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-800">{stats?.availableCropsCount || 0}</span>
            <Sprout className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Offers</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-purple-700">{stats?.pendingOffers || 0}</span>
            <Layers className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Confirmed Deals</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-700">{stats?.activeDeals || 0}</span>
            <FileCheck2 className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unread Messages</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-blue-700">{stats?.unreadMessagesCount || 0}</span>
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Recommended Crops Matching Company Demands */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-lg font-bold text-slate-900">Matching Farmer Crops For Your Demands</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Available harvest lots from local growers matching your procurement specs
            </p>
          </div>
          <Link
            to="/company/farmers"
            className="text-xs font-bold text-agri-700 hover:text-agri-800 flex items-center gap-1 transition"
          >
            <span>View All Crops</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {matchingCrops.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
            No matching farmer crops listed currently.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {matchingCrops.slice(0, 3).map((crop) => (
              <CropCard key={crop._id} crop={crop} onMakeOffer={handleMakeOffer} />
            ))}
          </div>
        )}
      </div>

      {/* Company's Published Demands */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Active Crop Demands</h2>
            <p className="text-xs text-slate-500 mt-0.5">Live procurement requirements visible to farmers</p>
          </div>
          <Link
            to="/company/my-demands"
            className="text-xs font-bold text-agri-700 hover:text-agri-800 flex items-center gap-1 transition"
          >
            <span>Manage Demands</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {myDemands.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
            <TrendingUp className="w-10 h-10 text-amber-500 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No Active Demands Posted</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Post your required crop quantities and offered price brackets to receive direct supply offers from farmers.
            </p>
            <Link
              to="/company/add-demand"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-agri-600 text-white font-bold text-xs shadow-sm hover:bg-agri-700 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Your First Demand</span>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {myDemands.slice(0, 3).map((demand) => (
              <DemandCard key={demand._id} demand={demand} />
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
            setSelectedCrop(null);
          }}
          cropContext={selectedCrop}
        />
      )}
    </div>
  );
}
