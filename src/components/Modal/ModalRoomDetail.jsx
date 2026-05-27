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
    <div className="flex gap-3 mb-4">
      <Badge color="red">Đang thuê</Badge>
      <Badge color="gray">Phòng đôi</Badge>
      <Badge color="amber">Tầng 1</Badge>
    </div>
    <div className="grid grid-cols-2 gap-[10px] mb-[14px]">
      {[
        ["Khách hiện tại", "Nguyễn Văn A"],
        ["Giá/đêm", "350.000đ"],
        ["Check-in", "19/05/2026"],
        ["Check-out", "22/05/2026"],
      ].map(([lbl, val]) => (
        <div
          key={lbl}
          className="bg-[var(--surface2)] rounded-[var(--radius)] p-3"
        >
          <div className="text-[11px] text-[var(--text3)] mb-1">
            {lbl}
          </div>
          <div
            className="text-[15px] font-semibold"
            style={{ color: lbl === "Giá/đêm" ? "var(--accent)" : "var(--text)" }}
          >
            {val}
          </div>
        </div>
      ))}
    </div>
    <div className="bg-[var(--surface2)] rounded-[var(--radius)] p-[14px] mb-4">
      <div className="text-xs text-[var(--text3)] mb-2">
        Tiện nghi phòng
      </div>
      <div className="flex flex-wrap gap-2">
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
      <span className="font-semibold">Tổng cộng</span>
      <span className="inv-total">1.050.000đ</span>
    </div>
  </Modal>
);

export default ModalRoomDetail;
