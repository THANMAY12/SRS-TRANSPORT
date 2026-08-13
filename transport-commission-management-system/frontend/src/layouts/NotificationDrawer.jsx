import React from "react";
import {
  X,
  AlertCircle,
  Clock,
  Truck,
  Building2,
  Scale,
  ArrowRight,
} from "lucide-react";

export const NotificationDrawer = ({
  isOpen,
  onClose,
  stats,
  onNavigatePage,
}) => {
  if (!isOpen) return null;

  const alerts = [
    {
      id: "pending-commission",
      title: "Pending Commission Entries",
      count: stats?.pendingCommissionCount || 0,
      description: "Trips requiring commission input",
      icon: Clock,
      color:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      page: "pending-commission",
    },
    {
      id: "pending-vehicle-advance",
      title: "Pending Vehicle Advances",
      count: stats?.pendingVehicleAdvanceCount || 0,
      description: "Vehicle advance payment type missing",
      icon: Truck,
      color:
        "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
      page: "pending-advance-vehicle",
    },
    {
      id: "pending-company-advance",
      title: "Pending Company Advances",
      count: stats?.pendingCompanyAdvanceCount || 0,
      description: "Company collection advance type missing",
      icon: Building2,
      color:
        "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
      page: "pending-advance-company",
    },
    {
      id: "balance-vehicle",
      title: "Vehicle Freight Balances (> ₹200)",
      count: stats?.balanceVehicleCount || 0,
      description: "Active vehicle balances pending clearance",
      icon: Scale,
      color:
        "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
      page: "balance-vehicle",
    },
    {
      id: "balance-company",
      title: "Company Booking Balances (> ₹200)",
      count: stats?.balanceCompanyCount || 0,
      description: "Active company balances pending collection",
      icon: Building2,
      color:
        "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
      page: "balance-company",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 h-full p-6 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pending Action Alerts
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <div
                  key={alert.id}
                  onClick={() => {
                    onNavigatePage(alert.page);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border ${alert.color} cursor-pointer hover:shadow-md transition-all flex items-center justify-between group`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-xs">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {alert.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {alert.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full bg-white dark:bg-slate-800 font-bold text-xs">
                      {alert.count}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
};
