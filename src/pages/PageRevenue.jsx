import Card from "../components/Card";
import CardHeader from "../components/Card/CardHeader";
import StatCard from "../components/Card/StatCard";
import BarChart from "../components/Barchar";
const MONTH_BARS = [
  { val: "68tr", pct: 58, lbl: "T1" },
  { val: "72tr", pct: 62, lbl: "T2" },
  { val: "78tr", pct: 67, lbl: "T3" },
  { val: "79tr", pct: 68, lbl: "T4" },
  { val: "86tr", pct: 74, lbl: "T5", hi: true },
  { val: "", pct: 10, lbl: "T6" },
];

const PageRevenue = () => (
  <div className="page-content">
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 14,
        marginBottom: 20,
      }}
    >
      <StatCard
        label="Doanh thu tháng 5"
        value="86,4tr"
        icon="ti-coin"
        iconColor="green"
        changeType="up"
        change={
          <>
            <i className="ti ti-trending-up" /> +9% so với T4
          </>
        }
      />
      <StatCard
        label="Doanh thu quý 2"
        value="238tr"
        icon="ti-chart-bar"
        iconColor="blue"
        changeType="up"
        change={
          <>
            <i className="ti ti-trending-up" /> +15% so với Q1
          </>
        }
      />
      <StatCard
        label="Trung bình/ngày"
        value="2,88tr"
        icon="ti-calendar-stats"
        iconColor="amber"
        changeType="neutral"
        change="Tháng hiện tại"
      />
      <StatCard
        label="Tỉ lệ lấp đầy TB"
        value="74%"
        icon="ti-percentage"
        iconColor="purple"
        changeType="up"
        change={
          <>
            <i className="ti ti-trending-up" /> +6% so với T4
          </>
        }
      />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card>
        <CardHeader title="Doanh thu theo tháng (2026)" icon="ti-chart-bar" />
        <div style={{ padding: "16px 18px" }}>
          <BarChart bars={MONTH_BARS} height={120} />
        </div>
      </Card>
      <Card>
        <CardHeader title="Doanh thu theo loại phòng" icon="ti-chart-pie" />
        <div
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {[
            {
              lbl: "Phòng đôi",
              val: "42.000.000đ",
              pct: 49,
              color: "var(--accent)",
            },
            { lbl: "Phòng đơn", val: "25.000.000đ", pct: 29, color: "#378ADD" },
            { lbl: "VIP Suite", val: "19.400.000đ", pct: 22, color: "#EF9F27" },
          ].map((r) => (
            <div key={r.lbl}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 5,
                  fontSize: 13,
                }}
              >
                <span>{r.lbl}</span>
                <span style={{ fontWeight: 600 }}>
                  {r.val}{" "}
                  <span style={{ color: "var(--text2)" }}>({r.pct}%)</span>
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${r.pct}%`, background: r.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

export default PageRevenue;
