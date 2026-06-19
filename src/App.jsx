import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate } from "react-router-dom";
import RoomMap from "./pages/RoomMap";
import RoomManagement from "./pages/RoomManagement";
import PriceManagement from "./pages/PriceManagement";
import BookingHistory from "./pages/BookingHistory";
import CustomerManagement from "./pages/CustomerManagement";
import Auth from "./pages/Auth";
import "./styles/App.css";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GridViewIcon from "@mui/icons-material/GridView";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Tooltip } from "@mui/material";
import InvoiceHistory from "./pages/Invoice/InvoiceHistory";
import ReportPage from "./pages/Report";
import ReportSubSidebar from "./components/ReportSubSidebar";

// Route đầu tiên của báo cáo — dùng để auto-navigate khi click "Báo cáo"
const FIRST_REPORT_PATH = "/reports/revenue";

const SIDEBAR_FULL = 220;
const SIDEBAR_RAIL = 60;

// ── Inner layout ─────────────────────────────────────────────────────────────
function AppLayout({ handleLogout }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("main-sidebar-collapsed") === "true"; }
    catch { return false; }
  });

  const location = useLocation();
  const navigate = useNavigate();

  const isInReport = location.pathname.startsWith("/reports");

  // Sub-sidebar báo cáo mở khi đang ở route /reports/*
  const reportOpen = isInReport;

  const closeMobile = () => setMobileSidebarOpen(false);

  const toggleCollapse = () => setCollapsed(v => {
    const next = !v;
    try { localStorage.setItem("main-sidebar-collapsed", String(next)); } catch { }
    return next;
  });

  // Click "Báo cáo": navigate thẳng tới trang đầu + đóng mobile sidebar
  const handleReportClick = () => {
    navigate(FIRST_REPORT_PATH);
    closeMobile();
  };

  // Click các nav item khác: đóng mobile sidebar (subsidebar tự đóng vì route thay đổi)
  const handleNavClick = () => {
    closeMobile();
  };

  const sidebarW = collapsed ? SIDEBAR_RAIL : SIDEBAR_FULL;

  const navContent = (
    <>
      {/* Nút collapse — chỉ trên desktop */}
      <div className="sidebar-collapse-btn-wrap">
        <Tooltip title={collapsed ? "Mở rộng" : "Thu gọn"} placement="right" arrow>
          <button className="sidebar-collapse-btn" onClick={toggleCollapse}>
            {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </button>
        </Tooltip>
      </div>

      {/* Brand */}
      <div className="sidebar-brand">
        <span className="brand-icon"><DashboardIcon /></span>
        <span className="brand-name">NHÀ NGHỈ 79</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">TỔNG QUAN</div>

        <Tooltip title={collapsed ? "Sơ đồ phòng" : ""} placement="right" arrow>
          <NavLink
            to="/"
            end
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            onClick={handleNavClick}
          >
            <span className="nav-icon"><GridViewIcon /></span>
            <span className="nav-label">Sơ đồ phòng</span>
          </NavLink>
        </Tooltip>

        <div className="nav-section-label" style={{ paddingTop: 12 }}>QUẢN LÝ</div>

        <Tooltip title={collapsed ? "Quản lý phòng" : ""} placement="right" arrow>
          <NavLink
            to="/rooms"
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            onClick={handleNavClick}
          >
            <span className="nav-icon"><MeetingRoomIcon /></span>
            <span className="nav-label">Quản lý phòng</span>
          </NavLink>
        </Tooltip>

        <Tooltip title={collapsed ? "Bảng giá" : ""} placement="right" arrow>
          <NavLink
            to="/prices"
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            onClick={handleNavClick}
          >
            <span className="nav-icon"><PriceChangeIcon /></span>
            <span className="nav-label">Bảng giá</span>
          </NavLink>
        </Tooltip>

        <Tooltip title={collapsed ? "Khách lưu trú" : ""} placement="right" arrow>
          <NavLink
            to="/customers"
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            onClick={handleNavClick}
          >
            <span className="nav-icon"><PeopleIcon /></span>
            <span className="nav-label">Khách lưu trú</span>
          </NavLink>
        </Tooltip>

        <Tooltip title={collapsed ? "Hóa đơn" : ""} placement="right" arrow>
          <NavLink
            to="/invoices"
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            onClick={handleNavClick}
          >
            <span className="nav-icon"><ReceiptIcon /></span>
            <span className="nav-label">Hóa đơn</span>
          </NavLink>
        </Tooltip>

        <div className="nav-section-label" style={{ paddingTop: 12 }}>BÁO CÁO</div>

        <Tooltip title={collapsed ? "Báo cáo" : ""} placement="right" arrow>
          <button
            className={`nav-item nav-item-btn${isInReport ? " active" : ""}`}
            onClick={handleReportClick}
          >
            <span className="nav-icon"><AssessmentIcon /></span>
            <span className="nav-label">Báo cáo</span>
          </button>
        </Tooltip>
      </nav>

      {/* User footer */}
      <div className="sidebar-user-footer">
        <div className="sidebar-avatar">QT</div>
        <div className="sidebar-user-info">
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Quản Trị Viên</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Administrator</div>
        </div>
        <Tooltip title="Đăng xuất" placement="right" arrow>
          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            ➔
          </button>
        </Tooltip>
      </div>
    </>
  );

  return (
    <div
      className="app-layout"
      style={{ "--sidebar-w": `${sidebarW}px` }}
    >
      {/* ── Mobile top bar ── */}
      <header className="mobile-topbar">
        <button className="hamburger-btn" onClick={() => setMobileSidebarOpen(true)}>
          <MenuIcon />
        </button>
        <div className="mobile-brand">
          <span style={{ opacity: 0.7, display: "flex", alignItems: "center" }}>
            <DashboardIcon fontSize="small" />
          </span>
          <span className="brand-name" style={{ fontSize: 15 }}>NHÀ NGHỈ 79</span>
        </div>
        <div style={{ width: 40 }} />
      </header>

      {/* ── Mobile backdrop ── */}
      {mobileSidebarOpen && <div className="sidebar-backdrop" onClick={closeMobile} />}

      {/* ── Sidebar chính ── */}
      <aside
        className={`sidebar${mobileSidebarOpen ? " sidebar--open" : ""}${collapsed ? " sidebar--collapsed" : ""}`}
      >
        {/* Close button — mobile only */}
        <button className="sidebar-close-btn" onClick={closeMobile}>
          <CloseIcon fontSize="small" />
        </button>

        {navContent}
      </aside>

      {/* ── Report sub-sidebar ── */}
      <ReportSubSidebar
        open={reportOpen}
        onClose={() => navigate("/")}
      />

      {/* ── Main content ── */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<RoomMap />} />
          <Route path="/rooms" element={<RoomManagement />} />
          <Route path="/prices" element={<PriceManagement />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/invoices" element={<InvoiceHistory />} />
          <Route path="/reports/revenue" element={<ReportPage />} />
          <Route path="/reports/history" element={<BookingHistory />} />
        </Routes>
      </main>

      <style>{`
        /* ── Base (desktop) ── */
        .mobile-topbar  { display: none; }
        .sidebar-close-btn { display: none; }
        .sidebar-backdrop  { display: none; }

        /* Collapse button */
        .sidebar-collapse-btn-wrap {
          display: flex;
          justify-content: flex-end;
          padding: 10px 10px 0;
        }
        .sidebar-collapse-btn {
          background: rgba(255,255,255,0.08);
          border: none;
          color: rgba(255,255,255,0.7);
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .sidebar-collapse-btn:hover {
          background: rgba(255,255,255,0.15);
          color: #fff;
        }

        /* Brand */
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px 8px;
          overflow: hidden;
        }
        .brand-icon {
          display: flex;
          align-items: center;
          color: rgba(255,255,255,0.8);
          flex-shrink: 0;
        }
        .brand-name {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.08em;
          white-space: nowrap;
          overflow: hidden;
          transition: opacity 0.2s, max-width 0.25s;
          max-width: 160px;
          opacity: 1;
          
        }

        /* Nav labels — ẩn khi collapsed */
        .nav-label {
          white-space: nowrap;
          overflow: hidden;
          max-width: 160px;
          opacity: 1;
          transition: opacity 0.2s, max-width 0.25s;
          color: #fff;
        }
        .nav-section-label {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.1em;
          padding: 8px 12px 4px;
          text-transform: uppercase;
          white-space: nowrap;
          overflow: hidden;
          max-width: 160px;
          opacity: 1;
          transition: opacity 0.2s, max-width 0.25s;
        }

        /* Collapsed state */
        .sidebar--collapsed .brand-name,
        .sidebar--collapsed .nav-label,
        .sidebar--collapsed .nav-section-label,
        .sidebar--collapsed .sidebar-user-info,
        .sidebar--collapsed .logout-btn {
          max-width: 0;
          opacity: 0;
          pointer-events: none;
        }
        .sidebar--collapsed .sidebar-brand {
          justify-content: center;
          padding: 12px 0 8px;
        }
        .sidebar--collapsed .nav-item {
          justify-content: center;
          padding: 10px 0;
        }
        .sidebar--collapsed .nav-icon {
          margin: 0;
        }
        .sidebar--collapsed .sidebar-user-footer {
          justify-content: center;
          padding: 14px 0;
        }
        .sidebar--collapsed .sidebar-collapse-btn-wrap {
          justify-content: center;
          padding: 10px 0 0;
        }

        /* Nav item màu chữ + icon */
        .nav-item {
          color: rgba(255, 255, 255, 0.75) !important;
        }
        .nav-item:hover {
          color: #fff !important;
          background: rgba(255, 255, 255, 0.08);
        }
        .nav-item.active {
          color: #fff !important;
        }
        .nav-item .nav-icon,
        .nav-item-btn .nav-icon {
          color: rgba(255, 255, 255, 0.75);
        }
        .nav-item:hover .nav-icon,
        .nav-item.active .nav-icon {
          color: #fff;
        }

        /* Nav button variant */
        .nav-item-btn {
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          display: flex;
          align-items: center;
          color: inherit;
          font: inherit;
        }

        /* User footer */
        .sidebar-user-footer {
          padding: 14px 16px;
          border-top: 1px solid rgba(255,255,255,0.07);
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: auto;
          overflow: hidden;
          transition: padding 0.25s;
        }
        .sidebar-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(108,99,255,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }
        .sidebar-user-info {
          flex: 1;
          overflow: hidden;
          max-width: 120px;
          opacity: 1;
          transition: opacity 0.2s, max-width 0.25s;
        }
        .logout-btn {
          background: rgba(239,68,68,0.15);
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          color: #f87171;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: all 0.15s;
          flex-shrink: 0;
          overflow: hidden;
          max-width: 32px;
          opacity: 1;
        }
        .logout-btn:hover {
          background: #dc2626;
          color: #fff;
        }

        /* Desktop sidebar width transition */
        .sidebar {
          transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
          width: var(--sidebar-w, 220px);
          overflow: hidden;
        }

        /* ── Mobile (≤768px) ── */
        @media (max-width: 768px) {
          .app-layout {
            display: flex !important;
            flex-direction: column !important;
          }
          .sidebar-collapse-btn-wrap { display: none; }
          .mobile-topbar {
            display: flex !important;
            align-items: center;
            justify-content: space-between;
            padding: 0 12px;
            height: 52px;
            background: var(--sidebar-bg, #f2f4fc);
            border-bottom: 1px solid rgba(255,255,255,0.07);
            position: sticky;
            top: 0;
            z-index: 100;
            flex-shrink: 0;
          }
          .mobile-brand {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #fff;
          }
          .hamburger-btn {
            background: none;
            border: none;
            color: rgba(255,255,255,0.7);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            transition: background 0.15s;
          }
          .hamburger-btn:hover { background: rgba(255,255,255,0.08); }
          .sidebar-backdrop {
            display: block !important;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.55);
            z-index: 200;
            backdrop-filter: blur(2px);
          }
          .sidebar {
            position: fixed !important;
            top: 0; left: 0;
            height: 100dvh !important;
            width: 260px !important;
            z-index: 300;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.4,0,0.2,1) !important;
            box-shadow: 4px 0 32px rgba(0,0,0,0.5);
          }
          .sidebar.sidebar--open { transform: translateX(0); }
          .sidebar-close-btn {
            display: flex !important;
            position: absolute;
            top: 12px; right: 12px;
            background: rgba(255,255,255,0.08);
            border: none;
            color: rgba(255,255,255,0.6);
            width: 30px; height: 30px;
            border-radius: 6px;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 1;
          }
          .main-content {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const handleAuthSuccess = () => setIsAuthenticated(true);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
    }
  };

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <BrowserRouter>
      <AppLayout handleLogout={handleLogout} />
    </BrowserRouter>
  );
}