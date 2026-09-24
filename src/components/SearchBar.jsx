import React from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
  showFilterToggle = false,
  isFilterOpen = false,
  onToggleFilter,
}) {
  return (
    <div className="relative flex items-center gap-2 w-full">
      <div className="relative flex-1">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agri-500 focus:border-transparent shadow-sm transition"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showFilterToggle && (
        <button
          type="button"
          onClick={onToggleFilter}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition shadow-sm ${
            isFilterOpen
              ? "bg-agri-50 border-agri-300 text-agri-700"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
        </button>
      )}
    </div>
  );
}
