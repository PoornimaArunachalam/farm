import React, { useState } from "react";
import { Sprout, Search, Trash2, Eye } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useQuery, useMutation } from "../../context/ConvexClientContext";
import StatusBadge from "../../components/StatusBadge";
import { Link } from "react-router-dom";

export default function ManageCrops() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const allCrops = useQuery("admin:getAllCrops", { token }) || [];
  const deleteCrop = useMutation("admin:deleteCrop");

  const filteredCrops = allCrops.filter((crop) => {
    const q = searchTerm.toLowerCase();
    return (
      crop.cropName.toLowerCase().includes(q) ||
      crop.variety.toLowerCase().includes(q) ||
      crop.farmerName.toLowerCase().includes(q) ||
      crop.district.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (cropId) => {
    if (!confirm("Are you sure you want to remove this crop listing from the platform?")) return;
    try {
      await deleteCrop({ token, cropId });
    } catch (e) {
      alert(e.message || "Failed to remove crop");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Platform Crop Listings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit and moderate farmer crop lots, pricing benchmarks, and availability statuses.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search crop, variety, farmer..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-agri-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Crop / Variety</th>
                <th className="py-3.5 px-4">Farmer Name</th>
                <th className="py-3.5 px-4">Quantity</th>
                <th className="py-3.5 px-4">Expected Price</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCrops.map((crop) => (
                <tr key={crop._id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={crop.image}
                        alt={crop.cropName}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{crop.cropName}</p>
                        <p className="text-[11px] text-slate-400">{crop.variety}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{crop.farmerName}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-800">
                    {crop.quantity.toLocaleString()} {crop.unit}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-emerald-600">
                    ₹{crop.expectedPrice}/{crop.priceUnit || "kg"}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {crop.district}, {crop.state}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={crop.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/farmer/crops/${crop._id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-agri-700 hover:bg-agri-50"
                        title="Inspect"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(crop._id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                        title="Remove Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
