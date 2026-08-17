import React, { useState } from "react";
import { Coins, Check } from "lucide-react";
import { Modal } from "../ui/Modal";
import { formatCurrency } from "../../lib/utils";

export const EnterCommissionModal = ({ trip, onClose, onSave }) => {
  const [commission, setCommission] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!trip) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (commission === "" || isNaN(Number(commission))) {
      setError("Please enter a valid numeric commission amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(trip.id, Number(commission));
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update commission amount.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={!!trip}
      onClose={onClose}
      title={`Enter commission — Trip #${trip.slNo}`}
      subtitle="Assign agent commission to update trip record status."
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-xs">
        {/* Context Box */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
          <p className="text-[10px] font-semibold text-slate-500 uppercase">
            Trip context
          </p>
          <div className="grid grid-cols-2 gap-2 text-slate-800">
            <div>
              <span className="text-slate-500">Vehicle:</span>{" "}
              <strong className="font-mono">{trip.vehicleNumber}</strong>
            </div>
            <div>
              <span className="text-slate-500">Transport:</span>{" "}
              <strong>{trip.transport}</strong>
            </div>
            <div>
              <span className="text-slate-500">Route:</span>{" "}
              <strong>{trip.fromLocation} → {trip.toLocation}</strong>
            </div>
            <div>
              <span className="text-slate-500">Freight:</span>{" "}
              <strong className="font-mono text-emerald-700">{formatCurrency(trip.freight)}</strong>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="modal_commission_input"
              className="block text-[11px] font-semibold text-slate-700 uppercase mb-1"
            >
              Commission Amount (₹) *
            </label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="modal_commission_input"
                type="number"
                min="0"
                required
                autoFocus
                placeholder="e.g. 2500"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
              />
            </div>
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
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>{isSubmitting ? "Saving..." : "Save Commission"}</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
