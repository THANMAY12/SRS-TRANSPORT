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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.webp";
export const Sidebar = ({ activePage, setActivePage, stats, isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  const groups = [
    {
      title: "Operations",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: "daily-entry",
          label: "Daily entry",
          icon: FilePlus,
          badge: null,
        },
      ],
    },
    {
      title: "Pending work",
      items: [
        {
          id: "pending-commission",
          label: "Pending commission",
          icon: Clock,
          badge: stats?.pendingCommissionCount || 0,
          badgeColor: "bg-amber-50 text-amber-700 border border-amber-200",
        },
        {
          id: "pending-advance-vehicle",
          label: "Pending vehicle advance",
          icon: Truck,
          badge: stats?.pendingVehicleAdvanceCount || 0,
          badgeColor: "bg-amber-50 text-amber-700 border border-amber-200",
        },
        {
          id: "pending-advance-company",
          label: "Pending company advance",
          icon: Building2,
          badge: stats?.pendingCompanyAdvanceCount || 0,
          badgeColor: "bg-amber-50 text-amber-700 border border-amber-200",
        },
      ],
    },
    {
      title: "Financial",
      items: [
        {
          id: "balance-vehicle",
          label: "Vehicle balance (> ₹200)",
          icon: Scale,
          badge: stats?.balanceVehicleCount || 0,
          badgeColor: "bg-slate-100 text-slate-700 border border-slate-200",
        },
        {
          id: "balance-company",
          label: "Company balance (> ₹200)",
          icon: Landmark,
          badge: stats?.balanceCompanyCount || 0,
          badgeColor: "bg-slate-100 text-slate-700 border border-slate-200",
        },
        {
          id: "completed",
          label: "Completed trips",
          icon: CheckCircle2,
          badge: stats?.completedTripsTodayCount || 0,
          badgeColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        },
      ],
    },
    {
      title: "Reporting",
      items: [
        {
          id: "reports",
          label: "Financial reports",
          icon: BarChart3,
          badge: null,
        },
      ],
    },
  ];

  const adminGroup = {
    title: "Administration",
    items: [
      {
        id: "manage-workers",
        label: "Manage workers",
        icon: Users,
      },
      {
        id: "audit-logs",
        label: "System audit logs",
        icon: ShieldCheck,
      },
    ],
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="main-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white text-slate-900 flex flex-col border-r border-slate-200 shadow-sm transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white shadow-xs">
              <img
                src={logo}
                alt="Transport Commission System"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-900 tracking-tight leading-none">
                TCMS Operations
              </h1>
              <span className="text-[10px] font-medium text-slate-500">
                Transport Commission System
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {group.title}
              </p>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
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
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive ? "text-blue-600" : "text-slate-400"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge !== null && item.badge > 0 && (
                        <span
                          className={`ml-2 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.badgeColor || "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* Admin Group */}
          {user?.role === "ADMIN" && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {adminGroup.title}
              </p>
              <nav className="space-y-0.5">
                {adminGroup.items.map((item) => {
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
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive ? "text-blue-600" : "text-slate-400"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="h-7 w-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
              <p className="text-[10px] font-medium text-slate-500 uppercase">{user?.role}</p>
            </div>
          </div>

          <button
            id="sidebar-logout-button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors bg-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
