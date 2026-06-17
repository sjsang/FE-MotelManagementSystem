import React, { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";
import CustomDateRangePicker from "../../components/DateRangePicker";

export default function ReportFilter({
  dateRange,
  setDateRange,
  onFilter,
  onExport,
  onExportBCA,
  loading,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerAnchor, setPickerAnchor] = useState(null);
  const [dateLabel, setDateLabel] = useState("Tháng này");
  const dateButtonRef = useRef(null);

  // --- LOGIC CHO MODAL XUẤT BÁO CÁO QUÝ (BCA) ---
  const [bcaModalOpen, setBcaModalOpen] = useState(false);
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentQuarter = Math.floor(today.getMonth() / 3) + 1;

  // Tính toán các năm hợp lệ (chỉ lấy năm có ít nhất 1 quý đã hoàn thành)
  const availableYears = [];
  for (let i = 0; i < 5; i++) {
    const y = currentYear - i;
    // Nếu năm nay mà đang ở Quý 1 (chưa hoàn thành quý nào) thì bỏ qua năm nay luôn
    if (y === currentYear && currentQuarter === 1) continue;
    availableYears.push(y);
  }

  const [selectedYear, setSelectedYear] = useState(
    availableYears[0] || currentYear - 1
  );

  // Tính toán các quý hợp lệ của năm đang chọn
  const availableQuarters =
    selectedYear === currentYear
      ? Array.from({ length: currentQuarter - 1 }, (_, i) => i + 1) // Chỉ lấy các quý nhỏ hơn quý hiện tại
      : [1, 2, 3, 4]; // Năm cũ thì full 4 quý

  const [selectedQuarter, setSelectedQuarter] = useState(
    availableQuarters[availableQuarters.length - 1]
  );

  // Tự động điều chỉnh Quý nếu đổi Năm làm sai lệch (vd: từ 2025 chọn Q4, đổi sang 2026 chưa có Q4)
  useEffect(() => {
    const validQuarters =
      selectedYear === currentYear
        ? Array.from({ length: currentQuarter - 1 }, (_, i) => i + 1)
        : [1, 2, 3, 4];

    if (!validQuarters.includes(selectedQuarter)) {
      setSelectedQuarter(validQuarters[validQuarters.length - 1]);
    }
  }, [selectedYear]);

  const handleConfirmBCA = () => {
    let fromMonth, toMonth, endDay;
    if (selectedQuarter === 1) {
      fromMonth = "01";
      toMonth = "03";
      endDay = "31";
    } else if (selectedQuarter === 2) {
      fromMonth = "04";
      toMonth = "06";
      endDay = "30";
    } else if (selectedQuarter === 3) {
      fromMonth = "07";
      toMonth = "09";
      endDay = "30";
    } else if (selectedQuarter === 4) {
      fromMonth = "10";
      toMonth = "12";
      endDay = "31";
    }

    // Format chuẩn YYYY-MM-DD
    const from = `${selectedYear}-${fromMonth}-01`;
    const to = `${selectedYear}-${toMonth}-${endDay}`;

    // Truyền thẳng thông số from, to của Quý đó ra ngoài hàm
    onExportBCA({ from, to });
    setBcaModalOpen(false);
  };
  // ----------------------------------------------

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
      {/* Modal Chọn Quý BCA */}
      {bcaModalOpen && (
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
              width: 400,
              padding: 24,
              backgroundColor: "#fff",
              borderRadius: 12,
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: 18, color: "#1f2a37" }}>
              {" "}
              Báo cáo theo quý (TT30/BCA)
            </h3>

            <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
              <div style={{ flex: 1 }}>
                <div
                  className="form-label"
                  style={{
                    fontSize: 13,
                    color: "#6b7a90",
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  Chọn Năm
                </div>
                <select
                  className="form-control"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    cursor: "pointer",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                  }}
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      Năm {y}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  className="form-label"
                  style={{
                    fontSize: 13,
                    color: "#6b7a90",
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  Chọn Quý
                </div>
                <select
                  className="form-control"
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    cursor: "pointer",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                  }}
                >
                  {availableQuarters.map((q) => (
                    <option key={q} value={q}>
                      Quý {q}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}
            >
              <button
                className="btn btn-ghost"
                onClick={() => setBcaModalOpen(false)}
                style={{
                  padding: "9px 20px",
                  borderRadius: 8,
                  color: "#4b5563",
                  backgroundColor: "#f3f4f6",
                }}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmBCA}
                style={{
                  padding: "9px 24px",
                  borderRadius: 8,
                  background: "#f59e0b",
                  color: "#fff",
                  border: "none",
                  fontWeight: 600,
                  boxShadow: "0 2px 4px rgba(245,158,11,0.2)",
                }}
              >
                Xuất file
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Giao diện bộ lọc bên dưới giữ nguyên */}
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: "0 0 auto", width: 230 }}>
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
          <button
            ref={dateButtonRef}
            onClick={handleOpenPicker}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
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
                    {dateRange.from
                      ? dayjs(dateRange.from).format("DD/MM/YYYY")
                      : "--"}
                  </span>
                  <span
                    style={{
                      margin: "0 10px",
                      color: "#6b7a90",
                      fontWeight: 500,
                    }}
                  >
                    →
                  </span>
                  <span style={{ fontWeight: 600, letterSpacing: "0.3px" }}>
                    {dateRange.to
                      ? dayjs(dateRange.to).format("DD/MM/YYYY")
                      : "--"}
                  </span>
                </>
              ) : (
                <span style={{ fontWeight: 600, letterSpacing: "0.3px" }}>
                  {dateLabel}
                </span>
              )}
            </div>
          </button>
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
          onClick={() => setBcaModalOpen(true)} // Mở modal khi bấm nút
          disabled={loading}
          style={{
            height: 38,
            background: "#f59e0b",
            color: "#fff",
            border: "none",
            padding: "0 20px",
            fontWeight: 600,
          }}
        >
          Báo cáo theo quý
        </button>

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
