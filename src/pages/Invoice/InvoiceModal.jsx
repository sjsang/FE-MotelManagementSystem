import React, { useState } from 'react';
import { createInvoice } from '../../utils/api';
import { buildPrintHTML } from '../../utils/printTemplate';

const BOOKING_TYPE_LABEL = {
    hourly: 'Nghỉ giờ',
    overnight: 'Qua đêm',
    fullday: 'Ngày đêm (24h)',
};

function fmt(n) {
    return (n || 0).toLocaleString('vi-VN') + 'đ';
}

function formatTime(dateStr) {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleString('vi-VN', {
        hour: '2-digit', minute: '2-digit',
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
}

const calculateUsageTime = (start, end) => {
    if (!start || !end) return '--';
    const diffMs = new Date(end) - new Date(start);
    if (diffMs <= 0) return '0 phút';
    const totalMins = Math.floor(diffMs / 60000);
    const d = Math.floor(totalMins / 1440);
    const h = Math.floor((totalMins % 1440) / 60);
    const m = totalMins % 60;
    let res = [];
    if (d > 0) res.push(`${d} ngày`);
    if (h > 0) res.push(`${h} giờ`);
    if (m > 0 || (d === 0 && h === 0)) res.push(`${m} phút`);
    return res.join(' ');
};

export default function InvoiceModal({ booking, onClose, onDone, addToast }) {
    const [discount, setDiscount] = useState(0);
    const [issuedBy, setIssuedBy] = useState('');
    const [loading, setLoading] = useState(false);
    const [invoice, setInvoice] = useState(null);

    const serviceTotal = (booking.services || []).reduce((s, sv) => s + sv.price * sv.quantity, 0);
    const totalAmount = booking.totalAmount || 0;
    const paidAmount = Math.max(0, totalAmount - Number(discount || 0));

    const handleCreate = async () => {
        setLoading(true);
        try {
            const res = await createInvoice({
                bookingId: booking._id,
                discount: Number(discount || 0),
                issuedBy: issuedBy.trim(),
            });
            setInvoice(res.data);
            addToast('Xuất hóa đơn thành công');
        } catch (e) {
            addToast(e.response?.data?.message || 'Lỗi xuất hóa đơn', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        if (!invoice) return;
        const win = window.open('', '_blank');
        win.document.write(buildPrintHTML(invoice));
        win.document.close();
        win.focus();
        win.print();
    };

    if (invoice) {
        return (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onDone()}>
                <div className="modal" style={{ maxWidth: 500 }}>
                    <div className="modal-header">
                        <div>
                            <div className="modal-title">✅ Hóa đơn {invoice.invoiceNumber}</div>
                            <div style={{ fontSize: 12, color: '#9fa3b8', marginTop: 2 }}>
                                Xuất lúc {formatTime(invoice.issuedAt)}
                            </div>
                        </div>
                        <button className="modal-close" onClick={onDone}>✕</button>
                    </div>

                    <div className="modal-body">
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {[
                                    ['Phòng', `${invoice.roomNumber} (${invoice.roomType === 'double' ? 'Đôi' : 'Đơn'})`],
                                    ['Loại thuê', BOOKING_TYPE_LABEL[invoice.bookingType]],
                                    ['Nhận phòng lúc', formatTime(invoice.checkIn)],
                                    ['Trả phòng lúc', formatTime(invoice.checkOut)],
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <div style={{ fontSize: 11, color: '#6b6f84' }}>{label}</div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ fontSize: 11, color: '#6b6f84' }}>Khách</div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{invoice.guestName}</div>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                            {[
                                ['Giá phòng', fmt(invoice.basePrice)],
                                ['Thời gian sử dụng', calculateUsageTime(invoice.checkIn, invoice.checkOut)],
                                ...(invoice.extraCharge > 0 ? [[`Phụ thu (${invoice.extraHours}h)`, fmt(invoice.extraCharge)]] : []),
                                ...(invoice.servicesCharge > 0 ? [['Dịch vụ', fmt(invoice.servicesCharge)]] : []),
                            ].map(([label, value]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                                    <span style={{ color: '#9fa3b8' }}>{label}</span>
                                    <span>{value}</span>
                                </div>
                            ))}
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10, marginTop: 6 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: invoice.discount > 0 ? 6 : 10 }}>
                                    <span style={{ fontWeight: 600 }}>Tổng cộng</span>
                                    <span style={{ fontWeight: 600 }}>{fmt(invoice.totalAmount)}</span>
                                </div>

                                {invoice.discount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <span style={{ fontWeight: 600, color: '#f87171' }}>Giảm giá</span>
                                        <span style={{ fontWeight: 600, color: '#f87171' }}>- {fmt(invoice.discount)}</span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, fontSize: 15 }}>Thực thu</span>
                                    <span style={{ fontWeight: 800, fontSize: 20, color: '#10b981' }}>{fmt(invoice.paidAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {(invoice.services || []).length > 0 && (
                            <div style={{ marginBottom: 14 }}>
                                <div style={{ fontSize: 12, color: '#6b6f84', marginBottom: 8 }}>Chi tiết dịch vụ:</div>
                                {invoice.services.map((s, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <span>{s.name} x{s.quantity}</span>
                                        <span>{fmt(s.price * s.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-ghost" onClick={onDone}>Đóng</button>
                        <button className="btn btn-primary" onClick={handlePrint}>🖨️ In hóa đơn</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 460 }}>
                <div className="modal-header">
                    <div>
                        <div className="modal-title">🧾 Xuất hóa đơn</div>
                        <div style={{ fontSize: 12, color: '#9fa3b8', marginTop: 2 }}>
                            Phòng {booking.roomNumber} — {booking.guestName}
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                        <div style={{ fontSize: 12, color: '#9fa3b8', marginBottom: 10 }}>Tổng kết sau check-out</div>
                        {[
                            ['Giá phòng', fmt(booking.basePrice)],
                            ['Thời gian sử dụng', calculateUsageTime(booking.checkIn, booking.checkOut)],
                            ...(booking.extraCharge > 0 ? [[`Phụ thu (${booking.extraHours}h)`, fmt(booking.extraCharge)]] : []),
                            ...(serviceTotal > 0 ? [['Dịch vụ', fmt(serviceTotal)]] : []),
                        ].map(([label, value]) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                                <span style={{ color: '#9fa3b8' }}>{label}</span>
                                <span>{value}</span>
                            </div>
                        ))}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8, marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 700 }}>Tổng cộng</span>
                            <span style={{ fontWeight: 700, color: '#10b981' }}>{fmt(totalAmount)}</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Giảm giá (đ)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={discount === 0 ? '' : discount.toLocaleString('vi-VN')}
                            onChange={e => {
                                const rawValue = e.target.value.replace(/\D/g, '');
                                if (!rawValue) {
                                    setDiscount(0);
                                    return;
                                }
                                const num = Number(rawValue);
                                if (num <= totalAmount) {
                                    setDiscount(num);
                                } else {
                                    setDiscount(totalAmount);
                                }
                            }}
                            placeholder="0"
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        <span style={{ fontWeight: 600 }}>Thực thu</span>
                        <span style={{ fontWeight: 800, fontSize: 18, color: '#10b981' }}>{fmt(paidAmount)}</span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Nhân viên xuất hóa đơn</label>
                        <input
                            className="form-control"
                            placeholder="Tên nhân viên (không bắt buộc)"
                            value={issuedBy}
                            onChange={e => setIssuedBy(e.target.value)}
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
                    <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
                        {loading ? '...' : '🧾 Xuất hóa đơn'}
                    </button>
                </div>
            </div>
        </div>
    );
}