import React, { useState, useEffect, useRef, useCallback } from "react";
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
export default function Revenue() {
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
      setCustomers(cRes.data || []);
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
          <div className="page-title">Doanh thu</div>
          <div className="page-subtitle">
            Thống k doanh thu theo kỳ, xem chi tiết lịch sử booking và xuất báo
            cáo
          </div>
        </div>
      </div>

      {/* ── Revenue filter ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div
          style={{
            fontWeight: 700,
            marginBottom: 12,
            fontSize: 13,
            color: "#9fa3b8",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          📊 Kỳ thống kê doanh thu
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div>
            <div className="form-label">Từ ngày</div>
            <input
              type="date"
              className="form-control"
              value={revFilter.from}
              min="1900-01-01"
              onChange={(e) =>
                setRevFilter((f) => ({ ...f, from: e.target.value }))
              }
              style={{ width: 150 }}
            />
          </div>
          <div>
            <div className="form-label">Đến ngày</div>
            <input
              type="date"
              className="form-control"
              value={revFilter.to}
              min="1900-01-01"
              onChange={(e) =>
                setRevFilter((f) => ({ ...f, to: e.target.value }))
              }
              style={{ width: 150 }}
            />
          </div>
          <button
            className="btn btn-ghost"
            onClick={loadRevenue}
            disabled={revLoading}
          >
            {revLoading ? "Đang tải..." : "🔍 Lọc"}
          </button>
        </div>
      </div>

      {/* ── Revenue stats ── */}
      {revenue && (
        <div
          className="stats-grid"
          style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 20 }}
        >
          <div className="stat-card">
            <div className="stat-label">Doanh thu (kỳ)</div>
            <div
              className="stat-value"
              style={{ color: "#10b981", fontSize: 18 }}
            >
              {(revenue.total || 0).toLocaleString("vi-VN")}đ
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Số lượt</div>
            <div className="stat-value" style={{ color: "#8b85ff" }}>
              {revenue.count || 0}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Nghỉ giờ</div>
            <div
              className="stat-value"
              style={{ color: "#f472b6", fontSize: 16 }}
            >
              {(revenue.byType?.hourly || 0).toLocaleString("vi-VN")}đ
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Qua đêm / 24h</div>
            <div
              className="stat-value"
              style={{ color: "#60a5fa", fontSize: 16 }}
            >
              {(
                (revenue.byType?.overnight || 0) +
                (revenue.byType?.fullday || 0)
              ).toLocaleString("vi-VN")}
              đ
            </div>
          </div>
        </div>
      )}

      {/* ── Chart ── */}
      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>
            📈 Doanh thu theo ngày
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartData}
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#6b6f84", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => (v / 1000).toFixed(0) + "k"}
                tick={{ fill: "#6b6f84", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" fill="#6c63ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
