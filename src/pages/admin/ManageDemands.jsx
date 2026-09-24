import React, { useState } from "react";
import { TrendingUp, Search, Trash2, Eye } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useQuery, useMutation } from "../../context/ConvexClientContext";
import StatusBadge from "../../components/StatusBadge";
import { Link } from "react-router-dom";

export default function ManageDemands() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const allDemands = useQuery("admin:getAllDemands", { token }) || [];
  const deleteDemand = useMutation("admin:deleteDemand");

  const filteredDemands = allDemands.filter((demand) => {
    const q = searchTerm.toLowerCase();
    return (
      demand.cropName.toLowerCase().includes(q) ||
      demand.variety.toLowerCase().includes(q) ||
      demand.companyName.toLowerCase().includes(q) ||
      demand.district.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (demandId) => {
    if (!confirm("Are you sure you want to remove this demand posting?")) return;
    try {
      await deleteDemand({ token, demandId });
    } catch (e) {
      alert(e.message || "Failed to remove demand");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Company Demands</h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit and moderate commercial procurement posts and price bracket guidelines.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search crop, company, district..."
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
                <th className="py-3.5 px-4">Company Entity</th>
                <th className="py-3.5 px-4">Required Volume</th>
                <th className="py-3.5 px-4">Price Bracket</th>
                <th className="py-3.5 px-4">Delivery Location</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDemands.map((demand) => (
                <tr key={demand._id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-6">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{demand.cropName}</p>
                      <p className="text-[11px] text-slate-400">{demand.variety}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{demand.companyName}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-800">
                    {demand.requiredQuantity.toLocaleString()} {demand.unit}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-emerald-600">
                    ₹{demand.offeredPriceMin} - ₹{demand.offeredPriceMax}/{demand.priceUnit || "kg"}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {demand.district}, {demand.state}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={demand.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/company/demands/${demand._id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-agri-700 hover:bg-agri-50"
                        title="Inspect"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(demand._id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                        title="Remove Demand"
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
