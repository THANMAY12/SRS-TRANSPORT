import React, { useState, useEffect } from "react";
import {
  Download,
  FileSpreadsheet,
  RefreshCw,
  Filter,
  XCircle,
  Calendar,
  User as UserIcon,
} from "lucide-react";
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

const tryParseJson = (val) => {
  if (!val || val === "N/A" || val === "-") return null;
  const trimmed = String(val).trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed;
      }
    } catch {
      return null;
    }
  }
  return null;
};

const formatValueText = (val) => {
  if (!val || val === "N/A" || val === "-") return val || "N/A";
  const parsed = tryParseJson(val);
  if (parsed && (parsed.slNo || parsed.vehicleNumber)) {
    const parts = [];
    parts.push(`Trip #${parsed.slNo ?? (parsed.id || "")}`);
    if (parsed.vehicleNumber) parts.push(`Vehicle: ${parsed.vehicleNumber}`);
    if (parsed.fromLocation && parsed.toLocation)
      parts.push(`Route: ${parsed.fromLocation} -> ${parsed.toLocation}`);
    if (parsed.freight !== undefined) parts.push(`Freight: Rs.${parsed.freight}`);
    if (parsed.booking !== undefined) parts.push(`Booking: Rs.${parsed.booking}`);
    if (parsed.commission !== undefined)
      parts.push(
        `Commission: ${parsed.commission !== null ? `Rs.${parsed.commission}` : "Pending"}`
      );
    return parts.join(" | ");
  }
  return val;
};

const AuditValueCell = ({ value }) => {
  if (!value || value === "N/A" || value === "-") {
    return <span className="text-slate-400 italic">N/A</span>;
  }

  const parsed = tryParseJson(value);
  if (parsed) {
    return (
      <div className="flex flex-col gap-1 text-xs font-sans py-0.5">
        <div className="flex items-center gap-1.5 flex-wrap font-sans">
          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">
            Trip #{parsed.slNo ?? "?"}
          </span>
          {parsed.vehicleNumber && (
            <span className="font-mono text-slate-900 font-semibold font-mono">
              {parsed.vehicleNumber}
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-600 font-sans leading-snug">
          {parsed.fromLocation && parsed.toLocation && (
            <span className="block">
              {parsed.fromLocation} → {parsed.toLocation}
            </span>
          )}
          {parsed.freight !== undefined && (
            <span className="block text-[10px] text-slate-500 font-mono">
              Freight: ₹{parsed.freight} | Booking: ₹{parsed.booking ?? 0}
            </span>
          )}
        </div>
      </div>
    );
  }

  return <span className="text-slate-700 text-xs font-medium leading-normal">{value}</span>;
};

export const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [userList, setUserList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState(null);

  // Filter States
  const [datePreset, setDatePreset] = useState("today"); // "today" | "yesterday" | "custom" | "all"
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [userFilter, setUserFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getTodayStr = () => new Date().toISOString().split("T")[0];
  const getYesterdayStr = () => new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Fetch Workers/Users for dropdown
  useEffect(() => {
    api
      .getWorkers()
      .then((workers) => {
        const usernames = Array.isArray(workers) ? workers.map((w) => w.username) : [];
        setUserList(Array.from(new Set([...usernames, "Darshan", "Admin"])).filter(Boolean));
      })
      .catch(() => {
        setUserList(["Darshan", "Admin", "Worker1"]);
      });
  }, []);

  const fetchLogs = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (datePreset === "today") {
        params.datePreset = "today";
        params.date = getTodayStr();
      } else if (datePreset === "yesterday") {
        params.datePreset = "yesterday";
        params.date = getYesterdayStr();
      } else if (datePreset === "custom") {
        params.datePreset = "custom";
        params.date = customDate;
      } else {
        params.datePreset = "all";
      }

      if (userFilter && userFilter !== "all") {
        params.username = userFilter;
      }

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const data = await api.getAuditLogs(params);
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      setToast({
        type: "error",
        message: "Failed to load audit trail logs.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [datePreset, customDate, userFilter, searchTerm]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleClearFilters = () => {
    setDatePreset("all");
    setCustomDate(getTodayStr());
    setUserFilter("all");
    setSearchTerm("");
  };

  // Additional client-side search filtering if user types in search box
  const filteredLogs = logs.filter((l) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      l.username.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      (l.newValue && l.newValue.toLowerCase().includes(q)) ||
      (l.oldValue && l.oldValue.toLowerCase().includes(q)) ||
      (l.date && l.date.includes(q))
    );
  });

  const getActiveDateLabel = () => {
    if (datePreset === "today") return `Today — ${formatDate(getTodayStr())}`;
    if (datePreset === "yesterday") return `Yesterday — ${formatDate(getYesterdayStr())}`;
    if (datePreset === "custom") return customDate ? formatDate(customDate) : "Custom Date";
    return "All Dates";
  };

  const getEmptyMessage = () => {
    if (datePreset === "today") {
      return `No audit events were recorded on Today (${formatDate(getTodayStr())}).`;
    }
    if (datePreset === "yesterday") {
      return `No audit events were recorded on Yesterday (${formatDate(getYesterdayStr())}).`;
    }
    if (datePreset === "custom") {
      return `No audit events were recorded on ${formatDate(customDate)}.`;
    }
    return "No audit log records found for the selected criteria.";
  };

  const handleExportDatabaseToExcel = async () => {
    setIsExporting(true);
    setToast({
      type: "info",
      message: "Export started: Compiling database records and filtered audit logs...",
    });

    try {
      const [tripsData, workersData] = await Promise.all([
        api.getTrips(),
        api.getWorkers().catch(() => []),
      ]);

      const trips = Array.isArray(tripsData) ? tripsData : [];
      const workers = Array.isArray(workersData) ? workersData : [];

      // Sheet 1: Trips
      const tripsRows = trips.map((t) => ({
        "Sl.No": t.slNo,
        Date: t.date,
        "Vehicle Number": t.vehicleNumber,
        "Driver Phone": t.driverPhone || "",
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
        "Vehicle Balance Cleared Date": t.vehicleBalanceClearedDate || "N/A",
        "Company Balance Cleared Date": t.companyBalanceClearedDate || "N/A",
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

      // Sheet 3: Filtered Audit Logs
      const auditRows = filteredLogs.map((l) => ({
        Timestamp: `${l.date || ""} ${l.time || ""}`.trim(),
        User: l.username,
        Role: l.userRole,
        Action: l.action,
        Resource: l.tripId || "-",
        "Previous Value": formatValueText(l.oldValue),
        "New Value": formatValueText(l.newValue),
      }));

      const workbook = XLSX.utils.book_new();

      const wsTrips = XLSX.utils.json_to_sheet(
        tripsRows.length > 0 ? tripsRows : [{ Status: "No trip records available" }]
      );
      const wsWorkers = XLSX.utils.json_to_sheet(
        workersRows.length > 0 ? workersRows : [{ Role: "No worker records available" }]
      );
      const wsAudit = XLSX.utils.json_to_sheet(
        auditRows.length > 0 ? auditRows : [{ "Audit Event Status": getEmptyMessage() }]
      );

      const formatSheet = (ws, rows) => {
        if (rows && rows.length > 0) {
          const keys = Object.keys(rows[0]);
          ws["!cols"] = keys.map((key) => {
            const maxLen = Math.max(key.length, ...rows.map((r) => String(r[key] || "").length));
            return { wch: Math.min(Math.max(maxLen + 3, 10), 45) };
          });
        }
      };

      formatSheet(wsTrips, tripsRows);
      formatSheet(wsWorkers, workersRows);
      formatSheet(wsAudit, auditRows);

      XLSX.utils.book_append_sheet(workbook, wsTrips, "Trips");
      XLSX.utils.book_append_sheet(workbook, wsWorkers, "Users & Workers");
      XLSX.utils.book_append_sheet(workbook, wsAudit, `Audit Logs (${datePreset})`);

      const fileName = `TCMS_Database_Export_${datePreset}_${getTodayStr()}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      setToast({
        type: "success",
        message: `Database & filtered audit logs exported to Excel successfully! File saved as ${fileName}`,
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
        searchPlaceholder="Search audit action, value..."
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

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Enterprise Day-Wise Date & User Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Filter Audit Records
            </h3>
          </div>

          {(datePreset !== "all" || userFilter !== "all" || searchTerm.trim() !== "") && (
            <button
              onClick={handleClearFilters}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1 transition-colors"
            >
              <XCircle className="h-3.5 w-3.5 text-slate-500" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Date Preset Selector */}
          <div>
            <label
              htmlFor="field_datePreset"
              className="block font-semibold text-slate-600 mb-1 uppercase text-[10px] flex items-center gap-1"
            >
              <Calendar className="h-3 w-3 text-slate-400" />
              <span>Date Filter</span>
            </label>
            <select
              id="field_datePreset"
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="custom">Custom Date</option>
              <option value="all">All Dates</option>
            </select>
          </div>

          {/* Custom Date Picker (when Custom Date is selected) */}
          {datePreset === "custom" && (
            <div>
              <label
                htmlFor="field_customDate"
                className="block font-semibold text-slate-600 mb-1 uppercase text-[10px]"
              >
                Select Calendar Date
              </label>
              <input
                id="field_customDate"
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
              />
            </div>
          )}

          {/* User Selector */}
          <div>
            <label
              htmlFor="field_userFilter"
              className="block font-semibold text-slate-600 mb-1 uppercase text-[10px] flex items-center gap-1"
            >
              <UserIcon className="h-3 w-3 text-slate-400" />
              <span>User Filter</span>
            </label>
            <select
              id="field_userFilter"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
            >
              <option value="all">All Users</option>
              {userList.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>

          {/* Search Term Input */}
          <div className={datePreset === "custom" ? "" : "lg:col-span-2"}>
            <label
              htmlFor="field_searchTerm"
              className="block font-semibold text-slate-600 mb-1 uppercase text-[10px]"
            >
              Quick Search Event / Value
            </label>
            <input
              id="field_searchTerm"
              type="text"
              placeholder="Search action event or values..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Active Filter Summary Banner */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-700 font-medium gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500">Showing audit logs for:</span>
          <strong className="text-slate-900 font-semibold">{getActiveDateLabel()}</strong>
          {userFilter !== "all" && (
            <>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">User:</span>
              <strong className="text-blue-700">{userFilter}</strong>
            </>
          )}
        </div>

        <div>
          <span className="font-mono font-bold text-slate-900">
            Showing {filteredLogs.length} audit event{filteredLogs.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Audit Log Table */}
      <DataTable
        columns={columns}
        data={filteredLogs}
        isLoading={isLoading}
        emptyMessage={getEmptyMessage()}
        renderRow={(log) => (
          <tr
            key={log.id}
            className="hover:bg-slate-50 transition-colors border-b border-slate-100"
          >
            <td className="py-2.5 px-3.5 font-semibold text-slate-900 align-top">{log.username}</td>
            <td className="py-2.5 px-3.5 align-top">
              <StatusBadge
                type={log.userRole === "ADMIN" ? "admin" : "worker"}
                text={log.userRole}
                size="sm"
              />
            </td>
            <td className="py-2.5 px-3.5 whitespace-nowrap align-top">{formatDate(log.date)}</td>
            <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-500 align-top">
              {log.time}
            </td>
            <td className="py-2.5 px-3.5 font-mono font-semibold text-blue-700 align-top">
              {log.action}
            </td>
            <td className="py-2.5 px-3.5 max-w-[240px] align-top">
              <AuditValueCell value={log.oldValue} />
            </td>
            <td className="py-2.5 px-3.5 max-w-[280px] align-top">
              <AuditValueCell value={log.newValue} />
            </td>
          </tr>
        )}
      />
    </div>
  );
};
