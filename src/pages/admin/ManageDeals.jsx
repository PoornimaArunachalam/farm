import React, { useState } from "react";
import { FileCheck2, Search, Building2, User, Sparkles } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "../../context/ConvexClientContext";
import StatusBadge from "../../components/StatusBadge";

export default function ManageDeals() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const allDeals = useQuery("deals:getMyDeals", { token }) || [];

  const filteredDeals = allDeals.filter((deal) => {
    const q = searchTerm.toLowerCase();
    return (
      deal.cropName.toLowerCase().includes(q) ||
      deal.farmerName.toLowerCase().includes(q) ||
      deal.companyName.toLowerCase().includes(q) ||
      deal.status.toLowerCase().includes(q)
    );
  });

  const totalValue = allDeals
    .filter((d) => d.status !== "cancelled")
    .reduce((acc, d) => acc + Number(d.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Platform Deals Audit & Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete transaction record of closed crop trade contracts across the network.
          </p>
        </div>

        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
            Gross Settled Volume
          </span>
          <span className="text-xl font-extrabold text-emerald-700">
            ₹{totalValue.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by crop, farmer, or company..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-agri-500"
            />
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {filteredDeals.length} deals recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Deal ID</th>
                <th className="py-3.5 px-4">Commodity</th>
                <th className="py-3.5 px-4">Farmer (Seller)</th>
                <th className="py-3.5 px-4">Company (Buyer)</th>
                <th className="py-3.5 px-4">Agreed Volume</th>
                <th className="py-3.5 px-4">Contract Total</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeals.map((deal) => (
                <tr key={deal._id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-500">
                    #{deal._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                    {deal.cropName}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {deal.farmerName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {deal.companyName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-800">
                    {deal.agreedQuantity.toLocaleString()} {deal.unit} @ ₹{deal.agreedPrice}/{deal.unit}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-emerald-600">
                    ₹{deal.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-6">
                    <StatusBadge status={deal.status} size="sm" />
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
