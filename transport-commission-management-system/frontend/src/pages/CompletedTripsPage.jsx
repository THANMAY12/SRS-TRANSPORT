import React from "react";
import { CheckCircle2, Search, Printer } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  isCompletedTrip,
  getVehicleBalanceAmount,
  getCompanyBalanceAmount,
} from "../lib/utils";

export const CompletedTripsPage = ({
  trips,
  globalSearch,
  setGlobalSearch,
}) => {
  // Filter completed trips
  const completedTrips = trips.filter((t) => {
    if (!isCompletedTrip(t)) return false;

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

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Page 7
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Completed Trips ({completedTrips.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Auto-archived when commission is entered, advances are settled, and
            balances &le; ₹200 or cleared.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search completed trips..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            id="completed-trips-print-btn"
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
            title="Print Completed Trips Table"
          >
            <Printer className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-emerald-500/10 text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider border-b border-emerald-500/20">
              <tr>
                <th className="py-3.5 px-3">Sl.No</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-3">Vehicle Number</th>
                <th className="py-3.5 px-3">From</th>
                <th className="py-3.5 px-3">To</th>
                <th className="py-3.5 px-3">Freight</th>
                <th className="py-3.5 px-3">Transport</th>
                <th className="py-3.5 px-3">Booking</th>
                <th className="py-3.5 px-3">Commission</th>
                <th className="py-3.5 px-3">Advance Received</th>
                <th className="py-3.5 px-3">Advance Paid</th>
                <th className="py-3.5 px-3">Vehicle Balance</th>
                <th className="py-3.5 px-3">Company Balance</th>
                <th className="py-3.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {completedTrips.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-400">
                    No fully completed trips yet. Complete commission, advances,
                    and balances to see records here.
                  </td>
                </tr>
              ) : (
                completedTrips.map((trip) => {
                  const vehBal = getVehicleBalanceAmount(trip);
                  const compBal = getCompanyBalanceAmount(trip);
                  return (
                    <tr
                      key={trip.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                        #{trip.slNo}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {formatDate(trip.date)}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold">
                        {trip.vehicleNumber}
                      </td>
                      <td className="py-3.5 px-3">{trip.fromLocation}</td>
                      <td className="py-3.5 px-3">{trip.toLocation}</td>
                      <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                        {formatCurrency(trip.freight)}
                      </td>
                      <td className="py-3.5 px-3 truncate max-w-[120px]">
                        {trip.transport}
                      </td>
                      <td className="py-3.5 px-3">
                        {formatCurrency(trip.booking)}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(trip.commission)}
                      </td>
                      <td className="py-3.5 px-3">
                        {formatCurrency(trip.advanceReceivedAmount)} (
                        {trip.advanceReceivedType})
                      </td>
                      <td className="py-3.5 px-3">
                        {formatCurrency(trip.advancePaidAmount)} (
                        {trip.advancePaidType})
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-600 dark:text-slate-400">
                        {vehBal <= 200
                          ? "Cleared / ≤₹200"
                          : formatCurrency(vehBal)}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-600 dark:text-slate-400">
                        {compBal <= 200
                          ? "Cleared / ≤₹200"
                          : formatCurrency(compBal)}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Completed
                        </span>
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
