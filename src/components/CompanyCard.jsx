import React from "react";
import { Building2, MapPin, MessageSquare, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMutation } from "../context/ConvexClientContext";

export default function CompanyCard({ company }) {
  const { user, token, role } = useAuth();
  const navigate = useNavigate();
  const getOrCreateConversation = useMutation("conversations:getOrCreate");

  const handleMessage = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (company.userId === user?._id) {
      alert("This is your company's profile.");
      return;
    }
    try {
      const convId = await getOrCreateConversation({
        token,
        partnerId: company.userId,
      });
      navigate(role === "farmer" ? "/farmer/messages" : "/company/messages", {
        state: { activeConvId: convId },
      });
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to message company");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-agri-300 p-5 shadow-sm hover:shadow-premium transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-start gap-3.5">
          <img
            src={
              company.logo ||
              "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200"
            }
            alt={company.companyName}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-sm shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {company.companyName}
              </h3>
              <ShieldCheck className="w-4 h-4 text-agri-600 shrink-0" title="Verified Buyer" />
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {company.district}, {company.state}
            </p>
            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
              <Building2 className="w-3 h-3 text-slate-500" />
              <span>{company.companyType || "Agro Enterprise"}</span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {company.description || "Active agriculture procurement company sourcing directly from farmers."}
        </p>

        {/* Active Demands Preview */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Active Demands ({company.demands?.length || 0})
          </span>
          {company.demands && company.demands.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {company.demands.slice(0, 3).map((dem) => (
                <span
                  key={dem._id}
                  className="px-2.5 py-1 rounded-lg bg-agri-50 text-agri-900 text-xs font-medium border border-agri-200/60 flex items-center gap-1"
                >
                  <Tag className="w-3 h-3 text-agri-600" />
                  <span className="font-semibold">{dem.cropName}</span>
                  <span className="text-[11px] text-slate-600">
                    ({dem.requiredQuantity} {dem.unit})
                  </span>
                </span>
              ))}
              {company.demands.length > 3 && (
                <span className="px-2 py-1 rounded-lg bg-slate-50 text-slate-500 text-xs font-medium">
                  +{company.demands.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No active crop demands published</p>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center gap-2">
        <Link
          to={`/farmer/companies/${company._id}`}
          className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:border-agri-400 text-slate-700 hover:text-agri-700 text-xs font-semibold text-center transition flex items-center justify-center gap-1"
        >
          <span>View Company & Demands</span>
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
