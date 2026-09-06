import React, { useState, useEffect } from "react";
import { Save, AlertCircle } from "lucide-react";
import { Modal } from "../ui/Modal";

export const EditTripModal = ({ trip, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    slNo: "",
    date: "",
    vehicleNumber: "",
    driverPhone: "",
    fromLocation: "",
    toLocation: "",
    freight: "",
    transport: "",
    booking: "",
    commission: "",
    commissionReceivedType: "",
    advanceReceivedAmount: "",
    advanceReceivedType: "",
    advancePaidAmount: "",
    advancePaidType: "",
    remarks: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (trip) {
      setFormData({
        slNo: trip.slNo ? String(trip.slNo) : "",
        date: trip.date || "",
        vehicleNumber: trip.vehicleNumber || "",
        driverPhone: trip.driverPhone || "",
        fromLocation: trip.fromLocation || "",
        toLocation: trip.toLocation || "",
        freight: trip.freight !== undefined && trip.freight !== null ? String(trip.freight) : "",
        transport: trip.transport || "",
        booking: trip.booking !== undefined && trip.booking !== null ? String(trip.booking) : "",
        commission:
          trip.commission !== null && trip.commission !== undefined ? String(trip.commission) : "",
        commissionReceivedType: trip.commissionReceivedType || "",
        advanceReceivedAmount:
          trip.advanceReceivedAmount !== undefined && trip.advanceReceivedAmount !== null
            ? String(trip.advanceReceivedAmount)
            : "",
        advanceReceivedType: trip.advanceReceivedType || "",
        advancePaidAmount:
          trip.advancePaidAmount !== undefined && trip.advancePaidAmount !== null
            ? String(trip.advancePaidAmount)
            : "",
        advancePaidType: trip.advancePaidType || "",
        remarks: trip.remarks || "",
      });
      setError(null);
    }
  }, [trip]);

  if (!trip) return null;

  const isCommissionValid =
    formData.commission !== "" &&
    formData.commission !== null &&
    formData.commission !== undefined &&
    !isNaN(Number(formData.commission)) &&
    Number(formData.commission) > 0;

  const handleCommissionChange = (val) => {
    const numVal = Number(val);
    const isValid = val !== "" && val !== null && val !== undefined && !isNaN(numVal) && numVal > 0;

    setFormData((prev) => ({
      ...prev,
      commission: val,
      commissionReceivedType: isValid ? prev.commissionReceivedType : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const slNoNum = Number(formData.slNo);
    if (!formData.slNo || isNaN(slNoNum) || !Number.isInteger(slNoNum) || slNoNum <= 0) {
      setError("Sl.No is required and must be a positive integer greater than 0.");
      return;
    }

    if (
      !formData.vehicleNumber ||
      !formData.fromLocation ||
      !formData.toLocation ||
      !formData.transport
    ) {
      setError("Vehicle Number, From, To, and Transport are required fields.");
      return;
    }

    if (
      isCommissionValid &&
      (!formData.commissionReceivedType || !formData.commissionReceivedType.trim())
    ) {
      setError("Commission Received Type is required when Commission is entered.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        slNo: slNoNum,
        date: formData.date,
        vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
        driverPhone: formData.driverPhone.trim(),
        fromLocation: formData.fromLocation.trim(),
        toLocation: formData.toLocation.trim(),
        freight: Number(formData.freight) || 0,
        transport: formData.transport.trim(),
        booking:
          formData.booking !== "" &&
          formData.booking !== null &&
          formData.booking !== undefined &&
          !isNaN(Number(formData.booking))
            ? Number(formData.booking)
            : null,
        commission: formData.commission !== "" ? Number(formData.commission) : null,
        commissionReceivedType: formData.commissionReceivedType,
        advanceReceivedAmount: Number(formData.advanceReceivedAmount) || 0,
        advanceReceivedType: formData.advanceReceivedType,
        advancePaidAmount: Number(formData.advancePaidAmount) || 0,
        advancePaidType: formData.advancePaidType,
        remarks: formData.remarks,
      };

      await onSave(trip.id, payload);
      onClose();
    } catch (err) {
      const errorMsg =
        typeof err?.message === "string"
          ? err.message
          : err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Error updating trip entry.";
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={!!trip}
      onClose={onClose}
      title={`Edit Trip Entry — #${trip.slNo}`}
      subtitle="Modify daily trip details before approval. Approval status will remain Pending."
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Trip & Route Info */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
              1. Trip & Route Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div>
                <label
                  htmlFor="edit_slNo"
                  className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                >
                  Sl.No *
                </label>
                <input
                  id="edit_slNo"
                  type="number"
                  min="1"
                  required
                  value={formData.slNo}
                  onChange={(e) => setFormData({ ...formData, slNo: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="edit_date"
                  className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                >
                  Date *
                </label>
                <input
                  id="edit_date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="edit_vehicleNumber"
                  className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                >
                  Vehicle Number *
                </label>
                <input
                  id="edit_vehicleNumber"
                  type="text"
                  required
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono uppercase font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="edit_driverPhone"
                  className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                >
                  Driver Phone Number
                </label>
                <input
                  id="edit_driverPhone"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.driverPhone}
                  onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="edit_fromLocation"
                  className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                >
                  From (Origin) *
                </label>
                <input
                  id="edit_fromLocation"
                  type="text"
                  required
                  value={formData.fromLocation}
                  onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="edit_toLocation"
                  className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                >
                  To (Destination) *
                </label>
                <input
                  id="edit_toLocation"
                  type="text"
                  required
                  value={formData.toLocation}
                  onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="edit_transport"
                  className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                >
                  Transport Agency *
                </label>
                <input
                  id="edit_transport"
                  type="text"
                  required
                  value={formData.transport}
                  onChange={(e) => setFormData({ ...formData, transport: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Freight & Commission */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
              2. Freight & Commission Amounts
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label
                  htmlFor="edit_freight"
                  className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                >
                  Freight (₹ Vehicle)
                </label>
                <input
                  id="edit_freight"
                  type="number"
                  min="0"
                  value={formData.freight}
                  onChange={(e) => setFormData({ ...formData, freight: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="edit_booking"
                  className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                >
                  Booking (₹ Company)
                </label>
                <input
                  id="edit_booking"
                  type="number"
                  min="0"
                  value={formData.booking}
                  onChange={(e) => setFormData({ ...formData, booking: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="edit_commission"
                  className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                >
                  Commission (₹ Agent)
                </label>
                <input
                  id="edit_commission"
                  type="number"
                  min="0"
                  value={formData.commission}
                  onChange={(e) => handleCommissionChange(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="edit_commissionReceivedType"
                  className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                >
                  Commission Type
                </label>
                <select
                  id="edit_commissionReceivedType"
                  disabled={!isCommissionValid}
                  value={formData.commissionReceivedType}
                  onChange={(e) =>
                    setFormData({ ...formData, commissionReceivedType: e.target.value })
                  }
                  className={`w-full px-3 py-1.5 border rounded-lg font-medium text-xs transition-colors ${
                    !isCommissionValid
                      ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                  }`}
                >
                  <option value="">
                    {!isCommissionValid ? "-- Disabled (No Comm) --" : "-- Select type --"}
                  </option>
                  <option value="Cash">Cash</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="To Pay">To Pay</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Advances & Payment Types */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
              3. Advances & Payment Types
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label
                  htmlFor="edit_advanceReceivedAmount"
                  className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                >
                  Adv Rec Amt (₹)
                </label>
                <input
                  id="edit_advanceReceivedAmount"
                  type="number"
                  min="0"
                  value={formData.advanceReceivedAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, advanceReceivedAmount: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="edit_advanceReceivedType"
                  className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                >
                  Adv Rec Type
                </label>
                <select
                  id="edit_advanceReceivedType"
                  value={formData.advanceReceivedType}
                  onChange={(e) =>
                    setFormData({ ...formData, advanceReceivedType: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                >
                  <option value="">-- Select type (Pending) --</option>
                  <option value="Cash">Cash</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="To Pay">To Pay</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit_advancePaidAmount"
                  className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                >
                  Adv Paid Amt (₹)
                </label>
                <input
                  id="edit_advancePaidAmount"
                  type="number"
                  min="0"
                  value={formData.advancePaidAmount}
                  onChange={(e) => setFormData({ ...formData, advancePaidAmount: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="edit_advancePaidType"
                  className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                >
                  Adv Paid Type
                </label>
                <select
                  id="edit_advancePaidType"
                  value={formData.advancePaidType}
                  onChange={(e) => setFormData({ ...formData, advancePaidType: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                >
                  <option value="">-- Select type (Pending) --</option>
                  <option value="Cash">Cash</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="To Pay">To Pay</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Remarks */}
          <div>
            <label
              htmlFor="edit_remarks"
              className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
            >
              Remarks & Operational Notes
            </label>
            <input
              id="edit_remarks"
              type="text"
              placeholder="e.g. Extra loading charge ₹500, driver contact..."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
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
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
