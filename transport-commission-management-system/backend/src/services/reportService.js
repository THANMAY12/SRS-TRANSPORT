import {
  getAllTrips,
  isPendingCommission,
  isPendingAdvanceVehicle,
  isPendingAdvanceCompany,
  isBalanceVehicleActive,
  isBalanceCompanyActive,
  isCompletedTrip,
  getVehicleBalanceAmount,
  getCompanyBalanceAmount,
} from "./tripService.js";

export async function getDashboardStats() {
  const allTrips = await getAllTrips();
  const todayStr = new Date().toISOString().split("T")[0];

  const todayTrips = allTrips.filter((t) => t.date === todayStr);

  const todayVehiclesCount = todayTrips.length;
  const todayFreightTotal = todayTrips.reduce((sum, t) => sum + t.freight, 0);
  const todayCommissionTotal = todayTrips.reduce((sum, t) => sum + (t.commission || 0), 0);

  const pendingCommissionCount = allTrips.filter(isPendingCommission).length;
  const pendingVehicleAdvanceCount = allTrips.filter(isPendingAdvanceVehicle).length;
  const pendingCompanyAdvanceCount = allTrips.filter(isPendingAdvanceCompany).length;

  const balanceVehicleCount = allTrips.filter(isBalanceVehicleActive).length;
  const balanceCompanyCount = allTrips.filter(isBalanceCompanyActive).length;

  const completedTripsTodayCount = todayTrips.filter(isCompletedTrip).length;

  return {
    todayVehiclesCount,
    todayFreightTotal,
    todayCommissionTotal,
    pendingCommissionCount,
    pendingVehicleAdvanceCount,
    pendingCompanyAdvanceCount,
    balanceVehicleCount,
    balanceCompanyCount,
    completedTripsTodayCount,
  };
}

export async function getReports(query) {
  const { period, startDate, endDate, vehicleNumber, transport } = query;

  let trips = await getAllTrips();
  const today = new Date();

  if (period === "daily") {
    const todayStr = today.toISOString().split("T")[0];
    trips = trips.filter((t) => t.date === todayStr);
  } else if (period === "weekly") {
    const weekAgo = new Date(today.getTime() - 7 * 86400000).toISOString().split("T")[0];
    trips = trips.filter((t) => t.date >= weekAgo);
  } else if (period === "monthly") {
    const monthAgo = new Date(today.getTime() - 30 * 86400000).toISOString().split("T")[0];
    trips = trips.filter((t) => t.date >= monthAgo);
  } else if (period === "custom" || startDate || endDate) {
    if (startDate) {
      trips = trips.filter((t) => t.date >= String(startDate));
    }
    if (endDate) {
      trips = trips.filter((t) => t.date <= String(endDate));
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
  const totalBooking = trips.reduce((sum, t) => sum + (t.booking || 0), 0);
  const totalCommission = trips.reduce((sum, t) => sum + (t.commission || 0), 0);
  const totalDifferenceAmount = trips.reduce(
    (sum, t) => sum + ((t.booking || 0) - (t.freight || 0)),
    0
  );
  const totalGrossIncome = trips.reduce(
    (sum, t) => sum + ((t.booking || 0) - (t.commission || 0)),
    0
  );
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
      totalDifferenceAmount,
      totalGrossIncome,
      totalAdvReceived,
      totalAdvPaid,
      totalVehicleBalance,
      totalCompanyBalance,
    },
    trips,
  };
}
