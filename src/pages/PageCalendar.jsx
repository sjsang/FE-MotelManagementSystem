import Btn from "../components/Btn";
import Card from "../components/Card";
import CardHeader from "../components/Card/CardHeader";
import Badge from "../components/Badge";
const PageCalendar = ({ showToast }) => {
  const booked = [19, 20, 21, 22, 23, 24, 25, 26];
  const checkout = [22, 23];
  const today = 22;
  const days = [];
  for (let i = 0; i < 4; i++) days.push(null);
  for (let d = 1; d <= 31; d++) days.push(d);

  return (
    <div className="page-content">
      <Card>
        <CardHeader
          title="Lịch đặt phòng — Tháng 5/2026"
          icon="ti-calendar"
          action={
            <div style={{ display: "flex", gap: 8 }}>
              <Btn size="sm" variant="outline">
                <i className="ti ti-chevron-left" /> Tháng trước
              </Btn>
              <Btn size="sm" variant="outline">
                Tháng sau <i className="ti ti-chevron-right" />
              </Btn>
            </div>
          }
        />
        <div style={{ padding: 16 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7,1fr)",
              gap: 4,
              marginBottom: 4,
            }}
          >
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text3)",
                  padding: "8px 0",
                }}
              >
                {d}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7,1fr)",
              gap: 4,
            }}
          >
            {days.map((d, i) => {
              if (!d) return <div key={`empty-${i}`} />;
              const isToday = d === today;
              const isCO = checkout.includes(d);
              const isBk = booked.includes(d);
              let bg = "white",
                col = "var(--text)",
                border = "1px solid var(--border)";
              if (isToday) {
                bg = "var(--accent)";
                col = "white";
                border = "1px solid var(--accent)";
              } else if (isCO) {
                bg = "#FCEBEB";
                col = "#A32D2D";
                border = "1px solid #F7C1C1";
              } else if (isBk) {
                bg = "#E1F5EE";
                col = "#0F6E56";
                border = "1px solid #9FE1CB";
              }
              return (
                <div
                  key={d}
                  onClick={() => showToast(`Ngày ${d}/5/2026`, "ti-calendar")}
                  style={{
                    background: bg,
                    color: col,
                    border,
                    borderRadius: 7,
                    padding: "8px 4px",
                    textAlign: "center",
                    fontSize: 13,
                    fontWeight: isToday ? 700 : 500,
                    cursor: "pointer",
                  }}
                >
                  {d}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <CardHeader title="Đặt phòng trong tháng" icon="ti-list" />
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã đặt</th>
              <th>Khách</th>
              <th>Phòng</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="td-muted">#DP-041</td>
              <td className="td-name">Nguyễn Văn A</td>
              <td>P.102</td>
              <td className="td-muted">22/05</td>
              <td className="td-muted">23/05</td>
              <td>
                <Badge color="green">Đã check-in</Badge>
              </td>
            </tr>
            <tr>
              <td className="td-muted">#DP-042</td>
              <td className="td-name">Trần Thị Bình</td>
              <td>P.105</td>
              <td className="td-muted">24/05</td>
              <td className="td-muted">26/05</td>
              <td>
                <Badge color="blue">Đã xác nhận</Badge>
              </td>
            </tr>
            <tr>
              <td className="td-muted">#DP-043</td>
              <td className="td-name">Phạm Quốc C</td>
              <td>P.108</td>
              <td className="td-muted">25/05</td>
              <td className="td-muted">27/05</td>
              <td>
                <Badge color="amber">Chờ xác nhận</Badge>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default PageCalendar;
