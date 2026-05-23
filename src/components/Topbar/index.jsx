const PAGE_HEADINGS = {
  dashboard: ["Dashboard", "Tổng quan hôm nay"],
  rooms: ["Quản lý phòng", "Danh sách & trạng thái phòng"],
  checkin: ["Check-in / Check-out", "Thủ tục nhận & trả phòng"],
  customers: ["Khách hàng", "Danh sách khách hàng"],
  invoices: ["Hóa đơn", "Quản lý thanh toán"],
  revenue: ["Doanh thu", "Thống kê tài chính"],
  reports: ["Báo cáo", "Phân tích tổng hợp"],
  calendar: ["Lịch đặt phòng", "Quản lý đặt trước"],
  settings: ["Cài đặt", "Cấu hình hệ thống"],
};

const Topbar = ({ activePage, onAddClick, showToast }) => {
  const [heading, breadcrumb] = PAGE_HEADINGS[activePage] || ["Dashboard", ""];
  return (
    <header
      style={{
        height: 56,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 14,
        flexShrink: 0,
      }}
    >
      <div>
        <div style={{ fontSize: 15.5, fontWeight: 600, color: "var(--text)" }}>
          {heading}
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 1 }}>
          {breadcrumb}
        </div>
      </div>
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ position: "relative" }}>
          <i
            className="ti ti-search"
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text3)",
              fontSize: 16,
              pointerEvents: "none",
            }}
          />
          <input
            className="search-input"
            type="text"
            placeholder="Tìm kiếm..."
          />
        </div>
        <div
          style={{
            background: "var(--accent-light)",
            color: "var(--accent-text)",
            fontSize: 12,
            fontWeight: 500,
            padding: "5px 12px",
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <i className="ti ti-calendar" style={{ fontSize: 13 }} />
          Thứ 6, 22/05/2026
        </div>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => showToast("Bạn có 3 thông báo mới", "ti-bell")}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: "1px solid var(--border2)",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text2)",
              fontSize: 17,
            }}
          >
            <i className="ti ti-bell" />
          </button>
          <span className="notif-dot" />
        </div>
        <button
          onClick={onAddClick}
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            border: "1px solid var(--accent)",
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "white",
            fontSize: 17,
          }}
        >
          <i className="ti ti-plus" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
