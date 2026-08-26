import React, { useState, useEffect, useCallback } from "react";
import { FileSpreadsheet, FileText, Filter, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PageHeader } from "../components/ui/PageHeader";
import { DataTable } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Toast } from "../components/ui/Toast";
import { TripDetailModal } from "../components/modals/TripDetailModal";
import { api } from "../services/api";
import { loadCustomPdfFont } from "../lib/pdfFontLoader";
import {
  formatCurrency,
  formatDate,
  getTripPaymentStatus,
  getTripDifferenceAmount,
  getTripAccountRefund,
  getTripGrossIncome,
  hasBooking,
} from "../lib/utils";

export const ReportsPage = () => {
  const [reportPeriod, setReportPeriod] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [transportFilter, setTransportFilter] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [reportData, setReportData] = useState({
    summary: {},
    trips: [],
  });

  const fetchReport = useCallback(async () => {
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
      setToast({
        type: "error",
        message: "Failed to fetch report records.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [reportPeriod, startDate, endDate, vehicleFilter, transportFilter]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleApplyCustomDates = (e) => {
    e.preventDefault();
    fetchReport();
  };

  // Export to Excel
  const exportToExcel = () => {
    if (reportData.trips.length === 0) {
      setToast({ type: "error", message: "No trip records available to export." });
      return;
    }

    const excelRows = reportData.trips.map((t) => {
      const freight = t.freight || 0;
      const diffAmount = getTripDifferenceAmount(t);
      const accountRefund = getTripAccountRefund(t);
      const grossIncome = getTripGrossIncome(t);
      const status = getTripPaymentStatus(t);

      const cashComm =
        t.commissionReceivedType === "Cash" && t.commission !== null ? t.commission : 0;
      const phonePeComm =
        t.commissionReceivedType === "PhonePe" && t.commission !== null ? t.commission : 0;

      return {
        "Sl.No": t.slNo,
        "Trip Date": t.date,
        "Vehicle Number": t.vehicleNumber,
        "Driver Phone": t.driverPhone || "",
        From: t.fromLocation,
        To: t.toLocation,
        Transport: t.transport,
        "Booking (INR)": hasBooking(t) ? t.booking : "Pending",
        "Freight (INR)": freight,
        "Difference Amount (Booking - Freight) (INR)": diffAmount,
        "Account Refund (INR)": accountRefund,
        "Commission (INR)": t.commission ?? "Pending",
        "Commission Received Type": t.commissionReceivedType || "Pending",
        "Cash Commission (INR)": cashComm,
        "PhonePe Commission (INR)": phonePeComm,
        "Commission Date": t.commissionDueDate || "N/A",
        "Total Gross Income (Difference + Commission) (INR)": grossIncome,
        "Payment Status": status,
        "Advance Received (INR)": t.advanceReceivedAmount || 0,
        "Advance Received Type": t.advanceReceivedType || "Pending",
        "Advance Received Date": t.collectionDueDate || "N/A",
        "Advance Paid (INR)": t.advancePaidAmount || 0,
        "Advance Paid Type": t.advancePaidType || "Pending",
        "Advance Paid Date": t.advanceDueDate || "N/A",
        "Vehicle Balance Cleared Date": t.vehicleBalanceClearedDate || "N/A",
        "Company Balance Cleared Date": t.companyBalanceClearedDate || "N/A",
        Remarks: t.remarks || "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transport Report");

    XLSX.writeFile(
      workbook,
      `Transport_Commission_Report_${reportPeriod}_${new Date().toISOString().split("T")[0]}.xlsx`
    );
    setToast({ type: "success", message: "Excel report exported successfully!" });
  };

  // Export to PDF
  const exportToPDF = async () => {
    if (reportData.trips.length === 0) {
      setToast({ type: "error", message: "No trip records available to export." });
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const fontLoaded = await loadCustomPdfFont(doc);

    // Title & Header
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Transport Financial Report", 14, 12);

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Generated on: ${new Date().toLocaleString("en-IN")} | Period: ${reportPeriod.toUpperCase()} | Vehicle: ${vehicleFilter || "All"} | Transport: ${transportFilter || "All"}`,
      14,
      17
    );

    // Summary Box (Structured 2-row layout with no horizontal clipping)
    const s = reportData.summary || {};
    const bookingTotal =
      s.totalBooking !== undefined
        ? s.totalBooking
        : reportData.trips.reduce(
            (sum, t) => sum + (hasBooking(t) ? Number(t.booking) || 0 : 0),
            0
          );
    const diffTotal =
      s.totalDifferenceAmount !== undefined
        ? s.totalDifferenceAmount
        : reportData.trips.reduce((sum, t) => sum + getTripDifferenceAmount(t), 0);
    const accountRefundTotal =
      s.totalAccountRefund !== undefined
        ? s.totalAccountRefund
        : reportData.trips.reduce((sum, t) => sum + getTripAccountRefund(t), 0);
    const grossTotal =
      s.totalGrossIncome !== undefined
        ? s.totalGrossIncome
        : reportData.trips.reduce((sum, t) => sum + getTripGrossIncome(t), 0);
    const cashTotal =
      s.cashCommission !== undefined
        ? s.cashCommission
        : reportData.trips.reduce(
            (sum, t) => sum + (t.commissionReceivedType === "Cash" ? t.commission || 0 : 0),
            0
          );
    const phonePeTotal =
      s.phonePeCommission !== undefined
        ? s.phonePeCommission
        : reportData.trips.reduce(
            (sum, t) => sum + (t.commissionReceivedType === "PhonePe" ? t.commission || 0 : 0),
            0
          );

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, 20, 269, 18, 2, 2, "FD");

    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);

    // Row 1 of Summary Box
    doc.text(
      `Trips: ${s.totalTrips || 0}   |   Total Booking: ₹${bookingTotal.toLocaleString("en-IN")}   |   Total Freight: ₹${(s.totalFreight || 0).toLocaleString("en-IN")}   |   Difference Amount: ₹${diffTotal.toLocaleString("en-IN")}`,
      18,
      26
    );

    // Row 2 of Summary Box
    doc.text(
      `Account Refund: ₹${accountRefundTotal.toLocaleString("en-IN")}   |   Total Gross Income: ₹${grossTotal.toLocaleString("en-IN")}   |   Total Commission: ₹${(s.totalCommission || 0).toLocaleString("en-IN")} (Cash: ₹${cashTotal.toLocaleString("en-IN")} | PhonePe: ₹${phonePeTotal.toLocaleString("en-IN")})`,
      18,
      33
    );

    // Table Data
    const tableHeaders = [
      [
        "Sl.No",
        "Date",
        "Vehicle",
        "Transport",
        "Booking",
        "Freight",
        "Difference Amount",
        "Account Refund",
        "Commission",
        "Cash Commission",
        "PhonePe Commission",
        "Total Gross Income",
        "Payment Status",
        "Adv Received",
        "Adv Paid",
      ],
    ];

    const tableRows = reportData.trips.map((t) => {
      const freight = t.freight || 0;
      const commission = t.commission !== null && t.commission !== undefined ? t.commission : 0;
      const diffAmount = getTripDifferenceAmount(t);
      const accountRefund = getTripAccountRefund(t);
      const grossIncome = getTripGrossIncome(t);
      const status = getTripPaymentStatus(t);

      const cashComm =
        t.commissionReceivedType === "Cash" && t.commission !== null ? t.commission : 0;
      const phonePeComm =
        t.commissionReceivedType === "PhonePe" && t.commission !== null ? t.commission : 0;

      return [
        t.slNo,
        t.date,
        t.vehicleNumber,
        t.transport,
        hasBooking(t) ? `₹${Number(t.booking).toLocaleString("en-IN")}` : "Pending",
        `₹${freight.toLocaleString("en-IN")}`,
        `₹${diffAmount.toLocaleString("en-IN")}`,
        `₹${accountRefund.toLocaleString("en-IN")}`,
        t.commission !== null ? `₹${commission.toLocaleString("en-IN")}` : "Pending",
        `₹${cashComm.toLocaleString("en-IN")}`,
        `₹${phonePeComm.toLocaleString("en-IN")}`,
        `₹${grossIncome.toLocaleString("en-IN")}`,
        status,
        `₹${(t.advanceReceivedAmount || 0).toLocaleString("en-IN")}`,
        `₹${(t.advancePaidAmount || 0).toLocaleString("en-IN")}`,
      ];
    });

    autoTable(doc, {
      head: tableHeaders,
      body: tableRows,
      startY: 42,
      theme: "grid",
      styles: {
        font: fontLoaded ? "CustomFont" : "helvetica",
        fontSize: 6,
        cellPadding: 1.5,
        valign: "middle",
        textColor: [15, 23, 42],
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        font: fontLoaded ? "CustomFont" : "helvetica",
        fontStyle: fontLoaded ? "normal" : "bold",
        fontSize: 6,
        halign: "center",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { halign: "center", cellWidth: 15 },
        2: { halign: "left", cellWidth: 19 },
        3: { halign: "left", cellWidth: 22 },
        4: { halign: "right", cellWidth: 18 },
        5: { halign: "right", cellWidth: 18 },
        6: { halign: "right", cellWidth: 19 },
        7: { halign: "right", cellWidth: 19 },
        8: { halign: "right", cellWidth: 17 },
        9: { halign: "right", cellWidth: 17 },
        10: { halign: "right", cellWidth: 17 },
        11: { halign: "right", cellWidth: 19 },
        12: { halign: "center", cellWidth: 18 },
        13: { halign: "right", cellWidth: 15 },
        14: { halign: "right", cellWidth: 15 },
      },
    });

    doc.save(`Transport_Report_${reportPeriod}_${new Date().toISOString().split("T")[0]}.pdf`);
    setToast({ type: "success", message: "PDF report exported successfully!" });
  };

  const s = reportData.summary || {};
  const calcBookingTotal =
    s.totalBooking !== undefined
      ? s.totalBooking
      : reportData.trips.reduce((sum, t) => sum + (hasBooking(t) ? Number(t.booking) || 0 : 0), 0);
  const calcDiffTotal =
    s.totalDifferenceAmount !== undefined
      ? s.totalDifferenceAmount
      : reportData.trips.reduce((sum, t) => sum + getTripDifferenceAmount(t), 0);
  const calcAccountRefundTotal =
    s.totalAccountRefund !== undefined
      ? s.totalAccountRefund
      : reportData.trips.reduce((sum, t) => sum + getTripAccountRefund(t), 0);
  const calcGrossTotal =
    s.totalGrossIncome !== undefined
      ? s.totalGrossIncome
      : reportData.trips.reduce((sum, t) => sum + getTripGrossIncome(t), 0);
  const calcCashComm =
    s.cashCommission !== undefined
      ? s.cashCommission
      : reportData.trips.reduce(
          (sum, t) => sum + (t.commissionReceivedType === "Cash" ? t.commission || 0 : 0),
          0
        );
  const calcPhonePeComm =
    s.phonePeCommission !== undefined
      ? s.phonePeCommission
      : reportData.trips.reduce(
          (sum, t) => sum + (t.commissionReceivedType === "PhonePe" ? t.commission || 0 : 0),
          0
        );

  const columns = [
    { title: "Sl.No" },
    { title: "Date" },
    { title: "Vehicle" },
    { title: "Transport" },
    { title: "Booking" },
    { title: "Freight" },
    { title: "Difference Amount" },
    { title: "Account Refund" },
    { title: "Commission" },
    { title: "Cash Commission" },
    { title: "PhonePe Commission" },
    { title: "Total Gross Income" },
    { title: "Payment Status" },
    { title: "Adv Received" },
    { title: "Adv Paid" },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        badgeText="Reporting & analytics"
        title="Financial reports"
        subtitle="Filter by daily, weekly, monthly, custom date range, vehicle, or transport. Export data to Excel & PDF."
        printId="report-print-btn"
        actions={
          <div className="flex items-center gap-2">
            <button
              id="report-export-excel-btn"
              onClick={exportToExcel}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Excel Export</span>
            </button>
            <button
              id="report-export-pdf-btn"
              onClick={exportToPDF}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <FileText className="h-4 w-4 text-rose-600" />
              <span>PDF Export</span>
            </button>
          </div>
        }
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Filter Controls Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2.5">
          <Filter className="h-4 w-4 text-blue-600" />
          <span>Report filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 text-xs">
          {/* Period Selector */}
          <div>
            <label
              htmlFor="field_reportPeriod"
              className="block font-semibold text-slate-600 mb-1 uppercase text-[10px]"
            >
              Report period
            </label>
            <select
              id="field_reportPeriod"
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
            >
              <option value="daily">Daily report (Today)</option>
              <option value="weekly">Weekly report (Last 7 days)</option>
              <option value="monthly">Monthly report (Last 30 days)</option>
              <option value="custom">Custom date range</option>
            </select>
          </div>

          {/* Vehicle Filter */}
          <div>
            <label
              htmlFor="field_vehicleFilter"
              className="block font-semibold text-slate-600 mb-1 uppercase text-[10px]"
            >
              Vehicle number
            </label>
            <input
              id="field_vehicleFilter"
              type="text"
              placeholder="e.g. KA-01"
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono uppercase font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Transport Filter */}
          <div>
            <label
              htmlFor="field_transportFilter"
              className="block font-semibold text-slate-600 mb-1 uppercase text-[10px]"
            >
              Transport name
            </label>
            <input
              id="field_transportFilter"
              type="text"
              placeholder="e.g. VRL Logistics"
              value={transportFilter}
              onChange={(e) => setTransportFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Custom Date Controls */}
          {reportPeriod === "custom" && (
            <>
              <div>
                <label
                  htmlFor="field_startDate"
                  className="block font-semibold text-slate-600 mb-1 uppercase text-[10px]"
                >
                  Start date
                </label>
                <input
                  id="field_startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="field_endDate"
                  className="block font-semibold text-slate-600 mb-1 uppercase text-[10px]"
                >
                  End date
                </label>
                <input
                  id="field_endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>
            </>
          )}
        </div>

        {reportPeriod === "custom" && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleApplyCustomDates}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
            >
              Apply date range
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total trips</p>
          <p className="text-xl font-bold text-slate-900 font-mono mt-1">{s.totalTrips || 0}</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total booking</p>
          <p className="text-xl font-bold text-slate-900 font-mono mt-1">
            {formatCurrency(calcBookingTotal)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total freight</p>
          <p className="text-xl font-bold text-slate-900 font-mono mt-1">
            {formatCurrency(s.totalFreight)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">
            Difference (Booking - Freight)
          </p>
          <p className="text-xl font-bold text-blue-700 font-mono mt-1">
            {formatCurrency(calcDiffTotal)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Account refund</p>
          <p className="text-xl font-bold text-indigo-700 font-mono mt-1">
            {formatCurrency(calcAccountRefundTotal)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">
            Total gross income (Diff + Comm)
          </p>
          <p className="text-xl font-bold text-emerald-700 font-mono mt-1">
            {formatCurrency(calcGrossTotal)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Total commission</p>
            <p className="text-xl font-bold text-slate-900 font-mono mt-1">
              {formatCurrency(s.totalCommission)}
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-600">
              Cash: <strong className="text-emerald-700">{formatCurrency(calcCashComm)}</strong>
            </span>
            <span className="text-slate-600">
              PhonePe: <strong className="text-blue-700">{formatCurrency(calcPhonePeComm)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Report Data Table */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Report records ({reportData.trips.length})
          </h3>
          <button
            onClick={fetchReport}
            className="p-1 rounded text-slate-500 hover:text-slate-800 flex items-center gap-1 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        <DataTable
          columns={columns}
          data={reportData.trips}
          isLoading={isLoading}
          emptyMessage="No records found for the selected report criteria."
          renderRow={(t) => {
            const freight = t.freight || 0;
            const diffAmount = getTripDifferenceAmount(t);
            const accountRefund = getTripAccountRefund(t);
            const grossIncome = getTripGrossIncome(t);
            const status = getTripPaymentStatus(t);

            const cashComm =
              t.commissionReceivedType === "Cash" && t.commission !== null ? t.commission : 0;
            const phonePeComm =
              t.commissionReceivedType === "PhonePe" && t.commission !== null ? t.commission : 0;

            return (
              <tr
                key={t.id}
                className="hover:bg-slate-50 transition-colors border-b border-slate-100"
              >
                <td className="py-2.5 px-3.5">
                  <button
                    type="button"
                    onClick={() => setSelectedTrip(t)}
                    className="font-mono font-bold text-blue-700 hover:underline"
                    title="Click to view full trip details"
                  >
                    #{t.slNo}
                  </button>
                </td>
                <td className="py-2.5 px-3.5 whitespace-nowrap">
                  <div>{formatDate(t.date)}</div>
                  {t.commissionDueDate && (
                    <div className="text-[10px] text-slate-500 font-sans">
                      Comm: {formatDate(t.commissionDueDate)}
                    </div>
                  )}
                </td>
                <td className="py-2.5 px-3.5 font-mono font-semibold">{t.vehicleNumber}</td>
                <td className="py-2.5 px-3.5 truncate max-w-[120px] text-slate-700">
                  {t.transport}
                </td>
                <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900">
                  {hasBooking(t) ? (
                    formatCurrency(t.booking)
                  ) : (
                    <span className="text-amber-600 font-normal">Pending</span>
                  )}
                </td>
                <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900">
                  {formatCurrency(freight)}
                </td>
                <td className="py-2.5 px-3.5 font-mono font-bold text-blue-700">
                  {formatCurrency(diffAmount)}
                </td>
                <td className="py-2.5 px-3.5 font-mono font-bold text-indigo-700">
                  {formatCurrency(accountRefund)}
                </td>
                <td className="py-2.5 px-3.5 font-mono font-semibold text-slate-900">
                  <div>{t.commission !== null ? formatCurrency(t.commission) : "Pending"}</div>
                  {t.commissionDueDate && (
                    <div className="text-[10px] text-slate-500 font-sans font-normal">
                      Date: {formatDate(t.commissionDueDate)}
                    </div>
                  )}
                </td>
                <td className="py-2.5 px-3.5 font-mono font-semibold text-emerald-700">
                  {formatCurrency(cashComm)}
                </td>
                <td className="py-2.5 px-3.5 font-mono font-semibold text-blue-700">
                  {formatCurrency(phonePeComm)}
                </td>
                <td className="py-2.5 px-3.5 font-mono font-bold text-emerald-700">
                  {formatCurrency(grossIncome)}
                </td>
                <td className="py-2.5 px-3.5">
                  <StatusBadge
                    type={
                      status === "Completed"
                        ? "completed"
                        : status.startsWith("Pending")
                          ? "pending"
                          : "balance-due"
                    }
                    text={status}
                    size="sm"
                  />
                </td>
                <td className="py-2.5 px-3.5 font-mono">
                  <div>{formatCurrency(t.advanceReceivedAmount)}</div>
                  {t.collectionDueDate && (
                    <div className="text-[10px] text-slate-500 font-sans">
                      Rec: {formatDate(t.collectionDueDate)}
                    </div>
                  )}
                </td>
                <td className="py-2.5 px-3.5 font-mono">
                  <div>{formatCurrency(t.advancePaidAmount)}</div>
                  {t.advanceDueDate && (
                    <div className="text-[10px] text-slate-500 font-sans">
                      Paid: {formatDate(t.advanceDueDate)}
                    </div>
                  )}
                </td>
              </tr>
            );
          }}
        />
      </div>

      {selectedTrip && (
        <TripDetailModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
      )}
    </div>
  );
};
