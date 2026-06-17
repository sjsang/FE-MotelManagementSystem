import React, { useState, useRef } from 'react';
import dayjs from 'dayjs';
import CustomDateRangePicker from '../../components/DateRangePicker';

export default function InvoiceFilter({ filter, setFilter, handleApplyFilter, handleClearFilter }) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerAnchor, setPickerAnchor] = useState(null);
    // Thêm state lưu nhãn, mặc định là 'Tháng này'
    const [dateLabel, setDateLabel] = useState('Tháng này');
    const dateButtonRef = useRef(null);

    const handleOpenPicker = () => {
        setPickerAnchor(dateButtonRef.current);
        setPickerOpen(true);
    };

    const handleApplyDates = (dates) => {
        setFilter(f => ({ ...f, from: dates.start || f.from, to: dates.end || f.to }));
        // Hứng label từ DatePicker đẩy ra
        setDateLabel(dates.label || '📅 Chọn trên lịch');
    };

    const setF = (k, v) => setFilter(f => ({ ...f, [k]: v }));

    // Bắt sự kiện nhấn Enter trong ô input để lọc luôn
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleApplyFilter();
        }
    };

    return (
        <div className="card" style={{ marginBottom: 16, padding: '16px 20px' }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>

                {/* 1. Khoảng thời gian */}
                <div style={{ flex: '0 0 auto', width: 230 }}>
                    <div className="form-label" style={{ fontSize: 12, color: '#9fa3b8', marginBottom: 6 }}>Khoảng thời gian</div>
                    <button
                        ref={dateButtonRef}
                        onClick={handleOpenPicker}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            padding: '9px 14px',
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
                            {/* LOGIC ĐIỀU KIỆN RENDER Ở ĐÂY */}
                            {dateLabel === '📅 Chọn trên lịch' ? (
                                <>
                                    <span style={{ fontWeight: 600, letterSpacing: '0.3px' }}>
                                        {filter.from ? dayjs(filter.from).format('DD/MM/YYYY') : '--'}
                                    </span>
                                    <span style={{ margin: '0 10px', color: '#6b7a90', fontWeight: 500 }}>
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

                {/* 2. Trạng thái */}
                <div>
                    <div className="form-label" style={{ fontSize: 12, color: '#9fa3b8', marginBottom: 6 }}>Trạng thái</div>
                    <select className="form-control" value={filter.status} onChange={e => setF('status', e.target.value)}
                        style={{ width: 130, padding: '9px 14px', cursor: 'pointer' }}>
                        <option value="">Tất cả</option>
                        <option value="issued">Đã xuất</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>

                {/* 3. Thanh toán */}
                <div>
                    <div className="form-label" style={{ fontSize: 12, color: '#9fa3b8', marginBottom: 6 }}>Thanh toán</div>
                    <select className="form-control" value={filter.paymentMethod} onChange={e => setF('paymentMethod', e.target.value)}
                        style={{ width: 140, padding: '9px 14px', cursor: 'pointer' }}>
                        <option value="">Tất cả</option>
                        <option value="cash">Tiền mặt</option>
                        <option value="transfer">Chuyển khoản</option>
                        <option value="card">Thẻ</option>
                    </select>
                </div>

                {/* 4. Số phòng */}
                <div>
                    <div className="form-label" style={{ fontSize: 12, color: '#9fa3b8', marginBottom: 6 }}>Số phòng</div>
                    <input className="form-control" placeholder="VD: 101" value={filter.roomNumber}
                        onChange={e => setF('roomNumber', e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{ width: 100, padding: '9px 14px' }} />
                </div>

                {/* 5. Tên khách hàng */}
                <div>
                    <div className="form-label" style={{ fontSize: 12, color: '#9fa3b8', marginBottom: 6 }}>Tên khách hàng</div>
                    <input className="form-control" placeholder="Nhập tên..." value={filter.guestName}
                        onChange={e => setF('guestName', e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{ width: 200, padding: '9px 14px' }} />
                </div>

                {/* 6. Các nút hành động */}
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={handleApplyFilter}
                        style={{
                            padding: '9px 20px', height: 'fit-content', borderRadius: 8,
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
                        style={{ padding: '9px 14px', height: 'fit-content' }}
                        onClick={() => {
                            setDateLabel('Tháng này'); // Reset lại nhãn khi bấm Xóa lọc
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