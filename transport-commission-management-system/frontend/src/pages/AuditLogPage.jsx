import React, { useState, useEffect } from "react";
import { Download, FileSpreadsheet, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";
import { PageHeader } from "../components/ui/PageHeader";
import { DataTable } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Toast } from "../components/ui/Toast";
import { api } from "../services/api";
import {
  formatDate,
  getVehicleBalanceAmount,
  getCompanyBalanceAmount,
  getTripPaymentStatus,
} from "../lib/utils";

export const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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

  const handleExportDatabaseToExcel = async () => {
    setIsExporting(true);
    setToast({
      type: "info",
      message: "Export started: Compiling database records into Excel workbook...",
    });

    try {
      // Fetch all database collections
      const [tripsData, workersData, auditLogsData] = await Promise.all([
        api.getTrips(),
        api.getWorkers().catch(() => []),
        api.getAuditLogs(),
      ]);

      const trips = Array.isArray(tripsData) ? tripsData : [];
      const workers = Array.isArray(workersData) ? workersData : [];
      const auditLogs = Array.isArray(auditLogsData) ? auditLogsData : [];

      // Sheet 1: Trips
      const tripsRows = trips.map((t) => ({
        "Sl.No": t.slNo,
        Date: t.date,
        "Vehicle Number": t.vehicleNumber,
        From: t.fromLocation,
        To: t.toLocation,
        "Freight (INR)": t.freight || 0,
        Transport: t.transport,
        "Booking (INR)": t.booking || 0,
        "Commission (INR)":
          t.commission !== null && t.commission !== undefined ? t.commission : "Pending",
        "Advance Received Amount (INR)": t.advanceReceivedAmount || 0,
        "Advance Received Type": t.advanceReceivedType || "Pending",
        "Advance Paid Amount (INR)": t.advancePaidAmount || 0,
        "Advance Paid Type": t.advancePaidType || "Pending",
        Remarks: t.remarks || "",
        "Vehicle Balance (INR)": getVehicleBalanceAmount(t),
        "Company Balance (INR)": getCompanyBalanceAmount(t),
        Status: getTripPaymentStatus(t),
      }));

      // Sheet 2: Users & Workers
      const workersRows = workers.map((w) => ({
        Name: w.name || w.username,
        Username: w.username,
        Role: w.role,
        Status: w.status || "ACTIVE",
        "Created At": w.createdAt ? formatDate(w.createdAt) : "N/A",
        "Updated At": w.updatedAt ? formatDate(w.updatedAt) : "N/A",
      }));

      // Sheet 3: Audit Logs
      const auditRows = auditLogs.map((l) => ({
        Timestamp: `${l.date || ""} ${l.time || ""}`.trim(),
        User: l.username,
        Role: l.userRole,
        Action: l.action,
        Resource: l.targetId || "-",
        "Previous Value": l.oldValue || "N/A",
        "New Value": l.newValue || "-",
      }));

      const workbook = XLSX.utils.book_new();

      const wsTrips = XLSX.utils.json_to_sheet(
        tripsRows.length > 0 ? tripsRows : [{ Status: "No trip records available" }]
      );
      const wsWorkers = XLSX.utils.json_to_sheet(
        workersRows.length > 0 ? workersRows : [{ Role: "No worker records available" }]
      );
      const wsAudit = XLSX.utils.json_to_sheet(
        auditRows.length > 0 ? auditRows : [{ Action: "No audit log records available" }]
      );

      // Auto-calculate column widths
      const formatSheet = (ws, rows) => {
        if (rows && rows.length > 0) {
          const keys = Object.keys(rows[0]);
          ws["!cols"] = keys.map((key) => {
            const maxLen = Math.max(
              key.length,
              ...rows.map((r) => String(r[key] || "").length)
            );
            return { wch: Math.min(Math.max(maxLen + 3, 10), 45) };
          });
        }
      };

      formatSheet(wsTrips, tripsRows);
      formatSheet(wsWorkers, workersRows);
      formatSheet(wsAudit, auditRows);

      XLSX.utils.book_append_sheet(workbook, wsTrips, "Trips");
      XLSX.utils.book_append_sheet(workbook, wsWorkers, "Users & Workers");
      XLSX.utils.book_append_sheet(workbook, wsAudit, "Audit Logs");

      const todayStr = new Date().toISOString().split("T")[0];
      const fileName = `TCMS_Database_Export_${todayStr}.xlsx`;

      XLSX.writeFile(workbook, fileName);

      setToast({
        type: "success",
        message: `Database exported to Excel successfully! File saved as ${fileName}`,
      });
    } catch (err) {
      console.error("Export database to Excel failed:", err);
      setToast({
        type: "error",
        message: err.message || "Export failed: Unable to generate database Excel file.",
      });
    } finally {
      setIsExporting(false);
    }
  };

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
              id="audit-export-excel-btn"
              onClick={handleExportDatabaseToExcel}
              disabled={isExporting}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-50"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>{isExporting ? "Exporting..." : "Export Database to Excel"}</span>
            </button>

            <button
              id="audit-download-backup-btn"
              onClick={handleDownloadBackup}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
              title="Download raw JSON database snapshot for disaster recovery"
            >
              <Download className="h-4 w-4 text-slate-600" />
              <span>JSON Backup</span>
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
