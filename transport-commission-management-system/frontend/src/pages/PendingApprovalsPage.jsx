import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Eye, Edit2 } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { DataTable } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Toast } from "../components/ui/Toast";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { TripDetailModal } from "../components/modals/TripDetailModal";
import { EditTripModal } from "../components/modals/EditTripModal";
import { RejectTripModal } from "../components/modals/RejectTripModal";
import { formatCurrency, formatDate, hasBooking } from "../lib/utils";
import { api } from "../services/api";

export const PendingApprovalsPage = ({
  globalSearch = "",
  setGlobalSearch = () => {},
  onTripApprovedOrRejected = () => {},
}) => {
  const [pendingTrips, setPendingTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Modals state
  const [viewTrip, setViewTrip] = useState(null);
  const [editTrip, setEditTrip] = useState(null);
  const [approveConfirmTrip, setApproveConfirmTrip] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [rejectTrip, setRejectTrip] = useState(null);

  const fetchPendingApprovals = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getPendingApprovals();
      setPendingTrips(Array.isArray(data) ? data : []);
    } catch (err) {
      setToast({
        type: "error",
        message:
          err?.response?.data?.message || err?.message || "Failed to load pending approvals.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingApprovals();
  }, [fetchPendingApprovals]);

  // Handle Edit Save
  const handleSaveEdit = async (id, payload) => {
    await api.updateTrip(id, payload);
    setToast({
      type: "success",
      message: `Trip #${payload.slNo} updated successfully and remains Pending approval.`,
    });
    await fetchPendingApprovals();
    if (onTripApprovedOrRejected) onTripApprovedOrRejected();
  };

  // Handle Approve Confirm
  const handleApproveConfirmed = async () => {
    if (!approveConfirmTrip) return;
    setIsApproving(true);
    try {
      await api.approveTrip(approveConfirmTrip.id);
      setToast({
        type: "success",
        message: `Daily Entry #${approveConfirmTrip.slNo} (${approveConfirmTrip.vehicleNumber}) approved successfully!`,
      });
      setApproveConfirmTrip(null);
      await fetchPendingApprovals();
      if (onTripApprovedOrRejected) onTripApprovedOrRejected();
    } catch (err) {
      setToast({
        type: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to approve daily entry. Please try again.",
      });
    } finally {
      setIsApproving(false);
    }
  };

  // Handle Reject
  const handleReject = async (id, reason) => {
    await api.rejectTrip(id, reason);
    setToast({
      type: "success",
      message: `Daily Entry #${rejectTrip?.slNo} rejected.`,
    });
    setRejectTrip(null);
    await fetchPendingApprovals();
    if (onTripApprovedOrRejected) onTripApprovedOrRejected();
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
    { title: "Comm Type" },
    { title: "Submitted By" },
    { title: "Status" },
    { title: "Actions", align: "center" },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        badgeText="Admin Approval Queue"
        title={`Pending Approvals (${pendingTrips.length})`}
        subtitle="Review and authorize daily transport entries created by workers before settlement."
        searchPlaceholder="Search Sl.No, Vehicle, Submitted By..."
        searchValue={globalSearch}
        onSearchChange={setGlobalSearch}
        printId="pending-approvals-print-btn"
      />

      {/* Toast Notification */}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Approvals Table */}
      <DataTable
        columns={columns}
        data={filteredTrips}
        isLoading={isLoading}
        emptyMessage="No pending trip approvals. All daily entries have been processed."
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
              {t.commissionReceivedType ? (
                <StatusBadge type="cash" text={t.commissionReceivedType} size="sm" />
              ) : (
                <span className="text-slate-400 text-[11px]">-</span>
              )}
            </td>
            <td className="py-2.5 px-3.5">
              <span className="font-medium text-slate-700">{t.createdBy || "System"}</span>
            </td>
            <td className="py-2.5 px-3.5">
              <StatusBadge type="pending-approval" text="Pending" size="sm" />
            </td>
            <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
              <div className="flex items-center justify-center gap-1.5">
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

                {/* Approve Button */}
                <button
                  onClick={() => setApproveConfirmTrip(t)}
                  className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                  title="Approve Daily Entry"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Approve</span>
                </button>

                {/* Reject Button */}
                <button
                  onClick={() => setRejectTrip(t)}
                  className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                  title="Reject Daily Entry"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Reject</span>
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

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={!!approveConfirmTrip}
        onClose={() => setApproveConfirmTrip(null)}
        onConfirm={handleApproveConfirmed}
        title={`Approve Daily Entry #${approveConfirmTrip?.slNo}?`}
        message={`Are you sure you want to approve Daily Entry Sl.No #${approveConfirmTrip?.slNo} (${approveConfirmTrip?.vehicleNumber} - ${approveConfirmTrip?.fromLocation} → ${approveConfirmTrip?.toLocation})?`}
        confirmLabel="Approve Entry"
        isDanger={false}
        isLoading={isApproving}
      />

      {/* Reject Modal */}
      {rejectTrip && (
        <RejectTripModal
          trip={rejectTrip}
          onClose={() => setRejectTrip(null)}
          onReject={handleReject}
        />
      )}
    </div>
  );
};
