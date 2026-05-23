import Badge from "../components/Badge";
import Card from "../components/Card";
import CardHeader from "../components/Card/CardHeader";
import StatCard from "../components/Card/StatCard";
import StatusPill from "../components/StatusPill";

const RoomTile = ({ num, type, status, onOpen }) => {
  const borderMap = {
    occupied: "#E24B4A",
    available: "#1D9E75",
    cleaning: "#EF9F27",
    reserved: "#378ADD",
  };
  return (
    <div
      onClick={() => onOpen(num)}
      style={{
        border: `1px solid var(--border)`,
        borderLeft: `3px solid ${borderMap[status]}`,
        borderRadius: "var(--radius)",
        padding: "12px 10px",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "var(--text)",
          marginBottom: 3,
        }}
      >
        {num}
      </div>
      <div style={{ fontSize: 10.5, color: "var(--text3)", marginBottom: 8 }}>
        {type}
      </div>
      <StatusPill status={status} />
    </div>
  );
};

const BarChart = ({ bars, height = 90 }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height }}>
    {bars.map((b, i) => (
      <div
        key={i}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <div style={{ fontSize: 9.5, color: "var(--text3)" }}>{b.val}</div>
        <div
          className={`bar-fill${b.hi ? " hi" : ""}`}
          style={{ height: `${b.pct}%` }}
        />
        <div style={{ fontSize: 10, color: "var(--text3)" }}>{b.lbl}</div>
      </div>
    ))}
  </div>
);

const WEEK_BARS = [
  { val: "3.2tr", pct: 52, lbl: "T2" },
  { val: "2.8tr", pct: 44, lbl: "T3" },
  { val: "4.1tr", pct: 65, lbl: "T4" },
  { val: "3.7tr", pct: 58, lbl: "T5" },
  { val: "5.2tr", pct: 84, lbl: "T6", hi: true },
  { val: "5.0tr", pct: 80, lbl: "T7" },
  { val: "4.4tr", pct: 70, lbl: "CN" },
];

const DASHBOARD_ROOMS = [
  { num: "101", type: "Phòng đơn", status: "occupied" },
  { num: "102", type: "Phòng đôi", status: "available" },
  { num: "103", type: "Phòng VIP", status: "occupied" },
  { num: "104", type: "Phòng đơn", status: "cleaning" },
  { num: "105", type: "Phòng đôi", status: "available" },
  { num: "106", type: "Phòng đôi", status: "occupied" },
  { num: "107", type: "Phòng đơn", status: "reserved" },
  { num: "108", type: "Phòng VIP", status: "occupied" },
  { num: "109", type: "Phòng đôi", status: "available" },
  { num: "110", type: "Phòng đơn", status: "cleaning" },
];

const TODAY_SCHEDULE = [
  {
    av: "NV",
    name: "Nguyễn Văn A",
    sub: "P.102 · 1 đêm · 350.000đ",
    time: "08:30",
    badge: "green",
    badgeTxt: "Check-in",
  },
  {
    av: "TT",
    name: "Trần Thị Bình",
    sub: "P.105 · 2 đêm · 700.000đ",
    time: "09:00",
    badge: "blue",
    badgeTxt: "Đặt trước",
  },
  {
    av: "LH",
    name: "Lê Hoàng Cường",
    sub: "P.101 · 3 đêm · 1.050.000đ",
    time: "11:00",
    badge: "red",
    badgeTxt: "Check-out",
  },
  {
    av: "PL",
    name: "Phạm Lan Dương",
    sub: "P.103 · 1 đêm · 500.000đ",
    time: "14:00",
    badge: "green",
    badgeTxt: "Check-in",
  },
  {
    av: "HM",
    name: "Hoàng Minh Em",
    sub: "P.106 · 2 đêm · 700.000đ",
    time: "16:30",
    badge: "red",
    badgeTxt: "Check-out",
  },
];

const PageDashboard = ({
  onNavigate,
  onOpenRoomDetail,
  onOpenAddRoomModal,
  showToast,
}) => (
  <div className="page-content">
    {/* Stats */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 14,
        marginBottom: 20,
      }}
    >
      <StatCard
        label="Phòng đang thuê"
        value="18"
        icon="ti-door-enter"
        iconColor="green"
        changeType="up"
        change={
          <>
            <i className="ti ti-trending-up" /> +3 so với hôm qua
          </>
        }
      />
      <StatCard
        label="Doanh thu hôm nay"
        value="4,2tr"
        icon="ti-coin"
        iconColor="blue"
        changeType="up"
        change={
          <>
            <i className="ti ti-trending-up" /> +12% tuần này
          </>
        }
      />
      <StatCard
        label="Phòng trống"
        value="7"
        icon="ti-home"
        iconColor="amber"
        changeType="neutral"
        change="Tổng 25 phòng · 72% lấp đầy"
      />
      <StatCard
        label="Check-out hôm nay"
        value="5"
        icon="ti-door-exit"
        iconColor="red"
        changeType="down"
        change={
          <>
            <i className="ti ti-alert-circle" /> 2 chưa thanh toán
          </>
        }
      />
    </div>

    {/* Room map + Today schedule */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 340px",
        gap: 16,
        marginBottom: 20,
      }}
    >
      <Card>
        <CardHeader
          title="Sơ đồ phòng"
          icon="ti-layout-grid"
          action={
            <span
              style={{
                fontSize: 12,
                color: "var(--accent)",
                cursor: "pointer",
                fontWeight: 500,
              }}
              onClick={() => onNavigate("rooms")}
            >
              <i className="ti ti-arrow-right" /> Xem tất cả
            </span>
          }
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5,1fr)",
            gap: 10,
            padding: 16,
          }}
        >
          {DASHBOARD_ROOMS.map((r) => (
            <RoomTile key={r.num} {...r} onOpen={onOpenRoomDetail} />
          ))}
        </div>
        <div
          style={{
            padding: "10px 18px 14px",
            display: "flex",
            gap: 16,
            borderTop: "1px solid var(--border)",
          }}
        >
          {[
            { cls: "dot-red", lbl: "Đang thuê (18)" },
            { cls: "dot-green", lbl: "Trống (7)" },
            { cls: "dot-amber", lbl: "Dọn phòng (3)" },
            { cls: "dot-blue", lbl: "Đã đặt (2)" },
          ].map((d) => (
            <span
              key={d.lbl}
              style={{
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 5,
                color: "var(--text2)",
              }}
            >
              <span className={`dot ${d.cls}`} />
              {d.lbl}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Lịch hôm nay"
          icon="ti-clock"
          action={<Badge color="green">5 lượt</Badge>}
        />
        <ul style={{ listStyle: "none" }}>
          {TODAY_SCHEDULE.map((s) => (
            <li key={s.name} className="ci-item">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--accent-light)",
                  color: "var(--accent-text)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {s.av}
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{s.name}</div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--text2)",
                    marginTop: 2,
                  }}
                >
                  {s.sub}
                </div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text3)",
                    marginBottom: 3,
                  }}
                >
                  {s.time}
                </div>
                <Badge color={s.badge}>{s.badgeTxt}</Badge>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>

    {/* Revenue chart + Recent payments */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        marginBottom: 20,
      }}
    >
      <Card>
        <CardHeader
          title="Doanh thu 7 ngày"
          icon="ti-chart-bar"
          action={
            <span
              style={{
                fontSize: 12,
                color: "var(--accent)",
                cursor: "pointer",
                fontWeight: 500,
              }}
              onClick={() => onNavigate("revenue")}
            >
              Xem chi tiết <i className="ti ti-arrow-right" />
            </span>
          }
        />
        <div style={{ padding: "16px 18px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            <div>
              Tuần này:{" "}
              <strong style={{ fontSize: 18, color: "var(--text)" }}>
                28.400.000đ
              </strong>
            </div>
            <span style={{ color: "#0F6E56", fontSize: 12 }}>
              <i className="ti ti-trending-up" /> +8% so với tuần trước
            </span>
          </div>
          <BarChart bars={WEEK_BARS} />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Thanh toán gần đây"
          icon="ti-receipt"
          action={
            <span
              style={{
                fontSize: 12,
                color: "var(--accent)",
                cursor: "pointer",
                fontWeight: 500,
              }}
              onClick={() => onNavigate("invoices")}
            >
              Xem tất cả <i className="ti ti-arrow-right" />
            </span>
          }
        />
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
                <Badge color="green">Tiền mặt</Badge>
              </td>
              <td>
                <Badge color="green">Xong</Badge>
              </td>
            </tr>
            <tr>
              <td>P.104</td>
              <td className="td-name">Bùi Thị F.</td>
              <td style={{ fontWeight: 600 }}>700.000đ</td>
              <td>
                <Badge color="blue">CK Ngân hàng</Badge>
              </td>
              <td>
                <Badge color="green">Xong</Badge>
              </td>
            </tr>
            <tr>
              <td>P.107</td>
              <td className="td-name">Đỗ Văn G.</td>
              <td style={{ fontWeight: 600 }}>500.000đ</td>
              <td>
                <Badge color="amber">Thẻ</Badge>
              </td>
              <td>
                <Badge color="amber">Chờ</Badge>
              </td>
            </tr>
            <tr>
              <td>P.110</td>
              <td className="td-name">Vũ Thị H.</td>
              <td style={{ fontWeight: 600 }}>1.400.000đ</td>
              <td>
                <Badge color="blue">CK Ngân hàng</Badge>
              </td>
              <td>
                <Badge color="red">Chưa TT</Badge>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  </div>
);

export default PageDashboard;
