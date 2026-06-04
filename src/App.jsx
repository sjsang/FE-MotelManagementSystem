import React, { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import RoomMap from "./pages/RoomMap";
import RoomManagement from "./pages/RoomManagement";
import PriceManagement from "./pages/PriceManagement";
import BookingHistory from "./pages/BookingHistory";
import CustomerManagement from "./pages/CustomerManagement";
import Auth from "./pages/Auth";
import "./styles/App.css";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-icon">🏨</span>
            <div>
              <div className="brand-name">NHÀ NGHỈ 79</div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.35)",
                  letterSpacing: "0.05em",
                }}
              >
                Hệ thống quản lý
              </div>
            </div>
          </div>
          <nav className="sidebar-nav">
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.25)",
                letterSpacing: "0.1em",
                padding: "8px 12px 4px",
                textTransform: "uppercase",
              }}
            >
              TỔNG QUAN
            </div>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <span className="nav-icon">⊞</span> Sơ đồ phòng
            </NavLink>

            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.25)",
                letterSpacing: "0.1em",
                padding: "12px 12px 4px",
                textTransform: "uppercase",
              }}
            >
              QUẢN LÝ
            </div>
            <NavLink
              to="/rooms"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <span className="nav-icon">🚪</span> Quản lý phòng
            </NavLink>
            <NavLink
              to="/prices"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <span className="nav-icon">💰</span> Bảng giá
            </NavLink>
            <NavLink
              to="/customers"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <span className="nav-icon">👥</span> Khách lưu trú
            </NavLink>

            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.25)",
                letterSpacing: "0.1em",
                padding: "12px 12px 4px",
                textTransform: "uppercase",
              }}
            >
              BÁO CÁO
            </div>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <span className="nav-icon">📋</span> Lịch sử
            </NavLink>
          </nav>

          {/* Bottom user section with logout button */}
          <div
            style={{
              padding: "14px 16px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "var(--sidebar-active-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              QT
            </div>
            <div style={{ flex: 1 }}>
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
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "none",
                width: 32,
                height: 32,
                borderRadius: "8px",
                color: "#f87171",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#dc2626";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                e.currentTarget.style.color = "#f87171";
              }}
            >
              ➔
            </button>
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<RoomMap />} />
            <Route path="/rooms" element={<RoomManagement />} />
            <Route path="/prices" element={<PriceManagement />} />
            <Route path="/customers" element={<CustomerManagement />} />
            <Route path="/history" element={<BookingHistory />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
