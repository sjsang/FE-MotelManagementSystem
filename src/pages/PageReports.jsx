import Btn from "../components/Btn";
import Card from "../components/Card";
import CardHeader from "../components/Card/CardHeader";
import StatCard from "../components/Card/StatCard";

const PageReports = () => (
  <div className="page-content">
    <div className="grid grid-cols-3 gap-[14px] mb-5">
      <StatCard
        label="Tổng lượt khách YTD"
        value="1.284"
        icon="ti-users"
        iconColor="blue"
        changeType="up"
        change="+18% so với 2025"
      />
      <StatCard
        label="Thời gian lưu trú TB"
        value="2,3 đêm"
        icon="ti-clock"
        iconColor="green"
        changeType="neutral"
        change="Từ đầu năm"
      />
      <StatCard
        label="Giá trị đơn TB"
        value="812k"
        icon="ti-coin"
        iconColor="amber"
        changeType="up"
        change="+7% so với 2025"
      />
    </div>
    <Card>
      <CardHeader
        title="Báo cáo tháng 5/2026"
        icon="ti-table"
        action={
          <Btn size="sm" variant="outline">
            <i className="ti ti-download" /> Tải PDF
          </Btn>
        }
      />
      <table className="data-table">
        <thead>
          <tr>
            <th>Chỉ tiêu</th>
            <th>Tháng 4</th>
            <th>Tháng 5</th>
            <th>Tăng/Giảm</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Tổng lượt khách", "217", "248", "+31 (+14%)", "up"],
            [
              "Doanh thu",
              "79.200.000đ",
              "86.400.000đ",
              "+7.200.000đ (+9%)",
              "up",
            ],
            ["Tỉ lệ lấp đầy TB", "68%", "74%", "+6%", "up"],
            ["Thời gian lưu trú TB", "2,1 đêm", "2,3 đêm", "+0.2 đêm", "up"],
            ["Khách hàng mới", "13", "18", "+5 (+38%)", "up"],
            ["Hóa đơn chưa thanh toán", "8", "6", "-2 (cải thiện)", "up"],
          ].map(([lbl, t4, t5, change, ct]) => (
            <tr key={lbl}>
              <td>{lbl}</td>
              <td className="td-muted">{t4}</td>
              <td className="font-medium">{t5}</td>
              <td style={{ color: ct === "up" ? "#0F6E56" : "#A32D2D" }}>
                {change}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

export default PageReports;
