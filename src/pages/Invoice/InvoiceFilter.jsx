import React, { useState, useRef } from 'react';
import dayjs from 'dayjs';
import CustomDateRangePicker from '../../components/DateRangePicker';

export default function InvoiceFilter({ filter, setFilter, handleApplyFilter, handleClearFilter }) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerAnchor, setPickerAnchor] = useState(null);
    const [dateLabel, setDateLabel] = useState('Tháng này');
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
        if (e.key === 'Enter') {
            handleApplyFilter();
        }
    };

    return (
        <div className="card" style={{ marginBottom: 16, padding: '16px 20px' }}>
            <style>{`
                .filter-wrapper {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                    align-items: flex-end;
                }
                .f-date { width: 230px; }
                /* Thu nhỏ chiều ngang Desktop */
                .f-status { width: 105px; } 
                .f-room { width: 85px; }    
                .f-name { width: 200px; }
                .f-actions { display: flex; gap: 8px; }

                /* CSS Responsive cho Mobile */
                @media (max-width: 768px) {
                    .filter-wrapper {
                        display: grid;
                        /* Đổi tỷ lệ 2fr 1fr để cột bên phải (Phòng/Trạng thái) nhỏ lại hẳn */
                        grid-template-columns: 2fr 1fr; 
                        grid-template-areas:
                            "date room"
                            "name status"
                            "actions actions";
                        gap: 12px;
                    }
                    .f-date { grid-area: date; width: 100% !important; }
                    .f-room { grid-area: room; width: 100% !important; }
                    .f-name { grid-area: name; width: 100% !important; }
                    .f-status { grid-area: status; width: 100% !important; }
                    .f-actions { grid-area: actions; width: 100% !important; justify-content: flex-start; }
                    
                    .f-date > button, 
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
                    <div className="form-label" style={{ fontSize: 12, color: '#9fa3b8', marginBottom: 6 }}>Khoảng thời gian</div>
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
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = '#DCEEFF';
                            e.currentTarget.style.borderColor = '#AFC7E8';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = '#EAF4FF';
                            e.currentTarget.style.borderColor = '#C3D6EA';
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

                {/* 2. Số phòng */}
                <div className="f-room">
                    <div className="form-label" style={{ fontSize: 12, color: '#9fa3b8', marginBottom: 6 }}>Số phòng</div>
                    <input className="form-control" placeholder="VD: 101" value={filter.roomNumber}
                        onChange={e => setF('roomNumber', e.target.value)}
                        onKeyDown={handleKeyDown}
                        // Chỉnh padding nhỏ lại cho gọn
                        style={{ width: '100%', padding: '8px 10px', fontSize: 13 }} />
                </div>

                {/* 3. Tên khách hàng */}
                <div className="f-name">
                    <div className="form-label" style={{ fontSize: 12, color: '#9fa3b8', marginBottom: 6 }}>Tên khách hàng</div>
                    <input className="form-control" placeholder="Nhập tên..." value={filter.guestName}
                        onChange={e => setF('guestName', e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{ width: '100%', padding: '8px 12px', fontSize: 13 }} />
                </div>
                {/* 4. Trạng thái */}
                <div className="f-status">
                    <div className="form-label" style={{ fontSize: 12, color: '#9fa3b8', marginBottom: 6 }}>Trạng thái</div>
                    <select className="form-control" value={filter.status} onChange={e => setF('status', e.target.value)}
                        style={{ width: '100%', padding: '8px 6px 8px 10px', fontSize: 13, cursor: 'pointer' }}>
                        <option value="" style={{ fontSize: '11px', padding: '4px' }}>Tất cả</option>
                        <option value="issued" style={{ fontSize: '11px', padding: '4px' }}>Đã xuất</option>
                        <option value="cancelled" style={{ fontSize: '11px', padding: '4px' }}>Đã hủy</option>
                    </select>
                </div>

                {/* 5. Các nút hành động */}
                <div className="f-actions">
                    <button
                        onClick={handleApplyFilter}
                        style={{
                            padding: '8px 18px', height: 'fit-content', borderRadius: 8,
                            backgroundColor: '#16a34a', color: '#fff', border: 'none',
                            fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(22,163,74,0.3)', transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#15803d'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#16a34a'}
                    >
                        Lọc
                    </button>

                    <button
                        className="btn btn-ghost"
                        style={{ padding: '8px 12px', height: 'fit-content', fontSize: 13 }}
                        onClick={() => {
                            setDateLabel('Tháng này');
                            handleClearFilter();
                        }}
                    >
                        ↺ Xóa lọc
                    </button>
                </div>

            </div>
        </div>
    );
}