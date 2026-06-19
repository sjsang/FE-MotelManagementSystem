import React, { useState, useEffect, useRef, useCallback } from 'react';
import { updateBooking, previewCheckout } from '../utils/api';
import InvoiceDetailModal from '../pages/Invoice/InvoiceDetailModal';

const SAVE_STATUS_STYLE = {
  saved: { color: '#10b981', label: '✓ Đã lưu' },
  pending: { color: '#f59e0b', label: '● Chưa lưu...' },
  saving: { color: '#8b85ff', label: '↻ Đang lưu...' },
  error: { color: '#ef4444', label: '✕ Lỗi lưu' },
};
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
  const [tab, setTab] = useState('info');
  const [createdInvoice, setCreatedInvoice] = useState(null);

  // --- Các state mới phục vụ chốt Bill ---
  const [discount, setDiscount] = useState(0);
  const [taxInput, setTaxInput] = useState('');
  const [taxType, setTaxType] = useState('percent'); // 'percent' | 'vnd'

  // Auto-save services
  const [saveStatus, setSaveStatus] = useState('saved');
  const debounceRef = useRef(null);
  const isFirstRender = useRef(true);

  // Preview checkout
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewIntervalRef = useRef(null);

  const fetchPreview = useCallback(async () => {
    if (!booking?._id) return;
    try {
      const res = await previewCheckout(booking._id);
      setPreview(res.data);
    } catch {
      // giữ preview cũ nếu lỗi, không reset
    }
  }, [booking?._id]);

  // Fetch preview khi vào tab checkout, polling mỗi 60s
  useEffect(() => {
    if (tab === 'checkout') {
      setPreviewLoading(true);
      fetchPreview().finally(() => setPreviewLoading(false));
      previewIntervalRef.current = setInterval(fetchPreview, 60000);
    } else {
      clearInterval(previewIntervalRef.current);
      previewIntervalRef.current = null;
    }
    return () => clearInterval(previewIntervalRef.current);
  }, [tab, fetchPreview]);

  // Chỉ sync lại services khi mở phòng khác (bookingId thay đổi)
  // Không reset khi onRefresh chạy cùng booking — tránh mất services đang edit
  const currentBookingId = room.currentBooking?._id;
  useEffect(() => {
    isFirstRender.current = true; // Reset flag để không trigger auto-save khi load data mới
    setBooking(room.currentBooking);
    setServices(room.currentBooking?.services || []);
    setElapsed(calcElapsed(room.currentBooking?.checkIn));
    setSaveStatus('saved');
    setTab('info');
  }, [currentBookingId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync booking metadata (is_reported, v.v.) khi room prop refresh mà không reset services
  useEffect(() => {
    setBooking(prev => {
      if (!prev || prev._id !== room.currentBooking?._id) return prev;
      return { ...room.currentBooking, services: prev.services };
    });
  }, [room.currentBooking]);

  useEffect(() => {
    const t = setInterval(() => setElapsed(calcElapsed(booking?.checkIn)), 30000);
    return () => clearInterval(t);
  }, [booking?.checkIn]);

  // Auto-save: bỏ qua lần render đầu (lúc khởi tạo từ server data)
  // Sau đó mỗi khi services thay đổi, debounce 800ms rồi tự lưu
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSaveStatus('pending');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await updateBooking(booking._id, { services });
        setSaveStatus('saved');
        if (onRefresh) onRefresh();
      } catch {
        setSaveStatus('error');
      }
    }, 800);
    return () => clearTimeout(debounceRef.current);
  }, [services]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Dùng totalAmount từ preview nếu có, fallback về tính local
  const previewTotal = preview?.totalAmount ?? ((booking.basePrice || 0) + serviceTotal);
  const taxVnd = taxType === 'percent'
    ? Math.round(previewTotal * (Number(taxInput || 0) / 100))
    : Number(taxInput || 0);
  const finalTotal = Math.max(0, previewTotal - discount) + taxVnd;

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
    const ok = window.confirm('Xác nhận Check-out?\nHành động này sẽ trả phòng và tạo hóa đơn, không thể hoàn tác.');
    if (!ok) return;
    setLoading(true);
    try {
      const invoiceData = await onCheckOut(booking._id, services, booking.notes, discount, taxVnd);
      if (invoiceData) {
        setCreatedInvoice(invoiceData);
      }
    } catch (e) {
      addToast("Lỗi check-out", "error");
    } finally {
      setLoading(false);
    }
  };

  const availableServices = priceConfig?.services || [];
  const names = (booking.guestName || '').split(',').map(s => s.trim());
  const ids = (booking.guestId || '').split(',').map(s => s.trim());
  const guestsCombined = Array.from(
    { length: Math.max(names.length, ids.length) },
    (_, i) => ({ name: names[i] || '', id: ids[i] || '' })
  ).filter(g => g.name || g.id);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Phòng {room.roomNumber} — Chi tiết lưu trú</div>
            <div style={{ fontSize: 12, color: '#9fa3b8', marginTop: 2 }}>
              Check-in: {formatTime(booking.checkIn)} • Đã ở: {elapsed.text}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 24px' }}>
          {[['info', 'Thông tin'], ['services', `Dịch vụ (${services.length})`], ['checkout', 'Check-out']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{
                padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13,
                fontWeight: tab === key ? 600 : 400, color: tab === key ? '#8b85ff' : '#9fa3b8',
                borderBottom: tab === key ? '2px solid #8b85ff' : '2px solid transparent',
                marginBottom: -1, fontFamily: 'inherit', position: 'relative'
              }}>
              {label}
              {/* Chấm cam báo có thay đổi chưa lưu */}
              {key === 'services' && saveStatus === 'pending' && (
                <span style={{
                  position: 'absolute', top: 8, right: 2,
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#f59e0b', display: 'inline-block'
                }} />
              )}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {tab === 'info' && (
            <div>
              <div style={{ background: 'rgba(46, 125, 82, 0.04)', border: '1.5px solid rgba(46, 125, 82, 0.15)', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                  Khách lưu trú ({guestsCombined.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {guestsCombined.map((g, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13.5, borderBottom: idx < guestsCombined.length - 1 ? '1px dashed var(--border)' : 'none', paddingBottom: idx < guestsCombined.length - 1 ? 8 : 0 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>👤 {g.name || 'Chưa cập nhật tên'}</span>
                      {g.id && <span style={{ fontSize: 11.5, color: 'var(--text2)', background: 'var(--bg3)', padding: '2px 8px', borderRadius: 6, fontWeight: 500 }}>ID/CCCD/Hộ chiếu: {g.id}</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  ['Khai báo công an', booking.is_reported ? `Đã khai báo (${formatTime(booking.reported)})` : 'Chưa khai báo'],
                  ['Loại', booking.bookingType === 'hourly' ? 'Nghỉ giờ' : booking.bookingType === 'overnight' ? 'Qua đêm' : 'Ngày đêm'],
                  ['Ca', booking.shift === 'night' ? 'Ca đêm' : 'Ca ngày'],
                  ['Giá cơ bản', fmt(booking.basePrice)],
                  ['Check-out dự kiến', booking.expectedCheckOut ? formatTime(booking.expectedCheckOut) : (booking.checkIn ? (() => { const fb = new Date(booking.checkIn); fb.setDate(fb.getDate() + 1); fb.setHours(0,0,0,0); return formatTime(fb); })() : '--')],
                  ['Lý do cư trú', booking.lydocutru === '20 - Mục đích khác' ? `Khác: ${booking.nhaplydo || ''}` : (booking.lydocutru || '--')],
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
              {/* Auto-save status bar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                <span style={{
                  fontSize: 11.5, fontWeight: 600,
                  color: SAVE_STATUS_STYLE[saveStatus].color,
                  transition: 'color 0.3s'
                }}>
                  {SAVE_STATUS_STYLE[saveStatus].label}
                </span>
              </div>
              {availableServices.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: '#6b6f84', marginBottom: 8 }}>Thêm nhanh:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {availableServices.map((svc, i) => (
                      <button key={i} onClick={() => addServiceFromList(svc)}
                        style={{ padding: '5px 12px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 20, color: '#8b85ff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                        + {svc.name} ({(svc.price).toLocaleString('vi-VN')}đ)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto auto', gap: 8, marginBottom: 14, alignItems: 'end' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#6b6f84', marginBottom: 4 }}>Tên dịch vụ</div>
                  <input className="form-control" placeholder="Khác..." value={newService.name} onChange={e => setNewService(s => ({ ...s, name: e.target.value }))} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#6b6f84', marginBottom: 4 }}>Giá (đ)</div>
                  <input className="form-control" type="number" placeholder="0" value={newService.price} onChange={e => setNewService(s => ({ ...s, price: e.target.value }))} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#6b6f84', marginBottom: 4 }}>SL</div>
                  <input className="form-control" type="number" min="1" value={newService.quantity} onChange={e => setNewService(s => ({ ...s, quantity: e.target.value }))} style={{ width: 60 }} />
                </div>
                <button className="btn btn-primary btn-sm" onClick={addCustomService} style={{ alignSelf: 'flex-end' }}>+</button>
              </div>

              {services.length > 0 ? (
                <div>
                  {services.map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: 13 }}>{s.name} x{s.quantity}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{(s.price * s.quantity).toLocaleString('vi-VN')}đ</span>
                        <button onClick={() => removeService(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16 }}>✕</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontWeight: 600 }}>Tổng dịch vụ</span>
                    <span style={{ fontWeight: 700, color: '#8b85ff' }}>{fmt(serviceTotal)}</span>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#6b6f84', fontSize: 13 }}>Chưa có dịch vụ</div>
              )}
            </div>
          )}

          {tab === 'checkout' && (
            <div>
              {/* Cảnh báo chưa khai báo công an — có nút bypass */}
              {!booking.is_reported && (
                <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>⚠️ Phòng chưa khai báo lưu trú</span>
                  <button
                    onClick={() => { if (window.confirm('Bỏ qua khai báo công an và tiếp tục check-out?')) { } }}
                    style={{ fontSize: 11.5, color: '#f59e0b', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Bỏ qua
                  </button>
                </div>
              )}

              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: 16, marginBottom: 16 }}>

                {/* Thời gian */}
                <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {[
                    ['Giờ vào', formatTime(booking.checkIn)],
                    ['Giờ ra (hiện tại)', formatTime(preview?.checkOutEstimated || new Date())],
                    ['Thời gian ở', elapsed.text],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12.5, color: '#6b6f84' }}>{label}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 600 }}>{val}</span>
                    </div>
                  ))}
                </div>

                {/* Breakdown tiền */}
                {previewLoading && !preview ? (
                  <div style={{ textAlign: 'center', padding: '12px 0', color: '#6b6f84', fontSize: 13 }}>⏳ Đang tính...</div>
                ) : (
                  <>
                    <div style={{ fontSize: 12, color: '#6b6f84', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Chi tiết</div>
                    {[
                      ['Giá cơ bản', fmt(preview?.basePrice ?? booking.basePrice)],
                      ...((preview?.extraCharge ?? 0) > 0 ? [[`Phụ thu (${preview.extraHours}h)`, fmt(preview.extraCharge)]] : []),
                      ['Dịch vụ', fmt(preview?.servicesCharge ?? serviceTotal)],
                    ].map(([label, val]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: '#9fa3b8' }}>{label}</span>
                        <span style={{ fontSize: 13 }}>{val}</span>
                      </div>
                    ))}

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>Tổng cộng</span>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{fmt(previewTotal)}</span>
                    </div>
                  </>
                )}

                {/* Giảm giá */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#f87171' }}>Giảm giá (đ)</span>
                  <input type="text" className="form-control"
                    value={discount === 0 ? '' : discount.toLocaleString('vi-VN')}
                    onChange={e => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setDiscount(raw ? Number(raw) : 0);
                    }}
                    placeholder="0"
                    style={{ width: 110, textAlign: 'right', padding: '6px 10px', borderColor: 'rgba(248,113,113,0.3)' }}
                  />
                </div>

                {/* Thuế / VAT */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b' }}>Thuế / VAT</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <select className="form-control" value={taxType}
                      onChange={e => { setTaxType(e.target.value); setTaxInput(''); }}
                      style={{ width: 60, padding: '6px 4px', borderColor: 'rgba(245,158,11,0.3)', color: '#f59e0b', fontWeight: 600 }}>
                      <option value="percent">%</option>
                      <option value="vnd">VNĐ</option>
                    </select>
                    <input type="text" className="form-control"
                      value={taxType === 'percent' ? taxInput : (taxInput === '' ? '' : Number(taxInput).toLocaleString('vi-VN'))}
                      onChange={e => {
                        const raw = e.target.value.replace(/\D/g, '');
                        if (!raw) { setTaxInput(''); return; }
                        if (taxType === 'percent' && Number(raw) > 100) { setTaxInput('100'); return; }
                        setTaxInput(raw);
                      }}
                      placeholder="0"
                      style={{ width: 100, textAlign: 'right', padding: '6px 10px', borderColor: 'rgba(245,158,11,0.3)' }}
                    />
                  </div>
                </div>

                {taxType === 'percent' && taxInput > 0 && (
                  <div style={{ textAlign: 'right', fontSize: 11.5, color: '#f59e0b', marginTop: 4, fontWeight: 600 }}>
                    ≈ + {fmt(taxVnd)}
                  </div>
                )}

                {/* Thực thu */}
                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 12, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>Thực thu</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{fmt(finalTotal)}</span>
                </div>


              </div>

              <div style={{ background: 'rgba(239,68,68,0.07)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>
                ⚠️ Xác nhận Check-out sẽ tự động trả phòng và chốt Hóa đơn
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
              <button className="btn" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }} onClick={() => setTab('checkout')}>
                Chuyển sang Check-out →
              </button>
            )
          )}
        </div>
      </div>

      {createdInvoice && (
        <InvoiceDetailModal
          invoice={createdInvoice}
          onClose={() => { setCreatedInvoice(null); onClose(); }}
          onCancel={() => { setCreatedInvoice(null); onClose(); }}
          addToast={addToast}
        />
      )}
    </div>
  );
}