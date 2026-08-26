import React, { useState } from "react";
import { ReceiptText } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { DataTable } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Toast } from "../components/ui/Toast";
import { EnterBookingModal } from "../components/modals/EnterBookingModal";
import { formatCurrency, formatDate, calculateDaysPending, isPendingBooking } from "../lib/utils";

export const PendingBookingPage = ({ trips, onUpdateTrip, globalSearch, setGlobalSearch }) => {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [toast, setToast] = useState(null);

  // Filter pending booking trips (!hasBooking(t))
  const pendingTrips = trips.filter(
    (t) =>
      isPendingBooking(t) &&
      (!globalSearch.trim() ||
        String(t.slNo).includes(globalSearch.trim()) ||
        t.vehicleNumber.toLowerCase().includes(globalSearch.toLowerCase().trim()) ||
        t.transport.toLowerCase().includes(globalSearch.toLowerCase().trim()) ||
        t.fromLocation.toLowerCase().includes(globalSearch.toLowerCase().trim()) ||
        t.toLocation.toLowerCase().includes(globalSearch.toLowerCase().trim()))
  );

  const handleSaveBooking = async (id, bookingVal, remarksVal) => {
    try {
      await onUpdateTrip(id, {
        booking: bookingVal,
        remarks: remarksVal !== undefined ? remarksVal : selectedTrip?.remarks || "",
      });
      setToast({
        type: "success",
        message: `Booking amount assigned successfully for Trip #${selectedTrip?.slNo}.`,
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Failed to update booking amount.",
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
    { title: "Commission" },
    { title: "Days Pending" },
    { title: "Action", align: "center" },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        badgeText="Pending work"
        title={`Pending booking (${pendingTrips.length})`}
        subtitle="Trips with unassigned company booking amount. Entering booking updates financial reports and margin calculations."
        searchPlaceholder="Search pending booking..."
        searchValue={globalSearch}
        onSearchChange={setGlobalSearch}
        printId="pending-booking-print-btn"
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Table */}
      <DataTable
        columns={columns}
        data={pendingTrips}
        headerBg="bg-amber-50/50"
        emptyMessage="No pending bookings. All trip booking entries are currently up to date."
        renderRow={(trip) => {
          const daysPending = calculateDaysPending(trip.date);
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
              <td className="py-2.5 px-3.5 font-mono text-emerald-700 font-semibold">
                {trip.commission !== null ? formatCurrency(trip.commission) : "Blank (Pending)"}
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
                  <ReceiptText className="h-3.5 w-3.5" />
                  <span>Enter Booking</span>
                </button>
              </td>
            </tr>
          );
        }}
      />

      {/* Booking Modal */}
      <EnterBookingModal
        trip={selectedTrip}
        onClose={() => setSelectedTrip(null)}
        onSave={handleSaveBooking}
      />
    </div>
  );
};
