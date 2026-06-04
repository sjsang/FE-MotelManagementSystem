import React, { useState, useEffect } from "react";
import { getCustomers } from "../utils/api";

const BOOKING_TYPES = [
  { value: "hourly", label: "🕐 Nghỉ giờ" },
  { value: "overnight", label: "🌙 Qua đêm" },
  { value: "fullday", label: "📅 Ngày đêm (24h)" },
];

function getPricePreview(priceConfig, roomType, bookingType, shift) {
  if (!priceConfig) return null;
  try {
    const prices =
      shift === "night" ? priceConfig.nightShift : priceConfig.dayShift;
    const tp = roomType === "double" ? prices.double : prices.single;
    if (bookingType === "fullday") return tp.fullday;
    if (bookingType === "overnight") return tp.overnight;
    if (bookingType === "hourly") return tp.hourly_first ?? null;
  } catch {
    return null;
  }
  return null;
}

function getHourlyHint(priceConfig, roomType, shift) {
  if (!priceConfig) return null;
  try {
    const prices =
      shift === "night" ? priceConfig.nightShift : priceConfig.dayShift;
    const tp = roomType === "double" ? prices.double : prices.single;
    const first = tp.hourly_first;
    const extra = tp.hourly_extra;
    const firstLimit = tp.hourly_first_limit; // phút, nếu có
    if (shift === "day") {
      const parts = [];
      if (firstLimit && first)
        parts.push(`≤${firstLimit}p: ${(first / 1000).toFixed(0)}k`);
      if (tp.hourly_2h) parts.push(`≤2h: ${(tp.hourly_2h / 1000).toFixed(0)}k`);
      if (extra) parts.push(`+${(extra / 1000).toFixed(0)}k/giờ`);
      return parts.length ? parts.join(" • ") : null;
    } else {
      const parts = [];
      if (first) parts.push(`Từ ${(first / 1000).toFixed(0)}k`);
      if (extra) parts.push(`+${(extra / 1000).toFixed(0)}k/giờ`);
      return parts.length ? parts.join(" • ") : null;
    }
  } catch {
    return null;
  }
}

function SearchableCustomerSelect({
  label,
  customers,
  selectedCustomer,
  onSelect,
  onClear,
  excludeId,
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = customers.filter((c) => {
    if (excludeId && c._id === excludeId) return false;
    const term = search.toLowerCase().trim();
    if (!term) return true;
    const name = c.hoten?.toLowerCase() || "";
    const cccd = c.cccd?.toLowerCase() || "";
    const passport = c.passport?.toLowerCase() || "";
    return (
      name.includes(term) || cccd.includes(term) || passport.includes(term)
    );
  });

  return (
    <div className="form-group" style={{ position: "relative" }}>
      <label className="form-label">{label}</label>
      {selectedCustomer ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--bg3)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            padding: "10px 14px",
            fontSize: "14px",
            color: "var(--text)",
          }}
        >
          <div>
            <strong style={{ color: "var(--accent)" }}>
              {selectedCustomer.hoten}
            </strong>
            <span
              style={{ marginLeft: 8, fontSize: "12px", color: "var(--text3)" }}
            >
              (
              {selectedCustomer.quoctich === "Việt Nam"
                ? `CCCD: ${selectedCustomer.cccd}`
                : `Hộ chiếu: ${selectedCustomer.passport}`}
              )
            </span>
          </div>
          <button
            type="button"
            onClick={onClear}
            style={{
              background: "none",
              border: "none",
              color: "#ef4444",
              cursor: "pointer",
              fontSize: "16px",
              padding: "2px 6px",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <div>
          <input
            className="form-control"
            placeholder="Nhập tên hoặc số CCCD/Hộ chiếu để tìm kiếm khách..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
          {isOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                maxHeight: "180px",
                overflowY: "auto",
                zIndex: 999,
                boxShadow: "var(--shadow)",
                marginTop: "4px",
              }}
            >
              {filtered.length === 0 ? (
                <div
                  style={{
                    padding: "12px",
                    color: "var(--text3)",
                    fontSize: "13px",
                    textAlign: "center",
                  }}
                >
                  Không tìm thấy khách hàng nào hợp lệ
                </div>
              ) : (
                filtered.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => {
                      onSelect(c);
                      setSearch("");
                      setIsOpen(false);
                    }}
                    style={{
                      padding: "10px 14px",
                      cursor: "pointer",
                      borderBottom: "1px solid var(--border)",
                      fontSize: "13px",
                      color: "var(--text)",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "var(--bg3)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <div style={{ fontWeight: 600 }}>{c.hoten}</div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--text3)",
                        marginTop: "2px",
                      }}
                    >
                      Quốc tịch: {c.quoctich} •{" "}
                      {c.quoctich === "Việt Nam"
                        ? `CCCD: ${c.cccd}`
                        : `Hộ chiếu: ${c.passport}`}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {isOpen && (
            <div
              style={{
                position: "fixed",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 998,
              }}
              onClick={() => setIsOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function CheckInModal({ room, priceConfig, onClose, onSubmit }) {
  const [customers, setCustomers] = useState([]);
  const [guest1, setGuest1] = useState(null);
  const [guest2, setGuest2] = useState(null);
  const [showGuest2, setShowGuest2] = useState(false);

  const [form, setForm] = useState({
    bookingType: "hourly",
    shift:
      new Date().getHours() >= 23 || new Date().getHours() < 5
        ? "night"
        : "day",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  // Tải danh sách khách hàng khi mở modal
  useEffect(() => {
    getCustomers()
      .then((res) => {
        setCustomers(res.data || []);
      })
      .catch((err) => {
        console.error("Không thể tải danh sách khách hàng:", err);
      });
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!guest1) {
      alert("Vui lòng chọn Khách hàng chính");
      return;
    }

    setLoading(true);

    const guest1Name = guest1.hoten;
    const guest1Id = guest1.cccd || guest1.passport || "";

    let finalGuestName = guest1Name;
    let finalGuestId = guest1Id;

    if (showGuest2 && guest2) {
      finalGuestName = `${guest1Name}, ${guest2.hoten}`;
      const guest2Id = guest2.cccd || guest2.passport || "";
      finalGuestId = `${guest1Id}${
        guest1Id && guest2Id ? ", " : ""
      }${guest2Id}`;
    }

    await onSubmit({
      ...form,
      guestName: finalGuestName,
      guestId: finalGuestId,
      guestPhone: "", // Để trống vì model khách hàng không lưu điện thoại
      roomNumber: room.roomNumber,
    });
    setLoading(false);
  };

  const pricePreview = getPricePreview(
    priceConfig,
    room.type,
    form.bookingType,
    form.shift
  );

  const hourlyHint =
    form.bookingType === "hourly"
      ? getHourlyHint(priceConfig, room.type, form.shift)
      : null;

  const fmt = (n) => (n ? n.toLocaleString("vi-VN") + "đ" : "");

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">Check-in phòng {room.roomNumber}</div>
            <div style={{ fontSize: 12, color: "#9fa3b8", marginTop: 2 }}>
              Phòng {room.type === "double" ? "đôi" : "đơn"}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Chọn khách hàng thứ nhất */}
          <SearchableCustomerSelect
            label="Khách hàng *"
            customers={customers}
            selectedCustomer={guest1}
            onSelect={(c) => setGuest1(c)}
            onClear={() => setGuest1(null)}
            excludeId={guest2?._id}
          />

          {/* Chọn khách hàng thứ hai (chỉ cho phép nếu là phòng đôi) */}
          {room.type === "double" && (
            <div style={{ marginTop: 14 }}>
              {!showGuest2 ? (
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
                  onClick={() => setShowGuest2(true)}
                >
                  ➕ Thêm khách thứ hai
                </button>
              ) : (
                <div
                  style={{
                    border: "1px dashed rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    padding: "12px",
                    background: "rgba(255,255,255,0.01)",
                  }}
                >
                  <SearchableCustomerSelect
                    label="Khách hàng thứ hai"
                    customers={customers}
                    selectedCustomer={guest2}
                    onSelect={(c) => setGuest2(c)}
                    onClear={() => {
                      setGuest2(null);
                      setShowGuest2(false);
                    }}
                    excludeId={guest1?._id}
                  />
                </div>
              )}
            </div>
          )}

          <div className="input-row" style={{ marginTop: 14 }}>
            <div className="form-group">
              <label className="form-label">Loại phòng</label>
              <select
                className="form-control"
                value={form.bookingType}
                onChange={(e) => set("bookingType", e.target.value)}
              >
                {BOOKING_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Ca</label>
              <select
                className="form-control"
                value={form.shift}
                onChange={(e) => set("shift", e.target.value)}
              >
                <option value="day">☀️ Ca ngày (5h–23h)</option>
                <option value="night">🌙 Ca đêm (23h–5h)</option>
              </select>
            </div>
          </div>

          {pricePreview && (
            <div
              style={{
                background: "rgba(108,99,255,0.1)",
                border: "1px solid rgba(108,99,255,0.25)",
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 14,
                marginTop: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 13, color: "#9fa3b8" }}>
                Giá khởi điểm
              </span>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#8b85ff" }}>
                {fmt(pricePreview)}
              </span>
            </div>
          )}

          {hourlyHint && (
            <div
              style={{
                background: "rgba(245,158,11,0.08)",
                borderRadius: 8,
                padding: "10px 12px",
                marginBottom: 14,
                fontSize: 12.5,
                color: "#f59e0b",
              }}
            >
              {hourlyHint}
            </div>
          )}

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
  );
}
