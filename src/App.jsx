import React, { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
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
import HistoryIcon from "@mui/icons-material/History";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Revenue from "./pages/Revenue";
import InvoiceHistory from "./pages/Invoice/InvoiceHistory";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleAuthSuccess = () => setIsAuthenticated(true);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  const navItems = (
    <nav className="sidebar-nav">
      <div className="nav-section-label">TỔNG QUAN</div>
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
        onClick={closeSidebar}
      >
        <span className="nav-icon">
          <GridViewIcon />
        </span>
        <span className="nav-label">Sơ đồ phòng</span>
      </NavLink>

      <div className="nav-section-label" style={{ paddingTop: 12 }}>
        QUẢN LÝ
      </div>
      <NavLink
        to="/rooms"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
        onClick={closeSidebar}
      >
        <span className="nav-icon">
          <MeetingRoomIcon />
        </span>
        <span className="nav-label">Quản lý phòng</span>
      </NavLink>
      <NavLink
        to="/prices"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
        onClick={closeSidebar}
      >
        <span className="nav-icon">
          <PriceChangeIcon />
        </span>
        <span className="nav-label">Bảng giá</span>
      </NavLink>
      <NavLink
        to="/customers"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
        onClick={closeSidebar}
      >
        <span className="nav-icon">
          <PeopleIcon />
        </span>
        <span className="nav-label">Khách lưu trú</span>
      </NavLink>
      <NavLink
        to="/invoices"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
        onClick={closeSidebar}
      >
        <span className="nav-icon">
          <ReceiptIcon />
        </span>
        <span className="nav-label">Hóa đơn</span>
      </NavLink>

      <div className="nav-section-label" style={{ paddingTop: 12 }}>
        BÁO CÁO
      </div>
      <NavLink
        to="/history"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
        onClick={closeSidebar}
      >
        <span className="nav-icon">
          <HistoryIcon />
        </span>
        <span className="nav-label">Lịch sử</span>
      </NavLink>
      <NavLink
        to="/revenue"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
        onClick={closeSidebar}
      >
        <span className="nav-icon">
          <RequestQuoteIcon />
        </span>
        <span className="nav-label">Doanh thu</span>
      </NavLink>
    </nav>
  );

  const userFooter = (
    <div className="sidebar-user-footer">
      <div className="sidebar-avatar">QT</div>
      <div className="sidebar-user-info" style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
          Quản Trị Viên
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
          Administrator
        </div>
      </div>
      <button
        onClick={handleLogout}
        title="Đăng xuất"
        className="logout-btn"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#dc2626";
          e.currentTarget.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(239,68,68,0.15)";
          e.currentTarget.style.color = "#f87171";
        }}
      >
        ➔
      </button>
    </div>
  );

  return (
    <BrowserRouter>
      <div className="app-layout">
        {/* ── Mobile top bar ── */}
        <header className="mobile-topbar">
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon />
          </button>
          <div className="mobile-brand">
            <span
              style={{ opacity: 0.7, display: "flex", alignItems: "center" }}
            >
              <DashboardIcon fontSize="small" />
            </span>
            <span className="brand-name" style={{ fontSize: 15 }}>
              NHÀ NGHỈ 79
            </span>
          </div>
          <div style={{ width: 40 }} />
        </header>

        {/* ── Mobile overlay backdrop ── */}
        {sidebarOpen && (
          <div className="sidebar-backdrop" onClick={closeSidebar} />
        )}

        {/* ── Sidebar ── */}
        <aside className={`sidebar${sidebarOpen ? " sidebar--open" : ""}`}>
          {/* Close button (mobile only) */}
          <button className="sidebar-close-btn" onClick={closeSidebar}>
            <CloseIcon fontSize="small" />
          </button>

          <div className="sidebar-brand">
            <span className="brand-icon">
              <DashboardIcon />
            </span>
            <div>
              <div className="brand-name">NHÀ NGHỈ 79</div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.35)",
                  letterSpacing: "0.05em",
                }}
              ></div>
            </div>
          </div>

          {navItems}
          {userFooter}
        </aside>

        {/* ── Main content ── */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<RoomMap />} />
            <Route path="/rooms" element={<RoomManagement />} />
            <Route path="/prices" element={<PriceManagement />} />
            <Route path="/customers" element={<CustomerManagement />} />
            <Route path="/history" element={<BookingHistory />} />
            <Route path="/invoices" element={<InvoiceHistory />} />
            <Route path="/revenue" element={<Revenue />} />
          </Routes>
        </main>
      </div>

      <style>{`
        /* Mobile topbar — hidden on desktop */
        .mobile-topbar {
          display: none;
        }

        /* Sidebar close button — hidden on desktop */
        .sidebar-close-btn {
          display: none;
        }

        /* Backdrop — hidden on desktop */
        .sidebar-backdrop {
          display: none;
        }

        /* Nav section label utility */
        .nav-section-label {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.1em;
          padding: 8px 12px 4px;
          text-transform: uppercase;
        }

        /* Nav label — text next to icon, toggled by tablet rail */
        .nav-label {
          white-space: nowrap;
          overflow: hidden;
        }

        /* User footer */
        .sidebar-user-footer {
          padding: 14px 16px;
          border-top: 1px solid rgba(255,255,255,0.07);
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: auto;
        }
        .sidebar-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--sidebar-active-bg, rgba(108,99,255,0.4));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
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
        }

        /* ── Tablet (≤1024px): collapse sidebar to icon-only rail ── */
        @media (max-width: 1024px) and (min-width: 769px) {
          .app-layout {
            grid-template-columns: 60px 1fr !important;
          }
          .sidebar {
            width: 60px !important;
            overflow: hidden;
          }

          /* Hide all text/label elements — keep only icons */
          .nav-label,
          .nav-section-label,
          .sidebar-brand .brand-name,
          .sidebar-brand > div:last-child,
          .sidebar-user-info,
          .logout-btn {
            display: none !important;
          }

          /* Center brand icon */
          .sidebar-brand {
            justify-content: center !important;
            padding: 16px 0 !important;
          }

          /* Center each nav item, icon only */
          .nav-item {
            justify-content: center !important;
            padding: 12px 0 !important;
          }
          .nav-icon {
            margin: 0 !important;
          }

          /* Center avatar in footer */
          .sidebar-user-footer {
            justify-content: center !important;
            padding: 14px 0 !important;
          }
          .sidebar-avatar {
            width: 30px;
            height: 30px;
            font-size: 12px;
          }
        }

        /* ── Mobile (≤768px): drawer sidebar ── */
        @media (max-width: 768px) {
          .app-layout {
            display: flex !important;
            flex-direction: column !important;
          }

          /* Topbar visible */
          .mobile-topbar {
            display: flex !important;
            align-items: center;
            justify-content: space-between;
            padding: 0 12px;
            height: 52px;
            background: var(--sidebar-bg, #151726);
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
          .hamburger-btn:hover {
            background: rgba(255,255,255,0.08);
          }

          /* Backdrop */
          .sidebar-backdrop {
            display: block !important;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.55);
            z-index: 200;
            backdrop-filter: blur(2px);
          }

          /* Sidebar as off-canvas drawer */
          .sidebar {
            position: fixed !important;
            top: 0;
            left: 0;
            height: 100dvh !important;
            width: 260px !important;
            z-index: 300;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 4px 0 32px rgba(0,0,0,0.5);
          }
          .sidebar.sidebar--open {
            transform: translateX(0);
          }

          /* Close button visible */
          .sidebar-close-btn {
            display: flex !important;
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(255,255,255,0.08);
            border: none;
            color: rgba(255,255,255,0.6);
            width: 30px;
            height: 30px;
            border-radius: 6px;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 1;
          }

          /* Main takes remaining space */
          .main-content {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            padding: 16px !important;
          }
        }
      `}</style>
    </BrowserRouter>
  );
}
