import React from "react";

export const DataTable = ({
  columns,
  data,
  renderRow,
  emptyMessage = "No records found matching search criteria.",
  isLoading = false,
  headerBg = "bg-slate-50",
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead
            className={`${headerBg} text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200 sticky top-0 z-10`}
          >
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-2.5 px-3.5 ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"}`}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-normal text-slate-800">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="py-3 px-3.5">
                      <div className="h-3 bg-slate-100 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10 text-center text-slate-400 font-medium"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => renderRow(item, idx))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
