import {
  getAllTrips,
  isPendingBooking,
  isPendingCommission,
  isPendingAdvanceVehicle,
  isPendingAdvanceCompany,
  isPendingRefund,
  hasRefund,
  isBalanceVehicleActive,
  isBalanceCompanyActive,
  isCompletedTrip,
  getVehicleBalanceAmount,
  getCompanyBalanceAmount,
  getTripAccountRefund,
  getTripGrossIncome,
  getTripReportDate,
  getLocalDateString,
  hasBooking,
} from "./tripService.js";

export async function getDashboardStats() {
  const allTrips = await getAllTrips();
  const todayStr = getLocalDateString(new Date());

  const todayTrips = allTrips.filter((t) => t.date === todayStr);

  const todayVehiclesCount = todayTrips.length;
  const todayFreightTotal = todayTrips.reduce((sum, t) => sum + t.freight, 0);
  const todayCommissionTotal = todayTrips.reduce((sum, t) => sum + (t.commission || 0), 0);

  const pendingBookingCount = allTrips.filter(isPendingBooking).length;
  const pendingCommissionCount = allTrips.filter(isPendingCommission).length;
  const pendingVehicleAdvanceCount = allTrips.filter(isPendingAdvanceVehicle).length;
  const pendingCompanyAdvanceCount = allTrips.filter(isPendingAdvanceCompany).length;
  const pendingRefundsCount = allTrips.filter(isPendingRefund).length;

  const balanceVehicleCount = allTrips.filter(isBalanceVehicleActive).length;
  const balanceCompanyCount = allTrips.filter(isBalanceCompanyActive).length;

  const completedTripsTodayCount = todayTrips.filter(isCompletedTrip).length;
  const pendingApprovalsCount = allTrips.filter((t) => t.approvalStatus === "Pending").length;

  return {
    todayVehiclesCount,
    todayFreightTotal,
    todayCommissionTotal,
    pendingBookingCount,
    pendingCommissionCount,
    pendingVehicleAdvanceCount,
    pendingCompanyAdvanceCount,
    pendingRefundsCount,
    balanceVehicleCount,
    balanceCompanyCount,
    completedTripsTodayCount,
    pendingApprovalsCount,
  };
}

export async function getReports(query) {
  const { period, startDate, endDate, vehicleNumber, transport } = query;

  let trips = await getAllTrips();

  // Accounting Rule: Only trips with an entered Refund (including 0) appear in Financial Reports
  trips = trips.filter(hasRefund);

  const todayStr = getLocalDateString(new Date());

  if (period === "daily") {
    trips = trips.filter((t) => getTripReportDate(t) === todayStr);
  } else if (period === "weekly") {
    const today = new Date();
    const weekAgoStr = getLocalDateString(new Date(today.getTime() - 7 * 86400000));
    trips = trips.filter((t) => getTripReportDate(t) >= weekAgoStr);
  } else if (period === "monthly") {
    const today = new Date();
    const monthAgoStr = getLocalDateString(new Date(today.getTime() - 30 * 86400000));
    trips = trips.filter((t) => getTripReportDate(t) >= monthAgoStr);
  } else if (period === "custom" || startDate || endDate) {
    if (startDate) {
      trips = trips.filter((t) => getTripReportDate(t) >= String(startDate));
    }
    if (endDate) {
      trips = trips.filter((t) => getTripReportDate(t) <= String(endDate));
    }
  }

  if (vehicleNumber) {
    trips = trips.filter((t) =>
      t.vehicleNumber.toLowerCase().includes(String(vehicleNumber).toLowerCase())
    );
  }
  if (transport) {
    trips = trips.filter((t) =>
      t.transport.toLowerCase().includes(String(transport).toLowerCase())
    );
  }

  const totalFreight = trips.reduce((sum, t) => sum + (t.freight || 0), 0);
  const totalBooking = trips.reduce(
    (sum, t) => sum + (hasBooking(t) ? Number(t.booking) || 0 : 0),
    0
  );
  const totalCommission = trips.reduce((sum, t) => sum + (t.commission || 0), 0);
  const cashCommission = trips.reduce(
    (sum, t) => sum + (t.commissionReceivedType === "Cash" ? t.commission || 0 : 0),
    0
  );
  const phonePeCommission = trips.reduce(
    (sum, t) => sum + (t.commissionReceivedType === "PhonePe" ? t.commission || 0 : 0),
    0
  );
  const totalRefund = trips.reduce((sum, t) => sum + (Number(t.refund) || 0), 0);
  const totalDifferenceAmount = totalRefund; // Backwards compatible alias
  const totalAccountRefund = trips.reduce((sum, t) => sum + getTripAccountRefund(t), 0);
  const totalGrossIncome = trips.reduce((sum, t) => sum + getTripGrossIncome(t), 0);
  const totalAdvReceived = trips.reduce((sum, t) => sum + (t.advanceReceivedAmount || 0), 0);
  const totalAdvPaid = trips.reduce((sum, t) => sum + (t.advancePaidAmount || 0), 0);
  const totalVehicleBalance = trips.reduce(
    (sum, t) => sum + (isBalanceVehicleActive(t) ? getVehicleBalanceAmount(t) : 0),
    0
  );
  const totalCompanyBalance = trips.reduce(
    (sum, t) => sum + (isBalanceCompanyActive(t) ? getCompanyBalanceAmount(t) : 0),
    0
  );

  return {
    summary: {
      totalTrips: trips.length,
      totalFreight,
      totalBooking,
      totalCommission,
      cashCommission,
      phonePeCommission,
      totalRefund,
      totalDifferenceAmount,
      totalAccountRefund,
      totalGrossIncome,
      totalAdvReceived,
      totalAdvPaid,
      totalVehicleBalance,
      totalCompanyBalance,
    },
    trips: trips.map((t) => ({
      ...t,
      reportDate: getTripReportDate(t),
      grossIncome: getTripGrossIncome(t),
      accountRefund: getTripAccountRefund(t),
    })),
  };
}
