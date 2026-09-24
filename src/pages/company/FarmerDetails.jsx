import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Sprout,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
  Flag,
} from "lucide-react";
import { useQuery, useMutation } from "../../context/ConvexClientContext";
import { useAuth } from "../../hooks/useAuth";
import CropCard from "../../components/CropCard";
import MakeOfferModal from "../../components/MakeOfferModal";
import ReportModal from "../../components/ReportModal";

export default function FarmerDetails() {
  const { farmerId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [isOfferOpen, setIsOfferOpen] = useState(false);

  const farmer = useQuery("farmers:getById", { farmerId });
  const getOrCreateConversation = useMutation("conversations:getOrCreate");

  if (!farmer) {
    return <div className="p-8 text-center text-slate-500">Loading farmer profile...</div>;
  }

  const handleStartChat = async () => {
    try {
      const convId = await getOrCreateConversation({
        token,
        partnerId: farmer.userId,
      });
      navigate("/company/messages", { state: { activeConvId: convId } });
    } catch (e) {
      alert(e.message || "Failed to initiate chat");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={() => setIsReportOpen(true)}
          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
          title="Report Farmer"
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <img
              src={
                farmer.profileImage ||
                "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200"
              }
              alt={farmer.fullName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover border-2 border-agri-200 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {farmer.fullName}
                </h1>
                <ShieldCheck className="w-5 h-5 text-emerald-600" title="Verified Farmer" />
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {farmer.village ? `${farmer.village}, ` : ""}
                {farmer.district}, {farmer.state}
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-900 text-xs font-bold">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                <span>{farmer.farmSize} {farmer.farmSizeUnit || "Acres"} Land</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartChat}
            className="px-6 py-3 rounded-2xl bg-agri-600 hover:bg-agri-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-agri-600/30 transition flex items-center justify-center gap-2 shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat & Negotiate</span>
          </button>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block font-medium">Contact Phone</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {farmer.phone}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block font-medium">Email</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-1 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {farmer.email}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Farmer Bio & Soil Management
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {farmer.description || "Passionate local farmer cultivating organic and high-grade crops."}
          </p>
        </div>
      </div>

      {/* Farmer's Available Crops */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Available Crops by {farmer.fullName} ({farmer.crops?.length || 0})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Current available inventory ready for purchase proposals.
          </p>
        </div>

        {farmer.crops?.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
            No crops currently listed for sale by this farmer.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {farmer.crops?.map((crop) => (
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
          targetUser={{ userId: farmer.userId }}
        />
      )}

      {/* Report Modal */}
      {isReportOpen && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          targetType="farmer"
          targetId={farmer._id}
          targetTitle={farmer.fullName}
        />
      )}
    </div>
  );
}
