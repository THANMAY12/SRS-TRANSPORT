import React from "react";
import { PageHeader } from "../components/ui/PageHeader";
import { DataTable } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";
import {
  formatCurrency,
  formatDate,
  isCompletedTrip,
  getVehicleBalanceAmount,
  getCompanyBalanceAmount,
} from "../lib/utils";

export const CompletedTripsPage = ({ trips, globalSearch, setGlobalSearch }) => {
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

  const columns = [
    { title: "Sl.No" },
    { title: "Date" },
    { title: "Vehicle Number" },
    { title: "From" },
    { title: "To" },
    { title: "Freight" },
    { title: "Transport" },
    { title: "Booking" },
    { title: "Commission" },
    { title: "Adv Received" },
    { title: "Adv Paid" },
    { title: "Vehicle Balance" },
    { title: "Company Balance" },
    { title: "Status", align: "center" },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        badgeText="Completed archive"
        title={`Completed trips (${completedTrips.length})`}
        subtitle="All financial obligations have been satisfied or cleared. Trips auto-archive once commission is filled, advance types recorded, and balances ≤ ₹200 or cleared."
        searchPlaceholder="Search completed trips..."
        searchValue={globalSearch}
        onSearchChange={setGlobalSearch}
        printId="completed-trips-print-btn"
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={completedTrips}
        headerBg="bg-slate-50"
        emptyMessage="No fully completed trips yet. Complete commission, advance payment types, and balances to archive records here."
        renderRow={(trip) => {
          const vehBal = getVehicleBalanceAmount(trip);
          const compBal = getCompanyBalanceAmount(trip);
          return (
            <tr
              key={trip.id}
              className="hover:bg-slate-50 transition-colors border-b border-slate-100 text-slate-800"
            >
              <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                #{trip.slNo}
              </td>
              <td className="py-2.5 px-3 whitespace-nowrap">{formatDate(trip.date)}</td>
              <td className="py-2.5 px-3 font-mono font-semibold">{trip.vehicleNumber}</td>
              <td className="py-2.5 px-3 whitespace-nowrap">{trip.fromLocation}</td>
              <td className="py-2.5 px-3 whitespace-nowrap">{trip.toLocation}</td>
              <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                {formatCurrency(trip.freight)}
              </td>
              <td className="py-2.5 px-3 truncate max-w-[120px] text-slate-700">{trip.transport}</td>
              <td className="py-2.5 px-3 font-mono text-slate-600">
                {formatCurrency(trip.booking)}
              </td>
              <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                {formatCurrency(trip.commission)}
              </td>
              <td className="py-2.5 px-3 font-mono">
                {formatCurrency(trip.advanceReceivedAmount)} ({trip.advanceReceivedType || "N/A"})
              </td>
              <td className="py-2.5 px-3 font-mono">
                {formatCurrency(trip.advancePaidAmount)} ({trip.advancePaidType || "N/A"})
              </td>
              <td className="py-2.5 px-3 font-mono text-slate-600">
                {trip.vehicleBalanceCleared ? "Cleared" : vehBal <= 200 ? "≤ ₹200" : formatCurrency(vehBal)}
              </td>
              <td className="py-2.5 px-3 font-mono text-slate-600">
                {trip.companyBalanceCleared ? "Cleared" : compBal <= 200 ? "≤ ₹200" : formatCurrency(compBal)}
              </td>
              <td className="py-2.5 px-3 text-center">
                <StatusBadge type="completed" text="Completed" size="sm" />
              </td>
            </tr>
          );
        }}
      />
    </div>
  );
};
