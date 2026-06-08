import React from 'react';

export default function InvoiceStats({ total, summary }) {
    return (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
            <div className="stat-card">
                <div className="stat-label">Tổng hóa đơn </div>
                <div className="stat-value" style={{ color: '#8b85ff' }}>{total}</div>
            </div>
            <div className="stat-card">
                <div className="stat-label">Đã xuất </div>
                <div className="stat-value" style={{ color: '#10b981' }}>{summary.count}</div>
            </div>
            <div className="stat-card">
                <div className="stat-label">Doanh thu </div>
                <div className="stat-value" style={{ color: '#f59e0b', fontSize: 18 }}>
                    {summary.totalPaid.toLocaleString('vi-VN')}đ
                </div>
            </div>
        </div>
    );
}