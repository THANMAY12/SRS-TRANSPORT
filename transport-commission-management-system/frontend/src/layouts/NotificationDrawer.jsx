import React from "react";
import { X, AlertCircle, Clock, Truck, Building2, Scale, Landmark, ArrowRight } from "lucide-react";

export const NotificationDrawer = ({ isOpen, onClose, stats, onNavigatePage }) => {
  if (!isOpen) return null;

  const queues = [
    {
      id: "pending-commission",
      title: "Pending commission entries",
      count: stats?.pendingCommissionCount || 0,
      description: "Trips requiring agent commission input",
      icon: Clock,
      border: "border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-900",
      page: "pending-commission",
    },
    {
      id: "pending-vehicle-advance",
      title: "Pending vehicle advances",
      count: stats?.pendingVehicleAdvanceCount || 0,
      description: "Trips missing vehicle advance payment type",
      icon: Truck,
      border: "border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-900",
      page: "pending-advance-vehicle",
    },
    {
      id: "pending-company-advance",
      title: "Pending company advances",
      count: stats?.pendingCompanyAdvanceCount || 0,
      description: "Trips missing company advance collection type",
      icon: Building2,
      border: "border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-900",
      page: "pending-advance-company",
    },
    {
      id: "balance-vehicle",
      title: "Vehicle freight balances (> ₹200)",
      count: stats?.balanceVehicleCount || 0,
      description: "Active vehicle balances pending clearance",
      icon: Scale,
      border: "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800",
      page: "balance-vehicle",
    },
    {
      id: "balance-company",
      title: "Company booking balances (> ₹200)",
      count: stats?.balanceCompanyCount || 0,
      description: "Active company balances pending collection",
      icon: Landmark,
      border: "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800",
      page: "balance-company",
    },
  ];

  const totalNeedsAttention = queues.reduce((sum, q) => sum + q.count, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full p-6 shadow-xl border-l border-slate-200 flex flex-col justify-between">
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-none">
                  Operations action center
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  {totalNeedsAttention} items requiring operational attention
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {totalNeedsAttention === 0 ? (
            <div className="p-6 text-center rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <p className="text-xs font-bold text-slate-800">No pending actions</p>
              <p className="text-[11px] text-slate-500">All operation queues are currently up to date.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {queues.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onNavigatePage(item.page);
                      onClose();
                    }}
                    className={`p-3.5 rounded-lg border ${item.border} cursor-pointer transition-colors flex items-center justify-between group`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-white border border-slate-200 text-slate-600 shadow-xs">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-bold text-xs font-mono text-slate-800">
                        {item.count}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
        >
          Close action center
        </button>
      </div>
    </div>
  );
};
