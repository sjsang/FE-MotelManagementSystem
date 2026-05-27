import Modal from "../Modal";
import Btn from "../Btn";
import FormGroup from "../FormGroup";
const ModalAddBooking = ({ open, onClose, showToast }) => (
  <Modal
    open={open}
    onClose={onClose}
    title="Đặt phòng mới"
    footer={
      <>
        <Btn variant="outline" onClick={onClose}>
          Hủy
        </Btn>
        <Btn
          variant="primary"
          onClick={() => {
            showToast("Đã tạo đặt phòng thành công!", "ti-check");
            onClose();
          }}
        >
          <i className="ti ti-check" /> Xác nhận
        </Btn>
      </>
    }
  >
    <div className="grid grid-cols-2 gap-[14px]">
      <FormGroup label="Họ tên khách *">
        <input className="form-control" placeholder="Nguyễn Văn A" />
      </FormGroup>
      <FormGroup label="Số điện thoại">
        <input className="form-control" placeholder="0901234567" />
      </FormGroup>
      <FormGroup label="Chọn phòng *">
        <select className="form-control">
          <option>P.102 — Phòng đơn</option>
          <option>P.105 — Phòng đôi</option>
          <option>P.108 — VIP Suite</option>
        </select>
      </FormGroup>
      <FormGroup label="Số đêm">
        <input
          className="form-control"
          type="number"
          defaultValue={1}
          min={1}
        />
      </FormGroup>
      <FormGroup label="Ngày check-in">
        <input className="form-control" type="date" defaultValue="2026-05-22" />
      </FormGroup>
      <FormGroup label="Thanh toán">
        <select className="form-control">
          <option>Tiền mặt</option>
          <option>Chuyển khoản</option>
          <option>Thẻ</option>
        </select>
      </FormGroup>
    </div>
  </Modal>
);

export default ModalAddBooking;
