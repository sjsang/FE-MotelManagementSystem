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

function ScrollableDropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const ITEM_HEIGHT = 34;
  const VISIBLE_ROWS = 7;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className="form-control"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          textAlign: "left",
          background: "var(--input-bg, #fff)",
        }}
      >
        <span>{value}</span>
        <span style={{ fontSize: 10, opacity: 0.5 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 9999,
            margin: 0,
            padding: "4px 0",
            listStyle: "none",
            background: "var(--modal-bg, #fff)",
            border: "1px solid var(--border, #e2e8f0)",
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            maxHeight: ITEM_HEIGHT * VISIBLE_ROWS + 8,
            overflowY: "auto",
          }}
        >
          {options.map((opt) => (
            <li
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              style={{
                height: ITEM_HEIGHT,
                lineHeight: ITEM_HEIGHT + "px",
                padding: "0 12px",
                cursor: "pointer",
                fontSize: 13,
                background: opt === value ? "var(--primary-light, #ede9fe)" : "transparent",
                color: opt === value ? "var(--primary, #7c3aed)" : "inherit",
                fontWeight: opt === value ? 600 : 400,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onMouseEnter={(e) => {
                if (opt !== value) e.currentTarget.style.background = "var(--hover-bg, #f3f4f6)";
              }}
              onMouseLeave={(e) => {
                if (opt !== value) e.currentTarget.style.background = "transparent";
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const LY_DO_CU_TRU_OPTIONS = [
  "1 - Du lịch", "2 - Công tác", "3 - Học tập", "4 - Thăm viếng",
  "5 - Hội nghị", "6 - Thăm thân", "7 - Từ thiện", "8 - Tổ chức quốc tế",
  "9 - Kết hôn", "10 - Lãnh sự quán", "11 - Viện trợ", "12 - Đại sứ quán",
  "13 - Định cư", "14 - Tiếp thị", "15 - Báo chí, phóng viên",
  "16 - Thương mại", "17 - Gia hạn thị thực", "18 - Chữa bệnh",
  "19 - Lao động", "20 - Mục đích khác",
];

export default function CheckInModal({
  room,
  priceConfig,
  onClose,
  onSubmit,
  addToast,
}) {
  const [customers, setCustomers] = useState([]);
  const [customerPage, setCustomerPage] = useState(1);
  const [hasMoreCustomers, setHasMoreCustomers] = useState(true);
  const [loadingMoreCustomers, setLoadingMoreCustomers] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState([null]);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [addingForIndex, setAddingForIndex] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerOptions, setCustomerOptions] = useState({
    nationalities: [],
    provinces: [],
    visaTypes: [],
  });
  const [checkedInIds, setCheckedInIds] = useState(new Set());
  const [checkedInCustomerIds, setCheckedInCustomerIds] = useState(new Set());
  const [checkedInNames, setCheckedInNames] = useState(new Set());

  const guestsContainerRef = useRef(null);



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

  const PAGE_SIZE = 50;

  useEffect(() => {
    // Load trang đầu tiên
    getCustomers({ sort: "hoten", limit: PAGE_SIZE, page: 1 })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setCustomers(list);
        setCustomerPage(1);
        setHasMoreCustomers(res.data?.hasMore ?? list.length === PAGE_SIZE);
      })
      .catch((err) => {
        console.error("Không thể tải danh sách khách hàng:", err);
      });

    // Lấy danh sách CCCD/hộ chiếu, ID và họ tên đang check-in để ngăn check-in 2 phòng
    getBookings({ status: "active", limit: "none" })
      .then((res) => {
        const bookingsList = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];
        const ids = new Set();
        const customerIds = new Set();
        const names = new Set();
        bookingsList.forEach((b) => {
          if (b.guestId) {
            b.guestId.split(",").forEach((id) => {
              const trimmed = id.trim();
              if (trimmed) ids.add(trimmed);
            });
          }
          if (b.guestCustomerId) {
            b.guestCustomerId.split(",").forEach((cid) => {
              const trimmed = cid.trim();
              if (trimmed) customerIds.add(trimmed);
            });
          }
          if (b.guestName) {
            b.guestName.split(",").forEach((name) => {
              const trimmed = name.trim().toLowerCase();
              if (trimmed) names.add(trimmed);
            });
          }
        });
        setCheckedInIds(ids);
        setCheckedInCustomerIds(customerIds);
        setCheckedInNames(names);
      })
      .catch(() => { });

    getCustomerOptions()
      .then((res) => {
        setCustomerOptions(
          res.data || { nationalities: [], provinces: [], visaTypes: [] }
        );
      })
      .catch(() => { });
  }, []);

  // Hàm lazy load: gọi khi người dùng cuộn xuống cuối dropdown
  const loadMoreCustomers = async () => {
    if (loadingMoreCustomers || !hasMoreCustomers) return;
    setLoadingMoreCustomers(true);
    try {
      const nextPage = customerPage + 1;
      const res = await getCustomers({
        sort: "hoten",
        limit: PAGE_SIZE,
        page: nextPage,
      });
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCustomers((prev) => [...prev, ...list]);
      setCustomerPage(nextPage);
      setHasMoreCustomers(res.data?.hasMore ?? list.length === PAGE_SIZE);
    } catch (err) {
      console.error("Lỗi khi tải thêm khách hàng:", err);
    } finally {
      setLoadingMoreCustomers(false);
    }
  };

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

        const custRes = await getCustomers({ sort: "hoten", limit: "none" });
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

      const newId = res.data?._id;

      const custRes = await getCustomers({ sort: "hoten", limit: "none" });
      const updatedList = Array.isArray(custRes.data)
        ? custRes.data
        : custRes.data?.data || [];
      setCustomers(updatedList);

      // Tìm bằng _id từ response để chắc chắn đúng khách
      const newCustomer = newId
        ? updatedList.find((c) => c._id === newId)
        : updatedList.find(
          (c) =>
            (payload.cccd && c.cccd === payload.cccd) ||
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

    if (
      form.lydocutru === "20 - Mục đích khác" &&
      (!form.nhaplydo || !form.nhaplydo.trim())
    ) {
      if (addToast) addToast("Vui lòng nhập lý do cư trú cụ thể", "error");
      return;
    }

    setLoading(true);

    const guestNames = activeGuests.map((g) => g.hoten).join(", ");
    const guestIds = activeGuests
      .map((g) => g.cccd || g.passport || "")
      .join(", ");
    const guestCustIds = activeGuests
      .map((g) => g._id || "")
      .join(", ");

    await onSubmit({
      ...form,
      guestName: guestNames,
      guestId: guestIds,
      guestCustomerId: guestCustIds,
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
              {selectedGuests.map((guest, idx) =>
                idx === 0 ? (
                  <SearchableCustomerSelect
                    key={idx}
                    label="Khách hàng chính *"
                    customers={customers.filter((c) => {
                      const id = c.cccd || c.passport || "";
                      const cid = c._id;

                      if (cid && checkedInCustomerIds.has(cid)) return false;
                      if (id && checkedInIds.has(id)) return false;

                      return true;
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
                      setSelectedGuests((prev) => {
                        const updated = [...prev];
                        updated[0] = null;
                        return updated;
                      });
                    }}
                    onEditClick={(customer) => setEditingCustomer(customer)}
                    excludeIds={selectedGuests
                      .filter((g, i) => g !== null && i !== idx)
                      .map((g) => g._id)}
                    onAddDirectClick={() => {
                      setAddingForIndex(idx);
                      setShowAddCustomerModal(true);
                    }}
                    onLoadMore={loadMoreCustomers}
                    hasMore={hasMoreCustomers}
                    loadingMore={loadingMoreCustomers}
                    dropdownAlign="down"
                  />
                ) : (
                  <div key={idx} style={{ position: "relative" }}>
                    {/* Nút Hủy slot trống */}
                    <SearchableCustomerSelect
                      label={`Khách hàng thứ ${idx + 1}`}
                      customers={customers.filter((c) => {
                        const id = c.cccd || c.passport || "";
                        const cid = c._id;

                        if (cid && checkedInCustomerIds.has(cid)) return false;
                        if (id && checkedInIds.has(id)) return false;

                        return true;
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
                        setSelectedGuests((prev) =>
                          prev.filter((_, i) => i !== idx)
                        );
                      }}
                      onEditClick={(customer) => setEditingCustomer(customer)}
                      excludeIds={selectedGuests
                        .filter((g, i) => g !== null && i !== idx)
                        .map((g) => g._id)}
                      onAddDirectClick={() => {
                        setAddingForIndex(idx);
                        setShowAddCustomerModal(true);
                      }}
                      onLoadMore={loadMoreCustomers}
                      hasMore={hasMoreCustomers}
                      loadingMore={loadingMoreCustomers}
                      dropdownAlign="down"
                    />
                  </div>

                )
              )}
            </div>


            {/* Nút thêm khách + Hủy trên cùng một hàng */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
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
              {selectedGuests.length > 1 && selectedGuests[selectedGuests.length - 1] === null && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() =>
                    setSelectedGuests((prev) => prev.slice(0, -1))
                  }
                  style={{ padding: "4px 12px", fontSize: 13 }}
                >
                  Hủy
                </button>
              )}
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
                  <option value="day">Ca ngày</option>
                  <option value="night">Ca đêm</option>
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

            {/* Lý do cư trú — đặt trước Tính tiền để dropdown có chỗ sổ xuống */}
            <div className="form-group">
              <label className="form-label">Lý do cư trú</label>
              <ScrollableDropdown
                value={form.lydocutru}
                options={LY_DO_CU_TRU_OPTIONS}
                onChange={(val) => {
                  set("lydocutru", val);
                  if (val !== "20 - Mục đích khác") {
                    set("nhaplydo", "");
                  }
                }}
              />
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
                value={
                  form.deposit === 0 ? "" : form.deposit.toLocaleString("vi-VN")
                }
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

      {editingCustomer && (
        <AddCustomerModal
          customer={editingCustomer}
          options={customerOptions}
          onClose={() => setEditingCustomer(null)}
          onSave={async (payload) => {
            try {
              await updateCustomer(editingCustomer._id, payload);
              if (addToast) addToast("Cập nhật thông tin thành công");
              // Reload danh sách khách
              const custRes = await getCustomers({
                sort: "hoten",
                limit: "none",
              });
              const updatedList = Array.isArray(custRes.data)
                ? custRes.data
                : custRes.data?.data || [];
              setCustomers(updatedList);
              // Cập nhật lại selectedGuests nếu khách đang được chọn
              setSelectedGuests((prev) =>
                prev.map((g) =>
                  g && g._id === editingCustomer._id
                    ? updatedList.find((c) => c._id === editingCustomer._id) ||
                    g
                    : g
                )
              );
              setEditingCustomer(null);
              return true;
            } catch (err) {
              const errMsg = err.response?.data?.message || "Lỗi khi cập nhật";
              if (addToast) addToast(errMsg, "error");
              return false;
            }
          }}
          addToast={addToast}
        />
      )}
    </>
  );
}
