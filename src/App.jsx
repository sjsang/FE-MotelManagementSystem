import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import RoomMap from "./pages/RoomMap";
import RoomManagement from "./pages/RoomManagement";
import PriceManagement from "./pages/PriceManagement";
import BookingHistory from "./pages/BookingHistory";
import "./styles/App.css";

export default function App() {
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

          {/* Bottom user section */}
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
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                Quản Trị Viên
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                Administrator
              </div>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<RoomMap />} />
            <Route path="/rooms" element={<RoomManagement />} />
            <Route path="/prices" element={<PriceManagement />} />
            <Route path="/history" element={<BookingHistory />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
