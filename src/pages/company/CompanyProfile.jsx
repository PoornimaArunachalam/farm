import React, { useState, useEffect } from "react";
import { Building2, MapPin, Phone, Mail, Globe, Save, AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useQuery, useMutation } from "../../context/ConvexClientContext";

export default function CompanyProfile() {
  const { token } = useAuth();
  const profile = useQuery("companies:getProfile", { token });
  const updateProfile = useMutation("companies:updateProfile");

  const [formData, setFormData] = useState({
    companyName: "",
    phone: "",
    companyType: "Food Processor",
    address: "",
    district: "",
    state: "",
    description: "",
    website: "",
    logo: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        companyName: profile.companyName || "",
        phone: profile.phone || "",
        companyType: profile.companyType || "Food Processor",
        address: profile.address || "",
        district: profile.district || "",
        state: profile.state || "",
        description: profile.description || "",
        website: profile.website || "",
        logo: profile.logo || "",
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
        companyName: formData.companyName,
        phone: formData.phone,
        companyType: formData.companyType,
        address: formData.address,
        district: formData.district,
        state: formData.state,
        description: formData.description,
        website: formData.website,
        logo: formData.logo,
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
    return <div className="p-8 text-center text-slate-500">Loading company profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Company Business Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your verified company credentials, procurement policies, and contact channels.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100">
          <img
            src={
              formData.logo ||
              "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200"
            }
            alt={formData.companyName}
            className="w-20 h-20 rounded-3xl object-cover border-2 border-slate-100 shadow-md"
          />
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">{formData.companyName}</h2>
              <ShieldCheck className="w-5 h-5 text-agri-600" title="Verified Buyer" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {formData.address ? `${formData.address}, ` : ""}{formData.district}, {formData.state}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5 text-slate-600" />
              <span>{formData.companyType}</span>
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
            <span className="font-bold">✓ Company profile updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                required
                name="companyName"
                value={formData.companyName}
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

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Type</label>
              <select
                name="companyType"
                value={formData.companyType}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="Food Processor">Food Processor</option>
                <option value="Wholesaler & Exporter">Wholesaler & Exporter</option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Retail Chain">Retail Chain</option>
                <option value="Agri-Tech">Agri-Tech</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Office / Plant Address</label>
              <input
                type="text"
                required
                name="address"
                value={formData.address}
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Description & Procurement Policy</label>
            <textarea
              rows="3"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your processing capability, payment schedule, weighing procedures..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Logo URL</label>
            <input
              type="url"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-2.5 rounded-xl bg-agri-600 hover:bg-agri-700 text-white font-bold text-xs shadow-md shadow-agri-600/30 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Saving Profile..." : "Save Profile Details"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
