import React, { useState, useEffect, useRef } from "react";
import { getCustomers, createCustomer, updateCustomer, getCustomerOptions, getBookings } from "../utils/api";
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
  checkedInIds,
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Tải trang đầu tiên khi mở dropdown hoặc thay đổi từ khóa
  const loadFirstPage = async (term) => {
    try {
      setLoadingMore(true);
      const res = await getCustomers({ search: term, sort: "hoten", page: 1 });
      const resData = res.data?.data || res.data || [];
      const resHasMore = res.data?.hasMore || false;
      setList(resData);
      setPage(1);
      setHasMore(resHasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Tải trang tiếp theo (Lazy load)
  const loadNextPage = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const res = await getCustomers({ search: search.trim(), sort: "hoten", page: nextPage });
      const resData = res.data?.data || res.data || [];
      const resHasMore = res.data?.hasMore || false;
      setList((prev) => [...prev, ...resData]);
      setPage(nextPage);
      setHasMore(resHasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Gọi tải trang đầu
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        loadFirstPage(search.trim());
      }, search.trim() ? 250 : 0);
      return () => clearTimeout(timer);
    }
  }, [search, isOpen]);

  const filtered = list.filter((c) => {
    if (excludeIds && excludeIds.includes(c._id)) return false;
    if (checkedInIds) {
      if (c.cccd && checkedInIds.has(c.cccd)) return false;
      if (c.passport && checkedInIds.has(c.passport)) return false;
    }
    return true;
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
                  {(selectedCustomer.quoctich === "Việt Nam" || selectedCustomer.quoctich === "VNM - Viet Nam")
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
                  onScroll={(e) => {
                    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                    if (scrollHeight - scrollTop - clientHeight < 15) {
                      loadNextPage();
                    }
                  }}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    maxHeight: "220px",
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
                  {filtered.length === 0 && !loadingMore ? (
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
                    <>
                      {filtered.map((c) => (
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
                            {(c.quoctich === "Việt Nam" || c.quoctich === "VNM - Viet Nam")
                              ? `CCCD: ${c.cccd}`
                              : `Hộ chiếu: ${c.passport}`}
                          </div>
                        </div>
                      ))}
                      {hasMore && (
                        <div
                          style={{
                            padding: "10px 14px",
                            textAlign: "center",
                            fontSize: "12px",
                            color: "var(--text3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            borderBottom: "1px solid var(--border)",
                            background: "rgba(255,255,255,0.02)",
                          }}
                        >
                          <span
                            className="loading-spinner"
                            style={{
                              width: "12px",
                              height: "12px",
                              border: "1.5px solid rgba(255,255,255,0.1)",
                              borderTopColor: "var(--accent)",
                              borderRadius: "50%",
                              display: "inline-block",
                              animation: "spin 0.8s linear infinite",
                            }}
                          />
                          Đang tải thêm...
                        </div>
                      )}
                    </>
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
  const [checkedInIds, setCheckedInIds] = useState(new Set());
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
    lydocutru: "1 - Du lịch",
    nhaplydo: "",
  });
  const [loading, setLoading] = useState(false);

  // Tải danh sách khách hàng và các cấu hình dropdown
  useEffect(() => {
    getCustomers({ sort: "hoten" })
      .then((res) => {
        setCustomers(Array.isArray(res.data) ? res.data : res.data?.data || []);
      })
      .catch((err) => {
        console.error("Không thể tải danh sách khách hàng:", err);
      });

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
      // 1. Kiểm tra nhanh trong danh sách khách hàng đã tải ở frontend
      const localExisting = customers.find(
        (c) =>
          (payload.cccd && c.cccd === payload.cccd) ||
          (payload.passport && c.passport === payload.passport)
      );

      if (localExisting) {
        // Tự động cập nhật thông tin mới nhất cho khách hàng này vào database
        await updateCustomer(localExisting._id, payload);
        
        // Tải lại danh sách khách hàng để đảm bảo dữ liệu mới nhất hiển thị trên màn hình
        const custRes = await getCustomers({ sort: "hoten" });
        const updatedList = Array.isArray(custRes.data)
          ? custRes.data
          : custRes.data?.data || [];
        setCustomers(updatedList);

        const updatedCustomer = updatedList.find(c => c._id === localExisting._id);
        
        // Chọn khách hàng đã cập nhật vào phòng hiện tại
        setSelectedGuests((prev) => {
          const updated = [...prev];
          updated[addingForIndex] = updatedCustomer || localExisting;
          return updated;
        });

        if (addToast) {
          addToast("Đã cập nhật thông tin mới nhất và tự động chọn khách hàng này!", "success");
        }
        return true;
      }

      // 2. Thử tạo mới khách hàng qua API
      const res = await createCustomer(payload);
      if (addToast) addToast("Thêm khách hàng mới thành công");

      // Tải lại danh sách khách hàng
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
      
      // 3. Nếu bị lỗi trùng CCCD/Hộ chiếu (khách cũ đã có trong DB nhưng frontend chưa tải về hết)
      if (errMsg.includes("đã tồn tại")) {
        try {
          // Gọi API tìm kiếm khách hàng bằng CCCD hoặc Hộ chiếu
          const searchRes = await getCustomers({ search: payload.cccd || payload.passport });
          const searchList = Array.isArray(searchRes.data)
            ? searchRes.data
            : searchRes.data?.data || [];
          
          const found = searchList.find(
            (c) =>
              (payload.cccd && c.cccd === payload.cccd) ||
              (payload.passport && c.passport === payload.passport)
          );

          if (found) {
            // Gọi API cập nhật thông tin mới nhất vào DB
            await updateCustomer(found._id, payload);

            // Tải lại danh sách khách hàng đầy đủ
            const custRes = await getCustomers({ sort: "hoten" });
            const updatedList = Array.isArray(custRes.data)
              ? custRes.data
              : custRes.data?.data || [];
            
            // Tìm lại đối tượng đã cập nhật để có dữ liệu chính xác nhất
            const updatedCustomer = updatedList.find(c => c._id === found._id) || { ...found, ...payload };

            // Cập nhật vào state khách hàng cục bộ
            setCustomers((prev) => {
              const baseList = prev.filter(c => c._id !== found._id);
              return [updatedCustomer, ...baseList];
            });

            // Chọn khách hàng này vào phòng
            setSelectedGuests((prev) => {
              const updated = [...prev];
              updated[addingForIndex] = updatedCustomer;
              return updated;
            });

            if (addToast) {
              addToast("Đã cập nhật thông tin mới nhất và tự động chọn khách hàng này!", "success");
            }
            return true;
          }
        } catch (fallbackErr) {
          console.error("Lỗi khi xử lý cập nhật fallback:", fallbackErr);
        }
      }

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
      if (addToast) addToast("Vui lòng nhập lý do cụ trú cụ thể", "error");
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
                  checkedInIds={checkedInIds}
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
          addToast={addToast}
        />
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
