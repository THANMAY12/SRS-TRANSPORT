import React from "react";

export const StatusBadge = ({ type, text, size = "md" }) => {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200 font-medium";

  switch (type) {
    case "pending-commission":
    case "pending-advance-vehicle":
    case "pending-advance-company":
    case "pending":
      colorClasses = "bg-amber-50 text-amber-800 border-amber-200 font-medium";
      break;
    case "balance-vehicle":
    case "balance-company":
    case "balance-due":
      colorClasses = "bg-purple-50 text-purple-800 border-purple-200 font-medium";
      break;
    case "completed":
    case "cleared":
    case "active":
      colorClasses = "bg-emerald-50 text-emerald-800 border-emerald-200 font-medium";
      break;
    case "disabled":
    case "error":
      colorClasses = "bg-rose-50 text-rose-800 border-rose-200 font-medium";
      break;
    case "admin":
      colorClasses = "bg-blue-50 text-blue-800 border-blue-200 font-medium";
      break;
    case "worker":
      colorClasses = "bg-slate-100 text-slate-700 border-slate-200 font-medium";
      break;
    case "cash":
    case "phonepe":
    case "topay":
      colorClasses = "bg-slate-100 text-slate-800 border-slate-200 font-medium";
      break;
    default:
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border tracking-tight ${sizeClasses} ${colorClasses}`}
    >
      {text}
    </span>
  );
};
