import React, { useState } from "react";
import { Building2 } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { DataTable } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Toast } from "../components/ui/Toast";
import { ClearAdvanceModal } from "../components/modals/ClearAdvanceModal";
import { formatCurrency, formatDate, calculateDaysPending } from "../lib/utils";

export const PendingAdvanceCompanyPage = ({
  trips,
  onUpdateTrip,
  globalSearch,
  setGlobalSearch,
}) => {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [toast, setToast] = useState(null);

  // Filter trips where advanceReceivedType is blank
  const pendingTrips = trips.filter(
    (t) =>
      (!t.advanceReceivedType || t.advanceReceivedType.trim() === "") &&
      (!globalSearch.trim() ||
        String(t.slNo).includes(globalSearch.trim()) ||
        t.vehicleNumber.toLowerCase().includes(globalSearch.toLowerCase().trim()) ||
        t.transport.toLowerCase().includes(globalSearch.toLowerCase().trim()) ||
        t.fromLocation.toLowerCase().includes(globalSearch.toLowerCase().trim()) ||
        t.toLocation.toLowerCase().includes(globalSearch.toLowerCase().trim()))
  );

  const handleSaveAdvanceReceived = async (id, data) => {
    try {
      await onUpdateTrip(id, data);
      setToast({
        type: "success",
        message: `Company advance collection type recorded for Trip #${selectedTrip?.slNo}.`,
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Failed to update company advance.",
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
    { title: "Adv Received Amount" },
    { title: "Collection Due Date" },
    { title: "Days Pending" },
    { title: "Action", align: "center" },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        badgeText="Pending work"
        title={`Pending company advance (${pendingTrips.length})`}
        subtitle="Trips missing company advance collection type. Selecting Cash, PhonePe, or To Pay removes the trip from this queue."
        searchPlaceholder="Search pending company advance..."
        searchValue={globalSearch}
        onSearchChange={setGlobalSearch}
        printId="pending-advance-company-print-btn"
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Table */}
      <DataTable
        columns={columns}
        data={pendingTrips}
        headerBg="bg-amber-50/50"
        emptyMessage="No pending company advances! All company advance collection types are recorded."
        renderRow={(trip) => {
          const daysPending = calculateDaysPending(trip.collectionDueDate || trip.date);
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
              <td className="py-2.5 px-3.5 font-medium text-slate-700">{trip.transport}</td>
              <td className="py-2.5 px-3.5 font-mono text-slate-600">
                {formatCurrency(trip.booking)}
              </td>
              <td className="py-2.5 px-3.5 font-mono font-semibold text-slate-900">
                {formatCurrency(trip.advanceReceivedAmount)}
              </td>
              <td className="py-2.5 px-3.5 whitespace-nowrap">
                {formatDate(trip.collectionDueDate || trip.date)}
              </td>
              <td className="py-2.5 px-3.5">
                <StatusBadge
                  type="pending-advance-company"
                  text={`${daysPending} Day${daysPending !== 1 ? "s" : ""} pending`}
                  size="sm"
                />
              </td>
              <td className="py-2.5 px-3.5 text-center">
                <button
                  onClick={() => setSelectedTrip(trip)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 mx-auto transition-colors"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Record Collection</span>
                </button>
              </td>
            </tr>
          );
        }}
      />

      {/* Advance Modal */}
      <ClearAdvanceModal
        trip={selectedTrip}
        type="company"
        onClose={() => setSelectedTrip(null)}
        onSave={handleSaveAdvanceReceived}
      />
    </div>
  );
};
