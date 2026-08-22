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
import { formatCurrency, formatDate, getTripPaymentStatus } from "../lib/utils";

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
      const booking = t.booking || 0;
      const freight = t.freight || 0;
      const commission = t.commission !== null && t.commission !== undefined ? t.commission : 0;
      const diffAmount = booking - freight;
      const grossIncome = diffAmount + commission;
      const status = getTripPaymentStatus(t);

      return {
        "Sl.No": t.slNo,
        "Trip Date": t.date,
        "Vehicle Number": t.vehicleNumber,
        "Driver Phone": t.driverPhone || "",
        From: t.fromLocation,
        To: t.toLocation,
        Transport: t.transport,
        "Booking (INR)": booking,
        "Freight (INR)": freight,
        "Difference Amount (Booking - Freight) (INR)": diffAmount,
        "Commission (INR)": t.commission ?? "Pending",
        "Commission Date": t.commissionDueDate || "N/A",
        "Total Gross Income ((Booking - Freight) + Commission) (INR)": grossIncome,
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
  const exportToPDF = () => {
    if (reportData.trips.length === 0) {
      setToast({ type: "error", message: "No trip records available to export." });
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });

    // Title & Header
    doc.setFontSize(14);
    doc.setTextColor(23, 32, 51);
    doc.text("Transport Commission Management Report", 14, 13);

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Generated on: ${new Date().toLocaleString("en-IN")} | Period: ${reportPeriod.toUpperCase()}`,
      14,
      19
    );

    // Summary Box
    const s = reportData.summary || {};
    const diffTotal =
      s.totalDifferenceAmount !== undefined
        ? s.totalDifferenceAmount
        : (s.totalBooking || 0) - (s.totalFreight || 0);
    const grossTotal =
      s.totalGrossIncome !== undefined ? s.totalGrossIncome : diffTotal + (s.totalCommission || 0);

    doc.setFillColor(247, 248, 250);
    doc.rect(14, 22, 268, 16, "F");
    doc.setFontSize(8);
    doc.setTextColor(0);
    doc.text(
      `Trips: ${s.totalTrips || 0}  |  Booking: ₹${(s.totalBooking || 0).toLocaleString("en-IN")}  |  Freight: ₹${(s.totalFreight || 0).toLocaleString("en-IN")}  |  Difference (Bk-Fr): ₹${diffTotal.toLocaleString("en-IN")}  |  Gross Income ((Bk-Fr)+Cm): ₹${grossTotal.toLocaleString("en-IN")}  |  Commission: ₹${(s.totalCommission || 0).toLocaleString("en-IN")}`,
      18,
      32
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
        "Difference (Bk-Fr)",
        "Commission",
        "Gross Income ((Bk-Fr)+Cm)",
        "Status",
        "Adv Rec",
        "Adv Paid",
      ],
    ];

    const tableRows = reportData.trips.map((t) => {
      const booking = t.booking || 0;
      const freight = t.freight || 0;
      const commission = t.commission !== null && t.commission !== undefined ? t.commission : 0;
      const diffAmount = booking - freight;
      const grossIncome = diffAmount + commission;
      const status = getTripPaymentStatus(t);

      return [
        t.slNo,
        t.date,
        t.vehicleNumber,
        t.transport,
        `₹${booking.toLocaleString("en-IN")}`,
        `₹${freight.toLocaleString("en-IN")}`,
        `₹${diffAmount.toLocaleString("en-IN")}`,
        t.commission !== null ? `₹${commission.toLocaleString("en-IN")}` : "Pending",
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
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontSize: 7.5,
        fontStyle: "bold",
      },
      bodyStyles: { fontSize: 7.5 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`Transport_Report_${reportPeriod}_${new Date().toISOString().split("T")[0]}.pdf`);
    setToast({ type: "success", message: "PDF report exported successfully!" });
  };

  const s = reportData.summary || {};
  const calcDiffTotal =
    s.totalDifferenceAmount !== undefined
      ? s.totalDifferenceAmount
      : (s.totalBooking || 0) - (s.totalFreight || 0);
  const calcGrossTotal =
    s.totalGrossIncome !== undefined
      ? s.totalGrossIncome
      : calcDiffTotal + (s.totalCommission || 0);

  const columns = [
    { title: "Sl.No" },
    { title: "Date" },
    { title: "Vehicle" },
    { title: "Transport" },
    { title: "Booking" },
    { title: "Freight" },
    { title: "Difference Amount (Booking - Freight)" },
    { title: "Commission" },
    { title: "Total Gross Income (Diff + Comm)" },
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total trips</p>
          <p className="text-xl font-bold text-slate-900 font-mono mt-1">{s.totalTrips || 0}</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total booking</p>
          <p className="text-xl font-bold text-slate-900 font-mono mt-1">
            {formatCurrency(s.totalBooking)}
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
          <p className="text-[11px] font-semibold text-slate-500 uppercase">
            Total gross income (Diff + Comm)
          </p>
          <p className="text-xl font-bold text-emerald-700 font-mono mt-1">
            {formatCurrency(calcGrossTotal)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total commission</p>
          <p className="text-xl font-bold text-slate-900 font-mono mt-1">
            {formatCurrency(s.totalCommission)}
          </p>
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
            const booking = t.booking || 0;
            const freight = t.freight || 0;
            const commission =
              t.commission !== null && t.commission !== undefined ? t.commission : 0;
            const diffAmount = booking - freight;
            const grossIncome = diffAmount + commission;
            const status = getTripPaymentStatus(t);

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
                  {formatCurrency(booking)}
                </td>
                <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900">
                  {formatCurrency(freight)}
                </td>
                <td className="py-2.5 px-3.5 font-mono font-bold text-blue-700">
                  {formatCurrency(diffAmount)}
                </td>
                <td className="py-2.5 px-3.5 font-mono font-semibold text-slate-900">
                  <div>{t.commission !== null ? formatCurrency(t.commission) : "Pending"}</div>
                  {t.commissionDueDate && (
                    <div className="text-[10px] text-slate-500 font-sans font-normal">
                      Date: {formatDate(t.commissionDueDate)}
                    </div>
                  )}
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
