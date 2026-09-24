import React from "react";
import { Building2, MapPin, Calendar, ArrowRight, MessageSquare, Tag, CheckCircle } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMutation } from "../context/ConvexClientContext";

export default function DemandCard({ demand, onMakeOffer, showActions = true }) {
  const { user, token, role } = useAuth();
  const navigate = useNavigate();
  const getOrCreateConversation = useMutation("conversations:getOrCreate");

  const handleMessageCompany = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      navigate("/login");
      return;
    }
    if (demand.companyId === user?._id) {
      alert("This is your company's own demand.");
      return;
    }

    try {
      const convId = await getOrCreateConversation({
        token,
        partnerId: demand.companyId,
      });
      navigate(role === "farmer" ? "/farmer/messages" : "/company/messages", {
        state: { activeConvId: convId, demandContext: demand },
      });
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to start conversation");
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-agri-300 shadow-sm hover:shadow-premium transition-all duration-300 flex flex-col p-5 justify-between relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-agri-50 rounded-bl-full -z-0 opacity-70 group-hover:scale-110 transition-transform"></div>

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-agri-100/70 border border-agri-200 flex items-center justify-center text-agri-800 font-bold text-base shrink-0">
              {demand.cropName ? demand.cropName.charAt(0) : "🌾"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-agri-700 transition">
                {demand.cropName}
              </h3>
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {demand.companyName}
              </p>
            </div>
          </div>
          <StatusBadge status={demand.status} size="sm" />
        </div>

        {/* Requirements & Quantity */}
        <div className="mt-4 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Required Quantity
            </span>
            <span className="text-base font-extrabold text-slate-800">
              {demand.requiredQuantity.toLocaleString()} {demand.unit}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Offered Price
            </span>
            <span className="text-base font-extrabold text-emerald-600">
              ₹{demand.offeredPriceMin} – ₹{demand.offeredPriceMax}
              <span className="text-xs font-normal text-slate-500 ml-0.5">
                /{demand.priceUnit || "kg"}
              </span>
            </span>
          </div>
        </div>

        {/* Variety & Requirements */}
        <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-agri-600 shrink-0" />
            <span className="truncate">
              Variety: <strong className="text-slate-800">{demand.variety || "Any standard"}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {demand.deliveryLocation ? `${demand.deliveryLocation}, ` : ""}
              {demand.district}, {demand.state}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Required By: <strong className="text-slate-800">{demand.requiredDate || "Immediate"}</strong></span>
          </div>
          {demand.qualityRequirements && (
            <p className="text-[11px] text-slate-500 line-clamp-1 italic pt-1">
              Note: {demand.qualityRequirements}
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      {showActions && (
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center gap-2 relative z-10">
          {role === "farmer" ? (
            <>
              <button
                type="button"
                onClick={() => onMakeOffer && onMakeOffer(demand)}
                className="flex-1 py-2 px-3 rounded-xl bg-agri-600 hover:bg-agri-700 text-white text-xs font-bold shadow-sm shadow-agri-600/20 transition flex items-center justify-center gap-1.5"
              >
                <span>Supply This Demand</span>
              </button>
              <button
                type="button"
                onClick={handleMessageCompany}
                className="p-2 rounded-xl border border-slate-200 hover:border-agri-400 text-slate-700 hover:text-agri-700 hover:bg-agri-50/50 transition"
                title="Message Company"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link
              to={`/company/demands/${demand._id}`}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:border-agri-400 text-slate-700 hover:text-agri-700 text-xs font-semibold text-center transition flex items-center justify-center gap-1"
            >
              <span>View Demand Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
