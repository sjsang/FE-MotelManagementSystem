import React from 'react';

const STATUS_STYLE = {
    issued: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Đã xuất' },
    cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Đã hủy' },
};

function fmt(n) { return (n || 0).toLocaleString('vi-VN') + 'đ'; }
function fmtDate(d) {
    if (!d) return '--';
    return new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function InvoiceTable({ loading, invoices, setSelected, page, totalPages, load }) {
    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
                <div style={{ textAlign: 'center', padding: 50, color: '#6b6f84' }}>Đang tải...</div>
            ) : (
                <>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Số hóa đơn</th>
                                    <th>Phòng</th>
                                    <th>Khách</th>
                                    <th>Thực thu</th>
                                    <th>Nhận phòng</th>
                                    <th>Trả phòng</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={{ textAlign: 'center', color: '#6b6f84', padding: 40 }}>
                                            Không có hóa đơn nào
                                        </td>
                                    </tr>
                                ) : invoices.map(inv => {
                                    const ss = STATUS_STYLE[inv.status];
                                    return (
                                        <tr key={inv._id} onClick={() => setSelected(inv)} style={{ cursor: 'pointer' }}>
                                            <td>
                                                <span style={{ fontWeight: 700, fontSize: 13, color: '#8b85ff' }}>
                                                    {inv.invoiceNumber}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 700 }}>{inv.roomNumber}</span>

                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{inv.guestName}</div>

                                            </td>


                                            <td>
                                                <span style={{ fontWeight: 700, color: '#10b981' }}>{fmt(inv.paidAmount)}</span>

                                            </td>
                                            <td style={{ fontSize: 12.5 }}>{fmtDate(inv.checkIn)}</td>
                                            <td style={{ fontSize: 12.5 }}>{fmtDate(inv.issuedAt)}</td>
                                            <td>
                                                <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: ss.bg, color: ss.color }}>
                                                    {ss.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '14px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => load(page - 1)}>← Trước</button>
                            <span style={{ fontSize: 13, color: '#6b6f84' }}>Trang {page} / {totalPages}</span>
                            <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => load(page + 1)}>Sau →</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}