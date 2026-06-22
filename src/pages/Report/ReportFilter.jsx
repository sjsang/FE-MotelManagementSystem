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

  const [quarterModalOpen, setQuarterModalOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
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

    const from = dayjs(`${qYear}-${fromMonth}-01`).toDate();
    const to = dayjs(`${qYear}-${toMonth}-${endDay}`).endOf("day").toDate();
    setDateRange({ from, to });
    setDateLabel(`Quý ${qQuarter}/${qYear}`);
    setQuarterModalOpen(false);
  };

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
    <div className="card" style={{ marginBottom: 20, padding: "16px 20px" }}>
      {/* ── CSS RESPONSIVE: Grid 10 cột, đổi vùng theo breakpoint ── */}
      <style>{`
  .filter-actions-grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 8px;
    grid-template-areas:
      "date date date quy xem . . . export export";
  }
  .filter-actions-grid .area-date   { grid-area: date; }
  .filter-actions-grid .area-quy    { grid-area: quy; }
  .filter-actions-grid .area-xem    { grid-area: xem; }
  .filter-actions-grid .area-export { grid-area: export; }

  @media (max-width: 768px) {
    .filter-actions-grid {
      grid-template-areas:
        "date date date date date date date quy quy quy"
        "xem  xem  xem  xem  xem  xem  export export export export";
    }
  }
`}</style>

      {/* ── MODAL CHỌN QUÝ ── */}
      {quarterModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
          <div style={{ width: 360, padding: 24, backgroundColor: "#fff", borderRadius: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 18, color: "#1f2a37" }}>Lọc theo Quý</h3>
            <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
              <div style={{ flex: 1 }}>
                <div className="form-label" style={{ fontSize: 13, color: "#6b7a90", marginBottom: 6, fontWeight: 600 }}>Chọn Năm</div>
                <select className="form-control" value={qYear} onChange={(e) => setQYear(Number(e.target.value))} style={{ width: "100%", padding: "10px 14px", cursor: "pointer", borderRadius: 8, border: "1px solid #d1d5db" }}>
                  {availableYears.map((y) => <option key={y} value={y}>Năm {y}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <div className="form-label" style={{ fontSize: 13, color: "#6b7a90", marginBottom: 6, fontWeight: 600 }}>Chọn Quý</div>
                <select className="form-control" value={qQuarter} onChange={(e) => setQQuarter(Number(e.target.value))} style={{ width: "100%", padding: "10px 14px", cursor: "pointer", borderRadius: 8, border: "1px solid #d1d5db" }}>
                  {availableQuarters.map((q) => <option key={q} value={q}>Quý {q}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button className="btn btn-ghost" onClick={() => setQuarterModalOpen(false)} style={{ padding: "9px 20px", borderRadius: 8, color: "#4b5563", backgroundColor: "#f3f4f6", border: "none", cursor: "pointer" }}>Hủy</button>
              <button className="btn btn-primary" onClick={handleApplyQuarter} style={{ padding: "9px 24px", borderRadius: 8, background: "#3b82f6", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>Áp dụng</button>
            </div>
          </div>
        </div>
      )}

      {/* ── NHÃN KỲ BÁO CÁO ── */}
      <div className="form-label" style={{ fontSize: 13, color: "#9fa3b8", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Kỳ báo cáo
      </div>

      {/* ── GRID: Date | Theo Quý | Xem | Xuất Excel ── */}
      <div className="filter-actions-grid">
        <button
          ref={dateButtonRef}
          onClick={handleOpenPicker}
          className="area-date"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: 38, padding: "0 14px", borderRadius: 8, border: "1px solid #C3D6EA", backgroundColor: "#EAF4FF", color: "#1f2a37", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#DCEEFF"; e.currentTarget.style.borderColor = "#AFC7E8"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#EAF4FF"; e.currentTarget.style.borderColor = "#C3D6EA"; }}
        >
          {dateLabel === "Chọn trên lịch" ? (
            <>
              <span style={{ fontWeight: 600 }}>{dateRange.from ? dayjs(dateRange.from).format("DD/MM/YYYY") : "--"}</span>
              <span style={{ margin: "0 10px", color: "#6b7a90" }}>→</span>
              <span style={{ fontWeight: 600 }}>{dateRange.to ? dayjs(dateRange.to).format("DD/MM/YYYY") : "--"}</span>
            </>
          ) : (
            <span style={{ fontWeight: 600 }}>{dateLabel}</span>
          )}
        </button>

        <button
          onClick={() => setQuarterModalOpen(true)}
          className="area-quy"
          style={{ height: 38, borderRadius: 8, border: "1px solid #C3D6EA", backgroundColor: "#fff", color: "#1f2a37", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
        >
          Theo Quý
        </button>

        <button className="area-xem btn btn-primary" onClick={onFilter} disabled={loading} style={{ height: 38, alignItems: "center", justifyContent: "center" }}>
          {loading ? "Đang tải..." : "Xem"}
        </button>

        <button className="area-export btn" onClick={onExport} disabled={loading} style={{ height: 38, background: "#10b981", color: "#fff", border: "none", fontWeight: 600, justifyContent: "center" }}>
          Xuất Excel
        </button>
      </div>

      <CustomDateRangePicker open={pickerOpen} anchorEl={pickerAnchor} onClose={() => setPickerOpen(false)} initialDates={{ start: dateRange.from, end: dateRange.to }} onApply={handleApplyDates} />
    </div>
  );
}