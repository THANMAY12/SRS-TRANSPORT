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
  isBalanceVehicleActive,
} from "../lib/utils";

export const BalanceVehiclePage = ({ trips, onClearBalance, globalSearch, setGlobalSearch }) => {
  const [confirmClearTrip, setConfirmClearTrip] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const [toast, setToast] = useState(null);

  // Filter trips with active vehicle balance (advancePaidType is set, Freight - advancePaidAmount > 200, !vehicleBalanceCleared)
  const balanceVehicleTrips = trips.filter((t) => {
    if (!isBalanceVehicleActive(t)) return false;

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
              confirmClearTrip.freight - confirmClearTrip.advancePaidAmount - amountToClear
            );
      const isSettled = res?.settled || remaining <= 200;

      setToast({
        type: "success",
        message: isSettled
          ? `Vehicle balance for Trip #${confirmClearTrip.slNo} (${confirmClearTrip.vehicleNumber}) cleared and settled successfully!`
          : `Cleared ${formatCurrency(amountToClear)} for Trip #${confirmClearTrip.slNo}. Remaining balance: ${formatCurrency(remaining)}.`,
      });
      setConfirmClearTrip(null);
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Failed to clear vehicle balance.",
      });
    } finally {
      setIsClearing(false);
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
    { title: "Adv Paid Amount" },
    { title: "Outstanding Balance Due" },
    { title: "Balance Due Date" },
    { title: "Days Pending" },
    { title: "Status" },
    { title: "Action", align: "center" },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        badgeText="Financial obligations"
        title={`Vehicle balance (> ₹200) (${balanceVehicleTrips.length})`}
        subtitle="Money owed to vehicle drivers/owners. Auto-created when Freight − Advance Paid > ₹200. Click Clear Balance once payment is settled."
        searchPlaceholder="Search vehicle balance..."
        searchValue={globalSearch}
        onSearchChange={setGlobalSearch}
        printId="balance-vehicle-print-btn"
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Table */}
      <DataTable
        columns={columns}
        data={balanceVehicleTrips}
        headerBg="bg-slate-50"
        emptyMessage="No outstanding vehicle balances."
        renderRow={(trip) => {
          const balanceAmount = trip.freight - trip.advancePaidAmount;
          const daysPending = calculateDaysPending(trip.advanceDueDate || trip.date);
          return (
            <tr
              key={trip.id}
              className="hover:bg-slate-50 transition-colors border-b border-slate-100"
            >
              <td className="py-2.5 px-3.5 font-mono font-bold text-blue-700">#{trip.slNo}</td>
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
              <td className="py-2.5 px-3.5 font-mono">{formatCurrency(trip.advancePaidAmount)}</td>
              <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900">
                {formatCurrency(balanceAmount)}
              </td>
              <td className="py-2.5 px-3.5 whitespace-nowrap">
                {formatDate(trip.advanceDueDate || trip.date)}
              </td>
              <td className="py-2.5 px-3.5">
                <StatusBadge
                  type="balance-due"
                  text={`${daysPending} Day${daysPending !== 1 ? "s" : ""}`}
                  size="sm"
                />
              </td>
              <td className="py-2.5 px-3.5">
                <StatusBadge type="balance-due" text="Balance due" size="sm" />
              </td>
              <td className="py-2.5 px-3.5 text-center">
                <button
                  onClick={() => setConfirmClearTrip(trip)}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1 mx-auto transition-colors"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Clear Balance</span>
                </button>
              </td>
            </tr>
          );
        }}
      />

      {/* Partial Clearance Dialog */}
      <ClearBalanceModal
        trip={confirmClearTrip}
        type="vehicle"
        onClose={() => setConfirmClearTrip(null)}
        onConfirm={handleConfirmClear}
        isLoading={isClearing}
      />
    </div>
  );
};
