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
            <style>{`
    @media (max-width: 768px) {
        .responsive-table {
            border-collapse: separate;
            border-spacing: 0 12px; /* Tạo khoảng trống giữa các dòng (gap) */
        }
        .responsive-table thead {
            display: none;
        }
        .responsive-table, .responsive-table tbody {
            display: block;
            width: 100%;
        }
        .responsive-table tr {
            display: block;
            width: 100%;
            background: rgba(255, 255, 255, 0.05); /* Nền cho mỗi card */
            border: 1px solid rgba(255, 255, 255, 0.1); /* Viền cho mỗi card */
            border-radius: 0; /* Không bo góc tr để khớp với card cha */
            margin-bottom: 8px;
            /* Thêm shadow nhẹ để card nổi bật lên */
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .responsive-table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            text-align: right;
            padding: 12px 16px !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
        }
        .responsive-table td:last-child {
            border-bottom: none !important;
        }
        .responsive-table td::before {
            content: attr(data-label);
            font-weight: 600;
            color: #6b6f84;
            font-size: 13px;
            text-align: left;
            margin-right: 16px;
        }
    }
`}</style>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 50, color: '#6b6f84' }}>Đang tải...</div>
            ) : (
                <>
                    <div className="table-wrap" style={{ padding: '0 16px' }}> {/* Thêm padding 2 bên cho mobile nếu cần */}
                        <table className="responsive-table">
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
                                        <td colSpan={7} style={{ textAlign: 'center', color: '#6b6f84', padding: 40, display: 'block' }}>
                                            Không có hóa đơn nào
                                        </td>
                                    </tr>
                                ) : invoices.map(inv => {
                                    const ss = STATUS_STYLE[inv.status];
                                    return (
                                        <tr key={inv._id} onClick={() => setSelected(inv)} style={{ cursor: 'pointer' }}>
                                            <td data-label="Số hóa đơn">
                                                <span style={{ fontWeight: 700, fontSize: 13, color: '#8b85ff' }}>
                                                    {inv.invoiceNumber}
                                                </span>
                                            </td>
                                            <td data-label="Phòng">
                                                <span style={{ fontWeight: 700 }}>{inv.roomNumber}</span>
                                            </td>
                                            <td data-label="Khách">
                                                <div style={{ fontWeight: 600 }}>{inv.guestName}</div>
                                            </td>
                                            <td data-label="Thực thu">
                                                <span style={{ fontWeight: 700, color: '#10b981' }}>{fmt(inv.paidAmount)}</span>
                                            </td>
                                            <td data-label="Nhận phòng" style={{ fontSize: 12.5 }}>
                                                {fmtDate(inv.checkIn)}
                                            </td>
                                            <td data-label="Trả phòng" style={{ fontSize: 12.5 }}>
                                                {fmtDate(inv.issuedAt)}
                                            </td>
                                            <td data-label="Trạng thái">
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