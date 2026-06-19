import React, { useState, useEffect, useRef } from "react";
import { getCustomers, createCustomer, getCustomerOptions } from "../../utils/api";
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

  const guestsContainerRef = useRef(null);

  useEffect(() => {
    // THÊM ĐIỀU KIỆN: selectedGuests.length > 1
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
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCustomers()
      .then((res) => {
        setCustomers(Array.isArray(res.data) ? res.data : res.data?.data || []);
      })
      .catch((err) => {
        console.error("Không thể tải danh sách khách hàng:", err);
      });

    getCustomerOptions()
      .then((res) => {
        setCustomerOptions(
          res.data || { nationalities: [], provinces: [], visaTypes: [] }
        );
      })
      .catch(() => { });
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreateCustomerDirect = async (payload) => {
    try {
      const res = await createCustomer(payload);
      if (addToast) addToast("Thêm khách hàng mới thành công");

      const custRes = await getCustomers();
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
          /* Chỉnh kích thước của ô hiển thị (Select) */
          .mobile-dropdown-text {
            font-size: 12px !important;
            padding: 6px !important;
            height: 36px !important;
            width: auto !important;
          }
          /* Ép kích thước của danh sách xổ xuống (Options) */
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
            <div style={{ marginBottom: "14px" }}>
              {selectedGuests.map((guest, idx) => (
                <SearchableCustomerSelect
                  key={idx}
                  label={
                    idx === 0
                      ? "Khách hàng chính *"
                      : `Khách hàng thứ ${idx + 1}`
                  }
                  customers={customers}
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

            <div className="form-group">
              <label className="form-label">Tạm ứng (đ)</label>
              <input
                className="form-control"
                type="text"
                placeholder="0"
                value={form.deposit === 0 ? '' : form.deposit.toLocaleString('vi-VN')}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  set('deposit', raw ? Number(raw) : 0);
                }}
              />
            </div>

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