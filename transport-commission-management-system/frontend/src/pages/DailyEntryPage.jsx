import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Save,
  X,
  Search,
  Printer,
} from "lucide-react";
import { formatCurrency, formatDate } from "../lib/utils";
import { useAuth } from "../context/AuthContext";

export const DailyEntryPage = ({
  trips,
  nextSlNo,
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
  const [autoSaveFeedback, setAutoSaveFeedback] = useState(null);

  // Form State
  const todayStr = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    date: todayStr,
    vehicleNumber: "",
    fromLocation: "",
    toLocation: "",
    freight: "",
    transport: "",
    booking: "",
    commission: "",
    advanceReceivedAmount: "",
    advanceReceivedType: "",
    advancePaidAmount: "",
    advancePaidType: "",
    remarks: "",
  });

  const resetForm = () => {
    setFormData({
      date: todayStr,
      vehicleNumber: "",
      fromLocation: "",
      toLocation: "",
      freight: "",
      transport: "",
      booking: "",
      commission: "",
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
      date: trip.date,
      vehicleNumber: trip.vehicleNumber,
      fromLocation: trip.fromLocation,
      toLocation: trip.toLocation,
      freight: String(trip.freight),
      transport: trip.transport,
      booking: String(trip.booking),
      commission: trip.commission !== null ? String(trip.commission) : "",
      advanceReceivedAmount: String(trip.advanceReceivedAmount),
      advanceReceivedType: trip.advanceReceivedType,
      advancePaidAmount: String(trip.advancePaidAmount),
      advancePaidType: trip.advancePaidType,
      remarks: trip.remarks,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.vehicleNumber ||
      !formData.fromLocation ||
      !formData.toLocation ||
      !formData.transport
    ) {
      alert("Vehicle Number, From, To, and Transport are required fields.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        date: formData.date,
        vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
        fromLocation: formData.fromLocation.trim(),
        toLocation: formData.toLocation.trim(),
        freight: Number(formData.freight) || 0,
        transport: formData.transport.trim(),
        booking: Number(formData.booking) || 0,
        commission:
          formData.commission !== "" ? Number(formData.commission) : null,
        advanceReceivedAmount: Number(formData.advanceReceivedAmount) || 0,
        advanceReceivedType: formData.advanceReceivedType,
        advancePaidAmount: Number(formData.advancePaidAmount) || 0,
        advancePaidType: formData.advancePaidType,
        remarks: formData.remarks,
      };

      if (editingTripId) {
        await onUpdateTrip(editingTripId, payload);
        setAutoSaveFeedback(`Trip #${editingTripId} updated successfully.`);
      } else {
        await onCreateTrip(payload);
        setAutoSaveFeedback(`Record saved automatically! Sl.No #${nextSlNo}`);
      }

      resetForm();
      setTimeout(() => setAutoSaveFeedback(null), 4000);
    } catch (err) {
      alert(err.message || "Error saving trip record");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter trips
  const filteredTrips = trips.filter((t) => {
    if (!globalSearch.trim()) return true;
    const q = globalSearch.toLowerCase().trim();
    return (
      String(t.slNo).includes(q) ||
      t.vehicleNumber.toLowerCase().includes(q) ||
      t.date.includes(q) ||
      t.transport.toLowerCase().includes(q) ||
      t.fromLocation.toLowerCase().includes(q) ||
      t.toLocation.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Page 1
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Daily Entry Log
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Auto-generate Sl.No & save every record automatically with full
            transport tracking.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            id="daily-entry-print-btn"
            onClick={() => window.print()}
            className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Print Table View"
          >
            <Printer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Print View</span>
          </button>

          <button
            id="daily-entry-add-btn"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-2 transition-transform active:scale-95"
          >
            {showForm ? (
              <X className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>
              {showForm
                ? "Cancel Entry"
                : `+ New Entry (Auto Sl.No #${nextSlNo})`}
            </span>
          </button>
        </div>
      </div>

      {/* Auto Save Banner Toast */}
      {autoSaveFeedback && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>{autoSaveFeedback}</span>
        </div>
      )}

      {/* Entry Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-md">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {editingTripId
                ? `Edit Trip Entry`
                : `New Daily Trip Entry (Sl.No #${nextSlNo})`}
            </h3>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full">
              Auto-Save Active
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Sl.No Auto */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  1. Sl.No (Auto Generated)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`#${editingTripId ? trips.find((t) => t.id === editingTripId)?.slNo : nextSlNo}`}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-bold"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  2. Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Vehicle Number */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  3. Vehicle Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA-01-AB-1234"
                  value={formData.vehicleNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono uppercase font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* From */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  4. From *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangalore"
                  value={formData.fromLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, fromLocation: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* To */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  5. To *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chennai"
                  value={formData.toLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, toLocation: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Freight */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  6. Freight (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 45000"
                  value={formData.freight}
                  onChange={(e) =>
                    setFormData({ ...formData, freight: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Transport */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  7. Transport *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VRL Logistics"
                  value={formData.transport}
                  onChange={(e) =>
                    setFormData({ ...formData, transport: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Booking */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  8. Booking (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 48000"
                  value={formData.booking}
                  onChange={(e) =>
                    setFormData({ ...formData, booking: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Commission */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  9. Commission (₹) [Leave blank if pending]
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 2000"
                  value={formData.commission}
                  onChange={(e) =>
                    setFormData({ ...formData, commission: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Advance Received Amount */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  10. Advance Received Amt (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 15000"
                  value={formData.advanceReceivedAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      advanceReceivedAmount: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Advance Received Type Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  11. Advance Received Type
                </label>
                <select
                  value={formData.advanceReceivedType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      advanceReceivedType: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Type (Blank = Pending) --</option>
                  <option value="Cash">Cash</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="To Pay">To Pay</option>
                </select>
              </div>

              {/* Advance Paid Amount */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  12. Advance Paid Amt (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 10000"
                  value={formData.advancePaidAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      advancePaidAmount: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Advance Paid Type Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  13. Advance Paid Type
                </label>
                <select
                  value={formData.advancePaidType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      advancePaidType: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Type (Blank = Pending) --</option>
                  <option value="Cash">Cash</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="To Pay">To Pay</option>
                </select>
              </div>

              {/* Remarks */}
              <div className="sm:col-span-2 md:col-span-3 xl:col-span-4">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  14. Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Additional loading charge, driver contact no..."
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                <span>
                  {isSaving ? "Saving Record..." : "Save Record Automatically"}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trips Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              All Daily Entries ({filteredTrips.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time daily transport commission database log
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Sl.No, Vehicle, Transport, Route..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3">1. Sl.No</th>
                <th className="py-3 px-3">2. Date</th>
                <th className="py-3 px-3">3. Vehicle No</th>
                <th className="py-3 px-3">4. From</th>
                <th className="py-3 px-3">5. To</th>
                <th className="py-3 px-3">6. Freight</th>
                <th className="py-3 px-3">7. Transport</th>
                <th className="py-3 px-3">8. Booking</th>
                <th className="py-3 px-3">9. Commission</th>
                <th className="py-3 px-3">10. Adv Rec</th>
                <th className="py-3 px-3">11. Rec Type</th>
                <th className="py-3 px-3">12. Adv Paid</th>
                <th className="py-3 px-3">13. Paid Type</th>
                <th className="py-3 px-3">14. Remarks</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-400">
                    No daily entry records found.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-blue-600 dark:text-blue-400">
                      #{t.slNo}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {formatDate(t.date)}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      {t.vehicleNumber}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {t.fromLocation}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {t.toLocation}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(t.freight)}
                    </td>
                    <td className="py-3 px-3 truncate max-w-[120px]">
                      {t.transport}
                    </td>
                    <td className="py-3 px-3">{formatCurrency(t.booking)}</td>
                    <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {t.commission !== null ? (
                        formatCurrency(t.commission)
                      ) : (
                        <span className="text-amber-500">Blank</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {formatCurrency(t.advanceReceivedAmount)}
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      {t.advanceReceivedType ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                          {t.advanceReceivedType}
                        </span>
                      ) : (
                        <span className="text-slate-400">Blank</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {formatCurrency(t.advancePaidAmount)}
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      {t.advancePaidType ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
                          {t.advancePaidType}
                        </span>
                      ) : (
                        <span className="text-slate-400">Blank</span>
                      )}
                    </td>
                    <td className="py-3 px-3 truncate max-w-[120px] text-slate-500">
                      {t.remarks || "-"}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEditClick(t)}
                          className="p-1 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          title="Edit Record"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {user?.role === "ADMIN" && (
                          <button
                            onClick={async () => {
                              if (
                                confirm(
                                  `Are you sure you want to delete Trip #${t.slNo}?`,
                                )
                              ) {
                                await onDeleteTrip(t.id);
                              }
                            }}
                            className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                            title="Delete Record (Admin Only)"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
