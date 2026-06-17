import React, { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";

// Import các hàm gọi API từ file utils/api.js
import {
  getReportSummary,
  getDailyRevenueReport,
  exportReportExcel,
  exportReportBCA, // <-- Đã thêm API xuất báo cáo BCA
} from "../../utils/api";

import ReportFilter from "./ReportFilter";
import SummaryCards from "./SummaryCards";
import DailyChart from "./DailyChart";

const today = () => new Date().toISOString().split("T")[0];
const firstDayOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
};

export default function ReportPage() {
  const { addToast, ToastContainer } = useToast();

  const [dateRange, setDateRange] = useState({
    from: firstDayOfMonth(),
    to: today(),
  });

  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [dailyData, setDailyData] = useState([]);

  // Hàm gọi data thống kê tổng quan và biểu đồ
  const fetchReportData = async () => {
    if (!dateRange.from || !dateRange.to) return;

    setLoading(true);
    try {
      const params = { from: dateRange.from, to: dateRange.to };

      const [summaryRes, dailyRes] = await Promise.all([
        getReportSummary(params),
        getDailyRevenueReport(params),
      ]);

      setSummaryData(summaryRes.data);
      setDailyData(dailyRes.data.daily);
    } catch (error) {
      console.error(error);
      addToast("Lỗi tải dữ liệu báo cáo", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // Hàm xuất Excel Doanh Thu thông thường
  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const params = { from: dateRange.from, to: dateRange.to };

      const response = await exportReportExcel(params);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `DoanhThu_${dateRange.from}_${dateRange.to}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      addToast("Xuất báo cáo doanh thu thành công!", "success");
    } catch (error) {
      console.error(error);
      addToast("Lỗi xuất báo cáo doanh thu", "error");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xuất Excel TT30/BCA mới
  // Nhận bcaParams từ Modal truyền ra
  const handleExportBCA = async (bcaParams) => {
    try {
      setLoading(true);

      // Gọi API với thông số from/to riêng biệt của Quý đó,
      // không dùng chung với dateRange của màn hình tổng nữa
      const response = await exportReportBCA(bcaParams);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      // Lưu tên file theo chuẩn
      link.setAttribute(
        "download",
        `BaoCao_TT30_BCA_${bcaParams.from}_${bcaParams.to}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      addToast("Xuất báo cáo BCA thành công!", "success");
    } catch (error) {
      console.error(error);
      addToast("Lỗi xuất báo cáo BCA", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="revenue-page-container"
      style={{ padding: "0 4px", boxSizing: "border-box" }}
    >
      <ToastContainer />
      <div
        className="page-header"
        style={{
          marginBottom: 20,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <h2
          className="page-title"
          style={{ margin: 0, fontSize: "clamp(18px, 5vw, 24px)" }}
        >
          Báo cáo Doanh thu
        </h2>
        <div
          className="page-subtitle"
          style={{
            color: "#666",
            fontSize: "clamp(12px, 3vw, 14px)",
            lineHeight: 1.4,
          }}
        >
          Thống kê doanh thu theo kỳ và xuất báo cáo dữ liệu hóa đơn, lưu trú
        </div>
      </div>

      <ReportFilter
        dateRange={dateRange}
        setDateRange={setDateRange}
        onFilter={fetchReportData}
        onExport={handleExportExcel}
        onExportBCA={handleExportBCA} // <-- Truyền prop vào đây
        loading={loading}
      />

      <SummaryCards
        summaryData={summaryData?.summary}
        byBookingType={summaryData?.byBookingType}
      />

      <DailyChart dailyData={dailyData} />
    </div>
  );
}
