import React, { useState, useRef } from "react";
import dayjs from "dayjs";
import CustomDateRangePicker from "../../components/DateRangePicker";

export default function ReportFilter({
  dateRange,
  setDateRange,
  onFilter,
  onExport,
  loading,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerAnchor, setPickerAnchor] = useState(null);
  const [dateLabel, setDateLabel] = useState("Tháng này");
  const dateButtonRef = useRef(null);

  // ========================================================
  // LOGIC MODAL CHỌN QUÝ
  // ========================================================
  const [quarterModalOpen, setQuarterModalOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;

  // Lấy 5 năm gần nhất
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const availableQuarters = [1, 2, 3, 4];

  const [qYear, setQYear] = useState(currentYear);
  const [qQuarter, setQQuarter] = useState(currentQuarter);

  const handleApplyQuarter = () => {
    let fromMonth, toMonth, endDay;
    if (qQuarter === 1) { fromMonth = "01"; toMonth = "03"; endDay = "31"; }
    else if (qQuarter === 2) { fromMonth = "04"; toMonth = "06"; endDay = "30"; }
    else if (qQuarter === 3) { fromMonth = "07"; toMonth = "09"; endDay = "30"; }
    else if (qQuarter === 4) { fromMonth = "10"; toMonth = "12"; endDay = "31"; }

    // Tính toán ngày bắt đầu và kết thúc của quý
    const from = dayjs(`${qYear}-${fromMonth}-01`).toDate();
    const to = dayjs(`${qYear}-${toMonth}-${endDay}`).endOf("day").toDate();

    // Cập nhật dateRange hệ thống
    setDateRange({ from, to });
    setDateLabel(`Quý ${qQuarter}/${qYear}`);
    setQuarterModalOpen(false);
  };
  // ========================================================

  const handleOpenPicker = () => {
    setPickerAnchor(dateButtonRef.current);
    setPickerOpen(true);
  };

  const handleApplyDates = (dates) => {
    setDateRange((prev) => ({
      ...prev,
      from: dates.start || prev.from,
      to: dates.end || prev.to,
    }));
    setDateLabel(dates.label || "Chọn trên lịch");
  };

  return (
    <div
      className="card"
      style={{
        marginBottom: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      {/* ── MODAL CHỌN QUÝ ── */}
      {quarterModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              width: 360,
              padding: 24,
              backgroundColor: "#fff",
              borderRadius: 12,
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", fontSize: 18, color: "#1f2a37" }}>
              Lọc theo Quý
            </h3>

            <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
              <div style={{ flex: 1 }}>
                <div
                  className="form-label"
                  style={{ fontSize: 13, color: "#6b7a90", marginBottom: 6, fontWeight: 600 }}
                >
                  Chọn Năm
                </div>
                <select
                  className="form-control"
                  value={qYear}
                  onChange={(e) => setQYear(Number(e.target.value))}
                  style={{
                    width: "100%", padding: "10px 14px", cursor: "pointer",
                    borderRadius: 8, border: "1px solid #d1d5db",
                  }}
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>Năm {y}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  className="form-label"
                  style={{ fontSize: 13, color: "#6b7a90", marginBottom: 6, fontWeight: 600 }}
                >
                  Chọn Quý
                </div>
                <select
                  className="form-control"
                  value={qQuarter}
                  onChange={(e) => setQQuarter(Number(e.target.value))}
                  style={{
                    width: "100%", padding: "10px 14px", cursor: "pointer",
                    borderRadius: 8, border: "1px solid #d1d5db",
                  }}
                >
                  {availableQuarters.map((q) => (
                    <option key={q} value={q}>Quý {q}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                className="btn btn-ghost"
                onClick={() => setQuarterModalOpen(false)}
                style={{
                  padding: "9px 20px", borderRadius: 8, color: "#4b5563",
                  backgroundColor: "#f3f4f6", border: "none", cursor: "pointer"
                }}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleApplyQuarter}
                style={{
                  padding: "9px 24px", borderRadius: 8, background: "#3b82f6",
                  color: "#fff", border: "none", fontWeight: 600, cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(59,130,246,0.3)"
                }}
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BỘ LỌC CHÍNH ── */}
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: "0 0 auto" }}>
          <div
            className="form-label"
            style={{
              fontSize: 13,
              color: "#9fa3b8",
              marginBottom: 6,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Kỳ báo cáo
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              ref={dateButtonRef}
              onClick={handleOpenPicker}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 230,
                padding: "9px 14px",
                borderRadius: 8,
                border: "1px solid #C3D6EA",
                backgroundColor: "#EAF4FF",
                color: "#1f2a37",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13.5,
                transition: "all 0.2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#DCEEFF";
                e.currentTarget.style.borderColor = "#AFC7E8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#EAF4FF";
                e.currentTarget.style.borderColor = "#C3D6EA";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                {dateLabel === "Chọn trên lịch" ? (
                  <>
                    <span style={{ fontWeight: 600, letterSpacing: "0.3px" }}>
                      {dateRange.from ? dayjs(dateRange.from).format("DD/MM/YYYY") : "--"}
                    </span>
                    <span style={{ margin: "0 10px", color: "#6b7a90", fontWeight: 500 }}>
                      →
                    </span>
                    <span style={{ fontWeight: 600, letterSpacing: "0.3px" }}>
                      {dateRange.to ? dayjs(dateRange.to).format("DD/MM/YYYY") : "--"}
                    </span>
                  </>
                ) : (
                  <span style={{ fontWeight: 600, letterSpacing: "0.3px" }}>
                    {dateLabel}
                  </span>
                )}
              </div>
            </button>

            {/* NÚT MỞ MODAL CHỌN QUÝ */}
            <button
              onClick={() => setQuarterModalOpen(true)}
              style={{
                height: 38,
                padding: "0 16px",
                borderRadius: 8,
                border: "1px solid #C3D6EA",
                backgroundColor: "#fff",
                color: "#1f2a37",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
            >
              Theo Quý
            </button>
          </div>

          <CustomDateRangePicker
            open={pickerOpen}
            anchorEl={pickerAnchor}
            onClose={() => setPickerOpen(false)}
            initialDates={{ start: dateRange.from, end: dateRange.to }}
            onApply={handleApplyDates}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={onFilter}
          disabled={loading}
          style={{ height: 38, padding: "0 20px" }}
        >
          {loading ? "Đang tải..." : "Xem"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          className="btn"
          onClick={onExport}
          disabled={loading}
          style={{
            height: 38,
            background: "#10b981",
            color: "#fff",
            border: "none",
            padding: "0 20px",
            fontWeight: 600,
          }}
        >
          Xuất Excel
        </button>
      </div>
    </div>
  );
}