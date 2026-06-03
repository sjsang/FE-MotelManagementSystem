import React, { useState, useEffect } from 'react';
import { updateBooking } from '../utils/api';

function formatTime(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
}

function calcElapsed(checkIn) {
  const diff = Date.now() - new Date(checkIn).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return { h, m, text: h > 0 ? `${h} giờ ${m} phút` : `${m} phút` };
}

export default function RoomDetailModal({ room, priceConfig, onClose, onCheckOut, onRefresh, addToast }) {
  const [booking, setBooking] = useState(room.currentBooking);
  const [services, setServices] = useState(booking?.services || []);
  const [elapsed, setElapsed] = useState(calcElapsed(booking?.checkIn));
  const [newService, setNewService] = useState({ name: '', price: '', quantity: 1 });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('info'); // 'info' | 'services' | 'checkout'

  useEffect(() => {
    setBooking(room.currentBooking);
    setServices(room.currentBooking?.services || []);
    setElapsed(calcElapsed(room.currentBooking?.checkIn));
    setTab('info');
  }, [room.currentBooking]);

  useEffect(() => {
    const t = setInterval(() => setElapsed(calcElapsed(booking?.checkIn)), 30000);
    return () => clearInterval(t);
  }, [booking?.checkIn]);

  if (!booking) {
    return (
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <div className="modal-header">
            <div className="modal-title">Phòng {room.roomNumber}</div>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body" style={{ textAlign: 'center', padding: 40, color: '#9fa3b8' }}>
            Không có booking active
          </div>
        </div>
      </div>
    );
  }

  const fmt = (n) => (n || 0).toLocaleString('vi-VN') + 'đ';
  const serviceTotal = services.reduce((s, sv) => s + sv.price * sv.quantity, 0);
  const estimatedTotal = (booking.basePrice || 0) + serviceTotal;

  const addServiceFromList = (svc) => {
    const exists = services.find(s => s.name === svc.name);
    if (exists) {
      setServices(prev => prev.map(s => s.name === svc.name ? { ...s, quantity: s.quantity + 1 } : s));
    } else {
      setServices(prev => [...prev, { name: svc.name, price: svc.price, quantity: 1 }]);
    }
  };

  const addCustomService = () => {
    if (!newService.name || !newService.price) return;
    setServices(prev => [...prev, { name: newService.name, price: Number(newService.price), quantity: Number(newService.quantity) || 1 }]);
    setNewService({ name: '', price: '', quantity: 1 });
  };

  const removeService = (idx) => setServices(prev => prev.filter((_, i) => i !== idx));

  const saveServices = async () => {
    try {
      await updateBooking(booking._id, { services });
      addToast('Đã lưu dịch vụ');
    } catch { addToast('Lỗi lưu dịch vụ', 'error'); }
  };

  const handleReport = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const res = await updateBooking(booking._id, { is_reported: true, reported: now });
      setBooking(res.data);
      addToast('Đã ghi nhận khai báo lưu trú thành công');
      if (onRefresh) onRefresh();
    } catch (e) {
      addToast('Lỗi khi ghi nhận khai báo lưu trú', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    await onCheckOut(booking._id, services, booking.notes);
    setLoading(false);
  };

  const availableServices = priceConfig?.services || [];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Phòng {room.roomNumber} — {booking.guestName}</div>
            <div style={{ fontSize: 12, color: '#9fa3b8', marginTop: 2 }}>
              Check-in: {formatTime(booking.checkIn)} • Đã ở: {elapsed.text}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 24px' }}>
          {[['info', 'Thông tin'], ['services', `Dịch vụ (${services.length})`], ['checkout', 'Check-out']].map(([key, label]) => {
            if (key === 'checkout' && !booking?.is_reported) return null;
            return (
              <button key={key} onClick={() => setTab(key)}
                style={{ padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13,
                  fontWeight: tab === key ? 600 : 400, color: tab === key ? '#8b85ff' : '#9fa3b8',
                  borderBottom: tab === key ? '2px solid #8b85ff' : '2px solid transparent',
                  marginBottom: -1, fontFamily: 'inherit' }}>
                {label}
              </button>
            );
          })}
        </div>

        <div className="modal-body">
          {tab === 'info' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  ['Khách', booking.guestName],
                  ['Khai báo công an', booking.is_reported ? `Đã khai báo (${formatTime(booking.reported)})` : 'Chưa khai báo'],
                  ['CMND / Hộ chiếu', booking.guestId || '--'],
                  ['Loại', booking.bookingType === 'hourly' ? 'Nghỉ giờ' : booking.bookingType === 'overnight' ? 'Qua đêm' : 'Ngày đêm'],
                  ['Ca', booking.shift === 'night' ? 'Ca đêm' : 'Ca ngày'],
                  ['Giá cơ bản', fmt(booking.basePrice)],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 11, color: '#6b6f84', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: label === 'Khai báo công an' ? (booking.is_reported ? '#10b981' : '#f59e0b') : 'inherit' }}>{value}</div>
                  </div>
                ))}
              </div>
              {booking.notes && (
                <div style={{ marginTop: 12, background: 'rgba(245,158,11,0.08)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#f59e0b' }}>
                  📝 {booking.notes}
                </div>
              )}
            </div>
          )}

          {tab === 'services' && (
            <div>
              {/* Preset services */}
              {availableServices.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: '#6b6f84', marginBottom: 8 }}>Thêm nhanh:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {availableServices.map((svc, i) => (
                      <button key={i} onClick={() => addServiceFromList(svc)}
                        style={{ padding: '5px 12px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)',
                          borderRadius: 20, color: '#8b85ff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                        + {svc.name} ({(svc.price).toLocaleString('vi-VN')}đ)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom service */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto auto', gap: 8, marginBottom: 14, alignItems: 'end' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#6b6f84', marginBottom: 4 }}>Tên dịch vụ</div>
                  <input className="form-control" placeholder="Khác..." value={newService.name}
                    onChange={e => setNewService(s => ({ ...s, name: e.target.value }))} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#6b6f84', marginBottom: 4 }}>Giá (đ)</div>
                  <input className="form-control" type="number" placeholder="0" value={newService.price}
                    onChange={e => setNewService(s => ({ ...s, price: e.target.value }))} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#6b6f84', marginBottom: 4 }}>SL</div>
                  <input className="form-control" type="number" min="1" value={newService.quantity}
                    onChange={e => setNewService(s => ({ ...s, quantity: e.target.value }))}
                    style={{ width: 60 }} />
                </div>
                <button className="btn btn-primary btn-sm" onClick={addCustomService} style={{ alignSelf: 'flex-end' }}>+</button>
              </div>

              {/* Service list */}
              {services.length > 0 ? (
                <div>
                  {services.map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: 13 }}>{s.name} x{s.quantity}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{(s.price * s.quantity).toLocaleString('vi-VN')}đ</span>
                        <button onClick={() => removeService(i)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16 }}>✕</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontWeight: 600 }}>Tổng dịch vụ</span>
                    <span style={{ fontWeight: 700, color: '#8b85ff' }}>{fmt(serviceTotal)}</span>
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={saveServices}>💾 Lưu dịch vụ</button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#6b6f84', fontSize: 13 }}>Chưa có dịch vụ</div>
              )}
            </div>
          )}

          {tab === 'checkout' && (
            <div>
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: '#9fa3b8', marginBottom: 12 }}>Tổng kết thanh toán (ước tính)</div>
                {[
                  ['Giá phòng cơ bản', fmt(booking.basePrice)],
                  ['Dịch vụ', fmt(serviceTotal)],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#9fa3b8' }}>{label}</span>
                    <span style={{ fontSize: 13 }}>{val}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>Ước tính</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>{fmt(estimatedTotal)}</span>
                </div>
                <div style={{ fontSize: 11.5, color: '#6b6f84', marginTop: 6 }}>* Giờ phụ thu sẽ được tính chính xác khi checkout</div>
              </div>

              <div style={{ background: 'rgba(239,68,68,0.07)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>
                ⚠️ Sau khi check-out, phòng sẽ chuyển sang trạng thái "Dọn phòng"
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
          {tab === 'checkout' && (
            <button className="btn btn-danger" onClick={handleCheckOut} disabled={loading}>
              {loading ? '...' : '🚪 Xác nhận Check-out'}
            </button>
          )}
          {tab !== 'checkout' && (
            !booking.is_reported ? (
              <button className="btn btn-success" onClick={handleReport} disabled={loading} style={{ background: '#2e7d52', borderColor: '#2e7d52', color: '#ffffff' }}>
                {loading ? '...' : '👮 Đã khai báo lưu trú'}
              </button>
            ) : (
              <button className="btn" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
                onClick={() => setTab('checkout')}>
                Chuyển sang Check-out →
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
