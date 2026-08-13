import React, { useState } from "react";
import {
  Truck,
  IndianRupee,
  Coins,
  Clock,
  Building2,
  Scale,
  Landmark,
  CheckCircle2,
  Search,
  Eye,
  ArrowRight,
  TrendingUp,
  Printer,
} from "lucide-react";
import { formatCurrency, formatDate } from "../lib/utils";

export const Dashboard = ({
  stats,
  latestTrips,
  onSelectTrip,
  onNavigatePage,
  globalSearch,
  setGlobalSearch,
}) => {
  const [selectedTripModal, setSelectedTripModal] = useState(null);

  const cards = [
    {
      id: "today-vehicles",
      title: "Today's Vehicles",
      value: stats?.todayVehiclesCount || 0,
      subtext: "Vehicles entered today",
      icon: Truck,
      color: "bg-blue-600 text-white",
      border: "border-blue-200 dark:border-blue-900",
      action: () => onNavigatePage("daily-entry"),
    },
    {
      id: "today-freight",
      title: "Today's Freight",
      value: formatCurrency(stats?.todayFreightTotal || 0),
      subtext: "Total freight generated today",
      icon: IndianRupee,
      color: "bg-indigo-600 text-white",
      border: "border-indigo-200 dark:border-indigo-900",
      action: () => onNavigatePage("reports"),
    },
    {
      id: "today-commission",
      title: "Today's Commission",
      value: formatCurrency(stats?.todayCommissionTotal || 0),
      subtext: "Commission earned today",
      icon: Coins,
      color: "bg-emerald-600 text-white",
      border: "border-emerald-200 dark:border-emerald-900",
      action: () => onNavigatePage("reports"),
    },
    {
      id: "pending-commission",
      title: "Pending Commission",
      value: stats?.pendingCommissionCount || 0,
      subtext: "Trips with missing commission",
      icon: Clock,
      color: "bg-amber-500 text-white",
      border: "border-amber-200 dark:border-amber-900",
      action: () => onNavigatePage("pending-commission"),
    },
    {
      id: "pending-vehicle-advance",
      title: "Pending Vehicle Advance",
      value: stats?.pendingVehicleAdvanceCount || 0,
      subtext: "Vehicle advance payment pending",
      icon: Truck,
      color: "bg-orange-500 text-white",
      border: "border-orange-200 dark:border-orange-900",
      action: () => onNavigatePage("pending-advance-vehicle"),
    },
    {
      id: "pending-company-advance",
      title: "Pending Company Advance",
      value: stats?.pendingCompanyAdvanceCount || 0,
      subtext: "Company advance collection pending",
      icon: Building2,
      color: "bg-cyan-600 text-white",
      border: "border-cyan-200 dark:border-cyan-900",
      action: () => onNavigatePage("pending-advance-company"),
    },
    {
      id: "balance-vehicle",
      title: "Balance Vehicle",
      value: stats?.balanceVehicleCount || 0,
      subtext: "Freight balance > ₹200 pending",
      icon: Scale,
      color: "bg-purple-600 text-white",
      border: "border-purple-200 dark:border-purple-900",
      action: () => onNavigatePage("balance-vehicle"),
    },
    {
      id: "balance-company",
      title: "Balance Company",
      value: stats?.balanceCompanyCount || 0,
      subtext: "Booking balance > ₹200 pending",
      icon: Landmark,
      color: "bg-pink-600 text-white",
      border: "border-pink-200 dark:border-pink-900",
      action: () => onNavigatePage("balance-company"),
    },
    {
      id: "completed-trips",
      title: "Completed Trips Today",
      value: stats?.completedTripsTodayCount || 0,
      subtext: "Trips fully settled today",
      icon: CheckCircle2,
      color: "bg-teal-600 text-white",
      border: "border-teal-200 dark:border-teal-900",
      action: () => onNavigatePage("completed"),
    },
  ];

  // Filter latest trips
  const filteredTrips = latestTrips.filter((t) => {
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
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-2">
              <TrendingUp className="h-3.5 w-3.5" /> Live Operational Overview
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Transport Commission Dashboard
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Track daily freight entries, pending advances, vehicle/company
              balances, and completed trips in real-time.
            </p>
          </div>
          <button
            id="dash-add-trip-btn"
            onClick={() => onNavigatePage("daily-entry")}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-transform active:scale-95"
          >
            <span>+ New Trip Entry</span>
          </button>
        </div>
      </div>

      {/* 9 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              id={`card-${card.id}`}
              onClick={card.action}
              className={`p-5 rounded-xl bg-white dark:bg-slate-900 border ${card.border} shadow-xs hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {card.title}
                </p>
                <div
                  className={`p-2.5 rounded-xl ${card.color} shadow-sm group-hover:scale-110 transition-transform`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {card.value}
                </h3>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                  {card.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Latest 20 Trips Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Latest 20 Trips
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recent transport entries with auto-calculated workflow status
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                id="dash-table-search-input"
                type="text"
                placeholder="Search Sl.No, Vehicle, Transport, From, To..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              id="dash-print-btn"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
              title="Print Dashboard View"
            >
              <Printer className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Sl.No</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Vehicle Number</th>
                <th className="py-3.5 px-4">Route</th>
                <th className="py-3.5 px-4">Freight</th>
                <th className="py-3.5 px-4">Booking</th>
                <th className="py-3.5 px-4">Commission</th>
                <th className="py-3.5 px-4">Transport</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No matching trip records found.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => (
                  <tr
                    key={trip.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">
                      #{trip.slNo}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {formatDate(trip.date)}
                    </td>
                    <td className="py-3.5 px-4 font-bold tracking-wider">
                      <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                        {trip.vehicleNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <span>{trip.fromLocation}</span>
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                        <span>{trip.toLocation}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(trip.freight)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {formatCurrency(trip.booking)}
                    </td>
                    <td className="py-3.5 px-4">
                      {trip.commission !== null ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(trip.commission)}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 truncate max-w-[150px]">
                      {trip.transport}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedTripModal(trip)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        title="View Full Trip Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trip Details Modal */}
      {selectedTripModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">
                  Trip Details #{selectedTripModal.slNo}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Vehicle: {selectedTripModal.vehicleNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTripModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 text-xs">
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">
                  Date
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {formatDate(selectedTripModal.date)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">
                  Transport
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedTripModal.transport}
                </p>
              </div>
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">
                  From Location
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedTripModal.fromLocation}
                </p>
              </div>
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">
                  To Location
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedTripModal.toLocation}
                </p>
              </div>
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">
                  Freight
                </p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(selectedTripModal.freight)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">
                  Booking
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(selectedTripModal.booking)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">
                  Commission
                </p>
                <p className="font-bold text-blue-600 dark:text-blue-400">
                  {selectedTripModal.commission !== null
                    ? formatCurrency(selectedTripModal.commission)
                    : "Not Entered"}
                </p>
              </div>
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">
                  Advance Paid
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(selectedTripModal.advancePaidAmount)} (
                  {selectedTripModal.advancePaidType || "Pending"})
                </p>
              </div>
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">
                  Advance Received
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(selectedTripModal.advanceReceivedAmount)} (
                  {selectedTripModal.advanceReceivedType || "Pending"})
                </p>
              </div>
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">
                  Remarks
                </p>
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  {selectedTripModal.remarks || "None"}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedTripModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
