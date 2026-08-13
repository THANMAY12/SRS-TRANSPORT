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
  return Math.max(0, t.freight - t.advancePaidAmount);
}

export function isBalanceVehicleActive(t) {
  if (isPendingAdvanceVehicle(t)) return false;
  const balance = getVehicleBalanceAmount(t);
  return balance > 200 && !t.vehicleBalanceCleared;
}

export function getCompanyBalanceAmount(t) {
  return Math.max(0, t.booking - t.advanceReceivedAmount);
}

export function isBalanceCompanyActive(t) {
  if (isPendingAdvanceCompany(t)) return false;
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
