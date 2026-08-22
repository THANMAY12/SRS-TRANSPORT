import React from "react";
import { ArrowUpRight } from "lucide-react";

export const MetricCard = ({
  id,
  title,
  value,
  subtext,
  icon: Icon,
  variant = "default", // "default", "warning", "neutral"
  onClick,
}) => {
  const isWarning = variant === "warning";

  const cardStyles = isWarning
    ? "bg-amber-50/40 border-amber-200 hover:border-amber-300"
    : "bg-white border-slate-200 hover:border-slate-300";

  const iconStyles = isWarning
    ? "bg-amber-100 text-amber-700 border border-amber-200"
    : "bg-blue-50 text-blue-600 border border-blue-100";

  return (
    <div
      id={`card-${id}`}
      onClick={onClick}
      className={`p-4 rounded-xl border ${cardStyles} shadow-xs transition-colors cursor-pointer group flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <div className={`p-2 rounded-lg ${iconStyles} shrink-0`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-mono">{value}</h3>
          {subtext && <p className="text-[11px] font-normal text-slate-500 mt-0.5">{subtext}</p>}
        </div>
      </div>

      {onClick && (
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500 group-hover:text-blue-600">
          <span>View details</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
        </div>
      )}
    </div>
  );
};
