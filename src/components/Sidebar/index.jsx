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
  <aside className="w-(--sidebar-w) bg-(--sidebar-bg) flex flex-col h-screen fixed left-0 top-0 z-100">
    <div className="px-4 py-5 border-b border-gray-700 flex items-center gap-3">
      <div className="size-9.5 bg-(--accent) rounded-[10px] flex items-center justify-center text-white text-[20px]">
        <i className="ti ti-building-cottage" />
      </div>
      <div>
        <div className="text-[15px] text-white leading-[1.2]">
          Nhà Nghỉ 79
        </div>
        <div className="text-[10.5px] text-[rgba(255,255,255,0.38)] tracking-[0.03em]">
          Hệ thống quản lý
        </div>
      </div>
    </div>

    {/* Nav */}
    <nav className="flex-1 py-3.5 px-2.5 overflow-y-auto">
      {NAV_GROUPS.map((g) => (
        <div key={g.label}>
          <div className="text-[9.5px] uppercase tracking-widest text-[rgba(255,255,255,0.3)] pt-3 px-2.5 pb-1.25 font-semibold">
            {g.label}
          </div>
          {g.items.map((item) => {
            const isActive = activePage === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2.5 py-2.25 px-3 rounded-lg text-[13.5px] cursor-pointer mb-px transition-all duration-150 ${isActive ? "text-white bg-(--accent)" : "text-[rgba(255,255,255,0.55)] bg-transparent"}`}
              >
                <i className={`ti ${item.icon} text-[18px] w-5.5`} />
                {item.label}
                {item.badge && (
                  <span
                    className={`ml-auto text-[10.5px] py-px px-1.75 rounded-[20px] font-medium ${isActive ? "bg-[rgba(255,255,255,0.25)] text-white" : "bg-[rgba(255,255,255,0.14)] text-[rgba(255,255,255,0.65)]"}`}
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
    <div className="py-3 px-2.5 border-t border-[rgba(255,255,255,0.07)]">
      <div className="flex items-center gap-2.5 py-2.5 px-3 rounded-[9px] cursor-pointer">
        <div className="size-8 rounded-full bg-(--accent) flex items-center justify-center text-xs font-semibold text-white">
          QT
        </div>
        <div>
          <div className="text-[13px] text-[rgba(255,255,255,0.8)] font-medium">
            Quản Trị Viên
          </div>
          <div className="text-[11px] text-[rgba(255,255,255,0.35)]">
            Administrator
          </div>
        </div>
        <i className="ti ti-chevron-right ml-auto text-[rgba(255,255,255,0.25)] text-sm" />
      </div>
    </div>
  </aside>
);

export default Sidebar;
