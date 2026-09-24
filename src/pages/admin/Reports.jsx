import React, { useState } from "react";
import { Flag, Search, CheckCircle, XCircle, AlertCircle, Download, FileText } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useQuery, useMutation } from "../../context/ConvexClientContext";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";

export default function Reports() {
  const { token } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");

  const reports = useQuery("reports:list", { token }) || [];
  const updateReportStatus = useMutation("reports:updateStatus");
  const deals = useQuery("deals:getMyDeals", { token }) || [];
  const crops = useQuery("admin:getAllCrops", { token }) || [];
  const demands = useQuery("admin:getAllDemands", { token }) || [];

  const filteredReports = reports.filter((r) => {
    return statusFilter === "all" || r.status === statusFilter;
  });

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await updateReportStatus({ token, reportId, status: newStatus });
    } catch (e) {
      alert(e.message || "Failed to update report status");
    }
  };

  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert("No data available to export.");
      return;
    }
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Moderation Reports & Export Logs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Resolve community flags, dispute claims, and generate audit reports.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportCSV(deals, "agriconnect_deals_report")}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Deals CSV</span>
          </button>
          <button
            type="button"
            onClick={() => exportCSV(crops, "agriconnect_crops_report")}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Crops CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Filter:</span>
        {["all", "pending", "reviewed", "resolved", "dismissed"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
              statusFilter === st
                ? "bg-agri-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {st} ({st === "all" ? reports.length : reports.filter((r) => r.status === st).length})
          </button>
        ))}
      </div>

      {/* Reports Feed */}
      {filteredReports.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No reports in this category"
          description="Community flags on suspicious listings or dispute resolutions will appear here."
        />
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <Flag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{report.reason}</h4>
                    <p className="text-xs text-slate-400">
                      Reported by: <strong className="text-slate-700">{report.reporterName}</strong> • Type: <strong className="capitalize text-slate-700">{report.targetType}</strong>
                    </p>
                  </div>
                </div>
                <StatusBadge status={report.status} size="sm" />
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600">
                <p className="font-medium">{report.description}</p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Target ID: <code className="bg-slate-100 px-1 py-0.5 rounded">{report.targetId}</code>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(report._id, "resolved")}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition"
                  >
                    Mark Resolved
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(report._id, "reviewed")}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold border border-amber-200 transition"
                  >
                    Mark Reviewed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(report._id, "dismissed")}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
