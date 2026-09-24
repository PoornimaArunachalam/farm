import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
  Tag,
  Flag,
} from "lucide-react";
import { useQuery, useMutation } from "../../context/ConvexClientContext";
import { useAuth } from "../../hooks/useAuth";
import DemandCard from "../../components/DemandCard";
import MakeOfferModal from "../../components/MakeOfferModal";
import ReportModal from "../../components/ReportModal";

export default function CompanyDetails() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [isOfferOpen, setIsOfferOpen] = useState(false);

  const company = useQuery("companies:getById", { companyId });
  const getOrCreateConversation = useMutation("conversations:getOrCreate");

  if (!company) {
    return <div className="p-8 text-center text-slate-500">Loading company profile...</div>;
  }

  const handleStartChat = async () => {
    try {
      const convId = await getOrCreateConversation({
        token,
        partnerId: company.userId,
      });
      navigate("/farmer/messages", { state: { activeConvId: convId } });
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
          title="Report Company"
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <img
              src={company.logo}
              alt={company.companyName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {company.companyName}
                </h1>
                <ShieldCheck className="w-5 h-5 text-agri-600" title="Verified Buyer" />
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {company.address ? `${company.address}, ` : ""}
                {company.district}, {company.state}
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 text-xs font-bold">
                <Building2 className="w-3.5 h-3.5 text-amber-700" />
                <span>{company.companyType}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartChat}
            className="px-6 py-3 rounded-2xl bg-agri-600 hover:bg-agri-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-agri-600/30 transition flex items-center justify-center gap-2 shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Direct Message</span>
          </button>
        </div>

        <div className="mt-6 grid sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block font-medium">Business Contact</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {company.phone}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block font-medium">Procurement Email</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-1 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {company.email}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block font-medium">Official Portal</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-1 truncate">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              {company.website || "Verified on AgriConnect"}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            About Company & Procurement Policy
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {company.description}
          </p>
        </div>
      </div>

      {/* Company's Active Demands */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Active Demands by {company.companyName} ({company.demands?.length || 0})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Current crop requirements available for direct supply offers.
          </p>
        </div>

        {company.demands?.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
            No active crop demands published right now by this company.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {company.demands?.map((demand) => (
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

      {/* Offer Modal */}
      {isOfferOpen && (
        <MakeOfferModal
          isOpen={isOfferOpen}
          onClose={() => {
            setIsOfferOpen(false);
            setSelectedDemand(null);
          }}
          demandContext={selectedDemand}
        />
      )}

      {/* Report Modal */}
      {isReportOpen && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          targetType="company"
          targetId={company._id}
          targetTitle={company.companyName}
        />
      )}
    </div>
  );
}
