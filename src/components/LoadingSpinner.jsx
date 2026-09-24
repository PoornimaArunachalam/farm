import React from "react";
import { Sprout } from "lucide-react";

export default function LoadingSpinner({ text = "Loading market data...", fullPage = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-4 border-agri-100 border-t-agri-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sprout className="w-6 h-6 text-agri-600 animate-bounce" />
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600">{text}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
