import React from "react";
import { MapPin, Calendar, CheckCircle2, MessageSquare, ArrowRight, TrendingUp } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMutation } from "../context/ConvexClientContext";

export default function CropCard({ crop, onMakeOffer, showActions = true }) {
  const { user, token, role } = useAuth();
  const navigate = useNavigate();
  const getOrCreateConversation = useMutation("conversations:getOrCreate");

  const handleMessageClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      navigate("/login");
      return;
    }
    if (crop.farmerId === user?._id) {
      alert("This is your own listed crop.");
      return;
    }

    try {
      const convId = await getOrCreateConversation({
        token,
        partnerId: crop.farmerId,
      });
      navigate(role === "company" ? "/company/messages" : "/farmer/messages", {
        state: { activeConvId: convId, cropContext: crop },
      });
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to initiate chat");
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-agri-300 shadow-sm hover:shadow-premium transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image & Badges Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={
            crop.image ||
            "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600"
          }
          alt={crop.cropName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {/* Quality & Status Tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 backdrop-blur-md shadow-sm">
            {crop.quality || "Grade A"}
          </span>
          <StatusBadge status={crop.status} size="sm" />
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <div>
            <p className="text-xs font-medium text-slate-200">Expected Price</p>
            <p className="text-2xl font-extrabold tracking-tight">
              ₹{crop.expectedPrice}
              <span className="text-xs font-normal text-slate-200 ml-1">
                /{crop.priceUnit || "kg"}
              </span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium bg-agri-600/90 text-white px-2.5 py-1 rounded-lg backdrop-blur-md">
              {crop.quantity.toLocaleString()} {crop.unit}
            </span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-agri-700 transition">
                {crop.cropName}
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Variety: <span className="text-slate-700">{crop.variety || "Standard"}</span>
              </p>
            </div>
          </div>

          <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-agri-600 shrink-0" />
              <span className="truncate">
                {crop.location ? `${crop.location}, ` : ""}
                {crop.district}, {crop.state}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Harvest: {crop.harvestDate || "Ready for pickup"}</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <span className="text-slate-400">Farmer:</span>
              <span className="font-semibold text-slate-800">{crop.farmerName}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
            {role === "company" ? (
              <>
                <button
                  type="button"
                  onClick={() => onMakeOffer && onMakeOffer(crop)}
                  className="flex-1 py-2 px-3 rounded-xl bg-agri-600 hover:bg-agri-700 text-white text-xs font-bold shadow-sm shadow-agri-600/20 transition flex items-center justify-center gap-1.5"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Make Offer
                </button>
                <button
                  type="button"
                  onClick={handleMessageClick}
                  className="p-2 rounded-xl border border-slate-200 hover:border-agri-400 text-slate-700 hover:text-agri-700 hover:bg-agri-50/50 transition"
                  title="Chat with Farmer"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link
                to={`/farmer/crops/${crop._id}`}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:border-agri-400 text-slate-700 hover:text-agri-700 text-xs font-semibold text-center transition flex items-center justify-center gap-1"
              >
                <span>View Crop Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
