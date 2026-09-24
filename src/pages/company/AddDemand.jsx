import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, PlusCircle, AlertCircle, CheckCircle, ArrowLeft, TrendingUp } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useMutation } from "../../context/ConvexClientContext";

export default function AddDemand() {
  const { profile, token } = useAuth();
  const navigate = useNavigate();
  const createDemand = useMutation("demands:create");

  const [formData, setFormData] = useState({
    cropName: "Tomato",
    variety: "Hybrid Round / Sauce Processing Grade",
    requiredQuantity: 5000,
    unit: "kg",
    offeredPriceMin: 25,
    offeredPriceMax: 30,
    priceUnit: "per kg",
    requiredDate: new Date(Date.now() + 86400000 * 15).toISOString().split("T")[0],
    deliveryLocation: profile?.address || "Company Warehouse",
    district: profile?.district || "Virudhunagar",
    state: profile?.state || "Tamil Nadu",
    qualityRequirements: "Brix level > 4.5, red ripe, minimal blemishes, crate packing accepted.",
    description: "Urgent batch procurement for food processing production line. Immediate digital payment upon weighing.",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (Number(formData.requiredQuantity) <= 0) {
      setError("Required quantity must be greater than 0");
      return;
    }
    if (Number(formData.offeredPriceMin) <= 0 || Number(formData.offeredPriceMax) <= 0) {
      setError("Prices must be greater than 0");
      return;
    }
    if (Number(formData.offeredPriceMin) > Number(formData.offeredPriceMax)) {
      setError("Minimum price cannot exceed maximum price");
      return;
    }

    setLoading(true);
    try {
      await createDemand({
        token,
        cropName: formData.cropName,
        variety: formData.variety,
        requiredQuantity: Number(formData.requiredQuantity),
        unit: formData.unit,
        offeredPriceMin: Number(formData.offeredPriceMin),
        offeredPriceMax: Number(formData.offeredPriceMax),
        priceUnit: formData.priceUnit,
        requiredDate: formData.requiredDate,
        deliveryLocation: formData.deliveryLocation,
        district: formData.district,
        state: formData.state,
        qualityRequirements: formData.qualityRequirements,
        description: formData.description,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/company/my-demands");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to post demand.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-semibold text-slate-400">Step 1 of 1 • Demand Publishing</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Post Crop Procurement Demand</h1>
            <p className="text-xs text-slate-500">
              Publish bulk demand specifications to notify nearby farmers and receive direct supply quotes.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-bold">✓ Demand published successfully! Notifying matching farmers...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Crop Name *</label>
              <input
                type="text"
                required
                name="cropName"
                value={formData.cropName}
                onChange={handleChange}
                placeholder="e.g. Tomato, Onion, Chilli, Rice, Cotton"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Variety / Specification</label>
              <input
                type="text"
                name="variety"
                value={formData.variety}
                onChange={handleChange}
                placeholder="e.g. Hybrid Round, Bellary Red, Sona Masoori"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Required Quantity *</label>
              <input
                type="number"
                required
                min="1"
                name="requiredQuantity"
                value={formData.requiredQuantity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit *</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
              >
                <option value="kg">kg</option>
                <option value="quintal">quintal</option>
                <option value="ton">ton</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Min Price (₹) *</label>
              <input
                type="number"
                required
                min="0.1"
                step="any"
                name="offeredPriceMin"
                value={formData.offeredPriceMin}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Price (₹) *</label>
              <input
                type="number"
                required
                min="0.1"
                step="any"
                name="offeredPriceMax"
                value={formData.offeredPriceMax}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price Unit</label>
              <select
                name="priceUnit"
                value={formData.priceUnit}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
              >
                <option value="per kg">per kg</option>
                <option value="per quintal">per quintal</option>
                <option value="per ton">per ton</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Required Delivery Deadline *</label>
              <input
                type="date"
                required
                name="requiredDate"
                value={formData.requiredDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Location *</label>
              <input
                type="text"
                required
                name="deliveryLocation"
                value={formData.deliveryLocation}
                onChange={handleChange}
                placeholder="e.g. ABC Processing Plant Gate"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">District *</label>
              <input
                type="text"
                required
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="e.g. Virudhunagar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                required
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Tamil Nadu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quality Requirements & Standards</label>
            <input
              type="text"
              name="qualityRequirements"
              value={formData.qualityRequirements}
              onChange={handleChange}
              placeholder="e.g. Double-skinned, low moisture, Brix > 4.5, minimal rot..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Procurement Description & Payment Terms</label>
            <textarea
              rows="3"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide details on payment turnaround, unloading support, packaging guidelines..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-7 py-2.5 rounded-xl bg-agri-600 hover:bg-agri-700 text-white font-bold text-xs shadow-md shadow-agri-600/30 transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? "Publishing Demand..." : "Publish Live Demand"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
