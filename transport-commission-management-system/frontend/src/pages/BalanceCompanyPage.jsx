import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { DataTable } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Toast } from "../components/ui/Toast";
import { ClearBalanceModal } from "../components/modals/ClearBalanceModal";
import {
  formatCurrency,
  formatDate,
  calculateDaysPending,
  isBalanceCompanyActive,
} from "../lib/utils";

export const BalanceCompanyPage = ({ trips, onClearBalance, globalSearch, setGlobalSearch }) => {
  const [confirmClearTrip, setConfirmClearTrip] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const [toast, setToast] = useState(null);

  // Filter trips with active company balance (advanceReceivedType is set, Booking - advanceReceivedAmount > 200, !companyBalanceCleared)
  const balanceCompanyTrips = trips.filter((t) => {
    if (!isBalanceCompanyActive(t)) return false;

    if (!globalSearch.trim()) return true;
    const q = globalSearch.toLowerCase().trim();
    return (
      String(t.slNo).includes(q) ||
      t.vehicleNumber.toLowerCase().includes(q) ||
      t.transport.toLowerCase().includes(q)
    );
  });

  const handleConfirmClear = async (amountToClear, clearedDate, remarks) => {
    if (!confirmClearTrip) return;
    setIsClearing(true);
    try {
      const res = await onClearBalance(confirmClearTrip.id, amountToClear, clearedDate, remarks);
      const remaining =
        res?.remainingBalance !== undefined
          ? res.remainingBalance
          : Math.max(
              0,
              confirmClearTrip.booking - confirmClearTrip.advanceReceivedAmount - amountToClear
            );
      const isSettled = res?.settled || remaining <= 200;

      setToast({
        type: "success",
        message: isSettled
          ? `Company collection balance for Trip #${confirmClearTrip.slNo} (${confirmClearTrip.transport}) cleared and settled successfully!`
          : `Cleared ${formatCurrency(amountToClear)} for Trip #${confirmClearTrip.slNo}. Remaining balance: ${formatCurrency(remaining)}.`,
      });
      setConfirmClearTrip(null);
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Failed to clear company balance.",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const columns = [
    { title: "Sl.No" },
    { title: "Date" },
    { title: "Vehicle Number" },
    { title: "Transport Agency" },
    { title: "Booking Amount" },
    { title: "Adv Received Amount" },
    { title: "Outstanding Collection Balance" },
    { title: "Collection Due Date" },
    { title: "Days Pending" },
    { title: "Status" },
    { title: "Action", align: "center" },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        badgeText="Financial collections"
        title={`Company balance (> ₹200) (${balanceCompanyTrips.length})`}
        subtitle="Money to be collected from transport booking companies. Auto-created when Booking − Advance Received > ₹200. Click Clear Collection once balance is received."
        searchPlaceholder="Search company balance..."
        searchValue={globalSearch}
        onSearchChange={setGlobalSearch}
        printId="balance-company-print-btn"
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Table */}
      <DataTable
        columns={columns}
        data={balanceCompanyTrips}
        headerBg="bg-slate-50"
        emptyMessage="No outstanding company collections."
        renderRow={(trip) => {
          const balanceAmount = trip.booking - trip.advanceReceivedAmount;
          const daysPending = calculateDaysPending(trip.collectionDueDate || trip.date);
          return (
            <tr
              key={trip.id}
              className="hover:bg-slate-50 transition-colors border-b border-slate-100"
            >
              <td className="py-2.5 px-3.5 font-mono font-bold text-blue-700">#{trip.slNo}</td>
              <td className="py-2.5 px-3.5 whitespace-nowrap">{formatDate(trip.date)}</td>
              <td className="py-2.5 px-3.5 font-mono font-semibold">{trip.vehicleNumber}</td>
              <td className="py-2.5 px-3.5 font-medium text-slate-900">{trip.transport}</td>
              <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900">
                {formatCurrency(trip.booking)}
              </td>
              <td className="py-2.5 px-3.5 font-mono">
                {formatCurrency(trip.advanceReceivedAmount)}
              </td>
              <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900">
                {formatCurrency(balanceAmount)}
              </td>
              <td className="py-2.5 px-3.5 whitespace-nowrap">
                {formatDate(trip.collectionDueDate || trip.date)}
              </td>
              <td className="py-2.5 px-3.5">
                <StatusBadge
                  type="balance-company"
                  text={`${daysPending} Day${daysPending !== 1 ? "s" : ""}`}
                  size="sm"
                />
              </td>
              <td className="py-2.5 px-3.5">
                <StatusBadge type="balance-company" text="Collection pending" size="sm" />
              </td>
              <td className="py-2.5 px-3.5 text-center">
                <button
                  onClick={() => setConfirmClearTrip(trip)}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1 mx-auto transition-colors"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Clear Collection</span>
                </button>
              </td>
            </tr>
          );
        }}
      />

      {/* Partial Clearance Dialog */}
      <ClearBalanceModal
        trip={confirmClearTrip}
        type="company"
        onClose={() => setConfirmClearTrip(null)}
        onConfirm={handleConfirmClear}
        isLoading={isClearing}
      />
    </div>
  );
};
