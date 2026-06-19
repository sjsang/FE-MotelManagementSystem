import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── Hook: detect màn hình nhỏ ───────────────────────────────────────────────
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < breakpoint
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}
import { getBookings, getRevenue, getCustomers } from "../utils/api";
import { useToast } from "../hooks/useToast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { exportBookingsToExcel } from "../utils/excel_bookinglist";

// ─── Constants ──────────────────────────────────────────────────────────────
const TYPE_LABEL = {
  hourly: "Nghỉ giờ",
  overnight: "Qua đêm",
  fullday: "Ngày đêm",
};
const STATUS_LABEL = {
  active: "Đang ở",
  completed: "Đã trả",
  cancelled: "Hủy",
};
const SHIFT_LABEL = { day: "Ca ngày", night: "Ca đêm" };
const STATUS_STYLE = {
  active: { color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  completed: { color: "#8b85ff", bg: "rgba(108,99,255,0.1)" },
  cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

const DATE_PRESETS = [
  { value: "", label: "Khoảng ngày" },
  { value: "today", label: "Hôm nay" },
  { value: "yesterday", label: "Hôm qua" },
  { value: "this_week", label: "Tuần này" },
  { value: "last_week", label: "Tuần trước" },
  { value: "this_month", label: "Tháng này" },
  { value: "last_month", label: "Tháng trước" },
];

const PAGE_LIMIT = 30;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n) {
  return (n || 0).toLocaleString("vi-VN") + "đ";
}
function fmtDate(d) {
  if (!d) return "--";
  return new Date(d).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function today() {
  return new Date().toISOString().split("T")[0];
}
function weekAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split("T")[0];
}

// ─── Custom tooltip cho chart ─────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div
        style={{
          background: "#1e2130",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          padding: "10px 14px",
        }}
      >
        <div style={{ fontSize: 12, color: "#9fa3b8", marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#8b85ff" }}>
          {(payload[0].value || 0).toLocaleString("vi-VN")}đ
        </div>
      </div>
    );
  }
  return null;
};

// ─── FilterTag (chip hiển thị bộ lọc đang active) ────────────────────────────
function FilterTag({ label, onRemove }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "rgba(139,133,255,0.15)",
        color: "#8b85ff",
        border: "1px solid rgba(139,133,255,0.3)",
        borderRadius: 20,
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {label}
      <button
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          color: "#8b85ff",
          cursor: "pointer",
          padding: 0,
          lineHeight: 1,
          fontSize: 14,
        }}
      >
        ×
      </button>
    </span>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function BookingHistory() {
  const isMobile = useIsMobile();

  // Revenue filter (độc lập với booking filter)
  const [revFilter, setRevFilter] = useState({ from: weekAgo(), to: today() });
  const [revenue, setRevenue] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [revLoading, setRevLoading] = useState(false);

  // Booking filter + lazy loading state
  const [filter, setFilter] = useState({
    status: "",
    bookingType: "",
    room_type: "",
    shift: "",
    preset: "today",
    from: "",
    to: "",
    dateField: "checkIn",
    search: "",
  });
  const [searchInput, setSearchInput] = useState(""); // controlled input trước khi commit

  const [bookings, setBookings] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [excludedBookingIds, setExcludedBookingIds] = useState(new Set());

  const toggleBookingSelection = (id) => {
    setExcludedBookingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isBookingSelected = (id) => {
    return !excludedBookingIds.has(id);
  };

  const allLoadedSelected =
    bookings.length > 0 && bookings.every((b) => isBookingSelected(b._id));

  const toggleSelectAll = () => {
    setExcludedBookingIds((prev) => {
      const next = new Set(prev);
      if (allLoadedSelected) {
        bookings.forEach((b) => next.add(b._id));
      } else {
        bookings.forEach((b) => next.delete(b._id));
      }
      return next;
    });
  };

  const { addToast, ToastContainer } = useToast();
  const observerRef = useRef(null); // ref gắn vào sentinel div
  const sentinelRef = useRef(null);

  // ── Xây query params từ filter ────────────────────────────────────────────
  const buildParams = useCallback(
    (cursor = null) => {
      const p = { limit: PAGE_LIMIT };
      if (filter.status) p.status = filter.status;
      if (filter.bookingType) p.bookingType = filter.bookingType;
      if (filter.room_type) p.room_type = filter.room_type;
      if (filter.shift) p.shift = filter.shift;
      if (filter.dateField) p.dateField = filter.dateField;
      if (filter.search) p.search = filter.search;
      if (filter.preset) {
        p.preset = filter.preset;
      } else {
        if (filter.from) p.from = filter.from;
        if (filter.to) p.to = filter.to + "T23:59:59";
      }
      if (cursor) p.cursor = cursor;
      return p;
    },
    [filter]
  );

  // ── Load trang đầu ───────────────────────────────────────────────────────
  const loadFirst = useCallback(async () => {
    setLoading(true);
    setBookings([]);
    setHasMore(false);
    setNextCursor(null);
    setExcludedBookingIds(new Set());
    try {
      const res = await getBookings(buildParams());
      const { data, hasMore: hm, nextCursor: nc } = res.data;
      setBookings(data || []);
      setHasMore(!!hm);
      setNextCursor(nc || null);
    } catch {
      addToast("Lỗi tải danh sách booking", "error");
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  // ── Load thêm (lazy) ─────────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await getBookings(buildParams(nextCursor));
      const { data, hasMore: hm, nextCursor: nc } = res.data;
      setBookings((prev) => [...prev, ...(data || [])]);
      setHasMore(!!hm);
      setNextCursor(nc || null);
    } catch {
      addToast("Lỗi tải thêm dữ liệu", "error");
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, nextCursor, loadingMore, buildParams]);

  // ── Intersection Observer để tự động load more ───────────────────────────
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [loadMore]);

  // ── Load revenue ─────────────────────────────────────────────────────────
  const loadRevenue = useCallback(async () => {
    setRevLoading(true);
    try {
      const [rRes, cRes] = await Promise.all([
        getRevenue({ from: revFilter.from, to: revFilter.to + "T23:59:59" }),
        getCustomers(),
      ]);
      setRevenue(rRes.data);
      setCustomers(
        Array.isArray(cRes.data) ? cRes.data : cRes.data?.data || []
      );
    } catch {
      addToast("Lỗi tải doanh thu", "error");
    } finally {
      setRevLoading(false);
    }
  }, [revFilter]);

  useEffect(() => {
    loadFirst();
  }, [filter]);
  useEffect(() => {
    loadRevenue();
  }, [revFilter]);

  // ── Helpers cập nhật filter ──────────────────────────────────────────────
  const setF = (key, val) => setFilter((f) => ({ ...f, [key]: val }));

  const clearFilter = (key) => setFilter((f) => ({ ...f, [key]: "" }));

  const commitSearch = () => setF("search", searchInput.trim());

  const handleExportExcel = async () => {
    setExporting(true);
    addToast("Đang tải toàn bộ dữ liệu theo bộ lọc để xuất Excel...", "info");
    try {
      const exportParams = buildParams();
      exportParams.limit = "none";
      delete exportParams.cursor;

      const [bookingsRes, customersRes] = await Promise.all([
        getBookings(exportParams),
        getCustomers({ limit: "none" }),
      ]);

      let allBookings = bookingsRes.data?.data || bookingsRes.data || [];
      const allCustomers = customersRes.data?.data || customersRes.data || [];

      if (excludedBookingIds.size > 0) {
        allBookings = allBookings.filter((b) => !excludedBookingIds.has(b._id));
      }

      if (allBookings.length === 0) {
        addToast(
          "Không có dữ liệu phù hợp với bộ lọc hiện tại để xuất!",
          "warning"
        );
        return;
      }

      exportBookingsToExcel(allBookings, allCustomers);
      addToast(
        `Xuất file Excel thành công (${allBookings.length} booking)!`,
        "success"
      );
    } catch (err) {
      console.error("Lỗi xuất Excel:", err);
      addToast("Lỗi khi tải dữ liệu xuất Excel", "error");
    } finally {
      setExporting(false);
    }
  };

  // ── Active filter tags ────────────────────────────────────────────────────
  const activeTags = [];
  if (filter.status)
    activeTags.push({ key: "status", label: STATUS_LABEL[filter.status] });
  if (filter.bookingType)
    activeTags.push({
      key: "bookingType",
      label: TYPE_LABEL[filter.bookingType],
    });
  if (filter.room_type)
    activeTags.push({
      key: "room_type",
      label: filter.room_type === "single" ? "Phòng đơn" : "Phòng đôi",
    });
  if (filter.shift)
    activeTags.push({ key: "shift", label: SHIFT_LABEL[filter.shift] });
  if (filter.preset)
    activeTags.push({
      key: "preset",
      label: DATE_PRESETS.find((p) => p.value === filter.preset)?.label,
    });
  if (!filter.preset && filter.from)
    activeTags.push({ key: "from", label: `Từ ${filter.from}` });
  if (!filter.preset && filter.to)
    activeTags.push({ key: "to", label: `Đến ${filter.to}` });
  if (filter.search)
    activeTags.push({ key: "search", label: `"${filter.search}"` });

  // ── Chart data ────────────────────────────────────────────────────────────
  const chartData = revenue
    ? Object.entries(revenue.byDay || {})
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, total]) => ({ date: day.slice(5), total }))
    : [];

  return (
    <div>
      <ToastContainer />
      <div className="page-header">
        <div>
          <div className="page-title">Lịch sử </div>
          <div className="page-subtitle">Xem lịch sử booking</div>
        </div>
      </div>
      <div className="card">
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ fontWeight: 700 }}>Danh sách booking</div>
          <button
            className="btn btn-success btn-sm"
            onClick={handleExportExcel}
            disabled={exporting || bookings.length === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
            }}
          >
            Xuất Excel
          </button>
        </div>

        {/* ── Bộ lọc chi tiết ── */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12,
            padding: "16px 18px",
            marginBottom: 14,
          }}
        >
          {/* Hàng 1: Tìm kiếm + Loại ngày + Trường ngày */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "flex-end",
              marginBottom: 12,
            }}
          >
            {/* Tìm kiếm */}
            <div style={{ flex: "1 1 220px" }}>
              <div className="form-label"> Tìm kiếm</div>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tên, SĐT, số phòng, CCCD..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && commitSearch()}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-ghost btn-sm" onClick={commitSearch}>
                  Tìm
                </button>
              </div>
            </div>

            {/* Trường ngày lọc */}
            <div>
              <div className="form-label">Lọc theo</div>
              <select
                className="form-control"
                value={filter.dateField}
                onChange={(e) => setF("dateField", e.target.value)}
                style={{ width: 130 }}
              >
                <option value="checkIn">Check-in</option>
                <option value="checkOut">Check-out</option>
                <option value="createdAt">Tạo lúc</option>
              </select>
            </div>

            {/* Preset ngày */}
            <div>
              <div className="form-label">Khoảng thời gian</div>
              <select
                className="form-control"
                value={filter.preset}
                onChange={(e) => {
                  setF("preset", e.target.value);
                  if (e.target.value) {
                    setF("from", "");
                    setF("to", "");
                  }
                }}
                style={{ width: 140 }}
              >
                {DATE_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Từ / Đến — chỉ hiện khi không chọn preset */}
            {!filter.preset && (
              <>
                <div>
                  <div className="form-label">Từ ngày</div>
                  <input
                    type="date"
                    className="form-control"
                    value={filter.from}
                    min="1900-01-01"
                    onChange={(e) => setF("from", e.target.value)}
                    style={{ width: 150 }}
                  />
                </div>
                <div>
                  <div className="form-label">Đến ngày</div>
                  <input
                    type="date"
                    className="form-control"
                    value={filter.to}
                    min="1900-01-01"
                    onChange={(e) => setF("to", e.target.value)}
                    style={{ width: 150 }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Hàng 2: Trạng thái / Loại booking / Loại phòng / Ca */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            {/* Trạng thái */}
            <div>
              <div className="form-label">Trạng thái</div>
              <select
                className="form-control"
                value={filter.status}
                onChange={(e) => setF("status", e.target.value)}
                style={{ width: 130 }}
              >
                <option value="">Tất cả</option>
                <option value="active">Đang ở</option>
                <option value="completed">Đã trả</option>
                <option value="cancelled">Hủy</option>
              </select>
            </div>

            {/* Loại booking */}
            <div>
              <div className="form-label">Loại đặt phòng</div>
              <select
                className="form-control"
                value={filter.bookingType}
                onChange={(e) => setF("bookingType", e.target.value)}
                style={{ width: 145 }}
              >
                <option value="">Tất cả</option>
                <option value="hourly">Nghỉ giờ</option>
                <option value="overnight">Qua đêm</option>
                <option value="fullday">Ngày đêm</option>
              </select>
            </div>

            {/* Loại phòng */}
            <div>
              <div className="form-label">Loại phòng</div>
              <select
                className="form-control"
                value={filter.room_type}
                onChange={(e) => setF("room_type", e.target.value)}
                style={{ width: 130 }}
              >
                <option value="">Tất cả</option>
                <option value="single">Phòng đơn</option>
                <option value="double">Phòng đôi</option>
              </select>
            </div>

            {/* Ca */}
            <div>
              <div className="form-label">Ca</div>
              <select
                className="form-control"
                value={filter.shift}
                onChange={(e) => setF("shift", e.target.value)}
                style={{ width: 120 }}
              >
                <option value="">Tất cả</option>
                <option value="day">Ca ngày</option>
                <option value="night">Ca đêm</option>
              </select>
            </div>

            {/* Nút reset */}
            <button
              className="btn btn-ghost btn-sm"
              style={{ alignSelf: "flex-end" }}
              onClick={() => {
                setFilter({
                  status: "",
                  bookingType: "",
                  room_type: "",
                  shift: "",
                  preset: "today",
                  from: "",
                  to: "",
                  dateField: "checkIn",
                  search: "",
                });
                setSearchInput("");
              }}
            >
              ↺ Xóa lọc
            </button>
          </div>
        </div>

        {/* Active filter tags */}
        {activeTags.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            {activeTags.map((tag) => (
              <FilterTag
                key={tag.key}
                label={tag.label}
                onRemove={() => clearFilter(tag.key)}
              />
            ))}
          </div>
        )}

        {/* Tổng số kết quả */}
        <div style={{ fontSize: 12, color: "#6b6f84", marginBottom: 10 }}>
          {loading
            ? "Đang tải..."
            : `Hiển thị ${bookings.length} booking${
                hasMore ? " (còn thêm)" : ""
              }`}
        </div>

        {/* ── Bảng / Card booking ── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#6b6f84" }}>
            Đang tải...
          </div>
        ) : (
          <>
            {/* ── Desktop: bảng ── */}
            {!isMobile && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 40, textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={allLoadedSelected}
                          onChange={toggleSelectAll}
                          style={{ width: 16, height: 16, cursor: "pointer" }}
                        />
                      </th>
                      <th>Phòng</th>
                      <th>Khách</th>
                      <th>Loại</th>
                      <th>Ca</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      {/* <th>Tổng tiền</th> */}
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          style={{
                            textAlign: "center",
                            color: "#6b6f84",
                            padding: 30,
                          }}
                        >
                          Không có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      bookings.map((b) => {
                        const ss =
                          STATUS_STYLE[b.status] || STATUS_STYLE.completed;
                        return (
                          <tr key={b._id}>
                            <td style={{ textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={isBookingSelected(b._id)}
                                onChange={() => toggleBookingSelection(b._id)}
                                style={{
                                  width: 16,
                                  height: 16,
                                  cursor: "pointer",
                                }}
                              />
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, fontSize: 15 }}>
                                {b.roomNumber}
                              </span>
                              {b.room_type && (
                                <div style={{ fontSize: 11, color: "#6b6f84" }}>
                                  {b.room_type === "double" ? "Đôi" : "Đơn"}
                                </div>
                              )}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>
                                {b.guestName}
                              </div>
                              {b.guestPhone && (
                                <div
                                  style={{ fontSize: 11.5, color: "#6b6f84" }}
                                >
                                  {b.guestPhone}
                                </div>
                              )}
                            </td>
                            <td>
                              <span style={{ fontSize: 12.5 }}>
                                {TYPE_LABEL[b.bookingType]}
                              </span>
                            </td>
                            <td>
                              <span
                                style={{
                                  fontSize: 11,
                                  padding: "2px 8px",
                                  borderRadius: 10,
                                  fontWeight: 600,
                                  background:
                                    b.shift === "night"
                                      ? "rgba(99,102,241,0.15)"
                                      : "rgba(251,191,36,0.12)",
                                  color:
                                    b.shift === "night" ? "#818cf8" : "#fbbf24",
                                }}
                              >
                                {SHIFT_LABEL[b.shift] || b.shift}
                              </span>
                            </td>
                            <td style={{ fontSize: 12.5 }}>
                              {fmtDate(b.checkIn)}
                            </td>
                            <td
                              style={{
                                fontSize: 12.5,
                                color: b.checkOut ? undefined : "#6b6f84",
                              }}
                            >
                              {fmtDate(b.checkOut) || "—"}
                            </td>
                            {/* <td>
                              {b.totalAmount ? (
                                <span
                                  style={{ fontWeight: 700, color: "#10b981" }}
                                >
                                  {fmt(b.totalAmount)}
                                </span>
                              ) : (
                                <span
                                  style={{ color: "#6b6f84", fontSize: 12 }}
                                >
                                  —
                                </span>
                              )}
                            </td> */}
                            <td>
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  padding: "3px 10px",
                                  borderRadius: 20,
                                  background: ss.bg,
                                  color: ss.color,
                                }}
                              >
                                {STATUS_LABEL[b.status]}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Mobile: card list ── */}
            {isMobile && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {bookings.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#6b6f84",
                      padding: 30,
                    }}
                  >
                    Không có dữ liệu
                  </div>
                ) : (
                  bookings.map((b) => {
                    const ss = STATUS_STYLE[b.status] || STATUS_STYLE.completed;
                    return (
                      <div
                        key={b._id}
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 12,
                          padding: "14px 16px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        {/* Dòng 1: Phòng + Trạng thái */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isBookingSelected(b._id)}
                              onChange={() => toggleBookingSelection(b._id)}
                              style={{
                                width: 18,
                                height: 18,
                                cursor: "pointer",
                              }}
                            />
                            <span style={{ fontWeight: 700, fontSize: 17 }}>
                              Phòng {b.roomNumber}
                            </span>
                            {b.room_type && (
                              <span
                                style={{
                                  marginLeft: 6,
                                  fontSize: 11,
                                  color: "#6b6f84",
                                }}
                              >
                                ({b.room_type === "double" ? "Đôi" : "Đơn"})
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              padding: "3px 10px",
                              borderRadius: 20,
                              background: ss.bg,
                              color: ss.color,
                            }}
                          >
                            {STATUS_LABEL[b.status]}
                          </span>
                        </div>

                        {/* Dòng 2: Khách */}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>
                            {b.guestName}
                          </div>
                          {b.guestPhone && (
                            <div style={{ fontSize: 12, color: "#6b6f84" }}>
                              {b.guestPhone}
                            </div>
                          )}
                        </div>

                        {/* Dòng 3: Loại + Ca */}
                        <div
                          style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              padding: "2px 8px",
                              borderRadius: 8,
                              background: "rgba(255,255,255,0.06)",
                              color: "#c5c8d8",
                            }}
                          >
                            {TYPE_LABEL[b.bookingType]}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              padding: "2px 8px",
                              borderRadius: 10,
                              fontWeight: 600,
                              background:
                                b.shift === "night"
                                  ? "rgba(99,102,241,0.15)"
                                  : "rgba(251,191,36,0.12)",
                              color:
                                b.shift === "night" ? "#818cf8" : "#fbbf24",
                            }}
                          >
                            {SHIFT_LABEL[b.shift] || b.shift}
                          </span>
                        </div>

                        {/* Dòng 4: Check-in / Check-out */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 8,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "#6b6f84",
                                marginBottom: 2,
                              }}
                            >
                              CHECK-IN
                            </div>
                            <div style={{ fontSize: 12.5 }}>
                              {fmtDate(b.checkIn)}
                            </div>
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "#6b6f84",
                                marginBottom: 2,
                              }}
                            >
                              CHECK-OUT
                            </div>
                            <div
                              style={{
                                fontSize: 12.5,
                                color: b.checkOut ? undefined : "#6b6f84",
                              }}
                            >
                              {fmtDate(b.checkOut) || "—"}
                            </div>
                          </div>
                        </div>

                        {/* Dòng 5: Tổng tiền */}
                        {/* <div
                          style={{
                            borderTop: "1px solid rgba(255,255,255,0.06)",
                            paddingTop: 10,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: 12, color: "#6b6f84" }}>
                            Tổng tiền
                          </span>
                          {b.totalAmount ? (
                            <span
                              style={{
                                fontWeight: 700,
                                color: "#10b981",
                                fontSize: 15,
                              }}
                            >
                              {fmt(b.totalAmount)}
                            </span>
                          ) : (
                            <span style={{ color: "#6b6f84", fontSize: 12 }}>
                              —
                            </span>
                          )}
                        </div> */}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Sentinel cho Intersection Observer */}
            <div
              ref={sentinelRef}
              style={{
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {loadingMore && (
                <span style={{ color: "#6b6f84", fontSize: 13 }}>
                  Đang tải thêm...
                </span>
              )}
              {!hasMore && bookings.length > 0 && (
                <span style={{ color: "#6b6f84", fontSize: 12 }}>
                  — Đã hiển thị tất cả —
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
