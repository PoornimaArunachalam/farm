import React, { useState } from "react";
import { Building2, Search, ShieldCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useQuery, useMutation } from "../../context/ConvexClientContext";

export default function ManageCompanies() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const allUsers = useQuery("admin:getAllUsers", { token }) || [];
  const toggleStatus = useMutation("admin:toggleUserStatus");

  const companyUsers = allUsers.filter((u) => u.role === "company");

  const filteredCompanies = companyUsers.filter((u) => {
    const name = u.profile?.companyName || "";
    const email = u.email || "";
    const type = u.profile?.companyType || "";
    const district = u.profile?.district || "";
    const q = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      type.toLowerCase().includes(q) ||
      district.toLowerCase().includes(q)
    );
  });

  const handleToggle = async (userId) => {
    try {
      await toggleStatus({ token, userId });
    } catch (e) {
      alert(e.message || "Failed to update company status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Registered Companies</h1>
          <p className="text-xs text-slate-500 mt-1">
            Oversee buyer enterprises, food processors, exporters, and verification records.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, type, district..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-agri-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Company Entity</th>
                <th className="py-3.5 px-4">Business Type</th>
                <th className="py-3.5 px-4">Phone / Contact</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-6 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCompanies.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          user.profile?.logo ||
                          "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=100"
                        }
                        alt={user.profile?.companyName}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {user.profile?.companyName || "Company"}
                        </p>
                        <p className="text-[11px] text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-semibold text-slate-800">
                      {user.profile?.companyType || "Wholesaler"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{user.phone}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {user.profile?.district || "-"}, {user.profile?.state || "-"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        user.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {user.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggle(user._id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                        user.isActive
                          ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      }`}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
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
