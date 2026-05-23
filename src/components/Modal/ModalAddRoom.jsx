import Modal from "../Modal";
import Btn from "../Btn";
import FormGroup from "../FormGroup";
const ModalAddRoom = ({ open, onClose, showToast }) => (
  <Modal
    open={open}
    onClose={onClose}
    title="Thêm phòng mới"
    footer={
      <>
        <Btn variant="outline" onClick={onClose}>
          Hủy
        </Btn>
        <Btn
          variant="primary"
          onClick={() => {
            showToast("Đã thêm phòng mới thành công!", "ti-check");
            onClose();
          }}
        >
          <i className="ti ti-plus" /> Thêm phòng
        </Btn>
      </>
    }
  >
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <FormGroup label="Số phòng *">
        <input className="form-control" placeholder="VD: 111" />
      </FormGroup>
      <FormGroup label="Loại phòng *">
        <select className="form-control">
          <option>Phòng đơn</option>
          <option>Phòng đôi</option>
          <option>VIP Suite</option>
        </select>
      </FormGroup>
      <FormGroup label="Tầng">
        <select className="form-control">
          <option>Tầng 1</option>
          <option>Tầng 2</option>
          <option>Tầng 3</option>
        </select>
      </FormGroup>
      <FormGroup label="Giá/đêm *">
        <input className="form-control" placeholder="350000" />
      </FormGroup>
      <FormGroup label="Giá theo giờ">
        <input className="form-control" placeholder="80000" />
      </FormGroup>
      <FormGroup label="Trạng thái">
        <select className="form-control">
          <option>Trống</option>
          <option>Dọn phòng</option>
          <option>Bảo trì</option>
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
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)" }}>
          Mô tả / Tiện nghi
        </label>
        <textarea
          className="form-control"
          placeholder="Điều hòa, WiFi, TV, ..."
        />
      </div>
    </div>
  </Modal>
);

export default ModalAddRoom;
