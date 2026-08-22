import React from "react";
import { Modal } from "../ui/Modal";
import { StatusBadge } from "../ui/StatusBadge";
import {
  formatCurrency,
  formatDate,
  isCompletedTrip,
  isPendingCommission,
  isPendingAdvanceVehicle,
  isPendingAdvanceCompany,
  getVehicleBalanceAmount,
  getCompanyBalanceAmount,
} from "../../lib/utils";

export const TripDetailModal = ({ trip, onClose }) => {
  if (!trip) return null;

  const vehBal = getVehicleBalanceAmount(trip);
  const compBal = getCompanyBalanceAmount(trip);
  const isComp = isCompletedTrip(trip);
  const isCommPending = isPendingCommission(trip);
  const isAdvVehPending = isPendingAdvanceVehicle(trip);
  const isAdvCompPending = isPendingAdvanceCompany(trip);

  return (
    <Modal
      isOpen={!!trip}
      onClose={onClose}
      title={`Trip detail — #${trip.slNo}`}
      subtitle={`Created on ${formatDate(trip.date)} • Vehicle: ${trip.vehicleNumber}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-xs">
        {/* Section 1: Trip & Route Information */}
        <div>
          <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Trip & Route Information
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[10px]">Sl.No</span>
              <strong className="font-mono text-blue-700">#{trip.slNo}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Date</span>
              <strong className="text-slate-900">{formatDate(trip.date)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Vehicle Number</span>
              <strong className="font-mono text-slate-900">{trip.vehicleNumber}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Origin (From)</span>
              <strong className="text-slate-900">{trip.fromLocation}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Destination (To)</span>
              <strong className="text-slate-900">{trip.toLocation}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Transport Agency</span>
              <strong className="text-slate-900">{trip.transport}</strong>
            </div>
          </div>
        </div>

        {/* Section 2: Financial Details */}
        <div>
          <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Financial Details & Commission
          </h4>
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">Freight (Vehicle)</span>
              <strong className="text-slate-900">{formatCurrency(trip.freight)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">Booking (Company)</span>
              <strong className="text-slate-900">{formatCurrency(trip.booking)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">Commission (Agent)</span>
              <strong className="text-emerald-700">
                {trip.commission !== null ? formatCurrency(trip.commission) : "Blank (Pending)"}
              </strong>
            </div>
          </div>
        </div>

        {/* Section 3: Advance Payments */}
        <div>
          <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Advances & Payment Types
          </h4>
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[10px]">Advance Paid to Vehicle</span>
              <strong className="font-mono text-slate-900">
                {formatCurrency(trip.advancePaidAmount)}
              </strong>
              <span className="ml-2 text-[10px] font-medium text-slate-600">
                ({trip.advancePaidType || "Blank / Pending"})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">
                Advance Received from Company
              </span>
              <strong className="font-mono text-slate-900">
                {formatCurrency(trip.advanceReceivedAmount)}
              </strong>
              <span className="ml-2 text-[10px] font-medium text-slate-600">
                ({trip.advanceReceivedType || "Blank / Pending"})
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Outstanding Balances */}
        <div>
          <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Outstanding Balances (&gt; ₹200 Threshold)
          </h4>
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">
                Vehicle Balance Due
              </span>
              <strong className="text-slate-900">
                {trip.vehicleBalanceCleared
                  ? "Cleared (Settled)"
                  : vehBal <= 200
                    ? `₹${vehBal} (≤ ₹200)`
                    : formatCurrency(vehBal)}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">
                Company Balance Due
              </span>
              <strong className="text-slate-900">
                {trip.companyBalanceCleared
                  ? "Cleared (Settled)"
                  : compBal <= 200
                    ? `₹${compBal} (≤ ₹200)`
                    : formatCurrency(compBal)}
              </strong>
            </div>
          </div>
        </div>

        {/* Status Summary & Remarks */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Workflow status</span>
            {isComp ? (
              <StatusBadge type="completed" text="Completed" size="sm" />
            ) : isCommPending ? (
              <StatusBadge type="pending-commission" text="Pending commission" size="sm" />
            ) : isAdvVehPending ? (
              <StatusBadge
                type="pending-advance-vehicle"
                text="Pending vehicle advance"
                size="sm"
              />
            ) : isAdvCompPending ? (
              <StatusBadge
                type="pending-advance-company"
                text="Pending company advance"
                size="sm"
              />
            ) : (
              <StatusBadge type="balance-due" text="Balance outstanding" size="sm" />
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
