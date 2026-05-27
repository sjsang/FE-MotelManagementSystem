import Badge from "../components/Badge";
import Btn from "../components/Btn";
import Card from "../components/Card";
import CardHeader from "../components/Card/CardHeader";
import FormGroup from "../components/FormGroup";
const PageSettings = ({ showToast }) => (
  <div className="page-content">
    <div className="grid grid-cols-2 gap-4 mb-4">
      <Card>
        <CardHeader title="Thông tin nhà nghỉ" icon="ti-building" />
        <div className="p-4.5">
          <div className="grid grid-cols-2 gap-3.5">
            <div
              className="col-span-full flex flex-col gap-1.25"
            >
              <label className="text-xs font-semibold text-(--text2)">
                Tên nhà nghỉ
              </label>
              <input className="form-control" defaultValue="Nhà Nghỉ Bình An" />
            </div>
            <div className="col-span-full flex flex-col gap-1.25">
              <label className="text-xs font-semibold text-(--text2)">
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
          <div className="mt-3.5">
            <Btn
              variant="primary"
              onClick={() => showToast("Đã lưu thông tin nhà nghỉ", "ti-check")}>
              <i className="ti ti-device-floppy" /> Lưu thay đổi
            </Btn>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Tài khoản quản trị" icon="ti-user-cog" />
        <div className="p-4.5">
          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-full flex flex-col gap-1.25">
              <label className="text-xs font-semibold text-(--text2)">
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
          <div className="mt-3.5">
            <Btn
              variant="primary"
              onClick={() => showToast("Đã cập nhật tài khoản", "ti-check")}>
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
                    className="form-control w-30 h-7.5"
                    defaultValue={dn}
                  />
                </td>
                <td>
                  <input
                    className="form-control w-30 h-7.5"
                    defaultValue={h}
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
        <div className="p-4.5 flex flex-col gap-3">
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
              className="bg-(--surface2) rounded-(--radius) p-3.5 flex justify-between items-center"
            >
              <div>
                <div className="text-[13px] font-medium">{b.title}</div>
                <div className="text-xs text-(--text3)">
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
