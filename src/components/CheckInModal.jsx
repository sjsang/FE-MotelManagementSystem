import React, { useState, useEffect, useRef } from 'react';
import { getCustomers, createCustomer, getCustomerOptions } from '../utils/api';
import AddCustomerModal from './AddCustomerModal';

const BOOKING_TYPES = [
  { value: 'hourly', label: '🕐 Nghỉ giờ' },
  { value: 'overnight', label: '🌙 Qua đêm' },
  { value: 'fullday', label: '📅 Ngày đêm (24h)' },
];

function getPricePreview(priceConfig, roomType, bookingType, shift) {
  if (!priceConfig) return null;
  try {
    const prices = shift === 'night' ? priceConfig.nightShift : priceConfig.dayShift;
    const tp = roomType === 'double' ? prices.double : prices.single;
    if (bookingType === 'fullday') return tp.fullday;
    if (bookingType === 'overnight') return tp.overnight;
    if (bookingType === 'hourly') return tp.hourly_first || null;
  } catch { return null; }
  return null;
}

function getHourlyHint(priceConfig, roomType, shift) {
  if (!priceConfig) return null;
  try {
    const prices = shift === "night" ? priceConfig.nightShift : priceConfig.dayShift;
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

function SearchableCustomerSelect({ label, customers, selectedCustomer, onSelect, onClear, excludeIds, onAddDirectClick, dropdownAlign = 'down' }) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = customers.filter(c => {
    if (excludeIds && excludeIds.includes(c._id)) return false;
    const term = search.toLowerCase().trim();
    if (!term) return true;
    const name = c.hoten?.toLowerCase() || '';
    const cccd = c.cccd?.toLowerCase() || '';
    const passport = c.passport?.toLowerCase() || '';
    return name.includes(term) || cccd.includes(term) || passport.includes(term);
  });

  return (
    <div className="form-group" style={{ position: 'relative', marginBottom: '12px' }}>
      <label className="form-label" style={{ marginBottom: '4px' }}>{label}</label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {selectedCustomer ? (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '10px 14px',
              fontSize: '13px',
              color: 'var(--text)',
              height: '40px'
            }}>
              <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <strong style={{ color: 'var(--accent)' }}>{selectedCustomer.hoten}</strong>
                <span style={{ marginLeft: 8, fontSize: '11px', color: 'var(--text3)' }}>
                  ({selectedCustomer.quoctich === 'Việt Nam' ? `CCCD: ${selectedCustomer.cccd}` : `Hộ chiếu: ${selectedCustomer.passport}`})
                </span>
              </div>
              <button
                type="button"
                onClick={onClear}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '2px 6px',
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                className="form-control"
                placeholder="Nhập tên hoặc số CCCD/Hộ chiếu để tìm kiếm..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                style={{ height: '40px' }}
              />
              {isOpen && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  zIndex: 999,
                  boxShadow: 'var(--shadow)',
                  ...(dropdownAlign === 'up' ? {
                    bottom: '100%',
                    marginBottom: '4px'
                  } : {
                    top: '100%',
                    marginTop: '4px'
                  })
                }}>
                  {filtered.length === 0 ? (
                    <div style={{ padding: '12px', color: 'var(--text3)', fontSize: '13px', textAlign: 'center' }}>
                      Không tìm thấy khách hàng nào hợp lệ
                    </div>
                  ) : (
                    filtered.map(c => (
                      <div
                        key={c._id}
                        onClick={() => {
                          onSelect(c);
                          setSearch('');
                          setIsOpen(false);
                        }}
                        style={{
                          padding: '10px 14px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border)',
                          fontSize: '13px',
                          color: 'var(--text)',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg3)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ fontWeight: 600 }}>{c.hoten}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
                          Quốc tịch: {c.quoctich} • {c.quoctich === 'Việt Nam' ? `CCCD: ${c.cccd}` : `Hộ chiếu: ${c.passport}`}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
              {isOpen && (
                <div
                  style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, zIndex: 998 }}
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
            padding: '0 14px',
            height: '40px',
            background: '#2e7d52',
            borderColor: '#2e7d52',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            fontSize: '18px',
            cursor: 'pointer'
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

export default function CheckInModal({ room, priceConfig, onClose, onSubmit, addToast }) {
  const [customers, setCustomers] = useState([]);
  const [selectedGuests, setSelectedGuests] = useState([null]);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [addingForIndex, setAddingForIndex] = useState(null);
  const [customerOptions, setCustomerOptions] = useState({ nationalities: [], provinces: [], visaTypes: [] });

  const guestsContainerRef = useRef(null);

  // Tự động cuộn xuống dưới cùng khi thêm khách mới vào phòng
  useEffect(() => {
    if (guestsContainerRef.current) {
      setTimeout(() => {
        if (guestsContainerRef.current) {
          guestsContainerRef.current.scrollTop = guestsContainerRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [selectedGuests.length]);

  const [form, setForm] = useState({
    bookingType: 'hourly',
    shift: new Date().getHours() >= 23 || new Date().getHours() < 5 ? 'night' : 'day',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  // Tải danh sách khách hàng và các cấu hình dropdown
  useEffect(() => {
    getCustomers().then(res => {
      setCustomers(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    }).catch(err => {
      console.error('Không thể tải danh sách khách hàng:', err);
    });

    getCustomerOptions().then(res => {
      setCustomerOptions(res.data || { nationalities: [], provinces: [], visaTypes: [] });
    }).catch(() => { });
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreateCustomerDirect = async (payload) => {
    try {
      const res = await createCustomer(payload);
      if (addToast) addToast('Thêm khách hàng mới thành công');

      // Tải lại danh sách khách hàng
      const custRes = await getCustomers();
      const updatedList = Array.isArray(custRes.data) ? custRes.data : (custRes.data?.data || []);
      setCustomers(updatedList);

      // Tìm khách hàng vừa thêm để gắn vào slot chọn hiện tại
      const newCustomer = updatedList.find(c => c.cccd === payload.cccd || (payload.passport && c.passport === payload.passport));
      if (newCustomer) {
        setSelectedGuests(prev => {
          const updated = [...prev];
          updated[addingForIndex] = newCustomer;
          return updated;
        });
      }
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Lỗi khi tạo khách hàng';
      if (addToast) addToast(errMsg, 'error');
      return false;
    }
  };

  const handleSubmit = async () => {
    const activeGuests = selectedGuests.filter(g => g !== null);
    if (activeGuests.length === 0) {
      if (addToast) addToast('Vui lòng chọn ít nhất một khách hàng', 'error');
      return;
    }

    setLoading(true);

    const guestNames = activeGuests.map(g => g.hoten).join(', ');
    const guestIds = activeGuests.map(g => g.cccd || g.passport || '').filter(id => id !== '').join(', ');

    await onSubmit({
      ...form,
      guestName: guestNames,
      guestId: guestIds,
      guestPhone: '', // Để trống vì model khách hàng không lưu điện thoại
      roomNumber: room.roomNumber
    });
    setLoading(false);
  };

  const pricePreview = getPricePreview(priceConfig, room.type, form.bookingType, form.shift);
  const hourlyHint =
    form.bookingType === "hourly"
      ? getHourlyHint(priceConfig, room.type, form.shift)
      : null;
  const fmt = (n) => (n ? n.toLocaleString("vi-VN") + "đ" : "");

  return (
    <>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
          <div className="modal-header">
            <div>
              <div className="modal-title">Check-in phòng {room.roomNumber}</div>
              <div style={{ fontSize: 12, color: '#9fa3b8', marginTop: 2 }}>
                Phòng {room.type === 'double' ? 'đôi' : 'đơn'}
              </div>
            </div>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          <div className="modal-body" ref={guestsContainerRef} style={{ overflowY: 'auto', flex: 1 }}>

            {/* Vùng chọn danh sách khách hàng */}
            <div style={{ marginBottom: '14px' }}>
              {selectedGuests.map((guest, idx) => (
                <SearchableCustomerSelect
                  key={idx}
                  label={idx === 0 ? "Khách hàng chính *" : `Khách hàng thứ ${idx + 1}`}
                  customers={customers}
                  selectedCustomer={guest}
                  onSelect={(c) => {
                    setSelectedGuests(prev => {
                      const updated = [...prev];
                      updated[idx] = c;
                      return updated;
                    });
                  }}
                  onClear={() => {
                    if (idx === 0) {
                      setSelectedGuests(prev => {
                        const updated = [...prev];
                        updated[0] = null;
                        return updated;
                      });
                    } else {
                      setSelectedGuests(prev => prev.filter((_, i) => i !== idx));
                    }
                  }}
                  excludeIds={selectedGuests.filter((g, i) => g !== null && i !== idx).map(g => g._id)}
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
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '13px' }}
                onClick={() => setSelectedGuests(prev => [...prev, null])}
              >
                ➕ Thêm khách vào phòng
              </button>
            </div>

            <div className="input-row" style={{ marginTop: 14 }}>
              <div className="form-group">
                <label className="form-label">Ca</label>
                <select className="form-control" value={form.shift}
                  onChange={e => {
                    const newShift = e.target.value;
                    set('shift', newShift);
                    if (newShift === 'night') {
                      set('bookingType', 'hourly');
                    }
                  }}>
                  <option value="day">☀️ Ca ngày (5h–23h)</option>
                  <option value="night">🌙 Ca đêm (23h–5h)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Loại thuê</label>
                <select className="form-control" value={form.bookingType}
                  onChange={e => set('bookingType', e.target.value)}>
                  {BOOKING_TYPES.filter(t => form.shift !== 'night' || t.value === 'hourly').map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {pricePreview && (
              <div style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 10, padding: '12px 14px', marginBottom: 14, marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#9fa3b8' }}>Giá khởi điểm</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#8b85ff' }}>{fmt(pricePreview)}</span>
              </div>
            )}

            {hourlyHint && (
              <div style={{ background: 'rgba(245,158,11,0.08)', borderRadius: 8, padding: '10px 12px', marginBottom: 14, fontSize: 12.5, color: '#f59e0b' }}>
                {hourlyHint}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Ghi chú</label>
              <input className="form-control" placeholder="Nhập ghi chú cho phòng này..." value={form.notes}
                onChange={e => set('notes', e.target.value)} />
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
            <button className="btn btn-success" onClick={handleSubmit} disabled={loading}>
              {loading ? '...' : '✓ Check-in'}
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