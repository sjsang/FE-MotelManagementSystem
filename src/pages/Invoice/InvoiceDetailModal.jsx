import React, { useState, useRef } from 'react';
import { cancelInvoice } from '../../utils/api';
import { buildPrintHTML } from '../../utils/printTemplate';

const BOOKING_TYPE_LABEL = { hourly: 'Nghỉ giờ', overnight: 'Qua đêm', fullday: 'Ngày đêm' };
const STATUS_STYLE = {
    issued: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Đã xuất' },
    cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Đã hủy' },
};

function fmt(n) { return (n || 0).toLocaleString('vi-VN') + 'đ'; }
function fmtDate(d) {
    if (!d) return '--';
    return new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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

export default function InvoiceDetailModal({ invoice, onClose, onCancel, addToast }) {
    const [cancelling, setCancelling] = useState(false);
    const [reason, setReason] = useState('');
    const [showCancelForm, setShowCancelForm] = useState(false);
    const ss = STATUS_STYLE[invoice.status];

    // Quản lý Modal In
    const [showPreview, setShowPreview] = useState(false);
    const iframeRef = useRef(null);

    const handleCancel = async () => {
        if (!reason.trim()) { addToast('Vui lòng nhập lý do hủy', 'error'); return; }
        setCancelling(true);
        try {
            await cancelInvoice(invoice._id, { reason });
            addToast('Đã hủy hóa đơn');
            onCancel();
        } catch (e) {
            addToast(e.response?.data?.message || 'Lỗi hủy hóa đơn', 'error');
        } finally { setCancelling(false); }
    };

    const handlePrint = () => {
        setShowPreview(true); // Chỉ mở Modal xem trước thay vì tab mới
    };

    const executePrint = () => {
        if (iframeRef.current) {
            iframeRef.current.contentWindow.print(); // Gọi lệnh in của trình duyệt từ bên trong iframe
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 500 }}>
                <div className="modal-header">
                    <div>
                        <div className="modal-title">{invoice.invoiceNumber}</div>
                        <div style={{ fontSize: 12, color: '#9fa3b8', marginTop: 2 }}>
                            Xuất lúc {fmtDate(invoice.issuedAt)}
                            {invoice.issuedBy && ` • ${invoice.issuedBy}`}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: ss.bg, color: ss.color }}>
                            {ss.label}
                        </span>
                        <button className="modal-close" onClick={onClose}>✕</button>
                    </div>
                </div>

                <div className="modal-body">
                    {/* Thông tin phòng & khách */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                            {[
                                ['Phòng', `${invoice.roomNumber} (${invoice.roomType === 'double' ? 'Đôi' : 'Đơn'})`],
                                ['Loại thuê', BOOKING_TYPE_LABEL[invoice.bookingType] || '--'],
                                ['Nhận phòng lúc', fmtDate(invoice.checkIn)],
                                ['Trả phòng lúc', fmtDate(invoice.checkOut)],
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <div style={{ fontSize: 11, color: '#6b6f84' }}>{label}</div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: 11, color: '#6b6f84' }}>Khách hàng</div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{invoice.guestName}</div>
                            {invoice.guestId && <div style={{ fontSize: 11.5, color: '#6b6f84' }}>CCCD: {invoice.guestId}</div>}
                        </div>
                    </div>

                    {/* Chi tiết tiền */}
                    <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                        {[
                            ['Giá phòng', fmt(invoice.basePrice)],
                            ['Thời gian sử dụng', calculateUsageTime(invoice.checkIn, invoice.checkOut)],
                            ...(invoice.earlyCheckInCharge > 0 ? [['Phụ thu vào sớm', fmt(invoice.earlyCheckInCharge)]] : []),
                            ...(invoice.extraCharge > 0 ? [['Phụ thu ra trễ', fmt(invoice.extraCharge)]] : []),
                            ...(invoice.servicesCharge > 0 ? [['Dịch vụ', fmt(invoice.servicesCharge)]] : []),
                        ].map(([label, value]) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                                <span style={{ color: '#9fa3b8' }}>{label}</span>
                                <span>{value}</span>
                            </div>
                        ))}

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8, marginTop: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: invoice.discount > 0 ? 6 : 10 }}>
                                <span style={{ fontWeight: 600 }}>Tổng cộng</span>
                                <span style={{ fontWeight: 600 }}>{fmt(invoice.totalAmount)}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontWeight: 600 }}>Giảm giá</span>
                                <span style={{ fontWeight: 600 }}>{fmt(invoice.discount)}</span>
                            </div>


                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontWeight: 600 }}>Thuế / VAT</span>
                                <span style={{ fontWeight: 600 }}>{fmt(invoice.tax)}</span>
                            </div>

                            {/* Trường Giá trị TT */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 8 }}>
                                <span style={{ fontWeight: 600 }}>Giá trị thanh toán</span>
                                <span style={{ fontWeight: 600 }}>{fmt(invoice.payableAmount)}</span>
                            </div>

                            {invoice?.deposit > 0 && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontWeight: 600 }}>Tạm ứng</span>
                                        <span style={{ fontWeight: 600 }}>{fmt(invoice.deposit)}</span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8, marginTop: 4 }}>
                                        <span style={{ fontWeight: 700, fontSize: 15 }}>Thực thu</span>
                                        <span style={{ fontWeight: 800, fontSize: 20 }}>{fmt(invoice.paidAmount)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Dịch vụ */}
                    {(invoice.services || []).length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 12, color: '#6b6f84', marginBottom: 6 }}>Chi tiết dịch vụ:</div>
                            {invoice.services.map((s, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <span>{s.name} x{s.quantity}</span>
                                    <span>{fmt(s.price * s.quantity)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Hủy hóa đơn */}
                    {invoice.status === 'issued' && (
                        <div>
                            {!showCancelForm ? (
                                <button onClick={() => setShowCancelForm(true)}
                                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: 8, padding: '7px 14px', fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                                    Hủy hóa đơn
                                </button>
                            ) : (
                                <div style={{ background: 'rgba(239,68,68,0.07)', borderRadius: 10, padding: '12px 14px' }}>
                                    <div style={{ fontSize: 13, color: '#f87171', marginBottom: 8, fontWeight: 600 }}>⚠️ Xác nhận hủy hóa đơn</div>
                                    <input className="form-control" placeholder="Lý do hủy..." value={reason}
                                        onChange={e => setReason(e.target.value)} style={{ marginBottom: 8 }} />
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => setShowCancelForm(false)}>Thôi</button>
                                        <button onClick={handleCancel} disabled={cancelling}
                                            style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 14px', fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                                            {cancelling ? '...' : 'Xác nhận hủy'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
                    <button className="btn btn-primary" onClick={handlePrint}>Xem & In hóa đơn</button>
                </div>
            </div>

            {/* === MODAL XEM TRƯỚC HÓA ĐƠN NẰM NGAY TRÊN TRANG === */}
            {showPreview && (
                <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={e => e.target === e.currentTarget && setShowPreview(false)}>
                    <div className="modal" style={{ maxWidth: 450, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '90vh' }}>
                        <div className="modal-header" style={{ padding: '12px 16px', background: 'var(--bg2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="modal-title" style={{ fontSize: 15 }}>Bản xem trước hóa đơn</div>
                            <button className="modal-close" onClick={() => setShowPreview(false)}>✕</button>
                        </div>

                        <div style={{ flex: 1, background: '#52565e', padding: '20px', overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
                            <iframe
                                ref={iframeRef}
                                srcDoc={buildPrintHTML(invoice)}
                                style={{ width: '100%', maxWidth: '400px', height: '100%', minHeight: '500px', background: '#fff', border: 'none', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                                title="Print Preview"
                            />
                        </div>

                        <div className="modal-footer" style={{ padding: '12px 16px', background: 'var(--bg2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <button className="btn btn-ghost" onClick={() => setShowPreview(false)}>Đóng</button>
                            <button className="btn btn-primary" onClick={executePrint}>In</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}