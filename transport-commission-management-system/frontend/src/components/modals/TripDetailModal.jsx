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
  getTripDifferenceAmount,
  getTripAccountRefund,
  getTripGrossIncome,
  hasBooking,
  hasRefund,
} from "../../lib/utils";

export const TripDetailModal = ({ trip, onClose }) => {
  if (!trip) return null;

  const vehBal = getVehicleBalanceAmount(trip);
  const compBal = getCompanyBalanceAmount(trip);
  const isComp = isCompletedTrip(trip);
  const isCommPending = isPendingCommission(trip);
  const isAdvVehPending = isPendingAdvanceVehicle(trip);
  const isAdvCompPending = isPendingAdvanceCompany(trip);

  const accountRefund = getTripAccountRefund(trip);
  const grossIncome = getTripGrossIncome(trip);

  return (
    <Modal
      isOpen={!!trip}
      onClose={onClose}
      title={`Trip Entry Details — #${trip.slNo}`}
      subtitle={`Date: ${formatDate(trip.date)} • Vehicle: ${trip.vehicleNumber}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Section 1: Route & Identification */}
        <div>
          <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Trip & Route Identification
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[10px]">Sl.No</span>
              <strong className="font-mono text-sm text-blue-700">#{trip.slNo}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Trip Date</span>
              <strong className="text-slate-900">{formatDate(trip.date)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Vehicle Number</span>
              <strong className="font-mono text-slate-900">{trip.vehicleNumber}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Driver Phone</span>
              <strong className="font-mono text-slate-900">{trip.driverPhone || "N/A"}</strong>
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
            Financial Details & Income Breakdown
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">Freight (Vehicle)</span>
              <strong className="text-slate-900">{formatCurrency(trip.freight)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">Booking (Company)</span>
              <strong className="text-slate-900">
                {hasBooking(trip) ? formatCurrency(trip.booking) : "Blank (Pending)"}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">Refund</span>
              <strong className="text-blue-700">
                {hasRefund(trip) ? formatCurrency(trip.refund) : "Blank (Pending)"}
              </strong>
              {trip.refundClearedAt && (
                <span className="block text-[10px] text-blue-600 font-sans mt-0.5">
                  Cleared: {formatDate(trip.refundClearedAt)}
                </span>
              )}
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">Commission (Agent)</span>
              <strong className="text-emerald-700">
                {trip.commission !== null ? formatCurrency(trip.commission) : "Blank (Pending)"}
              </strong>
              {trip.commissionDueDate && (
                <span className="block text-[10px] text-slate-500 font-sans mt-0.5">
                  Comm Date: {formatDate(trip.commissionDueDate)}
                </span>
              )}
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">Account Refund</span>
              <strong className="text-indigo-700">{formatCurrency(accountRefund)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">Total Gross Income</span>
              <strong className="text-emerald-700">{formatCurrency(grossIncome)}</strong>
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
              {trip.advanceDueDate && (
                <span className="block text-[10px] text-slate-500 font-sans mt-0.5">
                  Paid Date: {formatDate(trip.advanceDueDate)}
                </span>
              )}
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
              {trip.collectionDueDate && (
                <span className="block text-[10px] text-slate-500 font-sans mt-0.5">
                  Rec Date: {formatDate(trip.collectionDueDate)}
                </span>
              )}
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
              {trip.vehicleBalanceClearedDate && (
                <span className="block text-[10px] text-slate-500 font-sans mt-0.5">
                  Cleared Date: {formatDate(trip.vehicleBalanceClearedDate)}
                </span>
              )}
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
              {trip.companyBalanceClearedDate && (
                <span className="block text-[10px] text-slate-500 font-sans mt-0.5">
                  Cleared Date: {formatDate(trip.companyBalanceClearedDate)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Approval Workflow Status */}
        <div>
          <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Approval Workflow Status
          </h4>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[10px]">Status:</span>
              <StatusBadge
                type={
                  trip.approvalStatus === "Approved"
                    ? "approved"
                    : trip.approvalStatus === "Rejected"
                      ? "rejected"
                      : "pending-approval"
                }
                text={trip.approvalStatus || "Pending"}
                size="sm"
              />
            </div>
            {trip.approvalStatus === "Approved" && trip.approvedBy && (
              <p className="text-[11px] text-slate-600">
                Approved by <strong className="text-slate-800">{trip.approvedBy}</strong>
                {trip.approvedAt && ` on ${formatDate(trip.approvedAt)}`}
              </p>
            )}
            {trip.approvalStatus === "Rejected" && (
              <div className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded border border-rose-100 space-y-0.5">
                <p>
                  Rejected by <strong>{trip.rejectedBy || "Admin"}</strong>
                  {trip.rejectedAt && ` on ${formatDate(trip.rejectedAt)}`}
                </p>
                {trip.rejectionReason && (
                  <p>
                    Reason: <em>&ldquo;{trip.rejectionReason}&rdquo;</em>
                  </p>
                )}
              </div>
            )}
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
