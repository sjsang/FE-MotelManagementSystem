import { useState } from "react";
import Btn from "../components/Btn";
import Card from "../components/Card";
import CardHeader from "../components/Card/CardHeader";
import FormGroup from "../components/FormGroup";
import Badge from "../components/Badge";

const STAYING = [
  { room: "P.101", name: "Nguyễn Văn A", ci: "19/05", co: "22/05" },
  { room: "P.103", name: "Trần Thị Bình", ci: "21/05", co: "24/05" },
  { room: "P.106", name: "Lê Hoàng Cường", ci: "20/05", co: "23/05" },
  { room: "P.108", name: "Phạm Lan Dương", ci: "22/05", co: "25/05" },
  { room: "P.110", name: "Hoàng Minh Em", ci: "20/05", co: "22/05" },
];

const ROOM_PRICES = { 102: 280000, 105: 350000, 108: 650000, 109: 350000 };

const PageCheckin = ({ showToast }) => {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [room, setRoom] = useState("");
  const [nights, setNights] = useState(1);
  const total = room ? (ROOM_PRICES[room] || 0) * nights : 0;
  const fmtTotal = total > 0 ? total.toLocaleString("vi-VN") + "đ" : "0đ";

  const doCheckin = () => {
    if (!name.trim() || !room) {
      showToast("Vui lòng điền đầy đủ thông tin!", "ti-alert-circle");
      return;
    }
    showToast("Check-in thành công: " + name, "ti-check");
    setName("");
    setId("");
    setRoom("");
    setNights(1);
  };

  return (
    <div className="page-content">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Check-in form */}
        <Card>
          <CardHeader title="Làm thủ tục Check-in" icon="ti-door-enter" />
          <div style={{ padding: 18 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <FormGroup label="Họ và tên khách *">
                <input
                  className="form-control"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormGroup>
              <FormGroup label="CCCD / CMND *">
                <input
                  className="form-control"
                  placeholder="0123456789"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
              </FormGroup>
              <FormGroup label="Số điện thoại">
                <input className="form-control" placeholder="0901234567" />
              </FormGroup>
              <FormGroup label="Địa chỉ">
                <input className="form-control" placeholder="TP. Cần Thơ" />
              </FormGroup>
              <FormGroup label="Chọn phòng *">
                <select
                  className="form-control"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                >
                  <option value="">— Chọn phòng —</option>
                  <option value="102">P.102 — Phòng đơn — 280.000đ/đêm</option>
                  <option value="105">P.105 — Phòng đôi — 350.000đ/đêm</option>
                  <option value="108">P.108 — VIP Suite — 650.000đ/đêm</option>
                  <option value="109">P.109 — Phòng đôi — 350.000đ/đêm</option>
                </select>
              </FormGroup>
              <FormGroup label="Số đêm *">
                <input
                  className="form-control"
                  type="number"
                  value={nights}
                  min={1}
                  onChange={(e) => setNights(parseInt(e.target.value) || 1)}
                />
              </FormGroup>
              <FormGroup label="Ngày check-in">
                <input
                  className="form-control"
                  type="date"
                  defaultValue="2026-05-22"
                />
              </FormGroup>
              <FormGroup label="Hình thức thanh toán">
                <select className="form-control">
                  <option>Tiền mặt</option>
                  <option>Chuyển khoản</option>
                  <option>Thẻ ngân hàng</option>
                </select>
              </FormGroup>
              <div
                style={{
                  gridColumn: "1/-1",
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                }}
              >
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text2)",
                  }}
                >
                  Ghi chú
                </label>
                <textarea
                  className="form-control"
                  placeholder="Yêu cầu đặc biệt, ghi chú..."
                />
              </div>
            </div>
            <div
              style={{
                marginTop: 14,
                padding: 14,
                background: "var(--accent-light)",
                borderRadius: "var(--radius)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: "var(--accent-text)",
                  fontWeight: 500,
                }}
              >
                Tổng tiền:
              </span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--accent)",
                }}
              >
                {fmtTotal}
              </span>
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
              <Btn
                variant="primary"
                onClick={doCheckin}
                style={{ flex: 1, justifyContent: "center" }}
              >
                <i className="ti ti-check" /> Xác nhận Check-in
              </Btn>
              <Btn variant="outline">
                <i className="ti ti-printer" /> In phiếu
              </Btn>
            </div>
          </div>
        </Card>

        {/* Current guests */}
        <Card>
          <CardHeader
            title="Khách đang lưu trú"
            icon="ti-list-check"
            action={<Badge color="green">18 khách</Badge>}
          />
          <table className="data-table">
            <thead>
              <tr>
                <th>Phòng</th>
                <th>Tên khách</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {STAYING.map((s) => (
                <tr key={s.room}>
                  <td className="td-name">{s.room}</td>
                  <td>{s.name}</td>
                  <td className="td-muted">{s.ci}</td>
                  <td className="td-muted">{s.co}</td>
                  <td>
                    <Btn
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        showToast(
                          `Check-out ${s.name} — ${s.room} thành công`,
                          "ti-door-exit"
                        )
                      }
                    >
                      <i className="ti ti-door-exit" /> Out
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

export default PageCheckin;
