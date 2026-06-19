import React from 'react';

export default function InvoiceStats({ total, summary }) {
    return (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 15 }}>
            <div className="stat-card">
                <div className="stat-label">Tổng hóa đơn </div>
                <div className="stat-value" style={{ color: '#8b85ff' }}>{total}</div>
            </div>
        </div>
    );
}