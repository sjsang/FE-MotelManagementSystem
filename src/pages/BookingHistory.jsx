import React, { useState, useEffect } from 'react';
import { getBookings, getRevenue, getCustomers } from '../utils/api';
import { useToast } from '../hooks/useToast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { exportBookingsToExcel } from '../utils/excel_bookinglist';

const TYPE_LABEL = { hourly: 'Nghỉ giờ', overnight: 'Qua đêm', fullday: 'Ngày đêm' };
const STATUS_LABEL = { active: 'Đang ở', completed: 'Đã trả', cancelled: 'Hủy' };
const STATUS_STYLE = {
  active: { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  completed: { color: '#8b85ff', bg: 'rgba(108,99,255,0.1)' },
  cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

function fmt(n) { return (n || 0).toLocaleString('vi-VN') + 'đ'; }
function fmtDate(d) {
  if (!d) return '--';
  return new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function today() { return new Date().toISOString().split('T')[0]; }
function weekAgo() {
  const d = new Date(); d.setDate(d.getDate() - 7);
  return d.toISOString().split('T')[0];
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#1e2130', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
        <div style={{ fontSize: 12, color: '#9fa3b8', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#8b85ff' }}>{(payload[0].value || 0).toLocaleString('vi-VN')}đ</div>
      </div>
    );
  }
  return null;
};

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', from: weekAgo(), to: today() });
  const { addToast, ToastContainer } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [bRes, rRes, cRes] = await Promise.all([
        getBookings({ status: filter.status || undefined }),
        getRevenue({ from: filter.from, to: filter.to + 'T23:59:59' }),
        getCustomers(),
      ]);
      setBookings(bRes.data);
      setRevenue(rRes.data);
      setCustomers(cRes.data || []);
    } catch { addToast('Lỗi tải dữ liệu', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter.from, filter.to, filter.status]);

  // Chart data
  const chartData = revenue ? Object.entries(revenue.byDay || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, total]) => ({
      date: day.slice(5), // MM-DD
      total,
    })) : [];

  return (
    <div>
      <ToastContainer />
      <div className="page-header">
        <div>
          <div className="page-title">Lịch sử & Doanh thu</div>
          <div className="page-subtitle">Xem lịch sử booking và thống kê doanh thu</div>
        </div>
      </div>

      {/* Filter */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <div className="form-label">Từ ngày</div>
            <input type="date" className="form-control" value={filter.from}
              min="1900-01-01"
              onChange={e => setFilter(f => ({ ...f, from: e.target.value }))} style={{ width: 160 }} />
          </div>
          <div>
            <div className="form-label">Đến ngày</div>
            <input type="date" className="form-control" value={filter.to}
              min="1900-01-01"
              onChange={e => setFilter(f => ({ ...f, to: e.target.value }))} style={{ width: 160 }} />
          </div>
          <div>
            <div className="form-label">Trạng thái</div>
            <select className="form-control" value={filter.status}
              onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} style={{ width: 150 }}>
              <option value="">Tất cả</option>
              <option value="active">Đang ở</option>
              <option value="completed">Đã trả</option>
              <option value="cancelled">Hủy</option>
            </select>
          </div>
          <button className="btn btn-ghost" onClick={load}>🔍 Lọc</button>
        </div>
      </div>

      {/* Revenue stats */}
      {revenue && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          <div className="stat-card">
            <div className="stat-label">Doanh thu (kỳ)</div>
            <div className="stat-value" style={{ color: '#10b981', fontSize: 18 }}>{(revenue.total || 0).toLocaleString('vi-VN')}đ</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Số lượt</div>
            <div className="stat-value" style={{ color: '#8b85ff' }}>{revenue.count || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Nghỉ giờ</div>
            <div className="stat-value" style={{ color: '#f472b6', fontSize: 16 }}>{(revenue.byType?.hourly || 0).toLocaleString('vi-VN')}đ</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Qua đêm / 24h</div>
            <div className="stat-value" style={{ color: '#60a5fa', fontSize: 16 }}>{((revenue.byType?.overnight || 0) + (revenue.byType?.fullday || 0)).toLocaleString('vi-VN')}đ</div>
          </div>
        </div>
      )}

      {/* Revenue chart */}
      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>📈 Doanh thu theo ngày</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#6b6f84', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => (v / 1000).toFixed(0) + 'k'} tick={{ fill: '#6b6f84', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" fill="#6c63ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bookings table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontWeight: 700 }}>Danh sách booking</div>
          <button 
            className="btn btn-success btn-sm"
            onClick={() => exportBookingsToExcel(bookings, customers)}
            disabled={bookings.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            📥 Xuất Danh sách booking
          </button>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b6f84' }}>Đang tải...</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Khách</th>
                  <th>Loại</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: '#6b6f84', padding: 30 }}>Không có dữ liệu</td></tr>
                ) : bookings.map(b => {
                  const ss = STATUS_STYLE[b.status] || STATUS_STYLE.completed;
                  return (
                    <tr key={b._id}>
                      <td><span style={{ fontWeight: 700, fontSize: 15 }}>{b.roomNumber}</span></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.guestName}</div>
                        {b.guestPhone && <div style={{ fontSize: 11.5, color: '#6b6f84' }}>{b.guestPhone}</div>}
                      </td>
                      <td><span style={{ fontSize: 12.5 }}>{TYPE_LABEL[b.bookingType]}</span></td>
                      <td style={{ fontSize: 12.5 }}>{fmtDate(b.checkIn)}</td>
                      <td style={{ fontSize: 12.5, color: b.checkOut ? undefined : '#6b6f84' }}>
                        {fmtDate(b.checkOut) || '—'}
                      </td>
                      <td>
                        {b.totalAmount ? (
                          <span style={{ fontWeight: 700, color: '#10b981' }}>{fmt(b.totalAmount)}</span>
                        ) : (
                          <span style={{ color: '#6b6f84', fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                          background: ss.bg, color: ss.color }}>
                          {STATUS_LABEL[b.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
