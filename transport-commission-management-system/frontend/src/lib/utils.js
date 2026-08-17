export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function calculateDaysPending(dateString) {
  if (!dateString) return 0;
  const start = new Date(dateString).getTime();
  const now = new Date().getTime();
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// Workflow state calculators for Trips
export function isPendingCommission(t) {
  return t.commission === null || t.commission === undefined;
}

export function isPendingAdvanceVehicle(t) {
  return !t.advancePaidType || t.advancePaidType.trim() === "";
}

export function isPendingAdvanceCompany(t) {
  return !t.advanceReceivedType || t.advanceReceivedType.trim() === "";
}

export function getVehicleBalanceAmount(t) {
  if (!t) return 0;
  const freight = Number(t.freight) || 0;
  const advPaid = Number(t.advancePaidAmount) || 0;
  return Math.max(0, freight - advPaid);
}

export function isBalanceVehicleActive(t) {
  if (!t || isPendingAdvanceVehicle(t)) return false;
  if (t.advancePaidType === "To Pay") return false;
  const balance = getVehicleBalanceAmount(t);
  return balance > 200 && !t.vehicleBalanceCleared;
}

export function getCompanyBalanceAmount(t) {
  if (!t) return 0;
  const booking = Number(t.booking) || 0;
  const advRec = Number(t.advanceReceivedAmount) || 0;
  return Math.max(0, booking - advRec);
}

export function isBalanceCompanyActive(t) {
  if (!t || isPendingAdvanceCompany(t)) return false;
  if (t.advanceReceivedType === "To Pay") return false;
  const balance = getCompanyBalanceAmount(t);
  return balance > 200 && !t.companyBalanceCleared;
}

export function isCompletedTrip(t) {
  const commDone = !isPendingCommission(t);
  const advPaidDone = !isPendingAdvanceVehicle(t);
  const advRecDone = !isPendingAdvanceCompany(t);
  const vehBalDone = !isBalanceVehicleActive(t);
  const compBalDone = !isBalanceCompanyActive(t);

  return commDone && advPaidDone && advRecDone && vehBalDone && compBalDone;
}

export function getTripPaymentStatus(t) {
  if (!t) return "N/A";
  if (isCompletedTrip(t)) return "Completed";
  if (isPendingCommission(t)) return "Pending Comm";
  if (isPendingAdvanceVehicle(t)) return "Pending Adv Veh";
  if (isPendingAdvanceCompany(t)) return "Pending Adv Comp";
  if (isBalanceVehicleActive(t) || isBalanceCompanyActive(t)) return "Balance Due";
  return "In Progress";
}
