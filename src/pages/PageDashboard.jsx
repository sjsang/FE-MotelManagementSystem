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
      className="border border-(--border) rounded-(--radius) py-3 px-2.5 cursor-pointer transition-all duration-150"
      style={{ borderLeft: `3px solid ${borderMap[status]}` }}
    >
      <div className="text-[15px] font-semibold text-(--text) mb-0.75">
        {num}
      </div>
      <div className="text-[10.5px] text-(--text3) mb-2">
        {type}
      </div>
      <StatusPill status={status} />
    </div>
  );
};

const BarChart = ({ bars, height = 90 }) => (
  <div className="flex items-end gap-1.75" style={{ height }}>
    {bars.map((b, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-1">
        <div className="text-[9.5px] text-(--text3)">{b.val}</div>
        <div
          className={`bar-fill${b.hi ? " hi" : ""}`}
          style={{ height: `${b.pct}%` }}
        />
        <div className="text-[10px] text-(--text3)">{b.lbl}</div>
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
    <div className="grid grid-cols-4 gap-3.5 mb-5">
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
    <div className="grid grid-cols-[1fr_340px] gap-4 mb-5">
      <Card>
        <CardHeader
          title="Sơ đồ phòng"
          icon="ti-layout-grid"
          action={
            <span
              className="text-xs text-(--accent) cursor-pointer font-medium"
              onClick={() => onNavigate("rooms")}
            >
              <i className="ti ti-arrow-right" /> Xem tất cả
            </span>
          }
        />
        <div className="grid grid-cols-5 gap-2.5 p-4">
          {DASHBOARD_ROOMS.map((r) => (
            <RoomTile key={r.num} {...r} onOpen={onOpenRoomDetail} />
          ))}
        </div>
        <div className="pt-2.5 px-4 pb-3.5 flex gap-4 border-t border-(--border)">
          {[
            { cls: "dot-red", lbl: "Đang thuê (18)" },
            { cls: "dot-green", lbl: "Trống (7)" },
            { cls: "dot-amber", lbl: "Dọn phòng (3)" },
            { cls: "dot-blue", lbl: "Đã đặt (2)" },
          ].map((d) => (
            <span
              key={d.lbl}
              className="text-xs flex items-center gap-1.25 text-(--text2)"
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
        <ul className="list-none">
          {TODAY_SCHEDULE.map((s) => (
            <li key={s.name} className="ci-item">
              <div className="size-9 rounded-full bg-(--accent-light) text-(--accent-text) flex items-center justify-center text-[13px] font-semibold shrink-0">
                {s.av}
              </div>
              <div>
                <div className="text-[13.5px] font-medium">{s.name}</div>
                <div className="text-[11.5px] text-(--text2) mt-0.5">
                  {s.sub}
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs text-(--text3) mb-0.75">
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
    <div className="grid grid-cols-2 gap-4 mb-5">
      <Card>
        <CardHeader
          title="Doanh thu 7 ngày"
          icon="ti-chart-bar"
          action={
            <span
              className="text-xs text-(--accent) cursor-pointer font-medium"
              onClick={() => onNavigate("revenue")}
            >
              Xem chi tiết <i className="ti ti-arrow-right" />
            </span>
          }
        />
        <div className="py-4 px-4.5">
          <div className="flex justify-between text-xs mb-3">
            <div>
              Tuần này:{" "}
              <strong className="text-lg text-(--text)">
                28.400.000đ
              </strong>
            </div>
            <span className="text-[#0F6E56] text-xs">
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
              className="text-xs text-(--accent) cursor-pointer font-medium"
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
              <td className="font-semibold">1.050.000đ</td>
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
              <td className="font-semibold">700.000đ</td>
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
              <td className="font-semibold">500.000đ</td>
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
              <td className="font-semibold">1.400.000đ</td>
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
