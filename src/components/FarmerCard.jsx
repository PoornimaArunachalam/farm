import React from "react";
import { MapPin, Sprout, MessageSquare, ArrowRight, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMutation } from "../context/ConvexClientContext";

export default function FarmerCard({ farmer }) {
  const { user, token, role } = useAuth();
  const navigate = useNavigate();
  const getOrCreateConversation = useMutation("conversations:getOrCreate");

  const handleMessage = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (farmer.userId === user?._id) {
      alert("This is your own profile.");
      return;
    }
    try {
      const convId = await getOrCreateConversation({
        token,
        partnerId: farmer.userId,
      });
      navigate(role === "company" ? "/company/messages" : "/farmer/messages", {
        state: { activeConvId: convId },
      });
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to message farmer");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-agri-300 p-5 shadow-sm hover:shadow-premium transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-start gap-3.5">
          <img
            src={
              farmer.profileImage ||
              "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200"
            }
            alt={farmer.fullName}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-agri-100 shadow-sm shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {farmer.fullName}
              </h3>
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" title="Verified Farmer" />
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {farmer.village ? `${farmer.village}, ` : ""}
              {farmer.district}, {farmer.state}
            </p>
            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-semibold">
              <Sprout className="w-3 h-3 text-emerald-600" />
              <span>{farmer.farmSize} {farmer.farmSizeUnit || "Acres"} Land</span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {farmer.description || "Passionate farmer cultivating fresh organic and commercial crops."}
        </p>

        {/* Crops Preview */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Available Crops ({farmer.crops?.length || 0})
          </span>
          {farmer.crops && farmer.crops.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {farmer.crops.slice(0, 3).map((crop) => (
                <span
                  key={crop._id}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200 flex items-center gap-1"
                >
                  <span className="font-semibold text-agri-800">{crop.cropName}</span>
                  <span className="text-[11px] text-slate-500">
                    ({crop.quantity} {crop.unit})
                  </span>
                </span>
              ))}
              {farmer.crops.length > 3 && (
                <span className="px-2 py-1 rounded-lg bg-slate-50 text-slate-500 text-xs font-medium">
                  +{farmer.crops.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No crops currently listed</p>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center gap-2">
        <Link
          to={`/company/farmers/${farmer._id}`}
          className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:border-agri-400 text-slate-700 hover:text-agri-700 text-xs font-semibold text-center transition flex items-center justify-center gap-1"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <button
          type="button"
          onClick={handleMessage}
          className="p-2 rounded-xl bg-agri-600 hover:bg-agri-700 text-white shadow-sm transition"
          title="Direct Message"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
