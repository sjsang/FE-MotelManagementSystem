import React from 'react';
import { formatTime, formatCurrency } from '../../utils/roomDetailHelpers';

export default function TabInfo({ booking }) {
    const names = (booking.guestName || '').split(',').map(s => s.trim());
    const ids = (booking.guestId || '').split(',').map(s => s.trim());
    const guestsCombined = Array.from(
        { length: Math.max(names.length, ids.length) },
        (_, i) => ({ name: names[i] || '', id: ids[i] || '' })
    ).filter(g => g.name || g.id);

    return (
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
                    ['Giá cơ bản', formatCurrency(booking.basePrice)],
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
    );
}