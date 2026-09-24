import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, PlusCircle, Search, Edit3, Trash2, Eye } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useQuery, useMutation } from "../../context/ConvexClientContext";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";

export default function MyDemands() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const myDemands = useQuery("demands:getMyDemands", { token }) || [];
  const deleteDemand = useMutation("demands:remove");

  const filteredDemands = myDemands.filter((demand) => {
    const matchesSearch =
      demand.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demand.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demand.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || demand.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (demandId) => {
    if (!confirm("Are you sure you want to delete this demand posting?")) return;
    try {
      await deleteDemand({ token, demandId });
    } catch (e) {
      alert(e.message || "Failed to delete demand");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Crop Demands</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your company's bulk procurement requirements and track incoming supplier quotes.
          </p>
        </div>
        <Link
          to="/company/add-demand"
          className="px-5 py-2.5 rounded-xl bg-agri-600 hover:bg-agri-700 text-white font-bold text-xs shadow-sm shadow-agri-600/30 transition flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Demand</span>
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
            placeholder="Search demands by crop name, variety..."
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
            <option value="all">All Demands ({myDemands.length})</option>
            <option value="active">Active (Sourcing)</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Demands Table */}
      {filteredDemands.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No demands found"
          description={
            searchTerm || statusFilter !== "all"
              ? "No demands match your current filter."
              : "You haven't posted any crop procurement demands yet."
          }
          actionLabel="Post Demand"
          onAction={() => (window.location.href = "/company/add-demand")}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Crop / Variety</th>
                  <th className="py-3.5 px-4">Required Quantity</th>
                  <th className="py-3.5 px-4">Offered Price Range</th>
                  <th className="py-3.5 px-4">Required Deadline</th>
                  <th className="py-3.5 px-4">Delivery Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDemands.map((demand) => (
                  <tr key={demand._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{demand.cropName}</p>
                        <p className="text-[11px] text-slate-400">{demand.variety || "Standard"}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-800">
                      {demand.requiredQuantity.toLocaleString()} {demand.unit}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600">
                      ₹{demand.offeredPriceMin} - ₹{demand.offeredPriceMax}/{demand.priceUnit || "kg"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {demand.requiredDate}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium truncate max-w-[150px]">
                      {demand.district}, {demand.state}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={demand.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/company/demands/${demand._id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-agri-700 hover:bg-agri-50 transition"
                          title="View Details & Matches"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/company/edit-demand/${demand._id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                          title="Edit Demand"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(demand._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Demand"
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
