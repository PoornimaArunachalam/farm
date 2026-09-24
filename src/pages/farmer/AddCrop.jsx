import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, PlusCircle, AlertCircle, CheckCircle, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useMutation } from "../../context/ConvexClientContext";

export default function AddCrop() {
  const { profile, token } = useAuth();
  const navigate = useNavigate();
  const createCrop = useMutation("crops:create");

  const [formData, setFormData] = useState({
    cropName: "Tomato",
    variety: "Shivam Hybrid & Organic Country",
    quantity: 1000,
    unit: "kg",
    expectedPrice: 30,
    priceUnit: "per kg",
    harvestDate: new Date().toISOString().split("T")[0],
    location: profile?.village || "Farm Gate",
    district: profile?.district || "Virudhunagar",
    state: profile?.state || "Tamil Nadu",
    quality: "Grade A",
    description: "Freshly harvested, pesticide-free produce sorted and graded for wholesale & food processing procurement.",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagePreset = (url) => {
    setFormData((prev) => ({ ...prev, image: url }));
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
    if (!formData.location.trim()) {
      setError("Location is required.");
      return;
    }

    setLoading(true);
    try {
      await createCrop({
        token,
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
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/farmer/my-crops");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to list crop.");
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
        <span className="text-xs font-semibold text-slate-400">Step 1 of 1 • Crop Listing</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">List Available Crop</h1>
            <p className="text-xs text-slate-500">
              Publish your farm produce to thousands of verified buyers and receive direct offers.
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
            <span className="font-bold">✓ Crop added successfully! Redirecting to your crop list...</span>
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
                placeholder="e.g. Tomato, Onion, Chilli, Rice"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Variety / Strain</label>
              <input
                type="text"
                name="variety"
                value={formData.variety}
                onChange={handleChange}
                placeholder="e.g. Shivam Hybrid, Bellary Red"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="col-span-1">
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
                <option value="crates">crates</option>
              </select>
            </div>

            <div className="col-span-1">
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
            <div className="col-span-1">
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
                <option value="per crate">per crate</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quality / Grade *</label>
              <select
                name="quality"
                value={formData.quality}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
              >
                <option value="Grade A">Grade A (Premium / Export Quality)</option>
                <option value="Grade B">Grade B (Good Quality / Processing)</option>
                <option value="Organic Certified">Organic Certified</option>
                <option value="Standard">Standard Commercial Grade</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Harvest / Availability Date *</label>
              <input
                type="date"
                required
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Farm / Yard Location *</label>
              <input
                type="text"
                required
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Seithur Farm Gate"
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Crop Description & Details</label>
            <textarea
              rows="3"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe produce freshness, storage conditions, packaging available, or transport options..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
            />
          </div>

          {/* Image Selection / Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Crop Photo URL</label>
            <div className="flex gap-2 items-center">
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>

            {/* Quick Presets */}
            <div className="mt-2 flex flex-wrap gap-2 items-center text-xs text-slate-500">
              <span className="font-semibold">Sample Crop Photos:</span>
              <button
                type="button"
                onClick={() => handleImagePreset("https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium"
              >
                🍅 Tomato
              </button>
              <button
                type="button"
                onClick={() => handleImagePreset("https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=600")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium"
              >
                🧅 Onion
              </button>
              <button
                type="button"
                onClick={() => handleImagePreset("https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80&w=600")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium"
              >
                🌶️ Chilli
              </button>
              <button
                type="button"
                onClick={() => handleImagePreset("https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium"
              >
                🌾 Rice
              </button>
              <button
                type="button"
                onClick={() => handleImagePreset("https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=600")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium"
              >
                🥔 Potato
              </button>
            </div>
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
              <span>{loading ? "Publishing Listing..." : "Publish Crop Listing"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
