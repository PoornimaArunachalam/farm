import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { TrendingUp, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useMutation, useQuery } from "../context/ConvexClientContext";

export default function MakeOfferModal({
  isOpen,
  onClose,
  targetUser,
  cropContext,
  demandContext,
  existingOffer,
  onSuccess,
}) {
  const { user, token, role } = useAuth();
  const [cropName, setCropName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createOffer = useMutation("offers:create");
  const respondOffer = useMutation("offers:respond");
  const getOrCreateConversation = useMutation("conversations:getOrCreate");

  useEffect(() => {
    if (existingOffer) {
      setCropName(existingOffer.cropName);
      setQuantity(existingOffer.counterQuantity || existingOffer.quantity);
      setUnit(existingOffer.unit);
      setPricePerUnit(existingOffer.counterPrice || existingOffer.pricePerUnit);
      setMessage(existingOffer.counterNotes || "");
    } else if (cropContext) {
      setCropName(cropContext.cropName);
      setQuantity(cropContext.quantity);
      setUnit(cropContext.unit || "kg");
      setPricePerUnit(cropContext.expectedPrice);
    } else if (demandContext) {
      setCropName(demandContext.cropName);
      setQuantity(demandContext.requiredQuantity);
      setUnit(demandContext.unit || "kg");
      setPricePerUnit(demandContext.offeredPriceMax || demandContext.offeredPriceMin);
    }
  }, [cropContext, demandContext, existingOffer, isOpen]);

  const totalAmount = (Number(quantity) || 0) * (Number(pricePerUnit) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!quantity || Number(quantity) <= 0) {
      setError("Please specify a valid quantity greater than 0");
      return;
    }
    if (!pricePerUnit || Number(pricePerUnit) <= 0) {
      setError("Please specify a valid price per unit");
      return;
    }

    setLoading(true);
    try {
      if (existingOffer) {
        // Counter offer
        await respondOffer({
          token,
          offerId: existingOffer._id,
          action: "counter",
          counterPrice: Number(pricePerUnit),
          counterQuantity: Number(quantity),
          counterNotes: message,
        });
      } else {
        // New Offer
        const receiverId =
          targetUser?.userId ||
          targetUser?._id ||
          cropContext?.farmerId ||
          demandContext?.companyId;

        if (!receiverId) {
          throw new Error("Target recipient not specified.");
        }

        const convId = await getOrCreateConversation({
          token,
          partnerId: receiverId,
        });

        await createOffer({
          token,
          receiverId,
          cropId: cropContext?._id,
          demandId: demandContext?._id,
          cropName: cropName || "Agricultural Commodity",
          conversationId: convId,
          quantity: Number(quantity),
          unit,
          pricePerUnit: Number(pricePerUnit),
          message,
        });
      }

      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit offer.");
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingOffer ? "Propose Counter-Offer 🔄" : "Submit Trade Offer 💰"}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Crop / Produce
          </label>
          <input
            type="text"
            required
            value={cropName}
            onChange={(e) => setCropName(e.target.value)}
            placeholder="e.g. Tomato, Onion, Chilli"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              required
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 1500"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
            >
              <option value="kg">kg</option>
              <option value="quintal">quintal</option>
              <option value="ton">ton</option>
              <option value="crates">crates</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Offered Price per {unit} (₹)
          </label>
          <input
            type="number"
            required
            min="0.1"
            step="any"
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(e.target.value)}
            placeholder="e.g. 28"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
          />
        </div>

        {/* Live Calculation Box */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-agri-100/50 border border-emerald-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Calculated Deal Value</span>
            <span className="text-xl font-extrabold text-agri-900">
              ₹{totalAmount.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {quantity || 0} {unit} × ₹{pricePerUnit || 0} per {unit}
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Message / Delivery Terms (Optional)
          </label>
          <textarea
            rows="2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Can deliver to your warehouse within 3 days."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-agri-600 hover:bg-agri-700 text-white font-bold text-sm shadow-sm shadow-agri-600/30 transition flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>{loading ? "Submitting..." : existingOffer ? "Send Counter-Offer" : "Send Offer"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
