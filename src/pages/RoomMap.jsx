import React, { useState, useEffect, useCallback } from 'react';
import { getRooms, checkIn, checkOut, updateBooking, getActivePrice } from '../utils/api';
import { useToast } from '../hooks/useToast';
import CheckInModal from '../components/CheckInModal';
// import CheckOutModal from '../components/CheckOutModal';
import RoomDetailModal from '../components/RoomDetailModal';

const STATUS_LABEL = {
  available: 'Trống',
  occupied: 'Có khách',
  cleaning: 'Dọn phòng',
  maintenance: 'Bảo trì',
};

const TYPE_LABEL = { single: 'Đơn', double: 'Đôi' };

function RoomCard({ room, onClick }) {
  const statusStyles = {
    available: { border: '#10b981', bg: 'rgba(16,185,129,0.08)', dot: '#10b981' },
    occupied: { border: '#ef4444', bg: 'rgba(239,68,68,0.12)', dot: '#ef4444' },
    cleaning: { border: '#f59e0b', bg: 'rgba(245,158,11,0.1)', dot: '#f59e0b' },
    maintenance: { border: '#3b82f6', bg: 'rgba(59,130,246,0.1)', dot: '#3b82f6' },
  };
  const s = statusStyles[room.status] || statusStyles.available;
  const booking = room.currentBooking;

  const getElapsed = () => {
    if (!booking) return null;
    const diff = Date.now() - new Date(booking.checkIn).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}g ${m}p` : `${m}p`;
  };

  return (
    <div
      onClick={() => onClick(room)}
      style={{
        background: s.bg,
        border: `2px solid ${s.border}`,
        borderRadius: 14,
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'all 0.18s',
        position: 'relative',
        minWidth: 140,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${s.border}40`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>{room.roomNumber}</span>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: s.dot, marginTop: 5 }} />
      </div>

      <div style={{ fontSize: 11.5, color: '#9fa3b8', marginBottom: 6 }}>
        Phòng {TYPE_LABEL[room.type]}
      </div>

      <div style={{
        fontSize: 12,
        fontWeight: 600,
        color: s.dot,
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 20,
        background: `${s.dot}20`,
      }}>
        {STATUS_LABEL[room.status]}
      </div>

      {booking && (
        <div style={{ marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 8 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#e8eaf6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {booking.guestName}
          </div>
          <div style={{ fontSize: 11, color: '#9fa3b8', marginTop: 2 }}>
            {getElapsed()} • {booking.bookingType === 'hourly' ? 'Giờ' : booking.bookingType === 'overnight' ? 'Đêm' : '24h'}
          </div>
        </div>
      )}

      {room.status === 'available' && (
        <div style={{ marginTop: 10, fontSize: 11, color: '#6b6f84' }}>Nhấn để nhận phòng</div>
      )}
    </div>
  );
}

export default function RoomMap() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modal, setModal] = useState(null); // 'checkin' | 'checkout' | 'detail'
  const [priceConfig, setPriceConfig] = useState(null);
  const { addToast, ToastContainer } = useToast();

  const loadRooms = useCallback(async () => {
    try {
      const res = await getRooms();
      setRooms(res.data);
    } catch (e) {
      addToast('Không thể tải danh sách phòng', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadRooms();
    getActivePrice().then(r => setPriceConfig(r.data)).catch(() => {});
    const interval = setInterval(loadRooms, 30000);
    return () => clearInterval(interval);
  }, [loadRooms]);

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    if (room.status === 'available') setModal('checkin');
    else if (room.status === 'occupied') setModal('detail');
    else setModal(null);
  };

  const handleCheckIn = async (formData) => {
    try {
      await checkIn({ roomId: selectedRoom._id, ...formData });
      addToast(`✅ Check-in phòng ${selectedRoom.roomNumber} thành công`);
      setModal(null);
      loadRooms();
    } catch (e) {
      addToast(e.response?.data?.error || 'Lỗi check-in', 'error');
    }
  };

  const handleCheckOut = async (bookingId, services, notes) => {
    try {
      await checkOut(bookingId, { services, notes });
      addToast(`✅ Check-out thành công`);
      setModal(null);
      loadRooms();
    } catch (e) {
      addToast(e.response?.data?.error || 'Lỗi check-out', 'error');
    }
  };

  const handleMarkCleaning = async (room) => {
    try {
      const res = await import('../utils/api');
      await res.updateRoom(room._id, { status: 'available' });
      addToast(`Phòng ${room.roomNumber} đã sẵn sàng`);
      loadRooms();
    } catch (e) {
      addToast('Lỗi cập nhật', 'error');
    }
  };

  // Group by floor
  const floors = [...new Set(rooms.map(r => r.floor))].sort();
  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length,
  };

  return (
    <div>
      <ToastContainer />
      <div className="page-header">
        <div>
          <div className="page-title">Sơ đồ phòng</div>
          <div className="page-subtitle">Nhấn vào phòng để check-in / xem chi tiết</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={loadRooms}>↻ Làm mới</button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card">
          <div className="stat-label">Tổng phòng</div>
          <div className="stat-value" style={{ color: '#a78bfa' }}>{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Đang trống</div>
          <div className="stat-value" style={{ color: '#10b981' }}>{stats.available}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Có khách</div>
          <div className="stat-value" style={{ color: '#ef4444' }}>{stats.occupied}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Dọn phòng</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.cleaning}</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { color: '#10b981', label: 'Trống' },
          { color: '#ef4444', label: 'Có khách' },
          { color: '#f59e0b', label: 'Dọn phòng' },
          { color: '#3b82f6', label: 'Bảo trì' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#9fa3b8' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            {label}
          </div>
        ))}
      </div>

      {/* Floor maps */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b6f84' }}>Đang tải...</div>
      ) : (
        floors.map(floor => (
          <div key={floor} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#6b6f84', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'rgba(108,99,255,0.15)', color: '#8b85ff', padding: '2px 10px', borderRadius: 20, fontSize: 12 }}>Tầng {floor}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
              {rooms
                .filter(r => r.floor === floor)
                .map(room => (
                  <RoomCard
                    key={room._id}
                    room={room}
                    onClick={handleRoomClick}
                  />
                ))
              }
              {rooms.filter(r => r.floor === floor && r.status === 'cleaning').length > 0 && (
                <div style={{ display: 'contents' }}>
                  {rooms.filter(r => r.floor === floor && r.status === 'cleaning').map(room => null)}
                </div>
              )}
            </div>
            {/* Quick clean button for cleaning rooms */}
            {rooms.filter(r => r.floor === floor && r.status === 'cleaning').length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {rooms.filter(r => r.floor === floor && r.status === 'cleaning').map(room => (
                  <button key={room._id} className="btn btn-sm" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
                    onClick={() => handleMarkCleaning(room)}>
                    ✓ Phòng {room.roomNumber} dọn xong
                  </button>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Modals */}
      {modal === 'checkin' && selectedRoom && (
        <CheckInModal
          room={selectedRoom}
          priceConfig={priceConfig}
          onClose={() => setModal(null)}
          onSubmit={handleCheckIn}
        />
      )}

      {modal === 'detail' && selectedRoom && (
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
