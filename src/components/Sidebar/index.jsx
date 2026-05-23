const NAV_GROUPS = [
  {
    label: "Tổng quan",
    items: [
      { id: "dashboard", icon: "ti-layout-dashboard", label: "Dashboard" },
      {
        id: "calendar",
        icon: "ti-calendar",
        label: "Lịch đặt phòng",
        badge: 3,
      },
    ],
  },
  {
    label: "Quản lý",
    items: [
      { id: "rooms", icon: "ti-door", label: "Quản lý phòng" },
      {
        id: "checkin",
        icon: "ti-arrows-exchange",
        label: "Check-in / Out",
        badge: 5,
      },
      { id: "customers", icon: "ti-users", label: "Khách hàng" },
      { id: "invoices", icon: "ti-receipt", label: "Hóa đơn", badge: 2 },
    ],
  },
  {
    label: "Báo cáo",
    items: [
      { id: "revenue", icon: "ti-chart-bar", label: "Doanh thu" },
      { id: "reports", icon: "ti-report-analytics", label: "Thống kê" },
    ],
  },
  {
    label: "Hệ thống",
    items: [{ id: "settings", icon: "ti-settings", label: "Cài đặt" }],
  },
];

const Sidebar = ({ activePage, onNavigate }) => (
  <aside
    style={{
      width: "var(--sidebar-w)",
      background: "var(--sidebar-bg)",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 100,
    }}
  >
    {/* Logo */}
    <div
      style={{
        padding: "20px 18px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          background: "var(--accent)",
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 20,
        }}
      >
        <i className="ti ti-building-cottage" />
      </div>
      <div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 15,
            color: "white",
            lineHeight: 1.2,
          }}
        >
          Nhà Nghỉ Bình An
        </div>
        <div
          style={{
            fontSize: 10.5,
            color: "rgba(255,255,255,0.38)",
            letterSpacing: "0.03em",
          }}
        >
          Hệ thống quản lý
        </div>
      </div>
    </div>

    {/* Nav */}
    <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
      {NAV_GROUPS.map((g) => (
        <div key={g.label}>
          <div
            style={{
              fontSize: 9.5,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.3)",
              padding: "12px 10px 5px",
              fontWeight: 600,
            }}
          >
            {g.label}
          </div>
          {g.items.map((item) => {
            const isActive = activePage === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 8,
                  color: isActive ? "white" : "rgba(255,255,255,0.55)",
                  fontSize: 13.5,
                  cursor: "pointer",
                  marginBottom: 1,
                  transition: "all 0.15s",
                  background: isActive ? "var(--accent)" : "transparent",
                }}
              >
                <i
                  className={`ti ${item.icon}`}
                  style={{ fontSize: 18, width: 22 }}
                />
                {item.label}
                {item.badge && (
                  <span
                    style={{
                      marginLeft: "auto",
                      background: isActive
                        ? "rgba(255,255,255,0.25)"
                        : "rgba(255,255,255,0.14)",
                      color: isActive ? "white" : "rgba(255,255,255,0.65)",
                      fontSize: 10.5,
                      padding: "1px 7px",
                      borderRadius: 20,
                      fontWeight: 500,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </nav>

    {/* User */}
    <div
      style={{
        padding: "12px 10px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          borderRadius: 9,
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 600,
            color: "white",
          }}
        >
          QT
        </div>
        <div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.8)",
              fontWeight: 500,
            }}
          >
            Quản Trị Viên
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            Administrator
          </div>
        </div>
        <i
          className="ti ti-chevron-right"
          style={{
            marginLeft: "auto",
            color: "rgba(255,255,255,0.25)",
            fontSize: 14,
          }}
        />
      </div>
    </div>
  </aside>
);

export default Sidebar;
