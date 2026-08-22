import React, { useState } from "react";
import { Check } from "lucide-react";
import { Modal } from "../ui/Modal";
import { formatCurrency } from "../../lib/utils";

export const ClearAdvanceModal = ({
  trip,
  type = "vehicle", // "vehicle" or "company"
  onClose,
  onSave,
}) => {
  const isVehicle = type === "vehicle";
  const defaultAmt = isVehicle
    ? String(trip?.advancePaidAmount || 0)
    : String(trip?.advanceReceivedAmount || 0);

  const [amount, setAmount] = useState(defaultAmt);
  const [paymentType, setPaymentType] = useState("Cash");
  const [advanceDate, setAdvanceDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!trip) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!paymentType) {
      setError("Please select a payment type (Cash, PhonePe, or To Pay).");
      return;
    }
    if (!advanceDate || !advanceDate.trim()) {
      setError("Advance date is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isVehicle) {
        await onSave(trip.id, {
          advancePaidAmount: Number(amount) || 0,
          advancePaidType: paymentType,
          advanceDueDate: advanceDate,
        });
      } else {
        await onSave(trip.id, {
          advanceReceivedAmount: Number(amount) || 0,
          advanceReceivedType: paymentType,
          collectionDueDate: advanceDate,
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update advance payment details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = isVehicle
    ? `Set vehicle advance — Trip #${trip.slNo}`
    : `Set company advance — Trip #${trip.slNo}`;

  const subtitle = isVehicle
    ? "Record vehicle advance paid amount and payment type."
    : "Record company advance received amount and payment type.";

  return (
    <Modal isOpen={!!trip} onClose={onClose} title={title} subtitle={subtitle} maxWidth="max-w-md">
      <div className="space-y-4 text-xs">
        {/* Context Box */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
          <p className="text-[10px] font-semibold text-slate-500 uppercase">Trip context</p>
          <div className="grid grid-cols-2 gap-2 text-slate-800">
            <div>
              <span className="text-slate-500">Vehicle:</span>{" "}
              <strong className="font-mono">{trip.vehicleNumber}</strong>
            </div>
            <div>
              <span className="text-slate-500">Transport:</span> <strong>{trip.transport}</strong>
            </div>
            <div>
              <span className="text-slate-500">Freight:</span>{" "}
              <strong className="font-mono">{formatCurrency(trip.freight)}</strong>
            </div>
            <div>
              <span className="text-slate-500">Booking:</span>{" "}
              <strong className="font-mono">{formatCurrency(trip.booking)}</strong>
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
              htmlFor="modal_adv_amount_input"
              className="block text-[11px] font-semibold text-slate-700 uppercase mb-1"
            >
              {isVehicle ? "Advance Paid Amount (₹)" : "Advance Received Amount (₹)"}
            </label>
            <input
              id="modal_adv_amount_input"
              type="number"
              min="0"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label
              htmlFor="modal_adv_type_select"
              className="block text-[11px] font-semibold text-slate-700 uppercase mb-1"
            >
              {isVehicle ? "Advance Paid Type *" : "Advance Received Type *"}
            </label>
            <select
              id="modal_adv_type_select"
              required
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
            >
              <option value="Cash">Cash</option>
              <option value="PhonePe">PhonePe</option>
              <option value="To Pay">To Pay</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="modal_adv_date_input"
              className="block text-[11px] font-semibold text-slate-700 uppercase mb-1"
            >
              {isVehicle ? "Advance Paid Date *" : "Advance Received Date *"}
            </label>
            <input
              id="modal_adv_date_input"
              type="date"
              required
              value={advanceDate}
              onChange={(e) => setAdvanceDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
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
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>{isSubmitting ? "Saving..." : "Save Payment Details"}</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
