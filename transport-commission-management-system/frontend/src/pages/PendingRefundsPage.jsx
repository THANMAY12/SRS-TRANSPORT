import React, { useState, useEffect, useCallback } from "react";
import { Banknote, Eye, Edit2 } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { DataTable } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Toast } from "../components/ui/Toast";
import { TripDetailModal } from "../components/modals/TripDetailModal";
import { EditTripModal } from "../components/modals/EditTripModal";
import { EnterRefundModal } from "../components/modals/EnterRefundModal";
import { formatCurrency, formatDate, hasBooking } from "../lib/utils";
import { api } from "../services/api";

export const PendingRefundsPage = ({
  globalSearch = "",
  setGlobalSearch = () => {},
  onTripUpdated = () => {},
}) => {
  const [pendingTrips, setPendingTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Modals state
  const [viewTrip, setViewTrip] = useState(null);
  const [editTrip, setEditTrip] = useState(null);
  const [enterRefundTrip, setEnterRefundTrip] = useState(null);

  const fetchPendingRefunds = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getPendingRefundTrips();
      setPendingTrips(Array.isArray(data) ? data : []);
    } catch (err) {
      setToast({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Failed to load pending refunds.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRefunds();
  }, [fetchPendingRefunds]);

  // Handle Edit Save
  const handleSaveEdit = async (id, payload) => {
    await api.updateTrip(id, payload);
    setToast({
      type: "success",
      message: `Trip #${payload.slNo} updated successfully.`,
    });
    await fetchPendingRefunds();
    if (onTripUpdated) onTripUpdated();
  };

  // Handle Enter Refund Save
  const handleSaveRefund = async (id, refundAmount) => {
    await api.enterTripRefund(id, refundAmount);
    setToast({
      type: "success",
      message: `Refund of ₹${refundAmount} saved for Trip #${enterRefundTrip?.slNo}! It will now appear in Financial Reports.`,
    });
    setEnterRefundTrip(null);
    await fetchPendingRefunds();
    if (onTripUpdated) onTripUpdated();
  };

  // Filter pending trips
  const filteredTrips = pendingTrips.filter((t) => {
    if (!globalSearch.trim()) return true;
    const q = globalSearch.toLowerCase().trim();
    return (
      String(t.slNo).includes(q) ||
      t.vehicleNumber.toLowerCase().includes(q) ||
      (t.driverPhone && t.driverPhone.toLowerCase().includes(q)) ||
      t.date.includes(q) ||
      t.transport.toLowerCase().includes(q) ||
      t.fromLocation.toLowerCase().includes(q) ||
      t.toLocation.toLowerCase().includes(q) ||
      (t.createdBy && t.createdBy.toLowerCase().includes(q))
    );
  });

  const columns = [
    { title: "Sl.No" },
    { title: "Date" },
    { title: "Vehicle" },
    { title: "From" },
    { title: "To" },
    { title: "Freight" },
    { title: "Transport" },
    { title: "Booking" },
    { title: "Commission" },
    { title: "Submitted By" },
    { title: "Refund Status" },
    { title: "Actions", align: "center" },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        badgeText="Operational Queue"
        title={`Pending Refunds (${pendingTrips.length})`}
        subtitle="Trips where the Refund amount has not yet been entered. Enter ₹0 or the actual refund amount to include in Financial Reports."
        searchPlaceholder="Search Sl.No, Vehicle, Transport..."
        searchValue={globalSearch}
        onSearchChange={setGlobalSearch}
        printId="pending-refunds-print-btn"
      />

      {/* Toast Notification */}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredTrips}
        isLoading={isLoading}
        emptyMessage="No pending refunds found. All trip records have had their refund amounts entered."
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
            <td className="py-2.5 px-3.5 truncate max-w-[120px] text-slate-700">{t.transport}</td>
            <td className="py-2.5 px-3.5 font-mono text-slate-600">
              {hasBooking(t) ? (
                formatCurrency(t.booking)
              ) : (
                <StatusBadge type="pending-advance-company" text="Blank" size="sm" />
              )}
            </td>
            <td className="py-2.5 px-3.5 font-mono font-semibold text-slate-900">
              {t.commission !== null && t.commission !== undefined ? (
                formatCurrency(t.commission)
              ) : (
                <StatusBadge type="pending-commission" text="Blank" size="sm" />
              )}
            </td>
            <td className="py-2.5 px-3.5">
              <span className="font-medium text-slate-700">{t.createdBy || "System"}</span>
            </td>
            <td className="py-2.5 px-3.5">
              <StatusBadge type="pending" text="Pending Refund" size="sm" />
            </td>
            <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
              <div className="flex items-center justify-center gap-1.5">
                {/* Enter Refund Button */}
                <button
                  onClick={() => setEnterRefundTrip(t)}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                  title="Enter Refund Amount"
                >
                  <Banknote className="h-3.5 w-3.5" />
                  <span>Enter Refund</span>
                </button>

                {/* View Button */}
                <button
                  onClick={() => setViewTrip(t)}
                  className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                  title="View details"
                >
                  <Eye className="h-4 w-4" />
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => setEditTrip(t)}
                  className="p-1 rounded text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                  title="Edit entry"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* View Modal */}
      {viewTrip && <TripDetailModal trip={viewTrip} onClose={() => setViewTrip(null)} />}

      {/* Edit Modal */}
      {editTrip && (
        <EditTripModal trip={editTrip} onClose={() => setEditTrip(null)} onSave={handleSaveEdit} />
      )}

      {/* Enter Refund Modal */}
      {enterRefundTrip && (
        <EnterRefundModal
          trip={enterRefundTrip}
          onClose={() => setEnterRefundTrip(null)}
          onSave={handleSaveRefund}
        />
      )}
    </div>
  );
};
