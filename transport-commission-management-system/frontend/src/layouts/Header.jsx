import React from "react";
import { Menu, Search, Bell, Clock, RefreshCw, Printer } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Header = ({
  pageTitle,
  pageSubtitle,
  onMenuClick,
  globalSearch,
  setGlobalSearch,
  onRefresh,
  isRefreshing,
  onOpenNotifications,
  stats,
}) => {
  const { user, inactivityWarning, resetInactivityTimer } = useAuth();

  const totalOverduePending =
    (stats?.pendingCommissionCount || 0) +
    (stats?.pendingVehicleAdvanceCount || 0) +
    (stats?.pendingCompanyAdvanceCount || 0);

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left Title & Mobile Menu Button */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-menu-toggle"
          onClick={onMenuClick}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h2 className="text-sm font-bold text-slate-900 leading-tight">
            {pageTitle}
          </h2>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            {pageSubtitle}
          </p>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            id="header-global-search-input"
            type="text"
            placeholder="Search Sl.No, Vehicle, Date, Transport, Route..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Inactivity Warning Toast Banner */}
        {inactivityWarning && (
          <button
            id="inactivity-warning-banner"
            onClick={resetInactivityTimer}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-medium"
          >
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>Session inactive. Click to remain logged in</span>
          </button>
        )}

        {/* Refresh Button */}
        <button
          id="header-refresh-button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 bg-white transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
        </button>

        {/* Global Print Button */}
        <button
          id="header-print-button"
          onClick={() => window.print()}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 bg-white transition-colors"
          title="Print View"
        >
          <Printer className="h-4 w-4" />
        </button>

        {/* Notification Bell */}
        <button
          id="header-notification-button"
          onClick={onOpenNotifications}
          className="relative p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 bg-white transition-colors"
          title="Action Center Alerts"
        >
          <Bell className="h-4 w-4" />
          {totalOverduePending > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-amber-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-white">
              {totalOverduePending > 9 ? "9+" : totalOverduePending}
            </span>
          )}
        </button>

        {/* User Badge */}
        <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-900 leading-tight">
              {user?.username}
            </p>
            <span className="text-[10px] text-blue-700 font-semibold uppercase">
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
