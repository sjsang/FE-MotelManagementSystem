import Modal from "../Modal";
import Btn from "../Btn";
import Badge from "../Badge";
const ModalInvoice = ({ open, onClose, showToast }) => (
  <Modal
    open={open}
    onClose={onClose}
    title="Hóa đơn #HĐ-0087"
    footer={
      <>
        <Btn variant="outline" onClick={onClose}>
          Đóng
        </Btn>
        <Btn
          variant="primary"
          onClick={() => {
            showToast("Đang in hóa đơn...", "ti-printer");
            onClose();
          }}
        >
          <i className="ti ti-printer" /> In hóa đơn
        </Btn>
      </>
    }
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 18,
      }}
    >
      <div>
        <div style={{ fontSize: 12, color: "var(--text3)" }}>
          Nhà Nghỉ Bình An
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)" }}>
          123 Nguyễn Trãi, Ninh Kiều, Cần Thơ
        </div>
      </div>
      <Badge color="green">Đã thanh toán</Badge>
    </div>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        marginBottom: 14,
      }}
    >
      {[
        ["Khách hàng", "Lê Hoàng Cường"],
        ["Phòng", "P.101"],
        ["Check-in", "19/05/2026 14:00"],
        ["Check-out", "22/05/2026 12:00"],
      ].map(([l, v]) => (
        <div
          key={l}
          style={{
            background: "var(--surface2)",
            borderRadius: "var(--radius)",
            padding: 12,
          }}
        >
          <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>
            {l}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
            {v}
          </div>
        </div>
      ))}
    </div>
    <div className="inv-row">
      <span>Tiền phòng (3 đêm × 350.000đ)</span>
      <span>1.050.000đ</span>
    </div>
    <div className="inv-row">
      <span>Dịch vụ bổ sung</span>
      <span>0đ</span>
    </div>
    <div className="inv-row">
      <span>Thuế & phí</span>
      <span>0đ</span>
    </div>
    <div
      className="inv-row"
      style={{
        marginTop: 8,
        paddingTop: 12,
        borderTop: "2px solid var(--border)",
      }}
    >
      <span>TỔNG CỘNG</span>
      <span className="inv-total" style={{ fontSize: 18 }}>
        1.050.000đ
      </span>
    </div>
    <div
      style={{
        marginTop: 14,
        background: "var(--accent-light)",
        borderRadius: "var(--radius)",
        padding: 12,
        fontSize: 12.5,
        color: "var(--accent-text)",
      }}
    >
      <i
        className="ti ti-check-circle"
        style={{ fontSize: 15, verticalAlign: -2 }}
      />{" "}
      Đã thanh toán bằng <strong>Tiền mặt</strong> vào lúc 11:35 ngày 22/05/2026
    </div>
  </Modal>
);

export default ModalInvoice;
