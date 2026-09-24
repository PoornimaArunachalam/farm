import React, { useState } from "react";
import { TrendingUp, CheckCircle, XCircle, RotateCcw, Clock, Building2, User } from "lucide-react";
import StatusBadge from "./StatusBadge";
import MakeOfferModal from "./MakeOfferModal";
import confetti from "canvas-confetti";
import { useAuth } from "../hooks/useAuth";
import { useMutation } from "../context/ConvexClientContext";

export default function OfferCard({ offer, onRefresh }) {
  const { user, token } = useAuth();
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const respondOffer = useMutation("offers:respond");

  const isReceiver = offer.receiverId === user?._id;
  const isSender = offer.senderId === user?._id;
  const isPending = offer.status === "pending" || offer.status === "countered";

  const handleAccept = async () => {
    setLoadingAction(true);
    try {
      await respondOffer({
        token,
        offerId: offer._id,
        action: "accept",
      });
      // Celebration effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to accept offer");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to decline this offer?")) return;
    setLoadingAction(true);
    try {
      await respondOffer({
        token,
        offerId: offer._id,
        action: "reject",
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to decline offer");
    } finally {
      setLoadingAction(false);
    }
  };

  const displayQuantity = offer.counterQuantity || offer.quantity;
  const displayPrice = offer.counterPrice || offer.pricePerUnit;
  const displayTotal = offer.counterTotalAmount || offer.totalAmount;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-premium transition-all duration-300">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Trade Proposal
          </span>
          <h4 className="text-base font-bold text-slate-900">{offer.cropName}</h4>
        </div>
        <StatusBadge status={offer.status} size="sm" />
      </div>

      <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 grid grid-cols-3 gap-2 text-center my-3">
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Quantity</span>
          <span className="text-sm font-extrabold text-slate-800">
            {displayQuantity.toLocaleString()} {offer.unit}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Rate</span>
          <span className="text-sm font-extrabold text-emerald-600">
            ₹{displayPrice}/{offer.unit}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Amount</span>
          <span className="text-sm font-extrabold text-agri-900">
            ₹{displayTotal.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-slate-600 my-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">From:</span>
          <span className="font-semibold text-slate-800 flex items-center gap-1">
            {offer.senderRole === "company" ? <Building2 className="w-3.5 h-3.5 text-slate-400" /> : <User className="w-3.5 h-3.5 text-slate-400" />}
            {offer.senderName} ({offer.senderRole})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">To:</span>
          <span className="font-semibold text-slate-800">{offer.receiverName}</span>
        </div>
        {offer.message && (
          <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 italic">
            "{offer.message}"
          </p>
        )}
        {offer.counterNotes && (
          <p className="text-xs text-purple-700 bg-purple-50 p-2.5 rounded-lg border border-purple-100">
            <strong>Counter Note:</strong> {offer.counterNotes}
          </p>
        )}
      </div>

      {/* Actions */}
      {isPending && isReceiver && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={handleAccept}
            disabled={loadingAction}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/30 transition flex items-center justify-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Accept Deal</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCounterModalOpen(true)}
            disabled={loadingAction}
            className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm shadow-purple-600/30 transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Counter</span>
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={loadingAction}
            className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
            title="Decline Offer"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {isPending && isSender && (
        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 font-medium">
            <Clock className="w-3.5 h-3.5" />
            Awaiting response from {offer.receiverName}
          </span>
        </div>
      )}

      {/* Counter Modal */}
      {isCounterModalOpen && (
        <MakeOfferModal
          isOpen={isCounterModalOpen}
          onClose={() => setIsCounterModalOpen(false)}
          existingOffer={offer}
          onSuccess={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
}
