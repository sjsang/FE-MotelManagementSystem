import React, { useState, useEffect, useCallback } from "react";
import { formatTime, formatCurrency } from "../../utils/RoomDetailHelpers";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  getCustomerOptions,
  getBookings,
} from "../../utils/api";
import AddCustomerModal from "../../components/AddCustomerModal";
import SearchableCustomerSelect from "../CheckIn/SearchableCustomerSelect";

export default function TabInfo({ booking, addToast, onUpdateBooking }) {
  const names = (booking.guestName || "").split(",").map((s) => s.trim());
  const ids = (booking.guestId || "").split(",").map((s) => s.trim());
  const custIds = (booking.guestCustomerId || "").split(",").map((s) => s.trim());
  
  const guestsCombined = Array.from(
    { length: Math.max(names.length, ids.length, custIds.length) },
    (_, i) => ({ 
      name: names[i] || "", 
      id: ids[i] || "", 
      customerId: custIds[i] || "" 
    })
  ).filter((g) => g.name || g.id || g.customerId);

  const [customers, setCustomers] = useState([]);
  const [customerPage, setCustomerPage] = useState(1);
  const [hasMoreCustomers, setHasMoreCustomers] = useState(true);
  const [loadingMoreCustomers, setLoadingMoreCustomers] = useState(false);
  const [customerOptions, setCustomerOptions] = useState({
    nationalities: [],
    provinces: [],
    visaTypes: [],
  });
  const [checkedInIds, setCheckedInIds] = useState(new Set());
  const [checkedInCustomerIds, setCheckedInCustomerIds] = useState(new Set());
  const [checkedInNames, setCheckedInNames] = useState(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const PAGE_SIZE = 50;

  const loadInitialCustomers = useCallback(async () => {
    try {
      const res = await getCustomers({ sort: "hoten", limit: PAGE_SIZE, page: 1 });
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCustomers(list);
      setCustomerPage(1);
      setHasMoreCustomers(res.data?.hasMore ?? list.length === PAGE_SIZE);
    } catch (err) {
      console.error("Không thể tải danh sách khách hàng:", err);
    }
  }, []);

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

  useEffect(() => {
    if (isAdding || editingCustomer || showAddCustomerModal) {
      if (customers.length === 0) {
        loadInitialCustomers();
      }
      if (customerOptions.nationalities.length === 0) {
        getCustomerOptions()
          .then((res) => {
            setCustomerOptions(res.data || { nationalities: [], provinces: [], visaTypes: [] });
          })
          .catch(() => {});
      }

      getBookings({ status: "active", limit: "none" })
        .then((res) => {
          const bookingsList = Array.isArray(res.data)
            ? res.data
            : res.data?.data || [];
          const idsSet = new Set();
          const customerIdsSet = new Set();
          const namesSet = new Set();
          bookingsList.forEach((b) => {
            if (b._id === booking._id) return;
            if (b.guestId) {
              b.guestId.split(",").forEach((id) => {
                const trimmed = id.trim();
                if (trimmed) idsSet.add(trimmed);
              });
            }
            if (b.guestCustomerId) {
              b.guestCustomerId.split(",").forEach((cid) => {
                const trimmed = cid.trim();
                if (trimmed) customerIdsSet.add(trimmed);
              });
            }
            if (b.guestName) {
              b.guestName.split(",").forEach((name) => {
                const trimmed = name.trim().toLowerCase();
                if (trimmed) namesSet.add(trimmed);
              });
            }
          });
          setCheckedInIds(idsSet);
          setCheckedInCustomerIds(customerIdsSet);
          setCheckedInNames(namesSet);
        })
        .catch(() => {});
    }
  }, [isAdding, editingCustomer, showAddCustomerModal, loadInitialCustomers, booking._id, customers.length, customerOptions.nationalities.length]);

  const handleAddGuest = (customer) => {
    if (!customer) return;
    const name = customer.hoten;
    const id = customer.cccd || customer.passport || "";
    const cid = customer._id || "";

    let currentNames = (booking.guestName || "").split(",").map((s) => s.trim());
    let currentIds = (booking.guestId || "").split(",").map((s) => s.trim());
    let currentCustIds = (booking.guestCustomerId || "").split(",").map((s) => s.trim());

    if (currentNames.length === 1 && !currentNames[0]) {
      currentNames = [];
    }
    if (currentIds.length === 1 && !currentIds[0]) {
      currentIds = [];
    }
    if (currentCustIds.length === 1 && !currentCustIds[0]) {
      currentCustIds = [];
    }

    if (cid && currentCustIds.includes(cid)) {
      if (addToast) addToast("Khách hàng này đã có trong phòng", "warning");
      return;
    }

    while (currentIds.length < currentNames.length) {
      currentIds.push("");
    }
    while (currentCustIds.length < currentNames.length) {
      currentCustIds.push("");
    }

    currentNames.push(name);
    currentIds.push(id);
    currentCustIds.push(cid);

    onUpdateBooking({
      guestName: currentNames.join(", "),
      guestId: currentIds.join(", "),
      guestCustomerId: currentCustIds.join(", "),
    });
    setIsAdding(false);
  };

  const handleDeleteGuest = (idx) => {
    const updatedGuests = guestsCombined.filter((_, i) => i !== idx);

    if (updatedGuests.length === 0) {
      if (addToast) addToast("Không thể xóa toàn bộ khách hàng. Phòng phải có ít nhất một khách hàng.", "warning");
      return;
    }

    const newNames = updatedGuests.map((g) => g.name).join(", ");
    const newIds = updatedGuests.map((g) => g.id).join(", ");
    const newCustIds = updatedGuests.map((g) => g.customerId).join(", ");

    onUpdateBooking({
      guestName: newNames,
      guestId: newIds,
      guestCustomerId: newCustIds,
    });
  };

  const handleEditGuest = async (g, idx) => {
    setEditingIndex(idx);

    if (g.customerId) {
      const found = customers.find((c) => c._id === g.customerId);
      if (found) {
        setEditingCustomer(found);
        setShowAddCustomerModal(true);
        return;
      }

      try {
        const res = await getCustomerById(g.customerId);
        if (res.data) {
          setEditingCustomer(res.data);
          setShowAddCustomerModal(true);
          return;
        }
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết khách hàng bằng ID:", err);
      }
    }

    const found = customers.find(
      (c) =>
        (g.id && (c.cccd === g.id || c.passport === g.id)) ||
        (!g.id && c.hoten === g.name)
    );

    if (found) {
      setEditingCustomer(found);
      setShowAddCustomerModal(true);
      return;
    }

    try {
      const res = await getCustomers({ search: g.id || g.name, limit: 1 });
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      if (list.length > 0) {
        setEditingCustomer(list[0]);
      } else {
        setEditingCustomer({
          hoten: g.name,
          cccd: g.id,
          quoctich: "VNM - Viet Nam",
        });
      }
      setShowAddCustomerModal(true);
    } catch {
      setEditingCustomer({
        hoten: g.name,
        cccd: g.id,
        quoctich: "VNM - Viet Nam",
      });
      setShowAddCustomerModal(true);
    }
  };

  const handleCreateCustomerDirect = async (payload) => {
    try {
      if (editingCustomer && editingCustomer._id) {
        const res = await updateCustomer(editingCustomer._id, payload);
        if (addToast) addToast("Cập nhật thông tin khách hàng thành công", "success");

        const updatedCustomer = res.data;
        await loadInitialCustomers();

        const currentNames = (booking.guestName || "").split(",").map((s) => s.trim());
        const currentIds = (booking.guestId || "").split(",").map((s) => s.trim());
        const currentCustIds = (booking.guestCustomerId || "").split(",").map((s) => s.trim());

        const maxLen = Math.max(currentNames.length, currentIds.length, currentCustIds.length);
        while (currentNames.length < maxLen) currentNames.push("");
        while (currentIds.length < maxLen) currentIds.push("");
        while (currentCustIds.length < maxLen) currentCustIds.push("");

        if (editingIndex !== null && editingIndex >= 0) {
          currentNames[editingIndex] = updatedCustomer.hoten;
          currentIds[editingIndex] = updatedCustomer.cccd || updatedCustomer.passport || "";
          currentCustIds[editingIndex] = updatedCustomer._id;
        }

        await onUpdateBooking({
          guestName: currentNames.join(", "),
          guestId: currentIds.join(", "),
          guestCustomerId: currentCustIds.join(", "),
        });

        setShowAddCustomerModal(false);
        setEditingCustomer(null);
        setEditingIndex(null);
        return true;
      } else {
        const localExisting = customers.find(
          (c) =>
            (payload.cccd && c.cccd === payload.cccd) ||
            (payload.passport && c.passport === payload.passport)
        );

        if (localExisting) {
          await updateCustomer(localExisting._id, payload);
          if (addToast) addToast("Đã cập nhật thông tin khách hàng");

          await loadInitialCustomers();
          handleAddGuest(localExisting);
          setShowAddCustomerModal(false);
          return true;
        }

        const res = await createCustomer(payload);
        if (addToast) addToast("Thêm khách hàng mới thành công", "success");

        const newCustomer = res.data;
        await loadInitialCustomers();

        if (newCustomer) {
          handleAddGuest(newCustomer);
        }
        setShowAddCustomerModal(false);
        return true;
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Lỗi khi xử lý thông tin khách hàng";
      if (addToast) addToast(errMsg, "error");
      return false;
    }
  };

  return (
    <div>
      <div
        style={{
          background: "rgba(46, 125, 82, 0.04)",
          border: "1.5px solid rgba(46, 125, 82, 0.15)",
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--accent)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Khách lưu trú ({guestsCombined.length})
          </div>
          <button
            type="button"
            onClick={() => setIsAdding((prev) => !prev)}
            style={{
              background: "rgba(46, 125, 82, 0.1)",
              border: "none",
              borderRadius: "50%",
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2e7d52",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 16,
              transition: "background 0.2s",
            }}
            title="Thêm khách lưu trú"
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(46, 125, 82, 0.2)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(46, 125, 82, 0.1)"}
          >
            ＋
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {guestsCombined.map((g, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 14.5,
                borderBottom:
                  idx < guestsCombined.length - 1
                    ? "1px dashed var(--border)"
                    : "none",
                paddingBottom: idx < guestsCombined.length - 1 ? 8 : 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  👤 {g.name || "Chưa cập nhật tên"}
                </span>
                {g.id && (
                  <span
                    style={{
                      fontSize: 12.5,
                      color: "var(--text2)",
                      background: "var(--bg3)",
                      padding: "2px 8px",
                      borderRadius: 6,
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ID/CCCD: {g.id}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                {/* Nút Sửa */}
                <button
                  type="button"
                  onClick={() => handleEditGuest(g, idx)}
                  title="Chỉnh sửa thông tin khách"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#8b85ff",
                    cursor: "pointer",
                    padding: "4px 6px",
                    display: "flex",
                    alignItems: "center",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#7367f0"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#8b85ff"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </button>

                {/* Nút Xóa */}
                <button
                  type="button"
                  onClick={() => handleDeleteGuest(idx)}
                  title="Xóa khách khỏi phòng"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    padding: "4px 6px",
                    display: "flex",
                    alignItems: "center",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#dc2626"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#ef4444"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {isAdding && (
          <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
            <SearchableCustomerSelect
              label="Chọn khách hàng thêm vào phòng"
              customers={customers.filter((c) => {
                const id = c.cccd || c.passport || "";
                const cid = c._id;

                const isAlreadyInRoom = guestsCombined.some((g) => {
                  if (cid && g.customerId && g.customerId === cid) return true;
                  const matchId = id && g.id && g.id === id;
                  return matchId;
                });
                
                if (cid && checkedInCustomerIds.has(cid)) return false;
                if (id && checkedInIds.has(id)) return false;

                return !isAlreadyInRoom;
              })}
              selectedCustomer={null}
              onSelect={handleAddGuest}
              onAddDirectClick={() => {
                setEditingCustomer(null);
                setEditingIndex(null);
                setShowAddCustomerModal(true);
              }}
              onLoadMore={loadMoreCustomers}
              hasMore={hasMoreCustomers}
              loadingMore={loadingMoreCustomers}
              dropdownAlign="down"
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setIsAdding(false)}
                style={{ padding: "4px 10px", fontSize: 12 }}
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          [
            "Khai báo công an",
            booking.is_reported
              ? `Đã khai báo (${formatTime(booking.reported)})`
              : "Chưa khai báo",
          ],
          [
            "Loại",
            booking.bookingType === "hourly"
              ? "Nghỉ giờ"
              : booking.bookingType === "overnight"
              ? "Qua đêm"
              : "Ngày đêm",
          ],
          ["Ca", booking.shift === "night" ? "Ca đêm" : "Ca ngày"],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: 8,
              padding: "10px 12px",
            }}
          >
            <div style={{ fontSize: 12, color: "#6b6f84", marginBottom: 2 }}>
              {label}
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color:
                  label === "Khai báo công an"
                    ? booking.is_reported
                      ? "#10b981"
                      : "#f59e0b"
                    : "inherit",
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {booking.notes && (
        <div
          style={{
            marginTop: 30,
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 8,
            padding: "14px 12px 10px",
            position: "relative",
            background: "rgba(245,158,11,0.04)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -12,
              left: 12,
              padding: "0 6px",
              background: "#fff",
              fontSize: 16,
              fontWeight: 600,
              color: "#f59e0b",
            }}
          >
            Ghi chú
          </div>

          <div
            style={{
              fontSize: 14,
              color: "#f59e0b",
            }}
          >
            {booking.notes}
          </div>
        </div>
      )}

      {showAddCustomerModal && (
        <AddCustomerModal
          customer={editingCustomer}
          options={customerOptions}
          onClose={() => {
            setShowAddCustomerModal(false);
            setEditingCustomer(null);
            setEditingIndex(null);
          }}
          onSave={handleCreateCustomerDirect}
          addToast={addToast}
        />
      )}
    </div>
  );
}
