import Badge from "../components/Badge";
import Btn from "../components/Btn";
import Card from "../components/Card";
import CardHeader from "../components/Card/CardHeader";
import FormGroup from "../components/FormGroup";
const PageSettings = ({ showToast }) => (
  <div className="page-content">
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        marginBottom: 16,
      }}
    >
      <Card>
        <CardHeader title="Thông tin nhà nghỉ" icon="ti-building" />
        <div style={{ padding: 18 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div
              style={{
                gridColumn: "1/-1",
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              <label
                style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)" }}
              >
                Tên nhà nghỉ
              </label>
              <input className="form-control" defaultValue="Nhà Nghỉ Bình An" />
            </div>
            <div
              style={{
                gridColumn: "1/-1",
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              <label
                style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)" }}
              >
                Địa chỉ
              </label>
              <input
                className="form-control"
                defaultValue="123 Nguyễn Trãi, Ninh Kiều, Cần Thơ"
              />
            </div>
            <FormGroup label="Điện thoại">
              <input className="form-control" defaultValue="0292 3456789" />
            </FormGroup>
            <FormGroup label="Email">
              <input className="form-control" defaultValue="binhan@gmail.com" />
            </FormGroup>
            <FormGroup label="Giờ check-in">
              <input
                className="form-control"
                type="time"
                defaultValue="14:00"
              />
            </FormGroup>
            <FormGroup label="Giờ check-out">
              <input
                className="form-control"
                type="time"
                defaultValue="12:00"
              />
            </FormGroup>
          </div>
          <div style={{ marginTop: 14 }}>
            <Btn
              variant="primary"
              onClick={() => showToast("Đã lưu thông tin nhà nghỉ", "ti-check")}
            >
              <i className="ti ti-device-floppy" /> Lưu thay đổi
            </Btn>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Tài khoản quản trị" icon="ti-user-cog" />
        <div style={{ padding: 18 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div
              style={{
                gridColumn: "1/-1",
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              <label
                style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)" }}
              >
                Họ tên
              </label>
              <input className="form-control" defaultValue="Quản Trị Viên" />
            </div>
            <FormGroup label="Tên đăng nhập">
              <input className="form-control" defaultValue="admin" />
            </FormGroup>
            <FormGroup label="Email">
              <input className="form-control" defaultValue="admin@binhan.vn" />
            </FormGroup>
            <FormGroup label="Mật khẩu mới">
              <input
                className="form-control"
                type="password"
                placeholder="Để trống nếu không đổi"
              />
            </FormGroup>
            <FormGroup label="Xác nhận mật khẩu">
              <input className="form-control" type="password" placeholder="" />
            </FormGroup>
          </div>
          <div style={{ marginTop: 14 }}>
            <Btn
              variant="primary"
              onClick={() => showToast("Đã cập nhật tài khoản", "ti-check")}
            >
              <i className="ti ti-device-floppy" /> Cập nhật
            </Btn>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Cài đặt giá phòng" icon="ti-coin" />
        <table className="data-table">
          <thead>
            <tr>
              <th>Loại phòng</th>
              <th>Giá/đêm</th>
              <th>Giá theo giờ</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {[
              ["Phòng đơn", "280.000đ", "60.000đ/giờ"],
              ["Phòng đôi", "350.000đ", "80.000đ/giờ"],
              ["VIP Suite", "650.000đ", "120.000đ/giờ"],
            ].map(([lbl, dn, h]) => (
              <tr key={lbl}>
                <td className="td-name">{lbl}</td>
                <td>
                  <input
                    className="form-control"
                    defaultValue={dn}
                    style={{ width: 120, height: 30 }}
                  />
                </td>
                <td>
                  <input
                    className="form-control"
                    defaultValue={h}
                    style={{ width: 120, height: 30 }}
                  />
                </td>
                <td>
                  <Btn
                    size="sm"
                    variant="outline"
                    onClick={() => showToast(`Đã lưu giá ${lbl}`, "ti-check")}
                  >
                    <i className="ti ti-check" />
                  </Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <CardHeader title="Sao lưu dữ liệu" icon="ti-database" />
        <div
          style={{
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {[
            {
              title: "Sao lưu tự động",
              sub: "Mỗi ngày lúc 02:00",
              action: <Badge color="green">Đang bật</Badge>,
            },
            {
              title: "Sao lưu gần nhất",
              sub: "22/05/2026 02:00:14",
              action: (
                <Btn size="sm" variant="outline">
                  <i className="ti ti-download" /> Tải xuống
                </Btn>
              ),
            },
          ].map((b) => (
            <div
              key={b.title}
              style={{
                background: "var(--surface2)",
                borderRadius: "var(--radius)",
                padding: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{b.title}</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>
                  {b.sub}
                </div>
              </div>
              {b.action}
            </div>
          ))}
          <Btn
            variant="primary"
            onClick={() => showToast("Đang sao lưu dữ liệu...", "ti-database")}
          >
            <i className="ti ti-cloud-upload" /> Sao lưu ngay
          </Btn>
        </div>
      </Card>
    </div>
  </div>
);

export default PageSettings;
