import React, { useState, useEffect } from "react";
import { DollarSign, Save, AlertCircle } from "lucide-react";
import { Modal } from "../ui/Modal";
import { formatCurrency, formatDate } from "../../lib/utils";

export const EnterRefundModal = ({ trip, onClose, onSave }) => {
  const [refund, setRefund] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (trip) {
      setRefund(trip.refund !== null && trip.refund !== undefined ? String(trip.refund) : "");
      setError(null);
    }
  }, [trip]);

  if (!trip) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmed = refund.trim();
    if (trimmed === "") {
      setError("Please enter a refund amount (0 is a valid amount) or click Cancel.");
      return;
    }

    const num = Number(trimmed);
    if (isNaN(num) || num < 0) {
      setError("Refund amount must be a valid non-negative number (0 or greater).");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(trip.id, num);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to save refund. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={!!trip}
      onClose={onClose}
      title={`Enter Refund — #${trip.slNo}`}
      subtitle={`Date: ${formatDate(trip.date)} • Vehicle: ${trip.vehicleNumber}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-xs">
        {/* Trip Context Card */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Trip Summary
          </p>
          <div className="grid grid-cols-2 gap-2 text-slate-800">
            <div>
              <span className="text-slate-500 text-[11px]">Route:</span>{" "}
              <strong>
                {trip.fromLocation} → {trip.toLocation}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">Transport:</span>{" "}
              <strong>{trip.transport}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">Freight:</span>{" "}
              <strong className="font-mono text-slate-900">{formatCurrency(trip.freight)}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">Booking:</span>{" "}
              <strong className="font-mono text-slate-900">
                {trip.booking !== null && trip.booking !== undefined
                  ? formatCurrency(trip.booking)
                  : "Pending"}
              </strong>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="modal_refund_input"
              className="block text-[11px] font-semibold text-slate-700 uppercase mb-1"
            >
              Refund Amount (₹) *
            </label>
            <div className="relative">
              <input
                id="modal_refund_input"
                type="number"
                min="0"
                step="any"
                required
                autoFocus
                placeholder="Enter 0 or actual refund amount (e.g. 500)"
                value={refund}
                onChange={(e) => setRefund(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">
              💡 <strong>Note:</strong> Enter <strong>0</strong> if there is no refund. Entering any
              non-negative value (0 or greater) moves this trip from Pending Refunds to Financial
              Reports.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || refund.trim() === ""}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? "Saving..." : "Save Refund"}</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
