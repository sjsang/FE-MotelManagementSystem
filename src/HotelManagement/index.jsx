import React, { useState, useEffect } from "react";

export default function HotelManagement() {
  // ── STATE MANAGEMENT ─────────────────────────────────────
  const [activePage, setActivePage] = useState("dashboard");
  const [pageHeading, setPageHeading] = useState("Dashboard");
  const [pageBreadcrumb, setPageBreadcrumb] = useState("Tổng quan hôm nay");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRoomDetailOpen, setIsRoomDetailOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");

  const [toast, setToast] = useState({ show: false, message: "", icon: "" });
  const [roomFilter, setRoomFilter] = useState("all");

  // ── SIDEBAR NAVIGATION HANDLING ──────────────────────────
  const navigate = (pageId, heading, breadcrumb) => {
    setActivePage(pageId);
    setPageHeading(heading);
    setPageBreadcrumb(breadcrumb);
  };

  // ── TOAST MESSAGES ────────────────────────────────────────
  const showToast = (message, icon = "ti-bell") => {
    setToast({ show: true, message, icon });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // ── MODAL TOGGLES ─────────────────────────────────────────
  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const openRoomDetail = (roomId) => {
    setSelectedRoomId(roomId);
    setIsRoomDetailOpen(true);
  };
  const closeRoomDetail = () => setIsRoomDetailOpen(false);

  // ── INLINE STYLES SHEET (Giữ nguyên CSS gốc) ──────────────
  const injectStyles = `
    :root {
      --accent: #1D9E75;
      --accent-hover: #0F6E56;
      --accent-light: #E1F5EE;
      --accent-text: #085041;
      --sidebar-bg: #04342C;
      --sidebar-w: 230px;
      --bg: #FAFAF8;
      --surface: #FFFFFF;
      --surface2: #F5F4F0;
      --border: rgba(0,0,0,0.08);
      --border2: rgba(0,0,0,0.14);
      --text: #1a1a18;
      --text2: #6b6b67;
      --text3: #9b9b97;
      --radius: 8px;
      --radius-lg: 12px;
      --radius-xl: 16px;
      --shadow: 0 1px 4px rgba(0,0,0,0.08);
      --shadow-md: 0 4px 16px rgba(0,0,0,0.10);
    }

    .hotel-dashboard-body {
      font-family: 'Be Vietnam Pro', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      overflow: hidden;
    }

    /* ── SIDEBAR ────────────────────────── */
    .sidebar {
      width: var(--sidebar-w);
      background: var(--sidebar-bg);
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      flex-shrink: 0;
    }
    .sidebar-logo {
      padding: 20px 18px 18px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-mark {
      width: 38px; height: 38px;
      background: var(--accent);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 20px; flex-shrink: 0;
    }
    .logo-name {
      font-family: 'Playfair Display', serif;
      font-size: 15px; color: white; line-height: 1.2;
    }
    .logo-sub { font-size: 10.5px; color: rgba(255,255,255,0.38); letter-spacing: 0.03em; }
    .sidebar-nav { flex: 1; padding: 14px 10px; overflow-y: auto; }
    .nav-group-label {
      font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.1em;
      color: rgba(255,255,255,0.3); padding: 12px 10px 5px; font-weight: 600;
    }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 12px; border-radius: 8px;
      color: rgba(255,255,255,0.55); font-size: 13.5px;
      cursor: pointer; margin-bottom: 1px; transition: all 0.15s;
      position: relative;
    }
    .nav-item:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.85); }
    .nav-item.active { background: var(--accent); color: white; }
    .nav-item i { font-size: 18px; width: 22px; flex-shrink: 0; }
    .nav-badge {
      margin-left: auto; background: rgba(255,255,255,0.14);
      color: rgba(255,255,255,0.65); font-size: 10.5px;
      padding: 1px 7px; border-radius: 20px; font-weight: 500;
    }
    .nav-item.active .nav-badge { background: rgba(255,255,255,0.25); color: white; }
    .sidebar-bottom { padding: 12px 10px; border-top: 1px solid rgba(255,255,255,0.07); }
    .user-card { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 9px; cursor: pointer; transition: 0.15s; }
    .user-card:hover { background: rgba(255,255,255,0.07); }
    .user-av { width: 32px; height: 32px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: white; }
    .user-name { font-size: 13px; color: rgba(255,255,255,0.8); font-weight: 500; }
    .user-role { font-size: 11px; color: rgba(255,255,255,0.35); }

    /* ── MAIN WRAP ──────────────────────── */
    .main-wrap { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
    .topbar { height: 56px; background: var(--surface); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 24px; gap: 14px; flex-shrink: 0; }
    .page-heading { font-size: 15.5px; font-weight: 600; color: var(--text); }
    .page-breadcrumb { font-size: 12px; color: var(--text3); margin-top: 1px; }
    .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }
    .date-chip { background: var(--accent-light); color: var(--accent-text); font-size: 12px; font-weight: 500; padding: 5px 12px; border-radius: 20px; display: flex; align-items: center; gap: 6px; }
    .tb-btn { width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--border2); background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text2); font-size: 17px; transition: 0.15s; }
    .tb-btn:hover { background: var(--surface2); color: var(--text); }
    .tb-btn.primary { background: var(--accent); border-color: var(--accent); color: white; }
    .tb-btn.primary:hover { background: var(--accent-hover); }
    .content { flex: 1; overflow-y: auto; padding: 22px 24px; }

    /* ── PAGES ──────────────────────────── */
    .page { display: none; }
    .page.active { display: block; }

    /* ── STAT CARDS ─────────────────────── */
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
    .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 18px; box-shadow: var(--shadow); }
    .stat-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
    .stat-label { font-size: 12px; color: var(--text2); font-weight: 500; }
    .stat-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .si-green { background: #E1F5EE; color: #0F6E56; }
    .si-blue  { background: #E6F1FB; color: #185FA5; }
    .si-amber { background: #FAEEDA; color: #854F0B; }
    .si-red   { background: #FCEBEB; color: #A32D2D; }
    .si-purple{ background: #EEEDFE; color: #534AB7; }
    .stat-value { font-size: 28px; font-weight: 600; color: var(--text); line-height: 1; margin-bottom: 6px; }
    .stat-change { font-size: 12px; display: flex; align-items: center; gap: 4px; }
    .up   { color: #0F6E56; }
    .down { color: #A32D2D; }
    .neutral { color: var(--text3); }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .grid-65-35 { display: grid; grid-template-columns: 1fr 340px; gap: 16px; margin-bottom: 20px; }

    /* ── CARDS ──────────────────────────── */
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow); overflow: hidden; }
    .card-header { padding: 14px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
    .card-title { font-size: 13.5px; font-weight: 600; color: var(--text); display: flex; align-items: center; gap: 8px; }
    .card-title i { color: var(--accent); font-size: 16px; }
    .card-action { font-size: 12px; color: var(--accent); cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 4px; }
    .card-action:hover { color: var(--accent-hover); }

    /* ── ROOM GRID ──────────────────────── */
    .room-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; padding: 16px; }
    .room-tile { border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 10px; cursor: pointer; transition: all 0.15s; position: relative; }
    .room-tile:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
    .room-tile.occupied  { border-left: 3px solid #E24B4A; }
    .room-tile.available { border-left: 3px solid #1D9E75; }
    .room-tile.cleaning  { border-left: 3px solid #EF9F27; }
    .room-tile.reserved  { border-left: 3px solid #378ADD; }
    .room-num { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 3px; }
    .room-type-small { font-size: 10.5px; color: var(--text3); margin-bottom: 8px; }
    .status-pill { display: inline-flex; align-items: center; gap: 4px; font-size: 10.5px; padding: 2px 7px; border-radius: 20px; font-weight: 500; }
    .s-occupied  { background: #FCEBEB; color: #A32D2D; }
    .s-available { background: #E1F5EE; color: #0F6E56; }
    .s-cleaning  { background: #FAEEDA; color: #854F0B; }
    .s-reserved  { background: #E6F1FB; color: #185FA5; }
    .status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

    /* ── TABLES ─────────────────────────── */
    .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .data-table th { text-align: left; color: var(--text3); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; padding: 10px 16px; border-bottom: 1px solid var(--border); background: var(--surface2); }
    .data-table td { padding: 12px 16px; border-bottom: 1px solid var(--border); color: var(--text); }
    .data-table tbody tr:hover td { background: #F8FBF9; }
    .data-table .td-name { font-weight: 500; }

    /* ── BADGES ─────────────────────────── */
    .badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; padding: 3px 9px; border-radius: 20px; font-weight: 500; }
    .badge-green  { background: #E1F5EE; color: #085041; }
    .badge-red    { background: #FCEBEB; color: #791F1F; }
    .badge-blue   { background: #E6F1FB; color: #0C447C; }
    .badge-amber  { background: #FAEEDA; color: #633806; }
    
    /* ── MODALS & BACKDROP ──────────────── */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 1000; opacity: 0; pointer-events: none; transition: 0.2s; }
    .modal-backdrop.open { opacity: 1; pointer-events: all; }
    .modal { background: white; border-radius: var(--radius-xl); width: 520px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,0.18); transform: translateY(10px); transition: 0.2s; max-height: 90vh; overflow-y: auto; }
    .modal-backdrop.open .modal { transform: translateY(0); }
    .modal-header { padding: 18px 22px 14px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
    .modal-title { font-size: 15px; font-weight: 600; }
    .modal-close { width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--border2); background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; color: var(--text2); transition: 0.15s; }
    .modal-close:hover { background: #FCEBEB; color: #A32D2D; border-color: #F7C1C1; }
    .modal-body { padding: 20px 22px; }
    .modal-footer { padding: 14px 22px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; }

    /* ── FORMS ──────────────────────────── */
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; }
    .form-group.full { grid-column: 1 / -1; }
    .form-label { font-size: 12px; font-weight: 600; color: var(--text2); }
    .form-control { height: 38px; padding: 0 12px; border: 1px solid var(--border2); border-radius: var(--radius); font-family: 'Be Vietnam Pro', sans-serif; font-size: 13.5px; color: var(--text); background: white; outline: none; transition: 0.15s; }
    .form-control:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(29,158,117,0.12); }
    textarea.form-control { height: 80px; padding: 10px 12px; resize: none; }

    /* ── BUTTONS ────────────────────────── */
    .btn { display: inline-flex; align-items: center; gap: 7px; padding: 0 16px; height: 36px; border-radius: var(--radius); font-family: 'Be Vietnam Pro', sans-serif; font-size: 13px; font-weight: 500; border: 1px solid transparent; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
    .btn-primary { background: var(--accent); color: white; border-color: var(--accent); }
    .btn-primary:hover { background: var(--accent-hover); border-color: var(--accent-hover); }
    .btn-outline { background: white; color: var(--text); border-color: var(--border2); }
    .btn-outline:hover { background: var(--surface2); }
    .btn-sm { height: 30px; padding: 0 12px; font-size: 12px; }

    /* ── COMPONENT UI LIST ──────────────── */
    .ci-list { list-style: none; }
    .ci-item { display: flex; align-items: center; gap: 12px; padding: 12px 18px; border-bottom: 1px solid var(--border); transition: 0.12s; cursor: pointer; }
    .ci-item:last-child { border-bottom: none; }
    .ci-item:hover { background: #F8FBF9; }
    .ci-av { width: 36px; height: 36px; border-radius: 50%; background: var(--accent-light); color: var(--accent-text); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
    .ci-name { font-size: 13.5px; font-weight: 500; color: var(--text); }
    .ci-sub  { font-size: 11.5px; color: var(--text2); margin-top: 2px; }
    .ci-time { font-size: 12px; color: var(--text3); margin-bottom: 3px; text-align: right; }
    .ci-right { margin-left: auto; text-align: right; }

    /* ── CHARTS ─────────────────────────── */
    .mini-chart-wrap { padding: 16px 18px; }
    .chart-meta { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 12px; }
    .chart-total { font-weight: 600; font-size: 18px; color: var(--text); }
    .chart-bars { display: flex; align-items: flex-end; gap: 7px; height: 90px; }
    .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .bar-fill { width: 100%; background: var(--accent-light); border-radius: 4px 4px 0 0; min-height: 4px; transition: 0.2s; cursor: pointer; }
    .bar-fill:hover, .bar-fill.hi { background: var(--accent); }
    .bar-lbl { font-size: 10px; color: var(--text3); }
    .bar-val-top { font-size: 9.5px; color: var(--text3); }

    /* ── SEARCH & OTHER UI ELEMENTS ──────── */
    .search-wrap { position: relative; }
    .search-input { width: 240px; height: 34px; padding: 0 12px 0 34px; border: 1px solid var(--border2); border-radius: var(--radius); font-family: 'Be Vietnam Pro', sans-serif; font-size: 13px; background: white; outline: none; transition: 0.15s; color: var(--text); }
    .search-input:focus { border-color: var(--accent); width: 280px; }
    .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text3); font-size: 16px; pointer-events: none; }
    .notif-dot { position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; border-radius: 50%; background: #E24B4A; border: 2px solid var(--sidebar-bg); }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
    .dot-green  { background: var(--accent); }
    .dot-red    { background: #E24B4A; }
    .dot-amber  { background: #EF9F27; }
    .dot-blue   { background: #378ADD; }
    
    .room-detail { padding: 16px; }
    .detail-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
    .detail-item { background: var(--surface2); border-radius: var(--radius); padding: 12px; }
    .detail-lbl { font-size: 11px; color: var(--text3); margin-bottom: 4px; }
    .detail-val { font-size: 15px; font-weight: 600; color: var(--text); }

    /* ── FILTER BAR ─────────────────────── */
    .filter-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
    .filter-tab { padding: 5px 14px; border-radius: 20px; font-size: 12.5px; font-weight: 500; border: 1px solid var(--border2); background: white; cursor: pointer; color: var(--text2); transition: 0.15s; }
    .filter-tab:hover { background: var(--surface2); }
    .filter-tab.active { background: var(--accent); color: white; border-color: var(--accent); }

    /* ── TOAST ──────────────────────────── */
    .toast { position: fixed; bottom: 24px; right: 24px; background: var(--text); color: white; padding: 12px 18px; border-radius: 10px; font-size: 13px; font-weight: 500; box-shadow: var(--shadow-md); z-index: 2000; transform: translateY(20px); opacity: 0; transition: 0.25s; display: flex; align-items: center; gap: 8px; }
    .toast.show { transform: translateY(0); opacity: 1; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .page.active > * { animation: fadeIn 0.25s ease both; }
  `;

  return (
    <div className="hotel-dashboard-body">
      <style>{injectStyles}</style>

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">
            <i className="ti ti-building-cottage"></i>
          </div>
          <div>
            <div className="logo-name">Nhà Nghỉ Bình An</div>
            <div className="logo-sub">Hệ thống quản lý</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-label">Tổng quan</div>
          <div
            className={`nav-item ${activePage === "dashboard" ? "active" : ""}`}
            onClick={() =>
              navigate("dashboard", "Dashboard", "Tổng quan hôm nay")
            }
          >
            <i className="ti ti-layout-dashboard"></i> Dashboard
          </div>
          <div
            className={`nav-item ${activePage === "calendar" ? "active" : ""}`}
            onClick={() =>
              navigate("calendar", "Lịch đặt phòng", "Lịch theo tháng")
            }
          >
            <i className="ti ti-calendar"></i> Lịch đặt phòng
            <span className="nav-badge">3</span>
          </div>

          <div className="nav-group-label">Quản lý</div>
          <div
            className={`nav-item ${activePage === "rooms" ? "active" : ""}`}
            onClick={() =>
              navigate("rooms", "Quản lý phòng", "Danh sách phòng nghỉ")
            }
          >
            <i className="ti ti-door"></i> Quản lý phòng
          </div>
          <div
            className={`nav-item ${activePage === "checkin" ? "active" : ""}`}
            onClick={() =>
              navigate("checkin", "Check-in / Out", "Giao dịch lưu trú")
            }
          >
            <i className="ti ti-arrows-exchange"></i> Check-in / Out
            <span className="nav-badge" id="nb-ci">
              5
            </span>
          </div>
          <div
            className={`nav-item ${activePage === "customers" ? "active" : ""}`}
            onClick={() =>
              navigate("customers", "Khách hàng", "Thông tin khách")
            }
          >
            <i className="ti ti-users"></i> Khách hàng
          </div>
          <div
            className={`nav-item ${activePage === "invoices" ? "active" : ""}`}
            onClick={() => navigate("invoices", "Hóa đơn", "Thống kê hóa đơn")}
          >
            <i className="ti ti-receipt"></i> Hóa đơn
            <span className="nav-badge">2</span>
          </div>

          <div className="nav-group-label">Báo cáo</div>
          <div
            className={`nav-item ${activePage === "revenue" ? "active" : ""}`}
            onClick={() =>
              navigate("revenue", "Doanh thu", "Báo cáo tài chính")
            }
          >
            <i className="ti ti-chart-bar"></i> Doanh thu
          </div>
          <div
            className={`nav-item ${activePage === "reports" ? "active" : ""}`}
            onClick={() => navigate("reports", "Thống kê", "Chỉ số vận hành")}
          >
            <i className="ti ti-report-analytics"></i> Thống kê
          </div>

          <div className="nav-group-label">Hệ thống</div>
          <div
            className={`nav-item ${activePage === "settings" ? "active" : ""}`}
            onClick={() => navigate("settings", "Cài đặt", "Cấu hình hệ thống")}
          >
            <i className="ti ti-settings"></i> Cài đặt
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="user-av">QT</div>
            <div>
              <div className="user-name">Quản Trị Viên</div>
              <div className="user-role">Administrator</div>
            </div>
            <i
              className="ti ti-chevron-right"
              style={{
                marginLeft: "auto",
                color: "rgba(255,255,255,0.25)",
                fontSize: "14px",
              }}
            ></i>
          </div>
        </div>
      </aside>

      {/* ══════════════ MAIN WRAP ══════════════ */}
      <div className="main-wrap">
        {/* TOPBAR */}
        <header className="topbar">
          <div>
            <div className="page-heading">{pageHeading}</div>
            <div className="page-breadcrumb">{pageBreadcrumb}</div>
          </div>
          <div className="topbar-right">
            <div className="search-wrap">
              <i className="ti ti-search search-icon"></i>
              <input
                className="search-input"
                type="text"
                placeholder="Tìm kiếm..."
              />
            </div>
            <div className="date-chip">
              <i className="ti ti-calendar" style={{ fontSize: "13px" }}></i>
              Thứ 6, 22/05/2026
            </div>
            <div
              className="tb-btn"
              title="Thông báo"
              style={{ position: "relative" }}
              onClick={() => showToast("Bạn có 3 thông báo mới", "ti-bell")}
            >
              <i className="ti ti-bell"></i>
              <div className="notif-dot"></div>
            </div>
            <div
              className="tb-btn primary"
              title="Thêm mới"
              onClick={openAddModal}
            >
              <i className="ti ti-plus"></i>
            </div>
          </div>
        </header>

        <div className="content">
          {/* ══════════ PAGE: DASHBOARD ══════════ */}
          <div className={`page ${activePage === "dashboard" ? "active" : ""}`}>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-row">
                  <div className="stat-label">Phòng đang thuê</div>
                  <div className="stat-icon si-green">
                    <i className="ti ti-door-enter"></i>
                  </div>
                </div>
                <div className="stat-value">18</div>
                <div className="stat-change up">
                  <i className="ti ti-trending-up"></i> +3 so với hôm qua
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-row">
                  <div className="stat-label">Doanh thu hôm nay</div>
                  <div className="stat-icon si-blue">
                    <i className="ti ti-coin"></i>
                  </div>
                </div>
                <div className="stat-value">4,2tr</div>
                <div className="stat-change up">
                  <i className="ti ti-trending-up"></i> +12% tuần này
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-row">
                  <div className="stat-label">Phòng trống</div>
                  <div className="stat-icon si-amber">
                    <i className="ti ti-home"></i>
                  </div>
                </div>
                <div className="stat-value">7</div>
                <div className="stat-change neutral">
                  Tổng 25 phòng · 72% lấp đầy
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-row">
                  <div className="stat-label">Check-out hôm nay</div>
                  <div className="stat-icon si-red">
                    <i className="ti ti-door-exit"></i>
                  </div>
                </div>
                <div className="stat-value">5</div>
                <div className="stat-change down">
                  <i className="ti ti-alert-circle"></i> 2 chưa thanh toán
                </div>
              </div>
            </div>

            <div className="grid-65-35">
              {/* Room overview */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title">
                    <i className="ti ti-layout-grid"></i> Sơ đồ phòng
                  </div>
                  <span
                    className="card-action"
                    onClick={() =>
                      navigate("rooms", "Quản lý phòng", "Danh sách phòng nghỉ")
                    }
                  >
                    <i className="ti ti-arrow-right"></i> Xem tất cả
                  </span>
                </div>
                <div className="room-grid">
                  <div
                    className="room-tile occupied"
                    onClick={() => openRoomDetail("101")}
                  >
                    <div className="room-num">101</div>
                    <div className="room-type-small">Phòng đơn</div>
                    <div className="status-pill s-occupied">
                      <span className="status-dot"></span>Thuê
                    </div>
                  </div>
                  <div
                    className="room-tile available"
                    onClick={() => openRoomDetail("102")}
                  >
                    <div className="room-num">102</div>
                    <div className="room-type-small">Phòng đôi</div>
                    <div className="status-pill s-available">
                      <span className="status-dot"></span>Trống
                    </div>
                  </div>
                  <div
                    className="room-tile occupied"
                    onClick={() => openRoomDetail("103")}
                  >
                    <div className="room-num">103</div>
                    <div className="room-type-small">Phòng VIP</div>
                    <div className="status-pill s-occupied">
                      <span className="status-dot"></span>Thuê
                    </div>
                  </div>
                  <div
                    className="room-tile cleaning"
                    onClick={() => openRoomDetail("104")}
                  >
                    <div className="room-num">104</div>
                    <div className="room-type-small">Phòng đơn</div>
                    <div className="status-pill s-cleaning">
                      <span className="status-dot"></span>Dọn
                    </div>
                  </div>
                  <div
                    className="room-tile available"
                    onClick={() => openRoomDetail("105")}
                  >
                    <div className="room-num">105</div>
                    <div className="room-type-small">Phòng đôi</div>
                    <div className="status-pill s-available">
                      <span className="status-dot"></span>Trống
                    </div>
                  </div>
                  <div
                    className="room-tile occupied"
                    onClick={() => openRoomDetail("106")}
                  >
                    <div className="room-num">106</div>
                    <div className="room-type-small">Phòng đôi</div>
                    <div className="status-pill s-occupied">
                      <span className="status-dot"></span>Thuê
                    </div>
                  </div>
                  <div
                    className="room-tile reserved"
                    onClick={() => openRoomDetail("107")}
                  >
                    <div className="room-num">107</div>
                    <div className="room-type-small">Phòng đơn</div>
                    <div className="status-pill s-reserved">
                      <span className="status-dot"></span>Đặt
                    </div>
                  </div>
                  <div
                    className="room-tile occupied"
                    onClick={() => openRoomDetail("108")}
                  >
                    <div className="room-num">108</div>
                    <div className="room-type-small">Phòng VIP</div>
                    <div className="status-pill s-occupied">
                      <span className="status-dot"></span>Thuê
                    </div>
                  </div>
                  <div
                    className="room-tile available"
                    onClick={() => openRoomDetail("109")}
                  >
                    <div className="room-num">109</div>
                    <div className="room-type-small">Phòng đôi</div>
                    <div className="status-pill s-available">
                      <span className="status-dot"></span>Trống
                    </div>
                  </div>
                  <div
                    className="room-tile cleaning"
                    onClick={() => openRoomDetail("110")}
                  >
                    <div className="room-num">110</div>
                    <div className="room-type-small">Phòng đơn</div>
                    <div className="status-pill s-cleaning">
                      <span className="status-dot"></span>Dọn
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "10px 18px 14px",
                    display: "flex",
                    gap: "16px",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      color: "var(--text2)",
                    }}
                  >
                    <span className="dot dot-red"></span> Đang thuê (18)
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      color: "var(--text2)",
                    }}
                  >
                    <span className="dot dot-green"></span> Trống (7)
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      color: "var(--text2)",
                    }}
                  >
                    <span className="dot dot-amber"></span> Dọn phòng (3)
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      color: "var(--text2)",
                    }}
                  >
                    <span className="dot dot-blue"></span> Đã đặt (2)
                  </span>
                </div>
              </div>

              {/* Today schedule */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title">
                    <i className="ti ti-clock"></i> Lịch hôm nay
                  </div>
                  <span className="badge badge-green">5 lượt</span>
                </div>
                <ul className="ci-list">
                  <li className="ci-item">
                    <div className="ci-av">NV</div>
                    <div>
                      <div className="ci-name">Nguyễn Văn A</div>
                      <div className="ci-sub">P.102 · 1 đêm · 350.000đ</div>
                    </div>
                    <div className="ci-right">
                      <div className="ci-time">08:30</div>
                      <span className="badge badge-green">Check-in</span>
                    </div>
                  </li>
                  <li className="ci-item">
                    <div className="ci-av">TT</div>
                    <div>
                      <div className="ci-name">Trần Thị Bình</div>
                      <div className="ci-sub">P.105 · 2 đêm · 700.000đ</div>
                    </div>
                    <div className="ci-right">
                      <div className="ci-time">09:00</div>
                      <span className="badge badge-blue">Đặt trước</span>
                    </div>
                  </li>
                  <li className="ci-item">
                    <div className="ci-av">LH</div>
                    <div>
                      <div className="ci-name">Lê Hoàng Cường</div>
                      <div className="ci-sub">P.101 · 3 đêm · 1.050.000đ</div>
                    </div>
                    <div className="ci-right">
                      <div className="ci-time">11:00</div>
                      <span className="badge badge-red">Check-out</span>
                    </div>
                  </li>
                  <li className="ci-item">
                    <div className="ci-av">PL</div>
                    <div>
                      <div className="ci-name">Phạm Lan Dương</div>
                      <div className="ci-sub">P.103 · 1 đêm · 500.000đ</div>
                    </div>
                    <div className="ci-right">
                      <div className="ci-time">14:00</div>
                      <span className="badge badge-green">Check-in</span>
                    </div>
                  </li>
                  <li className="ci-item">
                    <div className="ci-av">HM</div>
                    <div>
                      <div className="ci-name">Hoàng Minh Em</div>
                      <div className="ci-sub">P.106 · 2 đêm · 700.000đ</div>
                    </div>
                    <div className="ci-right">
                      <div className="ci-time">16:30</div>
                      <span className="badge badge-red">Check-out</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid-2">
              {/* Revenue chart */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title">
                    <i className="ti ti-chart-bar"></i> Doanh thu 7 ngày
                  </div>
                  <span
                    className="card-action"
                    onClick={() =>
                      navigate("revenue", "Doanh thu", "Báo cáo tài chính")
                    }
                  >
                    Xem chi tiết <i className="ti ti-arrow-right"></i>
                  </span>
                </div>
                <div className="mini-chart-wrap">
                  <div className="chart-meta">
                    <div>
                      Tuần này: <span className="chart-total">28.400.000đ</span>
                    </div>
                    <span className="up" style={{ fontSize: "12px" }}>
                      <i className="ti ti-trending-up"></i> +8% so với tuần
                      trước
                    </span>
                  </div>
                  <div className="chart-bars">
                    <div className="bar-col">
                      <div className="bar-val-top">3.2tr</div>
                      <div className="bar-fill" style={{ height: "52%" }}></div>
                      <div className="bar-lbl">T2</div>
                    </div>
                    <div className="bar-col">
                      <div className="bar-val-top">2.8tr</div>
                      <div className="bar-fill" style={{ height: "44%" }}></div>
                      <div className="bar-lbl">T3</div>
                    </div>
                    <div className="bar-col">
                      <div className="bar-val-top">4.1tr</div>
                      <div className="bar-fill" style={{ height: "65%" }}></div>
                      <div className="bar-lbl">T4</div>
                    </div>
                    <div className="bar-col">
                      <div className="bar-val-top">3.7tr</div>
                      <div className="bar-fill" style={{ height: "58%" }}></div>
                      <div className="bar-lbl">T5</div>
                    </div>
                    <div className="bar-col">
                      <div className="bar-val-top">5.2tr</div>
                      <div
                        className="bar-fill hi"
                        style={{ height: "84%" }}
                      ></div>
                      <div className="bar-lbl">T6</div>
                    </div>
                    <div className="bar-col">
                      <div className="bar-val-top">5.0tr</div>
                      <div className="bar-fill" style={{ height: "80%" }}></div>
                      <div className="bar-lbl">T7</div>
                    </div>
                    <div className="bar-col">
                      <div className="bar-val-top">4.4tr</div>
                      <div className="bar-fill" style={{ height: "70%" }}></div>
                      <div className="bar-lbl">CN</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent payments */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title">
                    <i className="ti ti-receipt"></i> Thanh toán gần đây
                  </div>
                  <span
                    className="card-action"
                    onClick={() =>
                      navigate("invoices", "Hóa đơn", "Thống kê hóa đơn")
                    }
                  >
                    Xem tất cả <i className="ti ti-arrow-right"></i>
                  </span>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Phòng</th>
                      <th>Khách</th>
                      <th>Số tiền</th>
                      <th>Hình thức</th>
                      <th>TT</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>P.101</td>
                      <td className="td-name">Lê Hoàng C.</td>
                      <td style={{ fontWeight: 600 }}>1.050.000đ</td>
                      <td>
                        <span className="badge badge-green">Tiền mặt</span>
                      </td>
                      <td>
                        <span className="badge badge-green">Xong</span>
                      </td>
                    </tr>
                    <tr>
                      <td>P.104</td>
                      <td className="td-name">Bùi Thị F.</td>
                      <td style={{ fontWeight: 600 }}>700.000đ</td>
                      <td>
                        <span className="badge badge-blue">CK Ngân hàng</span>
                      </td>
                      <td>
                        <span className="badge badge-green">Xong</span>
                      </td>
                    </tr>
                    <tr>
                      <td>P.107</td>
                      <td className="td-name">Đỗ Văn G.</td>
                      <td style={{ fontWeight: 600 }}>500.000đ</td>
                      <td>
                        <span className="badge badge-amber">Thẻ</span>
                      </td>
                      <td>
                        <span className="badge badge-amber">Chờ</span>
                      </td>
                    </tr>
                    <tr>
                      <td>P.110</td>
                      <td className="td-name">Vũ Thị H.</td>
                      <td style={{ fontWeight: 600 }}>1.400.000đ</td>
                      <td>
                        <span className="badge badge-blue">CK Ngân hàng</span>
                      </td>
                      <td>
                        <span className="badge badge-red">Chưa TT</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ══════════ PAGE: ROOMS ══════════ */}
          <div className={`page ${activePage === "rooms" ? "active" : ""}`}>
            <div className="filter-bar">
              <div
                className={`filter-tab ${roomFilter === "all" ? "active" : ""}`}
                onClick={() => setRoomFilter("all")}
              >
                Tất cả (25)
              </div>
              <div
                className={`filter-tab ${
                  roomFilter === "available" ? "active" : ""
                }`}
                onClick={() => setRoomFilter("available")}
              >
                Trống (7)
              </div>
              <div
                className={`filter-tab ${
                  roomFilter === "occupied" ? "active" : ""
                }`}
                onClick={() => setRoomFilter("occupied")}
              >
                Đang thuê (18)
              </div>
              <div
                className={`filter-tab ${
                  roomFilter === "cleaning" ? "active" : ""
                }`}
                onClick={() => setRoomFilter("cleaning")}
              >
                Dọn phòng (3)
              </div>
              <div style={{ marginLeft: "auto" }}>
                <button className="btn btn-primary" onClick={openAddModal}>
                  <i className="ti ti-plus"></i> Thêm phòng
                </button>
              </div>
            </div>

            {/* Placeholder UI content cho các tab chức năng phụ */}
            <div
              className="card"
              style={{
                padding: "30px",
                textAlign: "center",
                color: "var(--text3)",
              }}
            >
              <i
                className="ti ti-door"
                style={{
                  fontSize: "48px",
                  marginBottom: "10px",
                  display: "block",
                  opacity: 0.5,
                }}
              ></i>
              <p>
                Giao diện Quản lý chi tiết cho trang này đã sẵn sàng kết nối dữ
                liệu.
              </p>
            </div>
          </div>

          {/* ══════════ PLACEHOLDER FOR OTHER PAGES ══════════ */}
          {[
            "calendar",
            "checkin",
            "customers",
            "invoices",
            "revenue",
            "reports",
            "settings",
          ].includes(activePage) && (
            <div
              className="card"
              style={{
                padding: "40px",
                textAlign: "center",
                color: "var(--text3)",
              }}
            >
              <i
                className="ti ti-tools"
                style={{
                  fontSize: "48px",
                  marginBottom: "12px",
                  display: "block",
                  opacity: 0.4,
                }}
              ></i>
              <h3>Tính năng {pageHeading}</h3>
              <p style={{ marginTop: "6px", fontSize: "13px" }}>
                Nội dung phân hệ quản lý [{pageBreadcrumb}] đang được đồng bộ.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════ MODAL: ADD NEW ══════════════ */}
      <div className={`modal-backdrop ${isAddModalOpen ? "open" : ""}`}>
        <div className="modal">
          <div className="modal-header">
            <div className="modal-title">Đặt phòng / Tạo giao dịch mới</div>
            <button className="modal-close" onClick={closeAddModal}>
              <i className="ti ti-x"></i>
            </button>
          </div>
          <div className="modal-body">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                closeAddModal();
                showToast("Tạo giao dịch thành công!", "ti-check");
              }}
            >
              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label">Tên khách hàng</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="09xx xxx xxx"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Chọn phòng</label>
                  <select className="form-control">
                    <option>Phòng 102 (Trống)</option>
                    <option>Phòng 105 (Trống)</option>
                    <option>Phòng 109 (Trống)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày đến</label>
                  <input
                    type="date"
                    className="form-control"
                    defaultValue="2026-05-22"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Số đêm lưu trú</label>
                  <input
                    type="number"
                    className="form-control"
                    defaultValue="1"
                    min="1"
                  />
                </div>
              </div>
              <div
                className="modal-footer"
                style={{ padding: "14px 0 0", borderTop: "none" }}
              >
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={closeAddModal}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Xác nhận tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ══════════════ MODAL: ROOM DETAIL ══════════════ */}
      <div className={`modal-backdrop ${isRoomDetailOpen ? "open" : ""}`}>
        <div className="modal">
          <div className="modal-header">
            <div className="modal-title">Chi tiết phòng {selectedRoomId}</div>
            <button className="modal-close" onClick={closeRoomDetail}>
              <i className="ti ti-x"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="room-detail">
              <div className="detail-row">
                <div className="detail-item">
                  <div className="detail-lbl">Trạng thái</div>
                  <div
                    className="detail-val"
                    style={{ color: "var(--accent)" }}
                  >
                    Đang hoạt động
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-lbl">Loại phòng</div>
                  <div className="detail-val">Phòng đơn Standard</div>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-item">
                  <div className="detail-lbl">Khách lưu trú</div>
                  <div className="detail-val">Nguyễn Chí Thanh</div>
                </div>
                <div className="detail-item">
                  <div className="detail-lbl">Giờ Check-in</div>
                  <div className="detail-val">22/05 - 14:00</div>
                </div>
              </div>
            </div>
            <div
              className="modal-footer"
              style={{ padding: "14px 0 0", borderTop: "none" }}
            >
              <button className="btn btn-outline" onClick={closeRoomDetail}>
                Đóng
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  closeRoomDetail();
                  showToast(
                    `Yêu cầu dọn phòng ${selectedRoomId} đã gửi`,
                    "ti-clean"
                  );
                }}
              >
                Dọn phòng
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ TOAST NOTIFICATION ══════════════ */}
      <div className={`toast success ${toast.show ? "show" : ""}`}>
        <i className={toast.icon}></i>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
