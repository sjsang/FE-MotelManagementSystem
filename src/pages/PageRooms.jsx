import { useState } from "react";
import Badge from "../components/Badge";
import Btn from "../components/Btn";
import Card from "../components/Card";
import CardHeader from "../components/Card/CardHeader";

const ROOMS_DATA = [
  {
    num: "P.101",
    type: "Phòng đôi",
    price: "350.000đ",
    status: "occupied",
    guest: "Nguyễn Văn A",
    checkout: "22/05/2026",
  },
  {
    num: "P.102",
    type: "Phòng đơn",
    price: "280.000đ",
    status: "available",
    guest: "—",
    checkout: "—",
  },
  {
    num: "P.103",
    type: "VIP Suite",
    price: "650.000đ",
    status: "occupied",
    guest: "Trần Thị Bình",
    checkout: "24/05/2026",
  },
  {
    num: "P.104",
    type: "Phòng đơn",
    price: "280.000đ",
    status: "cleaning",
    guest: "—",
    checkout: "—",
  },
  {
    num: "P.105",
    type: "Phòng đôi",
    price: "350.000đ",
    status: "available",
    guest: "—",
    checkout: "—",
  },
  {
    num: "P.106",
    type: "Phòng đôi",
    price: "350.000đ",
    status: "occupied",
    guest: "Lê Hoàng Cường",
    checkout: "23/05/2026",
  },
  {
    num: "P.107",
    type: "Phòng đơn",
    price: "280.000đ",
    status: "reserved",
    guest: "Phạm Lan D.",
    checkout: "25/05/2026",
  },
];

const FilterTab = ({ label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`py-1.25 px-3.5 rounded-[20px] text-[12.5px] font-medium cursor-pointer transition-all duration-150 border ${active
      ? "border-(--accent) bg-(--accent) text-white"
      : "border-(--border2) bg-white text-(--text2)"
      }`}
  >
    {label}
  </div>
);

const PageRooms = ({
  onNavigate,
  onOpenRoomDetail,
  onOpenAddRoomModal,
  showToast,
}) => {
  const [filter, setFilter] = useState("all");
  const filtered =
    filter === "all"
      ? ROOMS_DATA
      : ROOMS_DATA.filter((r) => r.status === filter);
  const statusBadge = {
    occupied: ["red", "Đang thuê"],
    available: ["green", "Trống"],
    cleaning: ["amber", "Dọn phòng"],
    reserved: ["blue", "Đã đặt"],
  };
  return (
    <div className="page-content">
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        {[
          ["all", "Tất cả (25)"],
          ["available", "Trống (7)"],
          ["occupied", "Đang thuê (18)"],
          ["cleaning", "Dọn phòng (3)"],
        ].map(([v, l]) => (
          <FilterTab
            key={v}
            label={l}
            active={filter === v}
            onClick={() => setFilter(v)}
          />
        ))}
        <div className="ml-auto">
          <Btn variant="primary" onClick={onOpenAddRoomModal}>
            <i className="ti ti-plus" /> Thêm phòng
          </Btn>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Occupancy Ring */}
        <Card>
          <CardHeader title="Tỉ lệ lấp đầy" icon="ti-chart-donut" />
          <div className="flex items-center gap-4 py-4 px-4.5">
            <svg width="90" height="90" viewBox="0 0 90 90" className="ring">
              <circle className="ring-bg" cx="45" cy="45" r="36" />
              <circle
                className="ring-fill"
                cx="45"
                cy="45"
                r="36"
                strokeDasharray="162 226"
                strokeDashoffset="0"
              />
            </svg>
            <div>
              <div className="text-[28px] font-bold text-(--text) leading-none">
                72%
              </div>
              <div className="text-xs text-(--text3) mt-1">
                Lấp đầy hôm nay
              </div>
              <div className="mt-3 flex flex-col gap-1.5">
                {[
                  ["dot-red", "Đang thuê: 18"],
                  ["dot-green", "Phòng trống: 7"],
                  ["dot-amber", "Đang dọn: 3"],
                  ["dot-blue", "Đã đặt trước: 2"],
                ].map(([cls, lbl]) => (
                  <div
                    key={lbl}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className={`dot ${cls}`} />
                    {lbl}
                  </div>
                ))}
              </div>
            </div>
            <div className="ml-auto flex flex-col gap-2 min-w-30">
              {[
                ["Phòng đơn", "10 phòng"],
                ["Phòng đôi", "10 phòng"],
                ["Phòng VIP", "5 phòng"],
              ].map(([lbl, val]) => (
                <div
                  key={lbl}
                  className="bg-(--surface2) rounded-(--radius) p-3"
                >
                  <div className="text-[11px] text-(--text3) mb-1">
                    {lbl}
                  </div>
                  <div className="text-[13px] font-semibold text-(--text)">
                    {val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader title="Thao tác nhanh" icon="ti-bolt" />
          <div className="p-4 grid grid-cols-2 gap-2.5">
            {[
              {
                icon: "ti-door-enter",
                color: "var(--accent)",
                lbl: "Check-in mới",
                fn: () => onNavigate("checkin"),
              },
              {
                icon: "ti-door-exit",
                color: "#A32D2D",
                lbl: "Check-out",
                fn: () => onNavigate("checkin"),
              },
              {
                icon: "ti-plus",
                color: "#185FA5",
                lbl: "Thêm phòng",
                fn: onOpenAddRoomModal,
              },
              {
                icon: "ti-receipt",
                color: "#854F0B",
                lbl: "Xuất hóa đơn",
                fn: () => onNavigate("invoices"),
              },
            ].map((a) => (
              <button
                key={a.lbl}
                onClick={a.fn}
                className="flex justify-center items-center h-13.5 flex-col gap-0.75 bg-white border border-(--border2) rounded-(--radius) cursor-pointer transition-all duration-150"
              >
                <i
                  className={`ti ${a.icon}`}
                  style={{ fontSize: 20, color: a.color }}
                />
                <span className="text-[11.5px] text-(--text)">
                  {a.lbl}
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Rooms table */}
      <Card className="mt-4">
        <CardHeader
          title="Danh sách phòng"
          icon="ti-list"
          action={
            <div className="relative">
              <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text3) text-base pointer-events-none" />
              <input
                className="search-input w-50"
                type="text"
                placeholder="Tìm phòng..."
              />
            </div>
          }
        />
        <table className="data-table">
          <thead>
            <tr>
              <th>Phòng</th>
              <th>Loại</th>
              <th>Giá/đêm</th>
              <th>Trạng thái</th>
              <th>Khách hiện tại</th>
              <th>Check-out</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const [bc, bl] = statusBadge[r.status];
              return (
                <tr key={r.num}>
                  <td className="td-name">{r.num}</td>
                  <td>{r.type}</td>
                  <td>{r.price}</td>
                  <td>
                    <Badge color={bc}>{bl}</Badge>
                  </td>
                  <td className={r.guest === "—" ? "td-muted" : ""}>
                    {r.guest}
                  </td>
                  <td className="td-muted">{r.checkout}</td>
                  <td>
                    {r.status === "available" ? (
                      <Btn
                        size="sm"
                        variant="primary"
                        onClick={() => onNavigate("checkin")}
                      >
                        <i className="ti ti-door-enter" /> Check-in
                      </Btn>
                    ) : (
                      <Btn
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onOpenRoomDetail(r.num.replace("P.", ""))
                        }
                      >
                        <i className="ti ti-eye" />
                      </Btn>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default PageRooms;
