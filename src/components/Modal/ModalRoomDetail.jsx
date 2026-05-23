import Modal from "../Modal";
import Btn from "../Btn";
import Badge from "../Badge";
const ModalRoomDetail = ({ open, onClose, roomNum, showToast }) => (
  <Modal
    open={open}
    onClose={onClose}
    title={`Chi tiết phòng ${roomNum}`}
    footer={
      <>
        <Btn variant="outline" onClick={onClose}>
          Đóng
        </Btn>
        <Btn
          variant="danger"
          onClick={() => {
            showToast(`Check-out P.${roomNum} thành công`, "ti-door-exit");
            onClose();
          }}
        >
          <i className="ti ti-door-exit" /> Check-out
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
    <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
      <Badge color="red">Đang thuê</Badge>
      <Badge color="gray">Phòng đôi</Badge>
      <Badge color="amber">Tầng 1</Badge>
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
        ["Khách hiện tại", "Nguyễn Văn A"],
        ["Giá/đêm", "350.000đ"],
        ["Check-in", "19/05/2026"],
        ["Check-out", "22/05/2026"],
      ].map(([lbl, val]) => (
        <div
          key={lbl}
          style={{
            background: "var(--surface2)",
            borderRadius: "var(--radius)",
            padding: 12,
          }}
        >
          <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>
            {lbl}
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: lbl === "Giá/đêm" ? "var(--accent)" : "var(--text)",
            }}
          >
            {val}
          </div>
        </div>
      ))}
    </div>
    <div
      style={{
        background: "var(--surface2)",
        borderRadius: "var(--radius)",
        padding: 14,
        marginBottom: 16,
      }}
    >
      <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8 }}>
        Tiện nghi phòng
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {["Điều hòa", "WiFi", 'TV 32"', "Phòng tắm riêng", "Tủ lạnh mini"].map(
          (t) => (
            <Badge key={t} color="gray">
              {t}
            </Badge>
          )
        )}
      </div>
    </div>
    <div className="inv-row">
      <span>3 đêm × 350.000đ</span>
      <span>1.050.000đ</span>
    </div>
    <div className="inv-row">
      <span>Dịch vụ khác</span>
      <span>0đ</span>
    </div>
    <div className="inv-row">
      <span style={{ fontWeight: 600 }}>Tổng cộng</span>
      <span className="inv-total">1.050.000đ</span>
    </div>
  </Modal>
);

export default ModalRoomDetail;
