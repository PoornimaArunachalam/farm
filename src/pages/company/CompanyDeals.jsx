import React, { useState } from "react";
import {
  FileCheck2,
  TrendingUp,
  Clock,
  User,
  CheckCircle2,
  Truck,
  Sparkles,
  Layers,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useQuery, useMutation } from "../../context/ConvexClientContext";
import StatusBadge from "../../components/StatusBadge";
import OfferCard from "../../components/OfferCard";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";

export default function CompanyDeals() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState("deals"); // "deals" or "offers"
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [newStatus, setNewStatus] = useState("in_progress");
  const [dealNotes, setDealNotes] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  const deals = useQuery("deals:getMyDeals", { token }) || [];
  const offers = useQuery("offers:getMyOffers", { token }) || [];
  const updateDealStatus = useMutation("deals:updateStatus");

  const totalValue = deals
    .filter((d) => d.status !== "cancelled")
    .reduce((acc, d) => acc + Number(d.totalAmount || 0), 0);

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDeal) return;
    try {
      await updateDealStatus({
        token,
        dealId: selectedDeal._id,
        status: newStatus,
        notes: dealNotes,
        deliveryDate,
      });
      setSelectedDeal(null);
    } catch (err) {
      alert(err.message || "Failed to update status");
    }
  };

  const openStatusModal = (deal) => {
    setSelectedDeal(deal);
    setNewStatus(deal.status);
    setDealNotes(deal.notes || "");
    setDeliveryDate(deal.deliveryDate || "");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Procurement Deals & Offers</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Confirmed trade agreements and active counter-offer negotiations with farmer suppliers.
          </p>
        </div>

        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
            Total Confirmed Procurement Value
          </span>
          <span className="text-xl font-extrabold text-emerald-700">
            ₹{totalValue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("deals")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "deals"
              ? "bg-agri-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Confirmed Deals ({deals.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("offers")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "offers"
              ? "bg-agri-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Active Trade Offers ({offers.length})</span>
        </button>
      </div>

      {/* Tab 1: Confirmed Deals */}
      {activeTab === "deals" && (
        <>
          {deals.length === 0 ? (
            <EmptyState
              icon={FileCheck2}
              title="No confirmed deals yet"
              description="When you accept an offer or a farmer accepts your trade proposal, confirmed trade agreements appear here."
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {deals.map((deal) => (
                <div
                  key={deal._id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-premium transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Deal #{deal._id.slice(-6).toUpperCase()}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900">{deal.cropName}</h3>
                      </div>
                      <StatusBadge status={deal.status} size="sm" />
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-center my-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                          Agreed Volume
                        </span>
                        <span className="text-sm font-extrabold text-slate-800">
                          {deal.agreedQuantity.toLocaleString()} {deal.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                          Total Value
                        </span>
                        <span className="text-sm font-extrabold text-emerald-600">
                          ₹{deal.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 my-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Farmer Supplier:</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {deal.farmerName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Locked Rate:</span>
                        <span className="font-semibold text-slate-800">
                          ₹{deal.agreedPrice}/{deal.unit}
                        </span>
                      </div>
                      {deal.deliveryDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Scheduled Date:</span>
                          <span className="font-semibold text-slate-800">{deal.deliveryDate}</span>
                        </div>
                      )}
                      {deal.notes && (
                        <p className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100 italic mt-2">
                          Note: {deal.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => openStatusModal(deal)}
                      className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:border-agri-400 text-slate-700 hover:text-agri-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Update Delivery / Status</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab 2: Negotiation Offers */}
      {activeTab === "offers" && (
        <>
          {offers.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No active trade offers"
              description="Make price proposals on listed farmer crops or review supplier counter offers."
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {offers.map((offer) => (
                <OfferCard key={offer._id} offer={offer} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Update Deal Status Modal */}
      {selectedDeal && (
        <Modal
          isOpen={!!selectedDeal}
          onClose={() => setSelectedDeal(null)}
          title={`Update Deal #${selectedDeal._id.slice(-6).toUpperCase()}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deal Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-semibold"
              >
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress (Transit / Weighing)</option>
                <option value="completed">Completed (Goods Accepted & Settled)</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Scheduled Delivery Date</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Notes</label>
              <textarea
                rows="3"
                value={dealNotes}
                onChange={(e) => setDealNotes(e.target.value)}
                placeholder="e.g. Weighbridge slip #4401 generated, payment queued..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDeal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-agri-600 hover:bg-agri-700 text-white text-xs font-bold shadow-sm"
              >
                Save Status
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
