import React, { useState, useEffect } from "react";
import { User, Sprout, MapPin, Phone, Mail, Save, AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useQuery, useMutation } from "../../context/ConvexClientContext";

export default function FarmerProfile() {
  const { token } = useAuth();
  const profile = useQuery("farmers:getProfile", { token });
  const updateProfile = useMutation("farmers:updateProfile");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    village: "",
    district: "",
    state: "",
    farmSize: 5,
    farmSizeUnit: "Acres",
    description: "",
    profileImage: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        phone: profile.phone || "",
        village: profile.village || "",
        district: profile.district || "",
        state: profile.state || "",
        farmSize: profile.farmSize || 5,
        farmSizeUnit: profile.farmSizeUnit || "Acres",
        description: profile.description || "",
        profileImage: profile.profileImage || "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await updateProfile({
        token,
        fullName: formData.fullName,
        phone: formData.phone,
        village: formData.village,
        district: formData.district,
        state: formData.state,
        farmSize: Number(formData.farmSize),
        farmSizeUnit: formData.farmSizeUnit,
        description: formData.description,
        profileImage: formData.profileImage,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <div className="p-8 text-center text-slate-500">Loading farmer profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Farmer Profile & Land Records</h1>
        <p className="text-xs text-slate-500 mt-1">
          Maintain your verified farmer profile, location details, and cultivate information.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100">
          <img
            src={
              formData.profileImage ||
              "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200"
            }
            alt={formData.fullName}
            className="w-20 h-20 rounded-3xl object-cover border-2 border-agri-200 shadow-md"
          />
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">{formData.fullName}</h2>
              <ShieldCheck className="w-5 h-5 text-emerald-600" title="Verified Farmer" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {formData.village ? `${formData.village}, ` : ""}{formData.district}, {formData.state}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold">
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
              <span>{formData.farmSize} {formData.farmSizeUnit} Landholding</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="my-6 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="my-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-bold">✓ Profile updated successfully!</span>
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Village / Town</label>
              <input
                type="text"
                required
                name="village"
                value={formData.village}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Farm Size</label>
              <input
                type="number"
                required
                min="0.1"
                step="any"
                name="farmSize"
                value={formData.farmSize}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
              <select
                name="farmSizeUnit"
                value={formData.farmSizeUnit}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="Acres">Acres</option>
                <option value="Hectares">Hectares</option>
                <option value="Bigha">Bigha</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">About Your Farm & Experience</label>
            <textarea
              rows="3"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell buyers about your agricultural methods, certifications, crop rotation..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Profile Photo URL</label>
            <input
              type="url"
              name="profileImage"
              value={formData.profileImage}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-2.5 rounded-xl bg-agri-600 hover:bg-agri-700 text-white font-bold text-xs shadow-md shadow-agri-600/30 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Updating Profile..." : "Save Profile Details"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
