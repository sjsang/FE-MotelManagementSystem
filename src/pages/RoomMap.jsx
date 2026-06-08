import React, { useState, useEffect, useCallback } from "react";
import {
  getRooms,
  checkIn,
  checkOut,
  updateBooking,
  getActivePrice,
  createInvoice,
} from "../utils/api";
import { useToast } from "../hooks/useToast";
import CheckInModal from "../components/CheckInModal";
import RoomDetailModal from "../components/RoomDetailModal";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";

const STATUS_LABEL = {
  available: "Trống",
  occupied: "Có khách",
  cleaning: "Dọn phòng",
  maintenance: "Bảo trì",
};

const TYPE_LABEL = { single: "Đơn", double: "Đôi" };

const STATUS_STYLES = {
  available: {
    border: "#2563eb",
    bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    dot: "#2563eb",
    badge: "#dbeafe",
    badgeText: "#1d4ed8",
    icon: "✓",
  },
  occupied: {
    border: "#ef4444",
    bg: "linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%)",
    dot: "#ef4444",
    badge: "#fee2e2",
    badgeText: "#b91c1c",
    icon: "●",
  },
  cleaning: {
    border: "#f59e0b",
    bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    dot: "#f59e0b",
    badge: "#fef3c7",
    badgeText: "#b45309",
    icon: "↻",
  },
  maintenance: {
    border: "#6366f1",
    bg: "linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)",
    dot: "#6366f1",
    badge: "#e0e7ff",
    badgeText: "#4338ca",
    icon: "⚙",
  },
};

/* ─── Room Card ─────────────────────────────────────────── */
function RoomCard({ room, onClick }) {
  const s = STATUS_STYLES[room.status] || STATUS_STYLES.available;
  const booking = room.currentBooking;

  const getElapsed = () => {
    if (!booking) return null;
    const diff = Date.now() - new Date(booking.checkIn).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}g ${m}p` : `${m}p`;
  };

  const bookingTypeLabel = (t) =>
    t === "hourly" ? "Theo giờ" : t === "overnight" ? "Qua đêm" : "24 giờ";

  return (
    <div
      onClick={() => onClick(room)}
      style={{
        background: s.bg,
        border: `1.5px solid ${s.border}30`,
        borderRadius: 16,
        padding: "16px",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = `0 12px 28px ${s.dot}22`;
        e.currentTarget.style.borderColor = `${s.border}80`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
        e.currentTarget.style.borderColor = `${s.border}30`;
      }}
    >
      {/* Accent strip top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: s.dot,
          borderRadius: "16px 16px 0 0",
          opacity: 0.7,
        }}
      />

      {/* Room number + status dot */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 10,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {room.roomNumber}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#94a3b8",
              marginTop: 3,
              fontWeight: 500,
            }}
          >
            Phòng {TYPE_LABEL[room.type] || room.type}
          </div>
        </div>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: s.badge,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: s.badgeText,
            fontWeight: 700,
          }}
        >
          {s.icon}
        </div>
      </div>

      {/* Status badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontSize: 11.5,
          fontWeight: 600,
          color: s.badgeText,
          background: s.badge,
          padding: "4px 10px",
          borderRadius: 20,
          border: `1px solid ${s.dot}30`,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: s.dot,
          }}
        />
        {STATUS_LABEL[room.status]}
      </div>

      {/* Guest info */}
      {booking && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: "1px dashed rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#1e293b",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {booking.guestName}
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              marginTop: 5,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 10.5,
                color: "#64748b",
                background: "rgba(0,0,0,0.05)",
                padding: "2px 7px",
                borderRadius: 12,
                fontWeight: 500,
              }}
            >
              ⏱ {getElapsed()}
            </span>
            <span
              style={{
                fontSize: 10.5,
                color: "#64748b",
                background: "rgba(0,0,0,0.05)",
                padding: "2px 7px",
                borderRadius: 12,
                fontWeight: 500,
              }}
            >
              {bookingTypeLabel(booking.bookingType)}
            </span>
          </div>
        </div>
      )}

      {room.status === "available" && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: "1px dashed rgba(37,99,235,0.15)",
            fontSize: 11.5,
            color: "#3b82f6",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>+</span> Nhấn để nhận phòng
        </div>
      )}
    </div>
  );
}

/* ─── Stat Card ─────────────────────────────────────────── */
function StatCard({ label, value, color, icon, sub }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px solid #e8f0fe",
        borderRadius: 16,
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: "0 1px 6px rgba(37,99,235,0.06)",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.1)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 1px 6px rgba(37,99,235,0.06)")
      }
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 13,
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: 11.5,
            color: "#94a3b8",
            fontWeight: 600,
            marginBottom: 2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            color,
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: 10.5, color: "#cbd5e1", marginTop: 3 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Floor Section ─────────────────────────────────────── */
function FloorSection({ floor, rooms, onRoomClick, onMarkCleaning }) {
  const occupiedCount = rooms.filter((r) => r.status === "occupied").length;
  const availableCount = rooms.filter((r) => r.status === "available").length;
  const cleaningRooms = rooms.filter((r) => r.status === "cleaning");

  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px solid #e8f0fe",
        borderRadius: 20,
        padding: "20px 22px",
        marginBottom: 20,
        boxShadow: "0 2px 8px rgba(37,99,235,0.05)",
      }}
    >
      {/* Floor header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          paddingBottom: 14,
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "#fff",
              padding: "5px 14px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              boxShadow: "0 3px 10px rgba(37,99,235,0.3)",
            }}
          >
            Tầng {floor}
          </div>
          <span style={{ fontSize: 12.5, color: "#94a3b8", fontWeight: 500 }}>
            {rooms.length} phòng
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {availableCount > 0 && (
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: "#1d4ed8",
                background: "#dbeafe",
                padding: "3px 10px",
                borderRadius: 20,
              }}
            >
              {availableCount} trống
            </span>
          )}
          {occupiedCount > 0 && (
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: "#b91c1c",
                background: "#fee2e2",
                padding: "3px 10px",
                borderRadius: 20,
              }}
            >
              {occupiedCount} có khách
            </span>
          )}
        </div>
      </div>

      {/* Room grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
          gap: 12,
        }}
      >
        {rooms.map((room) => (
          <RoomCard key={room._id} room={room} onClick={onRoomClick} />
        ))}
      </div>

      {/* Cleaning quick-done */}
      {cleaningRooms.length > 0 && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: "1px dashed #fde68a",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {cleaningRooms.map((room) => (
            <button
              key={room._id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#fffbeb",
                color: "#b45309",
                border: "1.5px solid #fde68a",
                borderRadius: 10,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fef3c7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fffbeb";
              }}
              onClick={() => onMarkCleaning(room)}
            >
              <span style={{ fontSize: 14 }}>✓</span>
              Phòng {room.roomNumber} dọn xong
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function RoomMap() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modal, setModal] = useState(null);
  const [priceConfig, setPriceConfig] = useState(null);
  const { addToast, ToastContainer } = useToast();

  const loadRooms = useCallback(async () => {
    try {
      const res = await getRooms();
      const validData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setRooms(validData);
    } catch {
      addToast("Không thể tải danh sách phòng", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadRooms();
    getActivePrice()
      .then((r) => setPriceConfig(r.data))
      .catch(() => { });
    const interval = setInterval(loadRooms, 30000);
    return () => clearInterval(interval);
  }, [loadRooms]);

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    if (room.status === "available") setModal("checkin");
    else if (room.status === "occupied") setModal("detail");
    else setModal(null);
  };

  const handleCheckIn = async (formData) => {
    try {
      await checkIn({ roomId: selectedRoom._id, ...formData });
      addToast(`Check-in phòng ${selectedRoom.roomNumber} thành công`);
      setModal(null);
      loadRooms();
    } catch (e) {
      addToast(e.response?.data?.error || "Lỗi check-in", "error");
    }
  };

  const handleCheckOut = async (bookingId, services, notes, discount, taxVnd) => {
    try {
      // 1. Chốt trả phòng
      await checkOut(bookingId, { services, notes });

      // 2. Tự động tạo hóa đơn
      const resInvoice = await createInvoice({
        bookingId,
        discount,
        tax: taxVnd,
      });

      addToast(`Check-out và tạo hóa đơn thành công`);
      loadRooms(); // Tải lại sơ đồ phòng

      // 3. Trả về data hóa đơn để RoomDetailModal bật lên
      return resInvoice.data;
    } catch (e) {
      addToast(e.response?.data?.message || e.response?.data?.error || 'Lỗi check-out', 'error');
      return null;
    }
  };


  const handleMarkCleaning = async (room) => {
    try {
      const res = await import("../utils/api");
      await res.updateRoom(room._id, { status: "available" });
      addToast(`Phòng ${room.roomNumber} đã sẵn sàng`);
      loadRooms();
    } catch {
      addToast("Lỗi cập nhật", "error");
    }
  };

  const floors = [...new Set(rooms.map((r) => r.floor))].sort();
  const stats = {
    total: rooms.length,
    available: rooms.filter((r) => r.status === "available").length,
    occupied: rooms.filter((r) => r.status === "occupied").length,
    cleaning: rooms.filter((r) => r.status === "cleaning").length,
  };

  return (
    <div
      style={{ minHeight: "100vh", background: "#f8faff", padding: "0 0 40px" }}
    >
      <ToastContainer />

      <div style={{ padding: "24px 28px 0" }}>
        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <StatCard
            label="Tổng phòng"
            value={stats.total}
            color="#2563eb"
            icon={<MeetingRoomIcon />}
          />

          <StatCard
            label="Đang trống"
            value={stats.available}
            color="#16a34a"
            icon={<CheckCircleIcon />}
            sub="Sẵn sàng nhận khách"
          />

          <StatCard
            label="Có khách"
            value={stats.occupied}
            color="#dc2626"
            icon={<PersonIcon />}
            sub="Đang sử dụng"
          />

          <StatCard
            label="Dọn phòng"
            value={stats.cleaning}
            color="#d97706"
            icon={<CleaningServicesIcon />}
            sub="Đang dọn dẹp"
          />
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 20,
            background: "#fff",
            borderRadius: 12,
            padding: "10px 16px",
            border: "1.5px solid #e8f0fe",
            flexWrap: "wrap",
            boxShadow: "0 1px 4px rgba(37,99,235,0.05)",
          }}
        >
          <span
            style={{
              fontSize: 11.5,
              color: "#94a3b8",
              fontWeight: 600,
              marginRight: 6,
            }}
          >
            Chú giải:
          </span>
          {[
            { color: "#2563eb", label: "Trống" },
            { color: "#ef4444", label: "Có khách" },
            { color: "#f59e0b", label: "Dọn phòng" },
            { color: "#6366f1", label: "Bảo trì" },
          ].map(({ color, label }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                color: "#475569",
                background: `${color}12`,
                padding: "3px 10px",
                borderRadius: 20,
                border: `1px solid ${color}30`,
                fontWeight: 500,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: color,
                }}
              />
              {label}
            </div>
          ))}
        </div>

        {/* Floor Sections */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              color: "#94a3b8",
              fontSize: 15,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
            Đang tải danh sách phòng...
          </div>
        ) : (
          floors.map((floor) => (
            <FloorSection
              key={floor}
              floor={floor}
              rooms={rooms.filter((r) => r.floor === floor)}
              onRoomClick={handleRoomClick}
              onMarkCleaning={handleMarkCleaning}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {modal === "checkin" && selectedRoom && (
        <CheckInModal
          room={selectedRoom}
          priceConfig={priceConfig}
          onClose={() => setModal(null)}
          onSubmit={handleCheckIn}
          addToast={addToast}
        />
      )}
      {modal === "detail" && selectedRoom && (
        <RoomDetailModal
          room={selectedRoom}
          priceConfig={priceConfig}
          onClose={() => setModal(null)}
          onCheckOut={handleCheckOut}
          onRefresh={loadRooms}
          addToast={addToast}
        />
      )}
    </div>
  );
}
