import React from "react";
import { Printer, Search } from "lucide-react";

export const PageHeader = ({
  badgeText,
  title,
  subtitle,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  actions,
  showPrint = true,
  printId,
}) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        {badgeText && (
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
            {badgeText}
          </span>
        )}
        <h1 className="text-lg font-bold text-slate-900 leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">{subtitle}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
        {onSearchChange !== undefined && (
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder || "Search records..."}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
            />
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {showPrint && (
            <button
              id={printId}
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              title="Print page view"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Print</span>
            </button>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
};
