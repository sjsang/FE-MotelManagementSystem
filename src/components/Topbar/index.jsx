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
    <header className="h-14 bg-(--surface) border-b border-(--border) flex items-center px-6 gap-3.5 shrink-0">
      <div>
        <div className="text-[15.5px] font-semibold text-(--text)">
          {heading}
        </div>
        <div className="text-xs text-(--text3) mt-px">
          {breadcrumb}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <i
            className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text3) text-base pointer-events-none"
          />
          <input
            className="search-input"
            type="text"
            placeholder="Tìm kiếm..."
          />
        </div>
        <div className="bg-(--accent-light) text-(--accent-text) text-xs font-medium py-1.25 px-3 rounded-[20px] flex items-center gap-1.5">
          <i className="ti ti-calendar text-[13px]" />
          Thứ 6, 22/05/2026
        </div>
        <div className="relative">
          <button
            onClick={() => showToast("Bạn có 3 thông báo mới", "ti-bell")}
            className="size-8.5 rounded-lg border border-(--border2) bg-white flex items-center justify-center cursor-pointer text-(--text2) text-[17px]"
          >
            <i className="ti ti-bell" />
          </button>
          <span className="notif-dot" />
        </div>
        <button
          onClick={onAddClick}
          className="size-8.5 rounded-lg border border-(--accent) bg-(--accent) flex items-center justify-center cursor-pointer text-white text-[17px]"
        >
          <i className="ti ti-plus" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
