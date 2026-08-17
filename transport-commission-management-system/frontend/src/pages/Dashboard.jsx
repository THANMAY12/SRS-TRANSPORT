import React, { useState } from "react";
import {
  Truck,
  IndianRupee,
  Coins,
  Clock,
  Building2,
  Scale,
  Landmark,
  CheckCircle2,
  Eye,
  ArrowRight,
  Plus,
} from "lucide-react";
import { MetricCard } from "../components/ui/MetricCard";
import { PageHeader } from "../components/ui/PageHeader";
import { DataTable } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";
import { TripDetailModal } from "../components/modals/TripDetailModal";
import {
  formatCurrency,
  formatDate,
  isPendingCommission,
  isPendingAdvanceVehicle,
  isPendingAdvanceCompany,
  isBalanceVehicleActive,
  isBalanceCompanyActive,
  isCompletedTrip,
} from "../lib/utils";

export const Dashboard = ({
  stats,
  latestTrips,
  onNavigatePage,
  globalSearch,
  setGlobalSearch,
}) => {
  const [selectedTripModal, setSelectedTripModal] = useState(null);

  // Group 1: Today's Operations (Uniform corporate visual treatment)
  const todayOperations = [
    {
      id: "today-vehicles",
      title: "Today's vehicles",
      value: stats?.todayVehiclesCount || 0,
      subtext: "Vehicles loaded today",
      icon: Truck,
      onClick: () => onNavigatePage("daily-entry"),
    },
    {
      id: "today-freight",
      title: "Today's freight",
      value: formatCurrency(stats?.todayFreightTotal || 0),
      subtext: "Total freight generated today",
      icon: IndianRupee,
      onClick: () => onNavigatePage("reports"),
    },
    {
      id: "today-commission",
      title: "Today's commission",
      value: formatCurrency(stats?.todayCommissionTotal || 0),
      subtext: "Commission earned today",
      icon: Coins,
      onClick: () => onNavigatePage("reports"),
    },
    {
      id: "completed-today",
      title: "Completed today",
      value: stats?.completedTripsTodayCount || 0,
      subtext: "Trips fully settled today",
      icon: CheckCircle2,
      onClick: () => onNavigatePage("completed"),
    },
  ];

  // Group 2: Pending Work (Subtle warning treatment)
  const pendingWork = [
    {
      id: "pending-commission",
      title: "Pending commission",
      value: stats?.pendingCommissionCount || 0,
      subtext: "Trips missing commission",
      icon: Clock,
      variant: "warning",
      onClick: () => onNavigatePage("pending-commission"),
    },
    {
      id: "pending-vehicle-advance",
      title: "Pending vehicle advance",
      value: stats?.pendingVehicleAdvanceCount || 0,
      subtext: "Vehicle advance type pending",
      icon: Truck,
      variant: "warning",
      onClick: () => onNavigatePage("pending-advance-vehicle"),
    },
    {
      id: "pending-company-advance",
      title: "Pending company advance",
      value: stats?.pendingCompanyAdvanceCount || 0,
      subtext: "Company collection type pending",
      icon: Building2,
      variant: "warning",
      onClick: () => onNavigatePage("pending-advance-company"),
    },
  ];

  // Group 3: Outstanding Balances
  const outstandingBalances = [
    {
      id: "balance-vehicle",
      title: "Vehicle balance (> ₹200)",
      value: stats?.balanceVehicleCount || 0,
      subtext: "Vehicle balances pending clearance",
      icon: Scale,
      onClick: () => onNavigatePage("balance-vehicle"),
    },
    {
      id: "balance-company",
      title: "Company balance (> ₹200)",
      value: stats?.balanceCompanyCount || 0,
      subtext: "Company collections pending clearance",
      icon: Landmark,
      onClick: () => onNavigatePage("balance-company"),
    },
  ];

  // Filter latest 20 trips
  const filteredTrips = latestTrips.filter((t) => {
    if (!globalSearch.trim()) return true;
    const q = globalSearch.toLowerCase().trim();
    return (
      String(t.slNo).includes(q) ||
      t.vehicleNumber.toLowerCase().includes(q) ||
      t.date.includes(q) ||
      t.transport.toLowerCase().includes(q) ||
      t.fromLocation.toLowerCase().includes(q) ||
      t.toLocation.toLowerCase().includes(q)
    );
  });

  const columns = [
    { title: "Sl.No" },
    { title: "Date" },
    { title: "Vehicle Number" },
    { title: "Route" },
    { title: "Freight" },
    { title: "Booking" },
    { title: "Commission" },
    { title: "Transport" },
    { title: "Status" },
    { title: "Action", align: "center" },
  ];

  const totalPendingItems =
    (stats?.pendingCommissionCount || 0) +
    (stats?.pendingVehicleAdvanceCount || 0) +
    (stats?.pendingCompanyAdvanceCount || 0);

  const totalBalanceItems =
    (stats?.balanceVehicleCount || 0) + (stats?.balanceCompanyCount || 0);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        badgeText="Operations overview"
        title="Dashboard"
        subtitle="Today's transport operations, financial activity, and pending action queues."
        searchPlaceholder="Search Sl.No, Vehicle, Transport..."
        searchValue={globalSearch}
        onSearchChange={setGlobalSearch}
        printId="dash-print-btn"
        actions={
          <button
            id="dash-add-trip-btn"
            onClick={() => onNavigatePage("daily-entry")}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>+ New Trip Entry</span>
          </button>
        }
      />

      {/* Row 1: Today's Operational Metrics */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
          Today's operational metrics
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {todayOperations.map((card) => (
            <MetricCard key={card.id} {...card} />
          ))}
        </div>
      </div>

      {/* Row 2 & 3: Pending Work & Outstanding Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left Column: Pending Work (3 cards) */}
        <div className="lg:col-span-3 space-y-2.5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending work
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {pendingWork.map((card) => (
              <MetricCard key={card.id} {...card} />
            ))}
          </div>
        </div>

        {/* Right Column: Outstanding Balances (2 cards) */}
        <div className="lg:col-span-2 space-y-2.5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Outstanding balances (&gt; ₹200)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {outstandingBalances.map((card) => (
              <MetricCard key={card.id} {...card} />
            ))}
          </div>
        </div>
      </div>

      {/* Operational Queue Summary */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div>
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
            Operational queue summary
          </h3>
          <p className="text-slate-500 mt-0.5">
            {totalPendingItems} trips requiring pending input details • {totalBalanceItems} active balances exceeding ₹200.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {(stats?.pendingCommissionCount || 0) > 0 && (
            <button
              onClick={() => onNavigatePage("pending-commission")}
              className="px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-1 hover:bg-amber-100 transition-colors"
            >
              <span>Pending commission ({stats.pendingCommissionCount})</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
          {(stats?.balanceVehicleCount || 0) > 0 && (
            <button
              onClick={() => onNavigatePage("balance-vehicle")}
              className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium flex items-center gap-1 hover:bg-slate-200 transition-colors"
            >
              <span>Vehicle balance ({stats.balanceVehicleCount})</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Recent 20 Trips Table */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Latest trips log
          </h3>
          <span className="text-xs text-slate-500 font-normal">
            Showing {filteredTrips.length} of {latestTrips.length} entries
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filteredTrips}
          emptyMessage={
            latestTrips.length === 0
              ? "No transport entries yet. Create your first transport entry to begin tracking operations."
              : "No trip entries found matching your search term."
          }
          renderRow={(trip) => {
            const isComm = isPendingCommission(trip);
            const isAdvPaid = isPendingAdvanceVehicle(trip);
            const isAdvRec = isPendingAdvanceCompany(trip);
            const isVehBal = isBalanceVehicleActive(trip);
            const isCompBal = isBalanceCompanyActive(trip);
            const isComp = isCompletedTrip(trip);

            return (
              <tr
                key={trip.id}
                className="hover:bg-slate-50 transition-colors border-b border-slate-100"
              >
                <td className="py-2.5 px-3.5 font-mono font-bold text-blue-700">
                  #{trip.slNo}
                </td>
                <td className="py-2.5 px-3.5 whitespace-nowrap">{formatDate(trip.date)}</td>
                <td className="py-2.5 px-3.5 font-mono font-semibold">{trip.vehicleNumber}</td>
                <td className="py-2.5 px-3.5 whitespace-nowrap">
                  {trip.fromLocation} → {trip.toLocation}
                </td>
                <td className="py-2.5 px-3.5 font-bold text-slate-900 font-mono">
                  {formatCurrency(trip.freight)}
                </td>
                <td className="py-2.5 px-3.5 font-mono text-slate-600">
                  {formatCurrency(trip.booking)}
                </td>
                <td className="py-2.5 px-3.5 font-mono font-semibold text-slate-900">
                  {trip.commission !== null ? formatCurrency(trip.commission) : "-"}
                </td>
                <td className="py-2.5 px-3.5 truncate max-w-[140px] text-slate-700">{trip.transport}</td>
                <td className="py-2.5 px-3.5">
                  {isComp ? (
                    <StatusBadge type="completed" text="Completed" size="sm" />
                  ) : isComm ? (
                    <StatusBadge type="pending-commission" text="Pending comm" size="sm" />
                  ) : isAdvPaid ? (
                    <StatusBadge type="pending-advance-vehicle" text="Pending adv veh" size="sm" />
                  ) : isAdvRec ? (
                    <StatusBadge type="pending-advance-company" text="Pending adv comp" size="sm" />
                  ) : isVehBal || isCompBal ? (
                    <StatusBadge type="balance-due" text="Balance due" size="sm" />
                  ) : (
                    <StatusBadge type="completed" text="In progress" size="sm" />
                  )}
                </td>
                <td className="py-2.5 px-3.5 text-center">
                  <button
                    onClick={() => setSelectedTripModal(trip)}
                    className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-slate-100 transition-colors"
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          }}
        />
      </div>

      {/* Trip Detail Modal */}
      <TripDetailModal
        trip={selectedTripModal}
        onClose={() => setSelectedTripModal(null)}
      />
    </div>
  );
};
