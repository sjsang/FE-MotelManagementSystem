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
    <div className="flex justify-between mb-4.5">
      <div>
        <div className="text-xs text-(--text3)">
          Nhà Nghỉ Bình An
        </div>
        <div className="text-[11px] text-(--text3)">
          123 Nguyễn Trãi, Ninh Kiều, Cần Thơ
        </div>
      </div>
      <Badge color="green">Đã thanh toán</Badge>
    </div>
    <div className="grid grid-cols-2 gap-2.5 mb-3.5">
      {[
        ["Khách hàng", "Lê Hoàng Cường"],
        ["Phòng", "P.101"],
        ["Check-in", "19/05/2026 14:00"],
        ["Check-out", "22/05/2026 12:00"],
      ].map(([l, v]) => (
        <div
          key={l}
          className="bg-(--surface2) rounded-(--radius) p-3"
        >
          <div className="text-[11px] text-(--text3) mb-1">{l}</div>
          <div className="text-[14px] font-semibold text-(--text)">{v}</div>
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
      className="inv-row mt-2 pt-3 border-t-2 border-(--border)"
    >
      <span>TỔNG CỘNG</span>
      <span className="inv-total text-lg">
        1.050.000đ
      </span>
    </div>
    <div className="mt-3.5 bg-(--accent-light) rounded-(--radius) p-3 text-[12.5px] text-(--accent-text)">
      <i className="ti ti-check-circle text-[15px] align-[-2px]" />{" "}
      Đã thanh toán bằng <strong>Tiền mặt</strong> vào lúc 11:35 ngày 22/05/2026
    </div>
  </Modal>
);

export default ModalInvoice;
