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
    style={{
      padding: "5px 14px",
      borderRadius: 20,
      fontSize: 12.5,
      fontWeight: 500,
      border: `1px solid ${active ? "var(--accent)" : "var(--border2)"}`,
      background: active ? "var(--accent)" : "white",
      cursor: "pointer",
      color: active ? "white" : "var(--text2)",
      transition: "0.15s",
    }}
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
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
        <div style={{ marginLeft: "auto" }}>
          <Btn variant="primary" onClick={onOpenAddRoomModal}>
            <i className="ti ti-plus" /> Thêm phòng
          </Btn>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 0,
        }}
      >
        {/* Occupancy Ring */}
        <Card>
          <CardHeader title="Tỉ lệ lấp đầy" icon="ti-chart-donut" />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 18px",
            }}
          >
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
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "var(--text)",
                  lineHeight: 1,
                }}
              >
                72%
              </div>
              <div
                style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}
              >
                Lấp đầy hôm nay
              </div>
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {[
                  ["dot-red", "Đang thuê: 18"],
                  ["dot-green", "Phòng trống: 7"],
                  ["dot-amber", "Đang dọn: 3"],
                  ["dot-blue", "Đã đặt trước: 2"],
                ].map(([cls, lbl]) => (
                  <div
                    key={lbl}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                    }}
                  >
                    <span className={`dot ${cls}`} />
                    {lbl}
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                minWidth: 120,
              }}
            >
              {[
                ["Phòng đơn", "10 phòng"],
                ["Phòng đôi", "10 phòng"],
                ["Phòng VIP", "5 phòng"],
              ].map(([lbl, val]) => (
                <div
                  key={lbl}
                  style={{
                    background: "var(--surface2)",
                    borderRadius: "var(--radius)",
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text3)",
                      marginBottom: 4,
                    }}
                  >
                    {lbl}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
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
          <div
            style={{
              padding: 16,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
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
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 54,
                  flexDirection: "column",
                  gap: 3,
                  background: "white",
                  border: "1px solid var(--border2)",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  transition: "0.15s",
                }}
              >
                <i
                  className={`ti ${a.icon}`}
                  style={{ fontSize: 20, color: a.color }}
                />
                <span style={{ fontSize: 11.5, color: "var(--text)" }}>
                  {a.lbl}
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Rooms table */}
      <Card style={{ marginTop: 16 }}>
        <CardHeader
          title="Danh sách phòng"
          icon="ti-list"
          action={
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
                style={{ width: 200 }}
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
