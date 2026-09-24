import React from "react";
import { PackageOpen } from "lucide-react";

export default function EmptyState({
  icon: Icon = PackageOpen,
  title = "No records found",
  description = "There are currently no items matching your criteria.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm max-w-lg mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 ring-8 ring-emerald-50/50">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-5 py-2.5 rounded-xl bg-agri-600 hover:bg-agri-700 text-white text-sm font-semibold shadow-sm shadow-agri-600/30 transition duration-150 ease-in-out"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
