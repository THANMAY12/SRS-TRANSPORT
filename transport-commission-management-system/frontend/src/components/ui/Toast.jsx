import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export const Toast = ({ type = "info", message, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const isSuccess = type === "success";
  const isError = type === "error";

  const bannerStyles = isSuccess
    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
    : isError
      ? "bg-rose-50 border-rose-200 text-rose-900"
      : "bg-blue-50 border-blue-200 text-blue-900";

  return (
    <div
      className={`p-3.5 rounded-lg border ${bannerStyles} shadow-xs flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2 duration-150`}
    >
      <div className="flex items-center gap-2.5">
        {isSuccess ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
        ) : (
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
        )}
        <span className="font-medium">{message}</span>
      </div>
      <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
