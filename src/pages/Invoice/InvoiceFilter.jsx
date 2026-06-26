import React, { useState, useRef } from 'react';
import dayjs from 'dayjs';
import CustomDateRangePicker from '../../components/DateRangePicker';

export default function InvoiceFilter({ filter, setFilter, handleApplyFilter, handleClearFilter, dateLabel, setDateLabel }) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerAnchor, setPickerAnchor] = useState(null);
    const dateButtonRef = useRef(null);

    const handleOpenPicker = () => {
        setPickerAnchor(dateButtonRef.current);
        setPickerOpen(true);
    };

    const handleApplyDates = (dates) => {
        setFilter(f => ({ ...f, from: dates.start || f.from, to: dates.end || f.to }));
        setDateLabel(dates.label || '📅 Chọn trên lịch');
    };

    const setF = (k, v) => setFilter(f => ({ ...f, [k]: v }));

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleApplyFilter();
    };

    return (
        <>
            <style>{`
                /* ── Layout chung ── */
                .filter-wrapper {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    align-items: flex-end;
                    flex: 1; 
                }
                .f-date { width: 210px; }
                .f-invoice { width: 120px; }
                .f-status { width: 100px; }
                .f-room { width: 80px; }
                .f-name { width: 180px; }
                .f-actions { display: flex; gap: 8px; }

                /* ── Stats + Filter cùng hàng trên PC ── */
                .stats-filter-row {
                    display: flex;
                    align-items: center;
                    gap: 0;
                }
                .stats-filter-divider { display: none; }

                /* ── Mobile: Ép tọa độ Grid chính xác ── */
                @media (max-width: 768px) {
                    .stats-filter-row {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .stats-filter-divider { display: none; }

                    .filter-wrapper {
                        display: grid;
                        grid-template-columns: repeat(10, 1fr);
                        gap: 12px;
                    }

                    /* Ép vị trí cố định: Hàng 1 (Thời gian 7/10, Phòng 3/10) */
                    .f-date { grid-column: 1 / 8; grid-row: 1; width: 100% !important; }
                    .f-room { grid-column: 8 / 11; grid-row: 1; width: 100% !important; }

                    /* Ép vị trí cố định: Hàng 2 (Tên 6/10, Trạng thái 4/10) */
                    .f-name   { grid-column: 1 / 7; grid-row: 2; width: 100% !important; }
                    .f-status { grid-column: 7 / 11; grid-row: 2; width: 100% !important; }

                    /* Ép vị trí cố định: Hàng 3 (Mã HĐ 6/10, Hành động 4/10) */
                    .f-invoice { grid-column: 1 / 7; grid-row: 3; width: 100% !important; }
                    .f-actions { 
                        grid-column: 7 / 11; 
                        grid-row: 3; 
                        width: 100% !important; 
                        justify-content: flex-start; /* Nút canh trái cho gần input */
                        align-self: flex-end; /* Ép nút nằm sát đáy cho bằng hàng với input */
                    }

                    .f-date > button,
                    .f-invoice > input,
                    .f-status > select,
                    .f-room > input,
                    .f-name > input {
                        width: 100% !important;
                        box-sizing: border-box;
                    }
                    .f-date button span {
                        font-size: 11.5px !important;
                        letter-spacing: 0 !important;
                    }
                    .f-date button .arrow-icon {
                        margin: 0 4px !important;
                    }
                }
            `}</style>

            <div className="filter-wrapper">
                {/* 1. Khoảng thời gian */}
                <div className="f-date">
                    <div className="form-label" style={{ fontSize: 12, color: '#9fa3b8', marginBottom: 6, fontWeight: 600 }}>KHOẢNG THỜI GIAN</div>
                    <button
                        ref={dateButtonRef}
                        onClick={handleOpenPicker}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: '1px solid #C3D6EA',
                            backgroundColor: '#EAF4FF',
                            color: '#1f2a37',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontSize: 13.5,
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                            {dateLabel === '📅 Chọn trên lịch' ? (
                                <>
                                    <span style={{ fontWeight: 600, letterSpacing: '0.3px' }}>
                                        {filter.from ? dayjs(filter.from).format('DD/MM/YYYY') : '--'}
                                    </span>
                                    <span className="arrow-icon" style={{ margin: '0 10px', color: '#6b7a90', fontWeight: 500 }}>
                                        →
                                    </span>
                                    <span style={{ fontWeight: 600, letterSpacing: '0.3px' }}>
                                        {filter.to ? dayjs(filter.to).format('DD/MM/YYYY') : '--'}
                                    </span>
                                </>
                            ) : (
                                <span style={{ fontWeight: 600, letterSpacing: '0.3px' }}>
                                    {dateLabel}
                                </span>
                            )}
                        </div>
                    </button>
                    <CustomDateRangePicker
                        open={pickerOpen}
                        anchorEl={pickerAnchor}
                        onClose={() => setPickerOpen(false)}
                        initialDates={{ start: filter.from, end: filter.to }}
                        onApply={handleApplyDates}
                    />
                </div>

                {/* 2. Mã hóa đơn */}
                <div className="f-invoice">
                    <div className="form-label" style={{ fontSize: 12, color: '#9fa3b8', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>Mã hóa đơn</div>
                    <input className="form-control" placeholder="VD: HD001" value={filter.invoiceNumber || ''}
                        onChange={e => setF('invoiceNumber', e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{ width: '100%', padding: '8px 10px', fontSize: 13, backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8 }} />
                </div>

                {/* 3. Số phòng */}
                <div className="f-room">
                    <div className="form-label" style={{ fontSize: 12, color: '#9fa3b8', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>Số phòng</div>
                    <input className="form-control" placeholder="VD: 01" value={filter.roomNumber || ''}
                        onChange={e => setF('roomNumber', e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{ width: '100%', padding: '8px 10px', fontSize: 13, backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8 }} />
                </div>

                {/* 4. Tên khách hàng */}
                <div className="f-name">
                    <div className="form-label" style={{ fontSize: 12, color: '#9fa3b8', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>Tên khách hàng</div>
                    <input className="form-control" placeholder="Nhập tên..." value={filter.guestName || ''}
                        onChange={e => setF('guestName', e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{ width: '100%', padding: '8px 12px', fontSize: 13, backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8 }} />
                </div>

                {/* 5. Trạng thái */}
                <div className="f-status">
                    <div className="form-label" style={{ fontSize: 12, color: '#9fa3b8', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>Trạng thái</div>
                    <select className="form-control" value={filter.status || ''} onChange={e => setF('status', e.target.value)}
                        style={{ width: '100%', padding: '8px 6px 8px 10px', fontSize: 13, cursor: 'pointer', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                        <option value="">Tất cả</option>
                        <option value="issued">Đã xuất</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>

                {/* 6. Nút hành động */}
                <div className="f-actions">
                    <button
                        onClick={handleApplyFilter}
                        style={{
                            padding: '8px 18px', height: 'fit-content', borderRadius: 8,
                            backgroundColor: '#16a34a', color: '#fff', border: 'none',
                            fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        Lọc
                    </button>

                    <button
                        className="btn btn-ghost"
                        style={{
                            padding: '8px 12px', height: 'fit-content', fontSize: 13,
                            backgroundColor: '#e2e8f0', color: '#475569', borderRadius: 8, border: 'none', fontWeight: 600
                        }}
                        onClick={() => {
                            setDateLabel('Tháng này');
                            handleClearFilter();
                        }}
                    >
                        ↺ Xóa
                    </button>
                </div>
            </div>
        </>
    );
}