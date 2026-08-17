import React, { useState, useEffect } from "react";
import { Download, RefreshCw } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { DataTable } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Toast } from "../components/ui/Toast";
import { api } from "../services/api";
import { formatDate } from "../lib/utils";

export const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      setToast({
        type: "error",
        message: "Failed to load audit trail logs.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDownloadBackup = async () => {
    try {
      await api.downloadBackup();
      setToast({
        type: "success",
        message: "Database JSON backup downloaded successfully!",
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Failed to download database backup.",
      });
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.newValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.oldValue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { title: "User Name" },
    { title: "Role" },
    { title: "Date" },
    { title: "Time" },
    { title: "Action Event" },
    { title: "Previous Value" },
    { title: "New Value" },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        badgeText="Administration"
        title="System audit trail"
        subtitle="Complete immutable audit record of all user activities, logins, trip creations, updates, deletions, and balance clearances."
        searchPlaceholder="Filter logs by user, action, or value..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        printId="audit-print-btn"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBackup}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Download className="h-4 w-4 text-blue-600" />
              <span>Download DB Backup</span>
            </button>
            <button
              onClick={fetchLogs}
              className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shrink-0"
              title="Refresh audit logs"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        }
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Audit Log Table */}
      <DataTable
        columns={columns}
        data={filteredLogs}
        isLoading={isLoading}
        emptyMessage="No audit log records found."
        renderRow={(log) => (
          <tr
            key={log.id}
            className="hover:bg-slate-50 transition-colors border-b border-slate-100"
          >
            <td className="py-2.5 px-3.5 font-semibold text-slate-900">
              {log.username}
            </td>
            <td className="py-2.5 px-3.5">
              <StatusBadge
                type={log.userRole === "ADMIN" ? "admin" : "worker"}
                text={log.userRole}
                size="sm"
              />
            </td>
            <td className="py-2.5 px-3.5 whitespace-nowrap">{formatDate(log.date)}</td>
            <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-500">{log.time}</td>
            <td className="py-2.5 px-3.5 font-mono font-semibold text-blue-700">
              {log.action}
            </td>
            <td className="py-2.5 px-3.5 truncate max-w-[180px] text-slate-400 italic">
              {log.oldValue || "N/A"}
            </td>
            <td className="py-2.5 px-3.5 truncate max-w-[220px] font-medium text-slate-800 font-mono">
              {log.newValue || "-"}
            </td>
          </tr>
        )}
      />
    </div>
  );
};
