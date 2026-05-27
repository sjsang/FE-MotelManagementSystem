import Badge from "../components/Badge";
import Btn from "../components/Btn";
import Card from "../components/Card";
import CardHeader from "../components/Card/CardHeader";
import StatCard from "../components/Card/StatCard";

const CUSTOMERS = [
  {
    av: "NV",
    name: "Nguyễn Văn A",
    cccd: "079123456789",
    phone: "0901234567",
    addr: "TP. Cần Thơ",
    visits: 5,
    spend: "3.500.000đ",
    badge: "green",
  },
  {
    av: "TT",
    name: "Trần Thị Bình",
    cccd: "048123456789",
    phone: "0912345678",
    addr: "TP. HCM",
    visits: 2,
    spend: "1.400.000đ",
    badge: "blue",
  },
  {
    av: "LH",
    name: "Lê Hoàng Cường",
    cccd: "058987654321",
    phone: "0933456789",
    addr: "Hà Nội",
    visits: 8,
    spend: "7.200.000đ",
    badge: "purple",
  },
  {
    av: "PL",
    name: "Phạm Lan Dương",
    cccd: "012345678901",
    phone: "0944567890",
    addr: "Đà Nẵng",
    visits: 3,
    spend: "2.100.000đ",
    badge: "green",
  },
  {
    av: "HM",
    name: "Hoàng Minh Em",
    cccd: "034567890123",
    phone: "0955678901",
    addr: "Kiên Giang",
    visits: 1,
    spend: "700.000đ",
    badge: "gray",
  },
];

const PageCustomers = ({ showToast }) => (
  <div className="page-content">
    <div className="flex items-center gap-2.5 mb-4 flex-wrap">
      <div className="relative">
        <i
          className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text3) text-base pointer-events-none"
        />
        <input
          className="search-input"
          placeholder="Tìm theo tên, CCCD, SĐT..."
        />
      </div>
      <div className="ml-auto">
        <Btn
          variant="primary"
          onClick={() => showToast("Mở form thêm khách hàng", "ti-user-plus")}
        >
          <i className="ti ti-user-plus" /> Thêm khách hàng
        </Btn>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3.5 mb-5">
      <StatCard
        label="Tổng khách hàng"
        value="248"
        icon="ti-users"
        iconColor="blue"
        changeType="up"
        change={
          <>
            <i className="ti ti-trending-up" /> +12 tháng này
          </>
        }
      />
      <StatCard
        label="Khách thường xuyên"
        value="34"
        icon="ti-star"
        iconColor="purple"
        changeType="neutral"
        change="Hơn 3 lần lưu trú"
      />
      <StatCard
        label="Khách mới tháng này"
        value="18"
        icon="ti-user-plus"
        iconColor="green"
        changeType="up"
        change={
          <>
            <i className="ti ti-trending-up" /> +5 so với tháng trước
          </>
        }
      />
    </div>

    <Card>
      <CardHeader title="Danh sách khách hàng" icon="ti-users" />
      <table className="data-table">
        <thead>
          <tr>
            <th>Khách hàng</th>
            <th>CCCD</th>
            <th>Điện thoại</th>
            <th>Địa chỉ</th>
            <th>Lần lưu trú</th>
            <th>Tổng chi tiêu</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {CUSTOMERS.map((c) => (
            <tr key={c.cccd}>
              <td>
                <div className="flex items-center gap-2.25">
                  <div className="size-8 rounded-full bg-(--accent-light) text-(--accent-text) flex items-center justify-center text-xs font-semibold">
                    {c.av}
                  </div>
                  <span className="td-name">{c.name}</span>
                </div>
              </td>
              <td className="td-muted">{c.cccd}</td>
              <td>{c.phone}</td>
              <td className="td-muted">{c.addr}</td>
              <td>
                <Badge color={c.badge}>{c.visits} lần</Badge>
              </td>
              <td className="font-semibold">{c.spend}</td>
              <td>
                <Btn
                  size="sm"
                  variant="outline"
                  onClick={() => showToast("Xem hồ sơ khách hàng", "ti-user")}
                >
                  <i className="ti ti-eye" />
                </Btn>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

export default PageCustomers;
