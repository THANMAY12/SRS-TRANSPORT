import React, { useState } from "react";
import { Coins } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { DataTable } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Toast } from "../components/ui/Toast";
import { EnterCommissionModal } from "../components/modals/EnterCommissionModal";
import { formatCurrency, formatDate, calculateDaysPending } from "../lib/utils";

export const PendingCommissionPage = ({ trips, onUpdateTrip, globalSearch, setGlobalSearch }) => {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [toast, setToast] = useState(null);

  // Filter pending commission trips (commission === null || commission === undefined)
  const pendingTrips = trips.filter(
    (t) =>
      (t.commission === null || t.commission === undefined) &&
      (!globalSearch.trim() ||
        String(t.slNo).includes(globalSearch.trim()) ||
        t.vehicleNumber.toLowerCase().includes(globalSearch.toLowerCase().trim()) ||
        t.transport.toLowerCase().includes(globalSearch.toLowerCase().trim()) ||
        t.fromLocation.toLowerCase().includes(globalSearch.toLowerCase().trim()) ||
        t.toLocation.toLowerCase().includes(globalSearch.toLowerCase().trim()))
  );

  const handleSaveCommission = async (id, commissionVal) => {
    try {
      await onUpdateTrip(id, { commission: commissionVal });
      setToast({
        type: "success",
        message: `Commission assigned successfully for Trip #${selectedTrip?.slNo}.`,
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Failed to update commission.",
      });
      throw err;
    }
  };

  const columns = [
    { title: "Sl.No" },
    { title: "Date" },
    { title: "Vehicle Number" },
    { title: "From" },
    { title: "To" },
    { title: "Freight" },
    { title: "Transport" },
    { title: "Booking" },
    { title: "Commission Due Date" },
    { title: "Days Pending" },
    { title: "Action", align: "center" },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        badgeText="Pending work"
        title={`Pending commission (${pendingTrips.length})`}
        subtitle="Trips with unassigned agent commission. Entering a commission amount clears the record from this queue."
        searchPlaceholder="Search pending commission..."
        searchValue={globalSearch}
        onSearchChange={setGlobalSearch}
        printId="pending-commission-print-btn"
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Table */}
      <DataTable
        columns={columns}
        data={pendingTrips}
        headerBg="bg-amber-50/50"
        emptyMessage="No pending commissions. All commission entries are currently up to date."
        renderRow={(trip) => {
          const daysPending = calculateDaysPending(trip.commissionDueDate || trip.date);
          return (
            <tr
              key={trip.id}
              className="hover:bg-slate-50 transition-colors border-b border-slate-100"
            >
              <td className="py-2.5 px-3.5 font-mono font-bold text-amber-700">#{trip.slNo}</td>
              <td className="py-2.5 px-3.5 whitespace-nowrap">{formatDate(trip.date)}</td>
              <td className="py-2.5 px-3.5 font-mono font-semibold">{trip.vehicleNumber}</td>
              <td className="py-2.5 px-3.5">{trip.fromLocation}</td>
              <td className="py-2.5 px-3.5">{trip.toLocation}</td>
              <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900">
                {formatCurrency(trip.freight)}
              </td>
              <td className="py-2.5 px-3.5 text-slate-700">{trip.transport}</td>
              <td className="py-2.5 px-3.5 font-mono text-slate-600">
                {formatCurrency(trip.booking)}
              </td>
              <td className="py-2.5 px-3.5 whitespace-nowrap">
                {formatDate(trip.commissionDueDate || trip.date)}
              </td>
              <td className="py-2.5 px-3.5">
                <StatusBadge
                  type="pending-commission"
                  text={`${daysPending} Day${daysPending !== 1 ? "s" : ""} pending`}
                  size="sm"
                />
              </td>
              <td className="py-2.5 px-3.5 text-center">
                <button
                  onClick={() => setSelectedTrip(trip)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 mx-auto transition-colors"
                >
                  <Coins className="h-3.5 w-3.5" />
                  <span>Enter Commission</span>
                </button>
              </td>
            </tr>
          );
        }}
      />

      {/* Commission Modal */}
      <EnterCommissionModal
        trip={selectedTrip}
        onClose={() => setSelectedTrip(null)}
        onSave={handleSaveCommission}
      />
    </div>
  );
};
