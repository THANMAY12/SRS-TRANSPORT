import React, { useState } from "react";
import { AlertCircle, XCircle } from "lucide-react";
import { Modal } from "../ui/Modal";
import { formatCurrency, formatDate } from "../../lib/utils";

export const RejectTripModal = ({ trip, onClose, onReject }) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!trip) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setError("Rejection reason is required and cannot be blank.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onReject(trip.id, trimmedReason);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to reject daily entry. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={!!trip}
      onClose={onClose}
      title={`Reject Daily Entry — #${trip.slNo}`}
      subtitle={`Date: ${formatDate(trip.date)} • Vehicle: ${trip.vehicleNumber}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-xs">
        {/* Trip Context Card */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
          <p className="text-[10px] font-semibold text-slate-500 uppercase">Trip Summary</p>
          <div className="grid grid-cols-2 gap-2 text-slate-800">
            <div>
              <span className="text-slate-500">Route:</span>{" "}
              <strong>
                {trip.fromLocation} → {trip.toLocation}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">Transport:</span> <strong>{trip.transport}</strong>
            </div>
            <div>
              <span className="text-slate-500">Freight:</span>{" "}
              <strong className="font-mono text-slate-900">{formatCurrency(trip.freight)}</strong>
            </div>
            <div>
              <span className="text-slate-500">Submitted By:</span>{" "}
              <strong className="text-blue-700">{trip.createdBy || "System"}</strong>
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
              htmlFor="rejection_reason_input"
              className="block text-[11px] font-semibold text-slate-700 uppercase mb-1"
            >
              Rejection Reason *
            </label>
            <textarea
              id="rejection_reason_input"
              required
              rows={3}
              autoFocus
              placeholder="e.g. Incorrect freight rate, invalid vehicle number, missing route details..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white resize-none"
            />
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
              disabled={isSubmitting || !reason.trim()}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="h-4 w-4" />
              <span>{isSubmitting ? "Rejecting..." : "Reject Entry"}</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
