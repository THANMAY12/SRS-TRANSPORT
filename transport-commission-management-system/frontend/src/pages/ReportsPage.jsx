import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Filter,
  RefreshCw,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "../services/api";
import { formatCurrency, formatDate } from "../lib/utils";

export const ReportsPage = () => {
  const [reportPeriod, setReportPeriod] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [transportFilter, setTransportFilter] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState({
    summary: {},
    trips: [],
  });

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const params = {
        reportPeriod,
        startDate: reportPeriod === "custom" ? startDate : undefined,
        endDate: reportPeriod === "custom" ? endDate : undefined,
        vehicleNumber: vehicleFilter,
        transport: transportFilter,
      };
      const data = await api.getReports(params);
      setReportData(data);
    } catch (err) {
      console.error("Failed to fetch report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportPeriod, vehicleFilter, transportFilter]);

  const handleApplyCustomDates = (e) => {
    e.preventDefault();
    fetchReport();
  };

  // Export to Excel
  const exportToExcel = () => {
    if (reportData.trips.length === 0) {
      alert("No trip records available to export.");
      return;
    }

    const excelRows = reportData.trips.map((t) => ({
      "Sl.No": t.slNo,
      Date: t.date,
      "Vehicle Number": t.vehicleNumber,
      From: t.fromLocation,
      To: t.toLocation,
      "Freight (INR)": t.freight,
      Transport: t.transport,
      "Booking (INR)": t.booking,
      "Commission (INR)": t.commission ?? "Pending",
      "Advance Received (INR)": t.advanceReceivedAmount,
      "Advance Received Type": t.advanceReceivedType || "Pending",
      "Advance Paid (INR)": t.advancePaidAmount,
      "Advance Paid Type": t.advancePaidType || "Pending",
      Remarks: t.remarks || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transport Report");

    XLSX.writeFile(
      workbook,
      `Transport_Commission_Report_${reportPeriod}_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // Export to PDF
  const exportToPDF = () => {
    if (reportData.trips.length === 0) {
      alert("No trip records available to export.");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });

    // Title & Header
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138); // Blue
    doc.text("Transport Commission Management Report", 14, 15);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(
      `Generated on: ${new Date().toLocaleString("en-IN")} | Period: ${reportPeriod.toUpperCase()}`,
      14,
      22,
    );

    // Summary Box
    const s = reportData.summary || {};
    doc.setFillColor(240, 244, 255);
    doc.rect(14, 26, 268, 16, "F");
    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.text(
      `Total Trips: ${s.totalTrips || 0}   |   Total Freight: ₹${(s.totalFreight || 0).toLocaleString("en-IN")}   |   Total Commission: ₹${(s.totalCommission || 0).toLocaleString("en-IN")}   |   Total Adv Paid: ₹${(s.totalAdvPaid || 0).toLocaleString("en-IN")}`,
      18,
      36,
    );

    // Table Data
    const tableHeaders = [
      [
        "Sl.No",
        "Date",
        "Vehicle",
        "From",
        "To",
        "Freight",
        "Transport",
        "Booking",
        "Commission",
        "Adv Paid",
        "Adv Rec",
      ],
    ];

    const tableRows = reportData.trips.map((t) => [
      t.slNo,
      t.date,
      t.vehicleNumber,
      t.fromLocation,
      t.toLocation,
      `₹${t.freight.toLocaleString("en-IN")}`,
      t.transport,
      `₹${t.booking.toLocaleString("en-IN")}`,
      t.commission !== null
        ? `₹${t.commission.toLocaleString("en-IN")}`
        : "Pending",
      `₹${t.advancePaidAmount.toLocaleString("en-IN")} (${t.advancePaidType || "N/A"})`,
      `₹${t.advanceReceivedAmount.toLocaleString("en-IN")} (${t.advanceReceivedType || "N/A"})`,
    ]);

    autoTable(doc, {
      head: tableHeaders,
      body: tableRows,
      startY: 46,
      theme: "grid",
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        fontSize: 8,
        fontStyle: "bold",
      },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(
      `Transport_Report_${reportPeriod}_${new Date().toISOString().split("T")[0]}.pdf`,
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const s = reportData.summary || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Analytics & Reports
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Transport Financial Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Filter by Daily, Weekly, Monthly, Date Range, Vehicle, or Transport.
            Export to Excel & PDF.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="report-export-excel-btn"
            onClick={exportToExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel Export</span>
          </button>

          <button
            id="report-export-pdf-btn"
            onClick={exportToPDF}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <FileText className="h-4 w-4" />
            <span>PDF Export</span>
          </button>

          <button
            id="report-print-btn"
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1.5"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-3">
          <Filter className="h-4 w-4 text-blue-600" />
          <span>Report Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 text-xs">
          {/* Period Selector */}
          <div>
            <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase text-[10px]">
              Report Period
            </label>
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily Report (Today)</option>
              <option value="weekly">Weekly Report (Last 7 Days)</option>
              <option value="monthly">Monthly Report (Last 30 Days)</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Vehicle Filter */}
          <div>
            <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase text-[10px]">
              Vehicle Number
            </label>
            <input
              type="text"
              placeholder="e.g. KA-01"
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono uppercase font-bold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Transport Filter */}
          <div>
            <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase text-[10px]">
              Transport Name
            </label>
            <input
              type="text"
              placeholder="e.g. VRL Logistics"
              value={transportFilter}
              onChange={(e) => setTransportFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Custom Date Controls */}
          {reportPeriod === "custom" && (
            <>
              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase text-[10px]">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase text-[10px]">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>

        {reportPeriod === "custom" && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleApplyCustomDates}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
            >
              Apply Date Range
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase">
            Total Trips
          </p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {s.totalTrips || 0}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase">
            Total Freight
          </p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(s.totalFreight)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase">
            Total Commission
          </p>
          <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {formatCurrency(s.totalCommission)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase">
            Total Booking
          </p>
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {formatCurrency(s.totalBooking)}
          </p>
        </div>
      </div>

      {/* Report Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Report Records ({reportData.trips.length})
          </h3>
          <button
            onClick={fetchReport}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3">Sl.No</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Vehicle</th>
                <th className="py-3 px-3">Route</th>
                <th className="py-3 px-3">Freight</th>
                <th className="py-3 px-3">Transport</th>
                <th className="py-3 px-3">Booking</th>
                <th className="py-3 px-3">Commission</th>
                <th className="py-3 px-3">Adv Received</th>
                <th className="py-3 px-3">Adv Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {reportData.trips.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No records found for the selected report criteria.
                  </td>
                </tr>
              ) : (
                reportData.trips.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-blue-600">
                      #{t.slNo}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {formatDate(t.date)}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      {t.vehicleNumber}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {t.fromLocation} → {t.toLocation}
                    </td>
                    <td className="py-3 px-3 font-bold">
                      {formatCurrency(t.freight)}
                    </td>
                    <td className="py-3 px-3 truncate max-w-[120px]">
                      {t.transport}
                    </td>
                    <td className="py-3 px-3">{formatCurrency(t.booking)}</td>
                    <td className="py-3 px-3 font-bold text-emerald-600">
                      {t.commission !== null
                        ? formatCurrency(t.commission)
                        : "Pending"}
                    </td>
                    <td className="py-3 px-3">
                      {formatCurrency(t.advanceReceivedAmount)}
                    </td>
                    <td className="py-3 px-3">
                      {formatCurrency(t.advancePaidAmount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
