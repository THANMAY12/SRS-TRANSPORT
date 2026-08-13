import React, { useState } from "react";
import { Search, CheckCircle2, Printer } from "lucide-react";
import { formatCurrency, formatDate, calculateDaysPending } from "../lib/utils";

export const BalanceVehiclePage = ({
  trips,
  onClearBalance,
  globalSearch,
  setGlobalSearch,
}) => {
  const [clearingId, setClearingId] = useState(null);

  // Filter trips where Advance Paid is completed (advancePaidType is set) AND (Freight - advancePaidAmount > 200) AND !vehicleBalanceCleared
  const balanceVehicleTrips = trips.filter((t) => {
    if (!t.advancePaidType || t.advancePaidType.trim() === "") return false;
    const balance = t.freight - t.advancePaidAmount;
    if (balance <= 200) return false;
    if (t.vehicleBalanceCleared) return false;

    if (!globalSearch.trim()) return true;
    const q = globalSearch.toLowerCase().trim();
    return (
      String(t.slNo).includes(q) ||
      t.vehicleNumber.toLowerCase().includes(q) ||
      t.transport.toLowerCase().includes(q) ||
      t.fromLocation.toLowerCase().includes(q) ||
      t.toLocation.toLowerCase().includes(q)
    );
  });

  const handleClear = async (trip) => {
    const balance = trip.freight - trip.advancePaidAmount;
    if (
      !confirm(
        `Clear Vehicle Balance of ${formatCurrency(balance)} for Trip #${trip.slNo} (${trip.vehicleNumber})?`,
      )
    ) {
      return;
    }

    setClearingId(trip.id);
    try {
      await onClearBalance(trip.id);
    } catch (err) {
      alert(err.message || "Failed to clear balance");
    } finally {
      setClearingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Page 5
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Balance for Vehicle ({balanceVehicleTrips.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Auto-created when Freight − Advance Paid Amount &gt; ₹200.
            Automatically removed once balance is cleared.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search vehicle balance..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            id="balance-vehicle-print-btn"
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
            title="Print Vehicle Balance Table"
          >
            <Printer className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-purple-500/10 text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider border-b border-purple-500/20">
              <tr>
                <th className="py-3.5 px-4">Sl.No</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Vehicle Number</th>
                <th className="py-3.5 px-4">From</th>
                <th className="py-3.5 px-4">To</th>
                <th className="py-3.5 px-4">Freight</th>
                <th className="py-3.5 px-4">Transport</th>
                <th className="py-3.5 px-4">Booking</th>
                <th className="py-3.5 px-4">Advance Paid Amount</th>
                <th className="py-3.5 px-4">Balance Amount</th>
                <th className="py-3.5 px-4">Balance Due Date</th>
                <th className="py-3.5 px-4">Days Pending</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {balanceVehicleTrips.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-400">
                    🎉 No active vehicle balances exceeding ₹200 pending!
                  </td>
                </tr>
              ) : (
                balanceVehicleTrips.map((trip) => {
                  const balanceAmount = trip.freight - trip.advancePaidAmount;
                  const daysPending = calculateDaysPending(
                    trip.advanceDueDate || trip.date,
                  );
                  return (
                    <tr
                      key={trip.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-purple-600 dark:text-purple-400">
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
                        {formatCurrency(trip.advancePaidAmount)}
                      </td>
                      <td className="py-3.5 px-4 font-black text-rose-600 dark:text-rose-400 text-sm">
                        {formatCurrency(balanceAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        {formatDate(trip.advanceDueDate || trip.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                          {daysPending} Day{daysPending !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          Balance Due
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          disabled={clearingId === trip.id}
                          onClick={() => handleClear(trip)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1 mx-auto transition-transform active:scale-95"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>
                            {clearingId === trip.id
                              ? "Clearing..."
                              : "Clear Balance"}
                          </span>
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
    </div>
  );
};
