import React, { useState, useRef, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { DataTable } from "../components/ui/DataTable";
import { Toast } from "../components/ui/Toast";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { StatusBadge } from "../components/ui/StatusBadge";
import { formatCurrency, formatDate, hasBooking, hasRefund } from "../lib/utils";
import { useAuth } from "../context/AuthContext";

export const DailyEntryPage = ({
  trips,
  onCreateTrip,
  onUpdateTrip,
  onDeleteTrip,
  globalSearch,
  setGlobalSearch,
}) => {
  const { user } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingTripId, setEditingTripId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirmTrip, setDeleteConfirmTrip] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toastRef = useRef(null);

  useEffect(() => {
    if (toast && toast.type === "error") {
      toastRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [toast]);

  // Form State
  const todayStr = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    slNo: "",
    date: todayStr,
    vehicleNumber: "",
    driverPhone: "",
    fromLocation: "",
    toLocation: "",
    freight: "",
    transport: "",
    booking: "",
    refund: "",
    commission: "",
    commissionReceivedType: "",
    advanceReceivedAmount: "",
    advanceReceivedType: "",
    advancePaidAmount: "",
    advancePaidType: "",
    remarks: "",
  });

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

  const resetForm = () => {
    setFormData({
      slNo: "",
      date: todayStr,
      vehicleNumber: "",
      driverPhone: "",
      fromLocation: "",
      toLocation: "",
      freight: "",
      transport: "",
      booking: "",
      refund: "",
      commission: "",
      commissionReceivedType: "",
      advanceReceivedAmount: "",
      advanceReceivedType: "",
      advancePaidAmount: "",
      advancePaidType: "",
      remarks: "",
    });
    setEditingTripId(null);
    setShowForm(false);
  };

  const handleEditClick = (trip) => {
    setEditingTripId(trip.id);
    setFormData({
      slNo: trip.slNo ? String(trip.slNo) : "",
      date: trip.date,
      vehicleNumber: trip.vehicleNumber,
      driverPhone: trip.driverPhone || "",
      fromLocation: trip.fromLocation,
      toLocation: trip.toLocation,
      freight: trip.freight ? String(trip.freight) : "",
      transport: trip.transport,
      booking: trip.booking ? String(trip.booking) : "",
      refund: trip.refund !== null && trip.refund !== undefined ? String(trip.refund) : "",
      commission:
        trip.commission !== null && trip.commission !== undefined ? String(trip.commission) : "",
      commissionReceivedType: trip.commissionReceivedType || "",
      advanceReceivedAmount: trip.advanceReceivedAmount ? String(trip.advanceReceivedAmount) : "",
      advanceReceivedType: trip.advanceReceivedType || "",
      advancePaidAmount: trip.advancePaidAmount ? String(trip.advancePaidAmount) : "",
      advancePaidType: trip.advancePaidType || "",
      remarks: trip.remarks || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const slNoNum = Number(formData.slNo);
    if (!formData.slNo || isNaN(slNoNum) || !Number.isInteger(slNoNum) || slNoNum <= 0) {
      setToast({
        type: "error",
        message: "Sl.No is required and must be a positive integer greater than 0.",
      });
      return;
    }

    if (
      !formData.vehicleNumber ||
      !formData.fromLocation ||
      !formData.toLocation ||
      !formData.transport
    ) {
      setToast({
        type: "error",
        message: "Vehicle Number, From, To, and Transport are required fields.",
      });
      return;
    }

    if (
      isCommissionValid &&
      (!formData.commissionReceivedType || !formData.commissionReceivedType.trim())
    ) {
      setToast({
        type: "error",
        message: "Commission Received Type is required when Commission is entered.",
      });
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
        refund:
          formData.refund !== "" &&
          formData.refund !== null &&
          formData.refund !== undefined &&
          !isNaN(Number(formData.refund)) &&
          Number(formData.refund) >= 0
            ? Number(formData.refund)
            : null,
        commission: formData.commission !== "" ? Number(formData.commission) : null,
        commissionReceivedType: formData.commissionReceivedType,
        advanceReceivedAmount: Number(formData.advanceReceivedAmount) || 0,
        advanceReceivedType: formData.advanceReceivedType,
        advancePaidAmount: Number(formData.advancePaidAmount) || 0,
        advancePaidType: formData.advancePaidType,
        remarks: formData.remarks,
      };

      if (editingTripId) {
        await onUpdateTrip(editingTripId, payload);
        setToast({
          type: "success",
          message: `Trip entry updated successfully.`,
        });
      } else {
        await onCreateTrip(payload);
        setToast({
          type: "success",
          message: `New trip record saved! Sl.No #${payload.slNo}`,
        });
      }

      resetForm();
    } catch (err) {
      const errorMsg =
        typeof err?.message === "string"
          ? err.message
          : err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Error saving trip record.";
      setToast({
        type: "error",
        message: errorMsg,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirmTrip) return;
    setIsDeleting(true);
    try {
      await onDeleteTrip(deleteConfirmTrip.id);
      setToast({
        type: "success",
        message: `Trip #${deleteConfirmTrip.slNo} deleted permanently.`,
      });
      setDeleteConfirmTrip(null);
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Failed to delete trip entry.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter trips
  const filteredTrips = trips.filter((t) => {
    if (!globalSearch.trim()) return true;
    const q = globalSearch.toLowerCase().trim();
    return (
      String(t.slNo).includes(q) ||
      t.vehicleNumber.toLowerCase().includes(q) ||
      (t.driverPhone && t.driverPhone.toLowerCase().includes(q)) ||
      t.date.includes(q) ||
      t.transport.toLowerCase().includes(q) ||
      t.fromLocation.toLowerCase().includes(q) ||
      t.toLocation.toLowerCase().includes(q)
    );
  });

  const columns = [
    { title: "Sl.No" },
    { title: "Date" },
    { title: "Vehicle No" },
    { title: "From" },
    { title: "To" },
    { title: "Freight" },
    { title: "Transport" },
    { title: "Booking" },
    { title: "Refund" },
    { title: "Commission" },
    { title: "Adv Rec Amt" },
    { title: "Rec Type" },
    { title: "Adv Paid Amt" },
    { title: "Paid Type" },
    { title: "Remarks" },
    { title: "Actions", align: "center" },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        badgeText="Daily entry hub"
        title="Daily entry log"
        subtitle="High-frequency operational trip record entry screen with manual Sl.No entry."
        searchPlaceholder="Search Sl.No, Vehicle, Transport..."
        searchValue={globalSearch}
        onSearchChange={setGlobalSearch}
        printId="daily-entry-print-btn"
        actions={
          <button
            id="daily-entry-add-btn"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span>{showForm ? "Cancel Entry" : "+ Add New Trip Entry"}</span>
          </button>
        }
      />

      {/* Toast Notification */}
      {toast && (
        <div ref={toastRef}>
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Entry Form */}
      {showForm && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {editingTripId ? `Edit trip entry` : `New daily trip entry`}
              </h3>
              <p className="text-xs text-slate-500">
                Fill in route, freight, transport, and advance details below.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
              Manual Sl.No
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Section 1: Trip & Route Info */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                1. Trip & route information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
                <div>
                  <label
                    htmlFor="field_slNo"
                    className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                  >
                    1. Sl.No *
                  </label>
                  <input
                    id="field_slNo"
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 10"
                    value={formData.slNo}
                    onChange={(e) => setFormData({ ...formData, slNo: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field_date"
                    className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                  >
                    2. Date *
                  </label>
                  <input
                    id="field_date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field_vehicleNumber"
                    className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                  >
                    3. Vehicle number *
                  </label>
                  <input
                    id="field_vehicleNumber"
                    type="text"
                    required
                    placeholder="e.g. KA-01-AB-1234"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono uppercase font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field_driverPhone"
                    className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                  >
                    Driver Phone Number
                  </label>
                  <input
                    id="field_driverPhone"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={formData.driverPhone}
                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field_fromLocation"
                    className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                  >
                    4. From (Origin) *
                  </label>
                  <input
                    id="field_fromLocation"
                    type="text"
                    required
                    placeholder="e.g. Bangalore"
                    value={formData.fromLocation}
                    onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field_toLocation"
                    className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                  >
                    5. To (Destination) *
                  </label>
                  <input
                    id="field_toLocation"
                    type="text"
                    required
                    placeholder="e.g. Chennai"
                    value={formData.toLocation}
                    onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field_transport"
                    className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                  >
                    7. Transport agency *
                  </label>
                  <input
                    id="field_transport"
                    type="text"
                    required
                    placeholder="e.g. VRL Logistics"
                    value={formData.transport}
                    onChange={(e) => setFormData({ ...formData, transport: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Financial Details */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                2. Freight, refund & commission amounts
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                <div>
                  <label
                    htmlFor="field_freight"
                    className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                  >
                    6. Freight (₹ Vehicle)
                  </label>
                  <input
                    id="field_freight"
                    type="number"
                    min="0"
                    placeholder="e.g. 45000"
                    value={formData.freight}
                    onChange={(e) => setFormData({ ...formData, freight: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field_booking"
                    className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                  >
                    8. Booking (₹ Company)
                  </label>
                  <input
                    id="field_booking"
                    type="number"
                    min="0"
                    placeholder="e.g. 48000"
                    value={formData.booking}
                    onChange={(e) => setFormData({ ...formData, booking: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field_refund"
                    className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                  >
                    Refund Amount (₹) [Blank = Pending]
                  </label>
                  <input
                    id="field_refund"
                    type="number"
                    min="0"
                    placeholder="e.g. 1000 or 0"
                    value={formData.refund}
                    onChange={(e) => setFormData({ ...formData, refund: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field_commission"
                    className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                  >
                    9. Commission (₹ Agent) [Blank = Pending]
                  </label>
                  <input
                    id="field_commission"
                    type="number"
                    min="0"
                    placeholder="e.g. 2000"
                    value={formData.commission}
                    onChange={(e) => handleCommissionChange(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field_commissionReceivedType"
                    className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                  >
                    Commission Received Type
                  </label>
                  <select
                    id="field_commissionReceivedType"
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
                      {!isCommissionValid
                        ? "-- Disabled (Enter Commission) --"
                        : "-- Select type --"}
                    </option>
                    <option value="Cash">Cash</option>
                    <option value="PhonePe">PhonePe</option>
                    <option value="To Pay">To Pay</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Payment Details */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                3. Advances & payment types
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div>
                  <label
                    htmlFor="field_advanceReceivedAmount"
                    className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                  >
                    10. Adv rec amt (₹)
                  </label>
                  <input
                    id="field_advanceReceivedAmount"
                    type="number"
                    min="0"
                    placeholder="e.g. 15000"
                    value={formData.advanceReceivedAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, advanceReceivedAmount: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field_advanceReceivedType"
                    className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                  >
                    11. Adv rec type [Blank = Pending]
                  </label>
                  <select
                    id="field_advanceReceivedType"
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
                    htmlFor="field_advancePaidAmount"
                    className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                  >
                    12. Adv paid amt (₹)
                  </label>
                  <input
                    id="field_advancePaidAmount"
                    type="number"
                    min="0"
                    placeholder="e.g. 10000"
                    value={formData.advancePaidAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, advancePaidAmount: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field_advancePaidType"
                    className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                  >
                    13. Adv paid type [Blank = Pending]
                  </label>
                  <select
                    id="field_advancePaidType"
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
                htmlFor="field_remarks"
                className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
              >
                14. Remarks & operational notes
              </label>
              <input
                id="field_remarks"
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
                onClick={resetForm}
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
                <span>{isSaving ? "Saving..." : "Save Record"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trips Table */}
      <DataTable
        columns={columns}
        data={filteredTrips}
        emptyMessage="No trip entries found in daily entry log."
        renderRow={(t) => (
          <tr key={t.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
            <td className="py-2.5 px-3.5 font-mono font-bold text-blue-700">#{t.slNo}</td>
            <td className="py-2.5 px-3.5 whitespace-nowrap">{formatDate(t.date)}</td>
            <td className="py-2.5 px-3.5 font-mono">
              <div className="font-semibold text-slate-900">{t.vehicleNumber}</div>
              {t.driverPhone && (
                <div className="text-[10px] text-slate-500 font-normal">📱 {t.driverPhone}</div>
              )}
            </td>
            <td className="py-2.5 px-3.5 whitespace-nowrap">{t.fromLocation}</td>
            <td className="py-2.5 px-3.5 whitespace-nowrap">{t.toLocation}</td>
            <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900">
              {formatCurrency(t.freight)}
            </td>
            <td className="py-2.5 px-3.5 truncate max-w-[120px]">{t.transport}</td>
            <td className="py-2.5 px-3.5 font-mono text-slate-600">
              {hasBooking(t) ? (
                formatCurrency(t.booking)
              ) : (
                <StatusBadge type="pending-advance-company" text="Blank" size="sm" />
              )}
            </td>
            <td className="py-2.5 px-3.5 font-mono font-semibold text-slate-900">
              {hasRefund(t) ? (
                formatCurrency(t.refund)
              ) : (
                <StatusBadge type="pending" text="Blank" size="sm" />
              )}
            </td>
            <td className="py-2.5 px-3.5 font-mono font-semibold text-slate-900">
              {t.commission !== null ? (
                formatCurrency(t.commission)
              ) : (
                <StatusBadge type="pending-commission" text="Blank" size="sm" />
              )}
            </td>
            <td className="py-2.5 px-3.5 font-mono">{formatCurrency(t.advanceReceivedAmount)}</td>
            <td className="py-2.5 px-3.5">
              {t.advanceReceivedType ? (
                <StatusBadge type="topay" text={t.advanceReceivedType} size="sm" />
              ) : (
                <span className="text-slate-400 text-[11px]">Blank</span>
              )}
            </td>
            <td className="py-2.5 px-3.5 font-mono">{formatCurrency(t.advancePaidAmount)}</td>
            <td className="py-2.5 px-3.5">
              {t.advancePaidType ? (
                <StatusBadge type="phonepe" text={t.advancePaidType} size="sm" />
              ) : (
                <span className="text-slate-400 text-[11px]">Blank</span>
              )}
            </td>
            <td className="py-2.5 px-3.5 truncate max-w-[120px] text-slate-500">
              {t.remarks || "-"}
            </td>
            <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => handleEditClick(t)}
                  className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-slate-100 transition-colors"
                  title="Edit record"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                {user?.role === "ADMIN" && (
                  <button
                    onClick={() => setDeleteConfirmTrip(t)}
                    className="p-1 rounded text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    title="Delete record (Admin only)"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </td>
          </tr>
        )}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmTrip}
        onClose={() => setDeleteConfirmTrip(null)}
        onConfirm={handleDeleteConfirmed}
        title={`Delete trip entry #${deleteConfirmTrip?.slNo}?`}
        message={`Are you sure you want to permanently delete Trip #${deleteConfirmTrip?.slNo} (${deleteConfirmTrip?.vehicleNumber})? This action cannot be undone.`}
        confirmLabel="Delete Trip"
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
