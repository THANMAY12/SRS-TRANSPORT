import React, { useState } from "react";
import { Check, Search, Coins, Printer } from "lucide-react";
import { formatCurrency, formatDate, calculateDaysPending } from "../lib/utils";

export const PendingCommissionPage = ({
  trips,
  onUpdateTrip,
  globalSearch,
  setGlobalSearch,
}) => {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [commissionInput, setCommissionInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter pending commission trips (commission === null || commission === undefined)
  const pendingTrips = trips.filter(
    (t) =>
      (t.commission === null || t.commission === undefined) &&
      (!globalSearch.trim() ||
        String(t.slNo).includes(globalSearch.trim()) ||
        t.vehicleNumber
          .toLowerCase()
          .includes(globalSearch.toLowerCase().trim()) ||
        t.transport.toLowerCase().includes(globalSearch.toLowerCase().trim()) ||
        t.fromLocation
          .toLowerCase()
          .includes(globalSearch.toLowerCase().trim()) ||
        t.toLocation.toLowerCase().includes(globalSearch.toLowerCase().trim())),
  );

  const handleOpenCommissionModal = (trip) => {
    setSelectedTrip(trip);
    setCommissionInput("");
  };

  const handleSaveCommission = async (e) => {
    e.preventDefault();
    if (!selectedTrip) return;
    if (commissionInput === "" || isNaN(Number(commissionInput))) {
      alert("Please enter a valid commission amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateTrip(selectedTrip.id, {
        commission: Number(commissionInput),
      });
      setSelectedTrip(null);
      setCommissionInput("");
    } catch (err) {
      alert(err.message || "Failed to update commission");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Page 2
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Pending Commission ({pendingTrips.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automatically displays records where Commission is blank. Once
            entered, records move automatically out of this queue.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search pending commission..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            id="pending-commission-print-btn"
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
            title="Print Pending Commission Table"
          >
            <Printer className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-amber-500/10 text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider border-b border-amber-500/20">
              <tr>
                <th className="py-3.5 px-4">Sl.No</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Vehicle Number</th>
                <th className="py-3.5 px-4">From</th>
                <th className="py-3.5 px-4">To</th>
                <th className="py-3.5 px-4">Freight</th>
                <th className="py-3.5 px-4">Transport</th>
                <th className="py-3.5 px-4">Booking</th>
                <th className="py-3.5 px-4">Commission Due Date</th>
                <th className="py-3.5 px-4">Days Pending</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {pendingTrips.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    🎉 No pending commission items! All trips have commission
                    assigned.
                  </td>
                </tr>
              ) : (
                pendingTrips.map((trip) => {
                  const daysPending = calculateDaysPending(
                    trip.commissionDueDate || trip.date,
                  );
                  return (
                    <tr
                      key={trip.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-amber-600 dark:text-amber-400">
                        #{trip.slNo}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {formatDate(trip.date)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {trip.vehicleNumber}
                      </td>
                      <td className="py-3.5 px-4">{trip.fromLocation}</td>
                      <td className="py-3.5 px-4">{trip.toLocation}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {formatCurrency(trip.freight)}
                      </td>
                      <td className="py-3.5 px-4">{trip.transport}</td>
                      <td className="py-3.5 px-4">
                        {formatCurrency(trip.booking)}
                      </td>
                      <td className="py-3.5 px-4">
                        {formatDate(trip.commissionDueDate || trip.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            daysPending > 3
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {daysPending} Day{daysPending !== 1 ? "s" : ""}{" "}
                          Pending
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenCommissionModal(trip)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1 mx-auto transition-transform active:scale-95"
                        >
                          <Coins className="h-3.5 w-3.5" />
                          <span>Enter Commission</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enter Commission Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Enter Commission for Trip #{selectedTrip.slNo}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Vehicle:{" "}
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {selectedTrip.vehicleNumber}
              </span>{" "}
              ({selectedTrip.fromLocation} → {selectedTrip.toLocation})
            </p>

            <form onSubmit={handleSaveCommission} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Commission Amount (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  autoFocus
                  placeholder="e.g. 2500"
                  value={commissionInput}
                  onChange={(e) => setCommissionInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTrip(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  <span>
                    {isSubmitting ? "Saving..." : "Save & Remove from Queue"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
