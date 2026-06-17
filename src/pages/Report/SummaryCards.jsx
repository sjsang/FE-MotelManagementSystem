import React from "react";

const formatVND = (n) => (n || 0).toLocaleString("vi-VN") + "đ";

export default function SummaryCards({ summaryData, byBookingType }) {
  if (!summaryData) return null;

  const typeMap =
    byBookingType?.reduce((acc, curr) => {
      acc[curr.type] = curr.revenue;
      return acc;
    }, {}) || {};

  return (
    <div
      className="stats-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "16px",
        marginBottom: 20,
      }}
    >
      <div
        className="stat-card"
        style={{
          padding: 20,
          borderRadius: 12,
          background: "rgba(16, 185, 129, 0.05)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
        }}
      >
        <div
          className="stat-label"
          style={{
            color: "#9fa3b8",
            marginBottom: 8,
            fontSize: 13,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Tổng Doanh thu
        </div>
        <div
          className="stat-value"
          style={{ color: "#10b981", fontSize: 24, fontWeight: "bold" }}
        >
          {formatVND(summaryData.totalRevenue)}
        </div>
        <div style={{ fontSize: 13, color: "#9fa3b8", marginTop: 8 }}>
          Số hóa đơn:{" "}
          <span style={{ color: "#fff", fontWeight: 600 }}>
            {summaryData.totalInvoices}
          </span>
        </div>
      </div>

      <div
        className="stat-card"
        style={{
          padding: 20,
          borderRadius: 12,
          background: "rgba(244, 114, 182, 0.05)",
          border: "1px solid rgba(244, 114, 182, 0.2)",
        }}
      >
        <div
          className="stat-label"
          style={{
            color: "#9fa3b8",
            marginBottom: 8,
            fontSize: 13,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Nghỉ giờ
        </div>
        <div
          className="stat-value"
          style={{ color: "#f472b6", fontSize: 20, fontWeight: "bold" }}
        >
          {formatVND(typeMap["hourly"])}
        </div>
      </div>

      <div
        className="stat-card"
        style={{
          padding: 20,
          borderRadius: 12,
          background: "rgba(139, 133, 255, 0.05)",
          border: "1px solid rgba(139, 133, 255, 0.2)",
        }}
      >
        <div
          className="stat-label"
          style={{
            color: "#9fa3b8",
            marginBottom: 8,
            fontSize: 13,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Qua đêm
        </div>
        <div
          className="stat-value"
          style={{ color: "#8b85ff", fontSize: 20, fontWeight: "bold" }}
        >
          {formatVND(typeMap["overnight"])}
        </div>
      </div>

      <div
        className="stat-card"
        style={{
          padding: 20,
          borderRadius: 12,
          background: "rgba(96, 165, 250, 0.05)",
          border: "1px solid rgba(96, 165, 250, 0.2)",
        }}
      >
        <div
          className="stat-label"
          style={{
            color: "#9fa3b8",
            marginBottom: 8,
            fontSize: 13,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Cả ngày
        </div>
        <div
          className="stat-value"
          style={{ color: "#60a5fa", fontSize: 20, fontWeight: "bold" }}
        >
          {formatVND(typeMap["fullday"])}
        </div>
      </div>
    </div>
  );
}
