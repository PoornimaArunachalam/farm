import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sprout, Save, AlertCircle, CheckCircle, ArrowLeft, Trash2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useQuery, useMutation } from "../../context/ConvexClientContext";

export default function EditCrop() {
  const { cropId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const crop = useQuery("crops:getById", { cropId });
  const updateCrop = useMutation("crops:update");
  const deleteCrop = useMutation("crops:remove");

  const [formData, setFormData] = useState({
    cropName: "",
    variety: "",
    quantity: 0,
    unit: "kg",
    expectedPrice: 0,
    priceUnit: "per kg",
    harvestDate: "",
    location: "",
    district: "",
    state: "",
    quality: "Grade A",
    description: "",
    image: "",
    status: "available",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (crop) {
      setFormData({
        cropName: crop.cropName || "",
        variety: crop.variety || "",
        quantity: crop.quantity || 0,
        unit: crop.unit || "kg",
        expectedPrice: crop.expectedPrice || 0,
        priceUnit: crop.priceUnit || "per kg",
        harvestDate: crop.harvestDate || "",
        location: crop.location || "",
        district: crop.district || "",
        state: crop.state || "",
        quality: crop.quality || "Grade A",
        description: crop.description || "",
        image: crop.image || "",
        status: crop.status || "available",
      });
    }
  }, [crop]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (Number(formData.quantity) <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }
    if (Number(formData.expectedPrice) <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    setLoading(true);
    try {
      await updateCrop({
        token,
        cropId,
        cropName: formData.cropName,
        variety: formData.variety,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        expectedPrice: Number(formData.expectedPrice),
        priceUnit: formData.priceUnit,
        harvestDate: formData.harvestDate,
        location: formData.location,
        district: formData.district,
        state: formData.state,
        quality: formData.quality,
        description: formData.description,
        image: formData.image,
        status: formData.status,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/farmer/my-crops");
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update crop.");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this crop listing?")) return;
    try {
      await deleteCrop({ token, cropId });
      navigate("/farmer/my-crops");
    } catch (e) {
      alert(e.message || "Failed to delete");
    }
  };

  if (!crop) {
    return (
      <div className="p-8 text-center text-slate-500">Loading crop details...</div>
    );
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
          <span>Delete Listing</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Edit Crop Listing</h1>
            <p className="text-xs text-slate-500">Update pricing, available quantity, or listing status.</p>
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
            <span className="font-bold">✓ Crop listing updated successfully!</span>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Listing Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-agri-500 font-semibold"
              >
                <option value="available">Available</option>
                <option value="partially_sold">Partially Sold</option>
                <option value="sold">Sold Out</option>
                <option value="inactive">Inactive / Hidden</option>
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
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
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
                <option value="crates">crates</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected Price (₹) *</label>
              <input
                type="number"
                required
                min="0.1"
                step="any"
                name="expectedPrice"
                value={formData.expectedPrice}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
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
                <option value="per crate">per crate</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quality Grade</label>
              <select
                name="quality"
                value={formData.quality}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="Grade A">Grade A</option>
                <option value="Grade B">Grade B</option>
                <option value="Organic Certified">Organic Certified</option>
                <option value="Standard">Standard</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Harvest Date</label>
              <input
                type="date"
                required
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                required
                name="location"
                value={formData.location}
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows="3"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
            <input
              type="url"
              name="image"
              value={formData.image}
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
