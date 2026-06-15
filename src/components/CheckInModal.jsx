import React, { useState, useEffect, useRef } from "react";
import { getCustomers, createCustomer, getCustomerOptions } from "../utils/api";
import AddCustomerModal from "./AddCustomerModal";

const BOOKING_TYPES = [
  { value: "hourly", label: "Nghỉ giờ" },
  { value: "overnight", label: "Qua đêm" },
  { value: "fullday", label: "Ngày đêm (24h)" },
];

// ─── Pricing helpers (từ PricingCalculator) ──────────────────────────────────
const QUICK_HOURS = {
  hourly: [0.5, 1, 1.5, 2, 3, 6, 12],
  overnight: [14, 15, 16, 20, 24],
  fullday: [24, 30, 36, 48, 72, 120],
};

const LATE_EARLY_FEE = 20000;

function fmtMoney(n) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ";
}

function fmtHours(h) {
  if (h === 0) return "0 giờ";
  const days = Math.floor(h / 24);
  const hrs = Math.floor(h % 24);
  const mins = Math.round((h % 1) * 60);
  const parts = [];
  if (days) parts.push(days + " ngày");
  if (hrs) parts.push(hrs + " giờ");
  if (mins) parts.push(mins + " phút");
  return parts.join(" ");
}

function ceilWithGrace(hours) {
  const fl = Math.floor(hours);
  return hours - fl > 0.25 ? fl + 1 : fl;
}

function calcBillingFromConfig(
  priceConfig,
  roomType,
  shift,
  bookingType,
  hours
) {
  if (!priceConfig) return null;
  try {
    const shiftPrices =
      shift === "night" ? priceConfig.nightShift : priceConfig.dayShift;
    const p = roomType === "double" ? shiftPrices.double : shiftPrices.single;
    if (!p) return null;

    let base = 0,
      extra = 0,
      extraH = 0,
      threshold = 0;
    let breakdowns = [],
      note = "";

    if (bookingType === "fullday") {
      base = p.fullday ?? 0;
      threshold = 24;
      if (hours > threshold) {
        extraH = ceilWithGrace(hours - 24);
        extra = extraH * LATE_EARLY_FEE;
      }
      note = `Gói cả ngày: ${fmtMoney(
        base
      )} cho 24 giờ đầu. Vượt quá tính thêm ${fmtMoney(
        LATE_EARLY_FEE
      )}/giờ (grace 15 phút).`;
      breakdowns = [{ l: "Giá cả ngày (≤ 24h)", v: fmtMoney(base) }];
      if (extraH > 0)
        breakdowns.push({
          l: `Phụ trội ${extraH}h × ${fmtMoney(LATE_EARLY_FEE)}`,
          v: fmtMoney(extra),
        });
    } else if (bookingType === "overnight") {
      base = p.overnight ?? 0;
      threshold = 14;
      if (hours > threshold) {
        extraH = ceilWithGrace(hours - 14);
        extra = extraH * LATE_EARLY_FEE;
      }
      note = `Gói qua đêm: ${fmtMoney(
        base
      )} cho 14 giờ đầu. Vượt quá tính thêm ${fmtMoney(LATE_EARLY_FEE)}/giờ.`;
      breakdowns = [{ l: "Giá qua đêm (≤ 14h)", v: fmtMoney(base) }];
      if (extraH > 0)
        breakdowns.push({
          l: `Phụ trội ${extraH}h × ${fmtMoney(LATE_EARLY_FEE)}`,
          v: fmtMoney(extra),
        });
    } else {
      // hourly
      if (shift === "night") {
        base = p.hourly_first ?? 0;
        threshold = 1;
        if (hours > 1) {
          extraH = ceilWithGrace(hours - 1);
          extra = extraH * (p.hourly_extra ?? 0);
        }
        note = `Ca đêm: ${fmtMoney(
          base
        )} giờ đầu. Từ giờ thứ 2 mỗi giờ thêm ${fmtMoney(
          p.hourly_extra ?? 0
        )} (grace 15 phút).`;
        breakdowns = [{ l: "Giờ đầu tiên", v: fmtMoney(base) }];
        if (extraH > 0)
          breakdowns.push({
            l: `${extraH} giờ tiếp × ${fmtMoney(p.hourly_extra ?? 0)}`,
            v: fmtMoney(extra),
          });
      } else {
        threshold = 2;
        const minutes = hours * 60;
        if (minutes <= 30) {
          base = p.hourly_first ?? p.hourly_2h ?? 0;
          note = `Ở ≤ 30 phút: tính giá mở phòng cố định ${fmtMoney(base)}.`;
          breakdowns = [{ l: "Mở phòng (≤ 30 phút)", v: fmtMoney(base) }];
        } else if (hours <= 2) {
          base = p.hourly_2h ?? p.hourly_first ?? 0;
          note = `Ở 30 phút – 2 giờ: tính gói 2 giờ cố định ${fmtMoney(base)}.`;
          breakdowns = [{ l: "Gói 2 giờ đầu", v: fmtMoney(base) }];
        } else {
          base = p.hourly_2h ?? p.hourly_first ?? 0;
          extraH = ceilWithGrace(hours - 2);
          extra = extraH * (p.hourly_extra ?? 0);
          note = `Hơn 2 giờ: gói 2 giờ ${fmtMoney(
            base
          )} + mỗi giờ thêm ${fmtMoney(p.hourly_extra ?? 0)} (grace 15 phút).`;
          breakdowns = [{ l: "Gói 2 giờ đầu", v: fmtMoney(base) }];
          if (extraH > 0)
            breakdowns.push({
              l: `${extraH} giờ tiếp × ${fmtMoney(p.hourly_extra ?? 0)}`,
              v: fmtMoney(extra),
            });
        }
      }
    }

    return { base, extra, total: base + extra, threshold, note, breakdowns };
  } catch {
    return null;
  }
}

// ─── Inline Pricing Panel ─────────────────────────────────────────────────────
function PricingPanel({ priceConfig, roomType, shift, bookingType }) {
  const [hours, setHours] = useState(1.5);
  const [hoursInput, setHoursInput] = useState("1.5");

  // Reset hours khi đổi bookingType cho hợp lý
  useEffect(() => {
    const defaults = { hourly: 1.5, overnight: 14, fullday: 24 };
    const h = defaults[bookingType] ?? 1.5;
    setHours(h);
    setHoursInput(String(h));
  }, [bookingType]);

  const billing = calcBillingFromConfig(
    priceConfig,
    roomType,
    shift,
    bookingType,
    hours
  );
  const quickList = QUICK_HOURS[bookingType] ?? [];

  if (!billing) return null;

  return (
    <div
      style={{
        background: "rgba(108,99,255,0.06)",
        border: "1px solid rgba(108,99,255,0.2)",
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 14,
        marginTop: 6,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#8b85ff",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: 10,
        }}
      >
        Tính tiền dự kiến
      </div>

      {/* Nhập số giờ */}
      <div style={{ marginBottom: 10 }}>
        <label
          style={{
            fontSize: 12,
            color: "var(--text3)",
            marginBottom: 4,
            display: "block",
          }}
        >
          Số giờ nghỉ
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            value={hoursInput}
            onChange={(e) => {
              setHoursInput(e.target.value);
              const n = parseFloat(e.target.value);
              if (!isNaN(n) && n >= 0) setHours(n);
            }}
            onBlur={() => setHoursInput(String(hours))}
            style={{
              width: 72,
              textAlign: "center",
              fontSize: 18,
              fontWeight: 700,
              padding: "6px 8px",
              border: "1.5px solid rgba(108,99,255,0.4)",
              borderRadius: 8,
              background: "var(--bg3)",
              color: "var(--text)",
              MozAppearance: "textfield",
              appearance: "textfield",
            }}
          />
          <span style={{ fontSize: 13, color: "var(--text3)" }}>giờ</span>
          <span style={{ fontSize: 12, color: "#8b85ff", marginLeft: 4 }}>
            ({fmtHours(hours)})
          </span>
        </div>
      </div>

      {/* Quick pick */}
      {quickList.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 12,
          }}
        >
          {quickList.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => {
                setHours(h);
                setHoursInput(String(h));
              }}
              style={{
                padding: "4px 10px",
                fontSize: 12,
                borderRadius: 20,
                border:
                  hours === h
                    ? "1.5px solid #8b85ff"
                    : "1px solid var(--border)",
                background:
                  hours === h ? "rgba(108,99,255,0.15)" : "var(--bg3)",
                color: hours === h ? "#8b85ff" : "var(--text3)",
                cursor: "pointer",
                fontWeight: hours === h ? 700 : 400,
                transition: "all 0.15s",
              }}
            >
              {fmtHours(h)}
            </button>
          ))}
        </div>
      )}

      {/* Breakdown */}
      <div
        style={{ borderTop: "1px solid rgba(108,99,255,0.15)", paddingTop: 10 }}
      >
        {billing.breakdowns.map((b, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              color: "var(--text3)",
              marginBottom: 4,
            }}
          >
            <span>{b.l}</span>
            <span style={{ fontWeight: 600, color: "var(--text)" }}>{b.v}</span>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
            paddingTop: 8,
            borderTop: "1px solid rgba(108,99,255,0.15)",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--text3)" }}>
            Tổng dự kiến
          </span>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#8b85ff" }}>
            {fmtMoney(billing.total)}
          </span>
        </div>
      </div>

      {/* Ghi chú */}
      {billing.note && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 10px",
            background: "rgba(245,158,11,0.08)",
            borderRadius: 8,
            fontSize: 12,
            color: "#f59e0b",
            lineHeight: 1.5,
          }}
        >
          {billing.note}
        </div>
      )}
    </div>
  );
}

function SearchableCustomerSelect({
  label,
  customers,
  selectedCustomer,
  onSelect,
  onClear,
  excludeIds,
  onAddDirectClick,
  dropdownAlign = "down",
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = customers.filter((c) => {
    if (excludeIds && excludeIds.includes(c._id)) return false;
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
    <div
      className="form-group"
      style={{ position: "relative", marginBottom: "12px" }}
    >
      <label className="form-label" style={{ marginBottom: "4px" }}>
        {label}
      </label>
      <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
        <div
          style={{
            flex: 1,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
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
                fontSize: "13px",
                color: "var(--text)",
                height: "40px",
              }}
            >
              <div
                style={{
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                <strong style={{ color: "var(--accent)" }}>
                  {selectedCustomer.hoten}
                </strong>
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: "11px",
                    color: "var(--text3)",
                  }}
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
            <div style={{ position: "relative", width: "100%" }}>
              <input
                className="form-control"
                placeholder="Nhập tên hoặc số CCCD/Hộ chiếu để tìm kiếm..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                style={{ height: "40px" }}
              />
              {isOpen && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    maxHeight: "180px",
                    overflowY: "auto",
                    zIndex: 999,
                    boxShadow: "var(--shadow)",
                    ...(dropdownAlign === "up"
                      ? {
                          bottom: "100%",
                          marginBottom: "4px",
                        }
                      : {
                          top: "100%",
                          marginTop: "4px",
                        }),
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
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
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

        <button
          type="button"
          className="btn btn-success"
          style={{
            padding: "0 14px",
            height: "40px",
            background: "#2e7d52",
            borderColor: "#2e7d52",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
            fontSize: "18px",
            cursor: "pointer",
          }}
          onClick={onAddDirectClick}
          title="Thêm mới khách hàng trực tiếp"
        >
          ＋
        </button>
      </div>
    </div>
  );
}

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

  // Tự động cuộn xuống dưới cùng khi thêm khách mới vào phòng
  useEffect(() => {
    if (guestsContainerRef.current) {
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
  });
  const [loading, setLoading] = useState(false);

  // Tải danh sách khách hàng và các cấu hình dropdown
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
      .catch(() => {});
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreateCustomerDirect = async (payload) => {
    try {
      const res = await createCustomer(payload);
      if (addToast) addToast("Thêm khách hàng mới thành công");

      // Tải lại danh sách khách hàng
      const custRes = await getCustomers();
      const updatedList = Array.isArray(custRes.data)
        ? custRes.data
        : custRes.data?.data || [];
      setCustomers(updatedList);

      // Tìm khách hàng vừa thêm để gắn vào slot chọn hiện tại
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
      guestPhone: "", // Để trống vì model khách hàng không lưu điện thoại
      roomNumber: room.roomNumber,
    });
    setLoading(false);
  };

  return (
    <>
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
                  className="form-control"
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
                  className="form-control"
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

      {/* Modal thêm mới khách hàng trực tiếp */}
      {showAddCustomerModal && (
        <AddCustomerModal
          options={customerOptions}
          onClose={() => {
            setShowAddCustomerModal(false);
            setAddingForIndex(null);
          }}
          onSave={handleCreateCustomerDirect}
        />
      )}
    </>
  );
}
