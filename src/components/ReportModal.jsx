import React, { useState } from "react";
import Modal from "./Modal";
import { Flag, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useMutation } from "../context/ConvexClientContext";

export default function ReportModal({
  isOpen,
  onClose,
  targetType = "farmer",
  targetId,
  targetUser,
  targetTitle = "Item",
}) {
  const { token } = useAuth();
  const [reason, setReason] = useState("Inaccurate Pricing / Description");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createReport = useMutation("reports:create");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please describe the issue.");
      return;
    }

    setLoading(true);
    try {
      await createReport({
        token,
        targetType,
        targetId: targetId || "target_item",
        targetUser: targetUser || undefined,
        reason,
        description,
      });
      setSubmitted(true);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to submit report.");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setDescription("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Report to Moderator" maxWidth="max-w-md">
      {submitted ? (
        <div className="text-center py-6">
          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h4 className="text-lg font-bold text-slate-900">Report Submitted</h4>
          <p className="text-xs text-slate-500 mt-1">
            Thank you for helping keep the AgriConnect marketplace safe and reliable. Our administration team will review this listing.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-5 px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-slate-500">
            Reporting: <strong className="text-slate-800">{targetTitle}</strong>
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
            >
              <option value="Inaccurate Pricing / Description">Inaccurate Pricing / Description</option>
              <option value="Non-Responsive Seller / Buyer">Non-Responsive Seller / Buyer</option>
              <option value="Fraudulent or Duplicate Listing">Fraudulent or Duplicate Listing</option>
              <option value="Abusive Language or Harassment">Abusive Language or Harassment</option>
              <option value="Poor Produce Quality Breach">Poor Produce Quality Breach</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Details</label>
            <textarea
              required
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific details about the issue..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm shadow-rose-600/30 transition flex items-center gap-1.5"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{loading ? "Submitting..." : "Submit Report"}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
