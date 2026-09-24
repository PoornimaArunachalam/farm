import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Calendar,
  ArrowLeft,
  Edit3,
  TrendingUp,
  Sprout,
  ShieldCheck,
  Flag,
} from "lucide-react";
import { useQuery } from "../../context/ConvexClientContext";
import StatusBadge from "../../components/StatusBadge";
import CropCard from "../../components/CropCard";
import ReportModal from "../../components/ReportModal";
import MakeOfferModal from "../../components/MakeOfferModal";

export default function DemandDetails() {
  const { demandId } = useParams();
  const navigate = useNavigate();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [isOfferOpen, setIsOfferOpen] = useState(false);

  const demand = useQuery("demands:getById", { demandId });
  const allCrops = useQuery("crops:getAllAvailable", {}) || [];

  if (!demand) {
    return <div className="p-8 text-center text-slate-500">Loading demand details...</div>;
  }

  // Find crops matching this demanded crop name
  const matchingCrops = allCrops.filter(
    (c) => c.cropName.toLowerCase() === demand.cropName.toLowerCase()
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
          <span>Back to Demands</span>
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
            to={`/company/edit-demand/${demand._id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Demand</span>
          </Link>
        </div>
      </div>

      {/* Main Demand Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-agri-700 uppercase tracking-wider">
                Crop Procurement Demand
              </span>
              <StatusBadge status={demand.status} size="sm" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">{demand.cropName}</h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Variety: <span className="text-slate-800">{demand.variety || "Standard"}</span> • By {demand.companyName}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-right shrink-0">
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
              Offered Price Bracket
            </span>
            <span className="text-2xl font-extrabold text-emerald-600">
              ₹{demand.offeredPriceMin} - ₹{demand.offeredPriceMax}
              <span className="text-xs font-normal text-slate-500 ml-0.5">/{demand.priceUnit || "kg"}</span>
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Required Volume</span>
            <span className="text-base font-extrabold text-slate-800">
              {demand.requiredQuantity.toLocaleString()} {demand.unit}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Required By</span>
            <span className="text-base font-extrabold text-slate-800">
              {demand.requiredDate}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Delivery Destination</span>
            <span className="font-semibold text-slate-800 truncate block">
              {demand.deliveryLocation ? `${demand.deliveryLocation}, ` : ""}
              {demand.district}, {demand.state}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Quality Spec</span>
            <span className="font-semibold text-slate-800 truncate block">
              {demand.qualityRequirements || "Standard Commercial"}
            </span>
          </div>
        </div>

        {demand.description && (
          <div className="mt-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Procurement Notes & Payment Terms
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {demand.description}
            </p>
          </div>
        )}
      </div>

      {/* Matching Farmer Crops Available Right Now */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Matching Farmer Harvests for {demand.cropName} ({matchingCrops.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified farmers who currently have this crop available for sale.
          </p>
        </div>

        {matchingCrops.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
            No farmer crops currently listed matching {demand.cropName}.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {matchingCrops.map((crop) => (
              <CropCard
                key={crop._id}
                crop={crop}
                onMakeOffer={(c) => {
                  setSelectedCrop(c);
                  setIsOfferOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Offer Modal */}
      {isOfferOpen && (
        <MakeOfferModal
          isOpen={isOfferOpen}
          onClose={() => {
            setIsOfferOpen(false);
            setSelectedCrop(null);
          }}
          cropContext={selectedCrop}
          demandContext={demand}
        />
      )}

      {/* Report Modal */}
      {isReportOpen && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          targetType="demand"
          targetId={demand._id}
          targetTitle={demand.cropName}
        />
      )}
    </div>
  );
}
