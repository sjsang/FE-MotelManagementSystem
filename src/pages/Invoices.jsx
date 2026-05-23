import Badge from "../components/Badge";
import Btn from "../components/Btn";
import Card from "../components/Card";
import CardHeader from "../components/Card/CardHeader";
import StatCard from "../components/Card/StatCard";

const INVOICES = [
  {
    id: "#HĐ-0087",
    room: "P.101",
    guest: "Lê Hoàng Cường",
    date: "22/05/2026",
    amount: "1.050.000đ",
    method: "green",
    methodTxt: "Tiền mặt",
    status: "green",
    statusTxt: "Đã TT",
  },
  {
    id: "#HĐ-0086",
    room: "P.104",
    guest: "Bùi Thị F.",
    date: "22/05/2026",
    amount: "700.000đ",
    method: "blue",
    methodTxt: "Chuyển khoản",
    status: "green",
    statusTxt: "Đã TT",
  },
  {
    id: "#HĐ-0085",
    room: "P.107",
    guest: "Đỗ Văn G.",
    date: "21/05/2026",
    amount: "500.000đ",
    method: "amber",
    methodTxt: "Thẻ",
    status: "amber",
    statusTxt: "Chờ xử lý",
  },
  {
    id: "#HĐ-0084",
    room: "P.110",
    guest: "Vũ Thị H.",
    date: "20/05/2026",
    amount: "1.400.000đ",
    method: "blue",
    methodTxt: "Chuyển khoản",
    status: "red",
    statusTxt: "Chưa TT",
  },
  {
    id: "#HĐ-0083",
    room: "P.103",
    guest: "Trần Thị Bình",
    date: "21/05/2026",
    amount: "700.000đ",
    method: "green",
    methodTxt: "Tiền mặt",
    status: "green",
    statusTxt: "Đã TT",
  },
];

const PageInvoices = ({ onOpenInvoiceDetail, showToast }) => (
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
        label="Tổng hóa đơn tháng này"
        value="87"
        icon="ti-receipt"
        iconColor="blue"
        changeType="up"
        change="+14 so với tháng trước"
      />
      <StatCard
        label="Đã thanh toán"
        value="81"
        icon="ti-check"
        iconColor="green"
        changeType="up"
        change="93% tỉ lệ"
      />
      <StatCard
        label="Chưa thanh toán"
        value="6"
        icon="ti-clock"
        iconColor="red"
        changeType="down"
        change="2 quá hạn"
      />
      <StatCard
        label="Doanh thu tháng này"
        value="86,4tr"
        icon="ti-coin"
        iconColor="amber"
        changeType="up"
        change="+9% so với T4"
      />
    </div>
    <Card>
      <CardHeader
        title="Danh sách hóa đơn"
        icon="ti-receipt"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Btn size="sm" variant="outline">
              <i className="ti ti-download" /> Xuất Excel
            </Btn>
            <Btn
              size="sm"
              variant="primary"
              onClick={() => showToast("Mở form tạo hóa đơn", "ti-plus")}
            >
              <i className="ti ti-plus" /> Tạo hóa đơn
            </Btn>
          </div>
        }
      />
      <table className="data-table">
        <thead>
          <tr>
            <th>Mã HĐ</th>
            <th>Phòng</th>
            <th>Khách hàng</th>
            <th>Ngày tạo</th>
            <th>Số tiền</th>
            <th>Hình thức</th>
            <th>Trạng thái</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {INVOICES.map((inv) => (
            <tr key={inv.id}>
              <td className="td-muted">{inv.id}</td>
              <td className="td-name">{inv.room}</td>
              <td>{inv.guest}</td>
              <td className="td-muted">{inv.date}</td>
              <td style={{ fontWeight: 600 }}>{inv.amount}</td>
              <td>
                <Badge color={inv.method}>{inv.methodTxt}</Badge>
              </td>
              <td>
                <Badge color={inv.status}>{inv.statusTxt}</Badge>
              </td>
              <td>
                {inv.status === "red" ? (
                  <Btn
                    size="sm"
                    variant="primary"
                    onClick={() =>
                      showToast("Gửi nhắc nhở thanh toán", "ti-send")
                    }
                  >
                    <i className="ti ti-send" /> Nhắc
                  </Btn>
                ) : (
                  <Btn
                    size="sm"
                    variant="outline"
                    onClick={onOpenInvoiceDetail}
                  >
                    <i className="ti ti-eye" />
                  </Btn>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

export default PageInvoices;
