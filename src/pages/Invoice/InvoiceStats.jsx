import React from 'react';

export default function InvoiceStats({ total, previousTotal }) {
    // Tính delta so với kỳ trước
    const delta = previousTotal != null ? total - previousTotal.count : null;
    const isUp = delta > 0;
    const isDown = delta < 0;

    return (
        <>
            <style>{`
                /* ── PC: stat block nằm bên trái cùng hàng với filter ── */
                .stat-inline-block {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    min-width: 160px;
                    flex-shrink: 0;
                    padding-right: 20px;
                    margin-right: 16px;
                    border-right: 1px solid rgba(0,0,0,0.1);
                }
                .stat-inline-label {
                    font-size: 11px;
                    color: #9fa3b8;
                    margin-bottom: 3px;
                    white-space: nowrap;
                }
                .stat-inline-value {
                    font-size: 22px;
                    font-weight: 700;
                    color: #8b85ff;
                    line-height: 1;
                }
                .stat-inline-delta {
                    font-size: 11.5px;
                    margin-top: 4px;
                    white-space: nowrap;
                }

                /* ── Mobile: thu gọn thành 1 dòng text ── */
                @media (max-width: 768px) {
                    .stat-inline-block {
                        flex-direction: row;
                        align-items: center;
                        gap: 8px;
                        min-width: unset;
                        width: 100%;
                        padding-bottom: 10px;
                        border-bottom: 1px solid rgba(0,0,0,0.1);
                        margin-bottom: 10px;
                    }
                    .stat-inline-label {
                        margin-bottom: 0;
                        font-size: 12px;
                    }
                    .stat-inline-value {
                        font-size: 16px;
                        font-weight: 700;
                    }
                    .stat-inline-delta {
                        margin-top: 0;
                        font-size: 11px;
                    }
                }
            `}</style>

            <div className="stat-inline-block">
                <div className="stat-inline-label">Tổng hóa đơn</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <div className="stat-inline-value">{total}</div>
                </div>
                {delta !== null && (
                    <div
                        className="stat-inline-delta"
                        style={{
                            color: isUp ? '#10b981' : isDown ? '#ef4444' : '#9fa3b8',
                            fontWeight: 600,
                        }}
                    >
                        {isUp ? '▲' : isDown ? '▼' : '—'}{' '}
                        {delta === 0
                            ? `Bằng ${previousTotal.label}`
                            : `${Math.abs(delta)} so với ${previousTotal.label}`}
                    </div>
                )}
            </div>
        </>
    );
}