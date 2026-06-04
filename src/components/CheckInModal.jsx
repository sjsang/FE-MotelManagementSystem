import React, { useState } from "react";

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

export default function CheckInModal({ room, priceConfig, onClose, onSubmit }) {
  const [form, setForm] = useState({
    guestName: "",
    guestPhone: "",
    guestId: "",
    bookingType: "hourly",
    shift:
      new Date().getHours() >= 23 || new Date().getHours() < 5
        ? "night"
        : "day",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.guestName.trim()) {
      alert("Vui lòng nhập tên khách");
      return;
    }
    setLoading(true);
    await onSubmit({ ...form, roomNumber: room.roomNumber });
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
          <div className="form-group">
            <label className="form-label">Tên khách *</label>
            <input
              className="form-control"
              placeholder="Nguyễn Văn A"
              value={form.guestName}
              onChange={(e) => set("guestName", e.target.value)}
              autoFocus
            />
          </div>
          <div className="input-row">
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input
                className="form-control"
                placeholder="09xx..."
                value={form.guestPhone}
                onChange={(e) => set("guestPhone", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">CMND / CCCD</label>
              <input
                className="form-control"
                placeholder="0xx..."
                value={form.guestId}
                onChange={(e) => set("guestId", e.target.value)}
              />
            </div>
          </div>

          <div className="input-row">
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
              placeholder="..."
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
