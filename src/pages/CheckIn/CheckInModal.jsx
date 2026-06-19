import React, { useState, useEffect, useRef } from "react";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  getCustomerOptions,
  getBookings,
} from "../../utils/api";
import AddCustomerModal from "../../components/AddCustomerModal";
import PricingPanel from "./PricingPanel";
import SearchableCustomerSelect from "./SearchableCustomerSelect";

const BOOKING_TYPES = [
  { value: "hourly", label: "Nghỉ giờ" },
  { value: "overnight", label: "Qua đêm" },
  { value: "fullday", label: "Ngày đêm (24h)" },
];

export default function CheckInModal({
  room,
  priceConfig,
  onClose,
  onSubmit,
  addToast,
}) {
  const [customers, setCustomers] = useState([]);
  const [selectedGuests, setSelectedGuests] = useState([null]);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [addingForIndex, setAddingForIndex] = useState(null);
  const [customerOptions, setCustomerOptions] = useState({
    nationalities: [],
    provinces: [],
    visaTypes: [],
  });
  const [checkedInIds, setCheckedInIds] = useState(new Set());

  const guestsContainerRef = useRef(null);

  // Tự động cuộn xuống dưới cùng khi thêm khách mới vào phòng
  useEffect(() => {
    if (selectedGuests.length > 1 && guestsContainerRef.current) {
      setTimeout(() => {
        if (guestsContainerRef.current) {
          guestsContainerRef.current.scrollTop =
            guestsContainerRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [selectedGuests.length]);

  const [form, setForm] = useState({
    bookingType: "hourly",
    shift:
      new Date().getHours() >= 23 || new Date().getHours() < 5
        ? "night"
        : "day",
    notes: "",
    deposit: 0,
    lydocutru: "1 - Du lịch",
    nhaplydo: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCustomers({ sort: "hoten" })
      .then((res) => {
        setCustomers(Array.isArray(res.data) ? res.data : res.data?.data || []);
      })
      .catch((err) => {
        console.error("Không thể tải danh sách khách hàng:", err);
      });

    // Lấy danh sách CCCD/hộ chiếu đang check-in để ngăn check-in 2 phòng
    getBookings({ status: "active", limit: "none" })
      .then((res) => {
        const bookingsList = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const ids = new Set();
        bookingsList.forEach((b) => {
          if (b.guestId) {
            b.guestId.split(",").forEach((id) => {
              const trimmed = id.trim();
              if (trimmed) ids.add(trimmed);
            });
          }
        });
        setCheckedInIds(ids);
      })
      .catch(() => {});

    getCustomerOptions()
      .then((res) => {
        setCustomerOptions(
          res.data || { nationalities: [], provinces: [], visaTypes: [] }
        );
      })
      .catch(() => {});
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreateCustomerDirect = async (payload) => {
    try {
      // Kiểm tra nhanh xem khách đã tồn tại chưa
      const localExisting = customers.find(
        (c) =>
          (payload.cccd && c.cccd === payload.cccd) ||
          (payload.passport && c.passport === payload.passport)
      );

      if (localExisting) {
        // Cập nhật thông tin mới nhất cho khách hàng đã tồn tại
        await updateCustomer(localExisting._id, payload);
        if (addToast) addToast("Đã cập nhật thông tin khách hàng");

        const custRes = await getCustomers({ sort: "hoten" });
        const updatedList = Array.isArray(custRes.data)
          ? custRes.data
          : custRes.data?.data || [];
        setCustomers(updatedList);

        const updated = updatedList.find((c) => c._id === localExisting._id);
        if (updated) {
          setSelectedGuests((prev) => {
            const arr = [...prev];
            arr[addingForIndex] = updated;
            return arr;
          });
        }
        return true;
      }

      // Tạo khách hàng mới
      const res = await createCustomer(payload);
      if (addToast) addToast("Thêm khách hàng mới thành công");

      const custRes = await getCustomers({ sort: "hoten" });
      const updatedList = Array.isArray(custRes.data)
        ? custRes.data
        : custRes.data?.data || [];
      setCustomers(updatedList);

      const newCustomer = updatedList.find(
        (c) =>
          c.cccd === payload.cccd ||
          (payload.passport && c.passport === payload.passport)
      );
      if (newCustomer) {
        setSelectedGuests((prev) => {
          const updated = [...prev];
          updated[addingForIndex] = newCustomer;
          return updated;
        });
      }
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || "Lỗi khi tạo khách hàng";
      if (addToast) addToast(errMsg, "error");
      return false;
    }
  };

  const handleSubmit = async () => {
    const activeGuests = selectedGuests.filter((g) => g !== null);
    if (activeGuests.length === 0) {
      if (addToast) addToast("Vui lòng chọn ít nhất một khách hàng", "error");
      return;
    }

    if (form.lydocutru === "20 - Mục đích khác" && (!form.nhaplydo || !form.nhaplydo.trim())) {
      if (addToast) addToast("Vui lòng nhập lý do cư trú cụ thể", "error");
      return;
    }

    setLoading(true);

    const guestNames = activeGuests.map((g) => g.hoten).join(", ");
    const guestIds = activeGuests
      .map((g) => g.cccd || g.passport || "")
      .filter((id) => id !== "")
      .join(", ");

    await onSubmit({
      ...form,
      guestName: guestNames,
      guestId: guestIds,
      guestPhone: "",
      roomNumber: room.roomNumber,
    });
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .mobile-dropdown-text {
            font-size: 12px !important;
            padding: 6px !important;
            height: 36px !important;
            width: auto !important;
          }
          .mobile-dropdown-text option {
            font-size: 10px !important;
            padding: 4px 0 4px 4px !important;
            max-width: 150px !important;
          }
        }
      `}</style>
      <div
        className="modal-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="modal"
          style={{
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="modal-header">
            <div>
              <div className="modal-title">
                Check-in phòng {room.roomNumber}
              </div>
              <div style={{ fontSize: 12, color: "#9fa3b8", marginTop: 2 }}>
                Phòng {room.type === "double" ? "đôi" : "đơn"}
              </div>
            </div>
            <button className="modal-close" onClick={onClose}>
              ✕
            </button>
          </div>

          <div
            className="modal-body"
            ref={guestsContainerRef}
            style={{ overflowY: "auto", flex: 1 }}
          >
            {/* Vùng chọn danh sách khách hàng */}
            <div style={{ marginBottom: "14px" }}>
              {selectedGuests.map((guest, idx) => (
                <SearchableCustomerSelect
                  key={idx}
                  label={
                    idx === 0
                      ? "Khách hàng chính *"
                      : `Khách hàng thứ ${idx + 1}`
                  }
                  customers={customers.filter((c) => {
                    // Ẩn khách đang check-in ở phòng khác
                    const id = c.cccd || c.passport || "";
                    return !id || !checkedInIds.has(id);
                  })}
                  selectedCustomer={guest}
                  onSelect={(c) => {
                    setSelectedGuests((prev) => {
                      const updated = [...prev];
                      updated[idx] = c;
                      return updated;
                    });
                  }}
                  onClear={() => {
                    if (idx === 0) {
                      setSelectedGuests((prev) => {
                        const updated = [...prev];
                        updated[0] = null;
                        return updated;
                      });
                    } else {
                      setSelectedGuests((prev) =>
                        prev.filter((_, i) => i !== idx)
                      );
                    }
                  }}
                  excludeIds={selectedGuests
                    .filter((g, i) => g !== null && i !== idx)
                    .map((g) => g._id)}
                  onAddDirectClick={() => {
                    setAddingForIndex(idx);
                    setShowAddCustomerModal(true);
                  }}
                  dropdownAlign="down"
                />
              ))}
            </div>

            {/* Nút thêm khách vào phòng */}
            <div style={{ marginBottom: 14 }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  fontSize: "13px",
                }}
                onClick={() => setSelectedGuests((prev) => [...prev, null])}
              >
                ➕ Thêm khách vào phòng
              </button>
            </div>

            <div className="input-row" style={{ marginTop: 14 }}>
              <div className="form-group">
                <label className="form-label">Ca</label>
                <select
                  className="form-control mobile-dropdown-text"
                  value={form.shift}
                  onChange={(e) => {
                    const newShift = e.target.value;
                    set("shift", newShift);
                    if (newShift === "night") {
                      set("bookingType", "hourly");
                    }
                  }}
                >
                  <option value="day">Ca ngày (5h–23h)</option>
                  <option value="night">Ca đêm (23h–5h)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Loại thuê</label>
                <select
                  className="form-control mobile-dropdown-text"
                  value={form.bookingType}
                  onChange={(e) => set("bookingType", e.target.value)}
                >
                  {BOOKING_TYPES.filter(
                    (t) => form.shift !== "night" || t.value === "hourly"
                  ).map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <PricingPanel
              priceConfig={priceConfig}
              roomType={room.type}
              shift={form.shift}
              bookingType={form.bookingType}
            />

            {/* Lý do cư trú */}
            <div className="form-group">
              <label className="form-label">Lý do cư trú</label>
              <select
                className="form-control"
                value={form.lydocutru}
                onChange={(e) => {
                  const val = e.target.value;
                  set("lydocutru", val);
                  if (val !== "20 - Mục đích khác") {
                    set("nhaplydo", "");
                  }
                }}
              >
                <option value="1 - Du lịch">1 - Du lịch</option>
                <option value="2 - Công tác">2 - Công tác</option>
                <option value="3 - Học tập">3 - Học tập</option>
                <option value="4 - Thăm viếng">4 - Thăm viếng</option>
                <option value="5 - Hội nghị">5 - Hội nghị</option>
                <option value="6 - Thăm thân">6 - Thăm thân</option>
                <option value="7 - Từ thiện">7 - Từ thiện</option>
                <option value="8 - Tổ chức quốc tế">8 - Tổ chức quốc tế</option>
                <option value="9 - Kết hôn">9 - Kết hôn</option>
                <option value="10 - Lãnh sự quán">10 - Lãnh sự quán</option>
                <option value="11 - Viện trợ">11 - Viện trợ</option>
                <option value="12 - Đại sứ quán">12 - Đại sứ quán</option>
                <option value="13 - Định cư">13 - Định cư</option>
                <option value="14 - Tiếp thị">14 - Tiếp thị</option>
                <option value="15 - Báo chí, phóng viên">15 - Báo chí, phóng viên</option>
                <option value="16 - Thương mại">16 - Thương mại</option>
                <option value="17 - Gia hạn thị thực">17 - Gia hạn thị thực</option>
                <option value="18 - Chữa bệnh">18 - Chữa bệnh</option>
                <option value="19 - Lao động">19 - Lao động</option>
                <option value="20 - Mục đích khác">20 - Mục đích khác</option>
              </select>
            </div>

            {form.lydocutru === "20 - Mục đích khác" && (
              <div className="form-group">
                <label className="form-label">Nhập lý do cư trú khác</label>
                <input
                  className="form-control"
                  placeholder="Nhập lý do cư trú cụ thể..."
                  value={form.nhaplydo}
                  onChange={(e) => set("nhaplydo", e.target.value)}
                />
              </div>
            )}

            {/* Tạm ứng */}
            <div className="form-group">
              <label className="form-label">Tạm ứng (đ)</label>
              <input
                className="form-control"
                type="text"
                placeholder="0"
                value={form.deposit === 0 ? "" : form.deposit.toLocaleString("vi-VN")}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  set("deposit", raw ? Number(raw) : 0);
                }}
              />
            </div>

            {/* Ghi chú */}
            <div className="form-group">
              <label className="form-label">Ghi chú</label>
              <input
                className="form-control"
                placeholder="Nhập ghi chú cho phòng này..."
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>
              Hủy
            </button>
            <button
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "..." : "✓ Check-in"}
            </button>
          </div>
        </div>
      </div>

      {showAddCustomerModal && (
        <AddCustomerModal
          options={customerOptions}
          onClose={() => {
            setShowAddCustomerModal(false);
            setAddingForIndex(null);
          }}
          onSave={handleCreateCustomerDirect}
          addToast={addToast}
        />
      )}
    </>
  );
}