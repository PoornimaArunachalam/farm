import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Sprout,
  Building2,
  UserPlus,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Lock,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "company" ? "company" : "farmer";
  const [role, setRole] = useState(initialRole);

  const [formData, setFormData] = useState({
    // Common
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    district: "Virudhunagar",
    state: "Tamil Nadu",

    // Farmer specific
    fullName: "",
    village: "",
    farmSize: 5,
    farmSizeUnit: "Acres",
    profileImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=300",

    // Company specific
    companyName: "",
    companyType: "Food Processor",
    address: "",
    companyDescription: "",
    website: "",
    companyLogo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=300",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const r = searchParams.get("role");
    if (r === "company" || r === "farmer") {
      setRole(r);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        role,
        ...formData,
      });

      if (role === "farmer") navigate("/farmer/dashboard");
      else if (role === "company") navigate("/company/dashboard");
      else navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to register account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-slate-900">Create Your Account</h2>
        <p className="mt-1 text-xs text-slate-500">
          Join India's real-time agriculture marketplace connecting growers and buyers.
        </p>
      </div>

      {/* Role Selector Tabs */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100/80 rounded-2xl">
        <button
          type="button"
          onClick={() => setRole("farmer")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            role === "farmer"
              ? "bg-white text-agri-800 shadow-sm border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sprout className="w-4 h-4 text-emerald-600" />
          <span>I am a Farmer</span>
        </button>

        <button
          type="button"
          onClick={() => setRole("company")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            role === "company"
              ? "bg-white text-agri-800 shadow-sm border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-600" />
          <span>I am a Company</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Specific Top Fields */}
        {role === "farmer" ? (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Raj Kumar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                  placeholder="e.g. 10"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                <select
                  name="farmSizeUnit"
                  value={formData.farmSizeUnit}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
                >
                  <option value="Acres">Acres</option>
                  <option value="Hectares">Hectares</option>
                  <option value="Bigha">Bigha</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Village / Town</label>
              <input
                type="text"
                required
                name="village"
                value={formData.village}
                onChange={handleChange}
                placeholder="e.g. Seithur, Rajapalayam"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company / Enterprise Name</label>
              <input
                type="text"
                required
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. ABC Foods Pvt Ltd"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Type</label>
              <select
                name="companyType"
                value={formData.companyType}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
              >
                <option value="Food Processor">Food Processor</option>
                <option value="Wholesaler & Mandi Trader">Wholesaler & Mandi Trader</option>
                <option value="Exporter">Agro Exporter</option>
                <option value="Retail Grocery Chain">Retail Grocery Chain</option>
                <option value="Agri-Tech & Logistics">Agri-Tech & Logistics</option>
                <option value="Manufacturer">Manufacturer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Office Address</label>
              <input
                type="text"
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. 142 SIDCO Industrial Complex"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
          </>
        )}

        {/* Common Location */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
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

        {/* Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
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
              placeholder="+91 9876543210"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
            />
          </div>
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password"
              required
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-agri-600 hover:bg-agri-700 text-white font-bold text-sm shadow-md shadow-agri-600/30 transition flex items-center justify-center gap-2 mt-4"
        >
          <UserPlus className="w-4 h-4" />
          <span>{loading ? "Creating Account..." : `Complete ${role === "farmer" ? "Farmer" : "Company"} Registration`}</span>
        </button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-bold text-agri-700 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
