import React from "react";
import {
  LayoutDashboard,
  FilePlus,
  Clock,
  Truck,
  Building2,
  Scale,
  Landmark,
  CheckCircle2,
  BarChart3,
  ShieldCheck,
  Users,
  LogOut,
  ChevronRight,
  TruckIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Sidebar = ({
  activePage,
  setActivePage,
  stats,
  isOpen,
  setIsOpen,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
      badgeColor: "",
    },
    {
      id: "daily-entry",
      label: "Page 1 – Daily Entry",
      icon: FilePlus,
      badge: null,
      badgeColor: "",
    },
    {
      id: "pending-commission",
      label: "Page 2 – Pending Commission",
      icon: Clock,
      badge: stats?.pendingCommissionCount || 0,
      badgeColor: "bg-amber-500 text-white",
    },
    {
      id: "pending-advance-vehicle",
      label: "Page 3 – Pending Advance Vehicle",
      icon: Truck,
      badge: stats?.pendingVehicleAdvanceCount || 0,
      badgeColor: "bg-orange-500 text-white",
    },
    {
      id: "pending-advance-company",
      label: "Page 4 – Pending Advance Company",
      icon: Building2,
      badge: stats?.pendingCompanyAdvanceCount || 0,
      badgeColor: "bg-blue-500 text-white",
    },
    {
      id: "balance-vehicle",
      label: "Page 5 – Balance for Vehicle",
      icon: Scale,
      badge: stats?.balanceVehicleCount || 0,
      badgeColor: "bg-purple-500 text-white",
    },
    {
      id: "balance-company",
      label: "Page 6 – Balance from Company",
      icon: Landmark,
      badge: stats?.balanceCompanyCount || 0,
      badgeColor: "bg-indigo-500 text-white",
    },
    {
      id: "completed",
      label: "Page 7 – Completed Trips",
      icon: CheckCircle2,
      badge: stats?.completedTripsTodayCount || 0,
      badgeColor: "bg-emerald-500 text-white",
    },
    {
      id: "reports",
      label: "Reports & Analytics",
      icon: BarChart3,
      badge: null,
      badgeColor: "",
    },
  ];

  const adminNavItems = [
    {
      id: "audit-logs",
      label: "Audit Logs",
      icon: ShieldCheck,
      badge: null,
      badgeColor: "",
    },
    {
      id: "manage-workers",
      label: "Manage Workers",
      icon: Users,
      badge: null,
      badgeColor: "",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="main-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <TruckIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-wide leading-none">
                TransCom
              </h1>
              <span className="text-[11px] font-medium text-blue-400 uppercase tracking-wider">
                Management System
              </span>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold flex items-center justify-center text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  user?.role === "ADMIN" ? "bg-emerald-400" : "bg-blue-400"
                }`}
              />

              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 custom-scrollbar">
          {/* Main Navigation */}
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              MAIN WORKFLOW
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;

                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => {
                      setActivePage(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon
                        className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== null && item.badge > 0 && (
                      <span
                        className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Admin Tools Section */}
          {user?.role === "ADMIN" && (
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                ADMINISTRATION
              </p>
              <nav className="space-y-1">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;

                  return (
                    <button
                      key={item.id}
                      id={`nav-admin-${item.id}`}
                      onClick={() => {
                        setActivePage(item.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30"
                          : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon
                          className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <button
            id="sidebar-logout-button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
