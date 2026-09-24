import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TrendingUp, Save, AlertCircle, CheckCircle, ArrowLeft, Trash2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useQuery, useMutation } from "../../context/ConvexClientContext";

export default function EditDemand() {
  const { demandId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const demand = useQuery("demands:getById", { demandId });
  const updateDemand = useMutation("demands:update");
  const deleteDemand = useMutation("demands:remove");

  const [formData, setFormData] = useState({
    cropName: "",
    variety: "",
    requiredQuantity: 0,
    unit: "kg",
    offeredPriceMin: 0,
    offeredPriceMax: 0,
    priceUnit: "per kg",
    requiredDate: "",
    deliveryLocation: "",
    district: "",
    state: "",
    qualityRequirements: "",
    description: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (demand) {
      setFormData({
        cropName: demand.cropName || "",
        variety: demand.variety || "",
        requiredQuantity: demand.requiredQuantity || 0,
        unit: demand.unit || "kg",
        offeredPriceMin: demand.offeredPriceMin || 0,
        offeredPriceMax: demand.offeredPriceMax || 0,
        priceUnit: demand.priceUnit || "per kg",
        requiredDate: demand.requiredDate || "",
        deliveryLocation: demand.deliveryLocation || "",
        district: demand.district || "",
        state: demand.state || "",
        qualityRequirements: demand.qualityRequirements || "",
        description: demand.description || "",
        status: demand.status || "active",
      });
    }
  }, [demand]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (Number(formData.requiredQuantity) <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }
    if (Number(formData.offeredPriceMin) <= 0 || Number(formData.offeredPriceMax) <= 0) {
      setError("Prices must be greater than 0");
      return;
    }

    setLoading(true);
    try {
      await updateDemand({
        token,
        demandId,
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
        status: formData.status,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/company/my-demands");
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update demand.");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this crop demand?")) return;
    try {
      await deleteDemand({ token, demandId });
      navigate("/company/my-demands");
    } catch (e) {
      alert(e.message || "Failed to delete");
    }
  };

  if (!demand) {
    return <div className="p-8 text-center text-slate-500">Loading demand details...</div>;
  }

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
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 p-2 rounded-xl hover:bg-rose-50 transition"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Demand</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Edit Crop Demand</h1>
            <p className="text-xs text-slate-500">Update required volume, price offers, or demand status.</p>
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
            <span className="font-bold">✓ Demand listing updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Crop Name *</label>
              <input
                type="text"
                required
                name="cropName"
                value={formData.cropName}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Variety</label>
              <input
                type="text"
                name="variety"
                value={formData.variety}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-semibold"
              >
                <option value="active">Active (Sourcing)</option>
                <option value="fulfilled">Fulfilled (Completed)</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantity *</label>
              <input
                type="number"
                required
                min="1"
                name="requiredQuantity"
                value={formData.requiredQuantity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="kg">kg</option>
                <option value="quintal">quintal</option>
                <option value="ton">ton</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Min Price (₹) *</label>
              <input
                type="number"
                required
                min="0.1"
                name="offeredPriceMin"
                value={formData.offeredPriceMin}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Price (₹) *</label>
              <input
                type="number"
                required
                min="0.1"
                name="offeredPriceMax"
                value={formData.offeredPriceMax}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
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
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="per kg">per kg</option>
                <option value="per quintal">per quintal</option>
                <option value="per ton">per ton</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Required By</label>
              <input
                type="date"
                required
                name="requiredDate"
                value={formData.requiredDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Location</label>
              <input
                type="text"
                required
                name="deliveryLocation"
                value={formData.deliveryLocation}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
              <input
                type="text"
                required
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
              <input
                type="text"
                required
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quality Requirements</label>
            <input
              type="text"
              name="qualityRequirements"
              value={formData.qualityRequirements}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows="3"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
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
              <Save className="w-4 h-4" />
              <span>{loading ? "Saving Changes..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
