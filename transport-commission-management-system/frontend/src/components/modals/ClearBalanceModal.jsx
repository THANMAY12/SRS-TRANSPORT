import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { formatCurrency } from "../../lib/utils";

export const ClearBalanceModal = ({
  trip,
  type = "vehicle", // "vehicle" | "company"
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const isVehicle = type === "vehicle";
  const currentBalance = trip
    ? isVehicle
      ? Math.max(0, (trip.freight || 0) - (trip.advancePaidAmount || 0))
      : Math.max(0, (trip.booking || 0) - (trip.advanceReceivedAmount || 0))
    : 0;

  const [amount, setAmount] = useState(String(currentBalance));
  const [clearedDate, setClearedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (trip) {
      setAmount(String(currentBalance));
      setClearedDate(new Date().toISOString().split("T")[0]);
      setValidationError("");
    }
  }, [trip, currentBalance]);

  if (!trip) return null;

  const handleAmountChange = (val) => {
    setAmount(val);
    setValidationError("");
  };

  const parseNum = (val) => {
    if (val === undefined || val === null || val.trim() === "") return NaN;
    return Number(val);
  };

  const numAmount = parseNum(amount);
  const isValidNumber = !isNaN(numAmount);
  const remainingBalance = isValidNumber ? currentBalance - numAmount : currentBalance;

  const getValidationError = () => {
    if (amount.trim() === "") {
      return "Amount to clear is required.";
    }
    if (!isValidNumber) {
      return "Please enter a valid numeric amount.";
    }
    if (numAmount <= 0) {
      return "Amount to clear must be greater than ₹0.";
    }
    if (numAmount > currentBalance) {
      return `Amount cannot exceed current outstanding balance (${formatCurrency(currentBalance)}).`;
    }
    if (!clearedDate || clearedDate.trim() === "") {
      return "Clearance date is required.";
    }
    return "";
  };

  const currentError = getValidationError();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentError) {
      setValidationError(currentError);
      return;
    }
    await onConfirm(numAmount, clearedDate);
  };

  const title = isVehicle
    ? `Clear vehicle freight balance — Trip #${trip.slNo}`
    : `Clear company collection balance — Trip #${trip.slNo}`;

  const subtitle = isVehicle
    ? `Vehicle: ${trip.vehicleNumber} | Transport: ${trip.transport}`
    : `Transport: ${trip.transport} | Vehicle: ${trip.vehicleNumber}`;

  return (
    <Modal isOpen={!!trip} onClose={onClose} title={title} subtitle={subtitle} maxWidth="max-w-md">
      <div className="space-y-4 text-xs">
        {/* Context Information Box */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Clearance context
          </p>
          <div className="grid grid-cols-2 gap-2 text-slate-800">
            <div>
              <span className="text-slate-500">Vehicle:</span>{" "}
              <strong className="font-mono">{trip.vehicleNumber}</strong>
            </div>
            <div>
              <span className="text-slate-500">Transport:</span>{" "}
              <strong className="truncate block">{trip.transport}</strong>
            </div>
            <div>
              <span className="text-slate-500">{isVehicle ? "Freight:" : "Booking:"}</span>{" "}
              <strong className="font-mono text-slate-900">
                {formatCurrency(isVehicle ? trip.freight : trip.booking)}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">{isVehicle ? "Adv Paid:" : "Adv Received:"}</span>{" "}
              <strong className="font-mono text-slate-900">
                {formatCurrency(isVehicle ? trip.advancePaidAmount : trip.advanceReceivedAmount)}
              </strong>
            </div>
          </div>
        </div>

        {/* Real-time Financial Breakdown */}
        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-blue-50/50 border border-blue-100 font-mono text-center">
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase block font-sans">
              Current Balance
            </span>
            <span className="text-sm font-bold text-slate-900">
              {formatCurrency(currentBalance)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase block font-sans">
              Clearing
            </span>
            <span className="text-sm font-bold text-blue-700">
              {!currentError && isValidNumber ? formatCurrency(numAmount) : "—"}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase block font-sans">
              Remaining
            </span>
            <span
              className={`text-sm font-bold ${
                !currentError && isValidNumber && remainingBalance <= 200
                  ? "text-emerald-600"
                  : "text-slate-900"
              }`}
            >
              {!currentError && isValidNumber ? formatCurrency(remainingBalance) : "—"}
            </span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="amount_to_clear_input"
              className="block text-[11px] font-semibold text-slate-700 uppercase mb-1"
            >
              Amount to Clear (₹) *
            </label>
            <input
              id="amount_to_clear_input"
              type="number"
              step="any"
              required
              autoFocus
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="Enter amount to clear"
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-slate-900 font-mono font-bold text-sm focus:outline-none focus:ring-2 transition-colors ${
                currentError || validationError
                  ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/30"
                  : "border-slate-300 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
              }`}
            />
            {(currentError || validationError) && (
              <p className="mt-1 text-[11px] font-medium text-rose-600">
                {currentError || validationError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="cleared_date_input"
              className="block text-[11px] font-semibold text-slate-700 uppercase mb-1"
            >
              Clearance Date *
            </label>
            <input
              id="cleared_date_input"
              type="date"
              required
              value={clearedDate}
              onChange={(e) => setClearedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Business Threshold Settlement Notice */}
          {!currentError && isValidNumber && remainingBalance <= 200 && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Remaining balance ({formatCurrency(remainingBalance)}) is ≤ ₹200. This trip will be
                marked as fully settled.
              </span>
            </div>
          )}

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !!currentError}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>
                {isLoading
                  ? "Clearing..."
                  : !currentError && isValidNumber
                    ? `Clear ${formatCurrency(numAmount)}`
                    : "Clear Balance"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
