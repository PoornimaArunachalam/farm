import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sprout, PlusCircle, Search, SlidersHorizontal, Edit3, Trash2, Eye } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useQuery, useMutation } from "../../context/ConvexClientContext";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";

export default function MyCrops() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const myCrops = useQuery("crops:getMyCrops", { token }) || [];
  const deleteCrop = useMutation("crops:remove");

  const filteredCrops = myCrops.filter((crop) => {
    const matchesSearch =
      crop.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || crop.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (cropId) => {
    if (!confirm("Are you sure you want to delete this crop listing?")) return;
    try {
      await deleteCrop({ token, cropId });
    } catch (e) {
      alert(e.message || "Failed to delete crop");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Listed Crops</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your agricultural produce, track availability status, and update rates.
          </p>
        </div>
        <Link
          to="/farmer/add-crop"
          className="px-5 py-2.5 rounded-xl bg-agri-600 hover:bg-agri-700 text-white font-bold text-xs shadow-sm shadow-agri-600/30 transition flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Crop</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your crops by name, variety..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-agri-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
          >
            <option value="all">All Statuses ({myCrops.length})</option>
            <option value="available">Available</option>
            <option value="partially_sold">Partially Sold</option>
            <option value="sold">Sold</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Crops Table / Cards */}
      {filteredCrops.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="No crops found"
          description={
            searchTerm || statusFilter !== "all"
              ? "No crops match the current search or filters."
              : "You haven't listed any crops on the marketplace yet."
          }
          actionLabel="List a Crop"
          onAction={() => (window.location.href = "/farmer/add-crop")}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Crop / Variety</th>
                  <th className="py-3.5 px-4">Available Quantity</th>
                  <th className="py-3.5 px-4">Expected Price</th>
                  <th className="py-3.5 px-4">Harvest Date</th>
                  <th className="py-3.5 px-4">Quality Grade</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCrops.map((crop) => (
                  <tr key={crop._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={crop.image}
                          alt={crop.cropName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{crop.cropName}</p>
                          <p className="text-[11px] text-slate-400">{crop.variety || "Standard"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-800">
                      {crop.quantity.toLocaleString()} {crop.unit}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600">
                      ₹{crop.expectedPrice}/{crop.priceUnit || "kg"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {crop.harvestDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-semibold text-slate-700">
                        {crop.quality}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={crop.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/farmer/crops/${crop._id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-agri-700 hover:bg-agri-50 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/farmer/edit-crop/${crop._id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                          title="Edit Listing"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(crop._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Listing"
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
      )}
    </div>
  );
}
