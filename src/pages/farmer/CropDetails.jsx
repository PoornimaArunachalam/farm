import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Sprout,
  MapPin,
  Calendar,
  ArrowLeft,
  Edit3,
  TrendingUp,
  Building2,
  ShieldCheck,
  Flag,
} from "lucide-react";
import { useQuery } from "../../context/ConvexClientContext";
import StatusBadge from "../../components/StatusBadge";
import DemandCard from "../../components/DemandCard";
import ReportModal from "../../components/ReportModal";
import MakeOfferModal from "../../components/MakeOfferModal";

export default function CropDetails() {
  const { cropId } = useParams();
  const navigate = useNavigate();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [isOfferOpen, setIsOfferOpen] = useState(false);

  const crop = useQuery("crops:getById", { cropId });
  const allDemands = useQuery("demands:getAllActive", {}) || [];

  if (!crop) {
    return <div className="p-8 text-center text-slate-500">Loading crop details...</div>;
  }

  // Find demands matching this crop
  const matchingDemands = allDemands.filter(
    (d) => d.cropName.toLowerCase() === crop.cropName.toLowerCase()
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
            title="Report Listing"
          >
            <Flag className="w-4 h-4" />
          </button>
          <Link
            to={`/farmer/edit-crop/${crop._id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Listing</span>
          </Link>
        </div>
      </div>

      {/* Main Crop Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden grid md:grid-cols-12">
        <div className="md:col-span-5 relative h-72 md:h-auto bg-slate-100">
          <img
            src={crop.image}
            alt={crop.cropName}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 backdrop-blur-md shadow-sm">
              {crop.quality}
            </span>
            <StatusBadge status={crop.status} />
          </div>
        </div>

        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-agri-700">
                  Variety: {crop.variety || "Standard"}
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 mt-0.5">
                  {crop.cropName}
                </h1>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Expected Price</span>
                <span className="text-2xl font-extrabold text-emerald-600">
                  ₹{crop.expectedPrice}
                  <span className="text-xs text-slate-500 font-normal">/{crop.priceUnit}</span>
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-600 leading-relaxed">
              {crop.description || "Fresh crop available for direct pickup or transport arrangement."}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block">Available Quantity</span>
                <span className="text-base font-extrabold text-slate-800">
                  {crop.quantity.toLocaleString()} {crop.unit}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Harvest Date</span>
                <span className="text-base font-extrabold text-slate-800">
                  {crop.harvestDate}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Location</span>
                <span className="font-semibold text-slate-800">
                  {crop.location ? `${crop.location}, ` : ""}
                  {crop.district}, {crop.state}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Farmer</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {crop.farmerName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Matching Company Demands for this Crop */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Active Company Demands for {crop.cropName} ({matchingDemands.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Companies offering to buy this specific crop. Send an offer directly.
          </p>
        </div>

        {matchingDemands.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
            No active company demands found for {crop.cropName} at this moment.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {matchingDemands.map((demand) => (
              <DemandCard
                key={demand._id}
                demand={demand}
                onMakeOffer={(dem) => {
                  setSelectedDemand(dem);
                  setIsOfferOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {isReportOpen && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          targetType="crop"
          targetId={crop._id}
          targetTitle={crop.cropName}
        />
      )}

      {/* Offer Modal */}
      {isOfferOpen && (
        <MakeOfferModal
          isOpen={isOfferOpen}
          onClose={() => {
            setIsOfferOpen(false);
            setSelectedDemand(null);
          }}
          cropContext={crop}
          demandContext={selectedDemand}
        />
      )}
    </div>
  );
}
