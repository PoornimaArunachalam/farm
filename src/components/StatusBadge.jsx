import React from "react";

export default function StatusBadge({ status, size = "md" }) {
  const getBadgeStyle = (st) => {
    switch (st?.toLowerCase()) {
      case "available":
      case "active":
      case "confirmed":
      case "accepted":
      case "resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20";
      case "in_progress":
      case "partially_sold":
      case "pending":
      case "reviewed":
        return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20";
      case "completed":
      case "fulfilled":
        return "bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20";
      case "countered":
        return "bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/20";
      case "sold":
      case "expired":
      case "dismissed":
      case "inactive":
        return "bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/20";
      case "rejected":
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/10";
    }
  };

  const formatText = (st) => {
    if (!st) return "Unknown";
    return st.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3 py-1.5 text-sm font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ring-1 ring-inset ${getBadgeStyle(
        status
      )} ${sizeClasses[size] || sizeClasses.md}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
      {formatText(status)}
    </span>
  );
}
