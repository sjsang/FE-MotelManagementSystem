import React, { useState, useEffect } from 'react';
import { getActivePrice, updatePrice, createPrice } from '../utils/api';
import { useToast } from '../hooks/useToast';

export default function PriceManagement() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edited, setEdited] = useState(null);
  const [tab, setTab] = useState('day'); // 'day' | 'night' | 'services'
  const { addToast, ToastContainer } = useToast();

  useEffect(() => {
    getActivePrice()
      .then(r => { setConfig(r.data); setEdited(JSON.parse(JSON.stringify(r.data))); })
      .catch(() => addToast('Lỗi tải bảng giá', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const set = (path, value) => {
    setEdited(prev => {
      const clone = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let obj = clone;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = value === '' ? '' : Number(value);
      return clone;
    });
  };

  const setService = (i, field, value) => {
    setEdited(prev => {
      const clone = JSON.parse(JSON.stringify(prev));
      clone.services[i][field] = field === 'price' ? (value === '' ? '' : Number(value)) : value;
      return clone;
    });
  };

  const addService = () => {
    setEdited(prev => ({
      ...prev,
      services: [...(prev.services || []), { name: '', price: 0, unit: 'cái' }]
    }));
  };

  const removeService = (i) => {
    setEdited(prev => ({ ...prev, services: prev.services.filter((_, idx) => idx !== i) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePrice(config._id, edited);
      setConfig(edited);
      addToast('✅ Đã lưu bảng giá');
    } catch (e) {
      addToast(e.response?.data?.error || 'Lỗi lưu bảng giá', 'error');
    } finally { setSaving(false); }
  };

  const fmt = (n) => n ? n.toLocaleString('vi-VN') : '0';

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b6f84' }}>Đang tải...</div>;
  if (!edited) return null;

  const PriceField = ({ label, path, note }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</div>
        {note && <div style={{ fontSize: 11.5, color: '#6b6f84', marginTop: 2 }}>{note}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="number"
          className="form-control"
          style={{ width: 130, textAlign: 'right' }}
          value={path.split('.').reduce((obj, k) => obj?.[k], edited) || ''}
          onChange={e => set(path, e.target.value)}
        />
        <span style={{ fontSize: 12, color: '#6b6f84', width: 16 }}>đ</span>
      </div>
    </div>
  );

  return (
    <div>
      <ToastContainer />
      <div className="page-header">
        <div>
          <div className="page-title">Bảng giá</div>
          <div className="page-subtitle">Cấu hình giá phòng theo ca và loại phòng</div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? '...' : '💾 Lưu bảng giá'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          ['day', '☀️ Ca ngày (5h–23h)'],
          ['night', '🌙 Ca đêm (23h–5h)'],
          ['services', '🛒 Dịch vụ'],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontWeight: 600, fontSize: 13, background: tab === key ? 'var(--accent)' : 'var(--bg3)',
              color: tab === key ? '#fff' : '#9fa3b8', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'day' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 4, color: '#8b85ff' }}>🛏 Phòng đơn – Ca ngày</div>
            <div style={{ fontSize: 12, color: '#6b6f84', marginBottom: 12 }}>Áp dụng 5h – 23h</div>
            <PriceField label="Ngày đêm (24h)" path="dayShift.single.fullday" note="Tính từ 12h hôm nay đến 12h mai" />
            <PriceField label="Qua đêm" path="dayShift.single.overnight" note="Từ 18h đến 8h sáng" />
            <PriceField label="Nghỉ giờ – Đầu (≤30 phút)" path="dayShift.single.hourly_first" />
            <PriceField label="Nghỉ giờ – Đến 2 giờ" path="dayShift.single.hourly_2h" />
            <PriceField label="Phụ thu mỗi giờ thêm" path="dayShift.single.hourly_extra" />
          </div>
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 4, color: '#f472b6' }}>🛏🛏 Phòng đôi – Ca ngày</div>
            <div style={{ fontSize: 12, color: '#6b6f84', marginBottom: 12 }}>Áp dụng 5h – 23h</div>
            <PriceField label="Ngày đêm (24h)" path="dayShift.double.fullday" />
            <PriceField label="Qua đêm" path="dayShift.double.overnight" />
            <PriceField label="Nghỉ giờ – Đến 2 giờ" path="dayShift.double.hourly_2h" />
            <PriceField label="Phụ thu mỗi giờ thêm" path="dayShift.double.hourly_extra" />
          </div>
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>⏰ Phụ thu chung</div>
            <PriceField label="Check-in sớm / Check-out muộn" path="lateEarlyFee" note="Mỗi giờ phụ thu thêm" />
          </div>
        </div>
      )}

      {tab === 'night' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 4, color: '#8b85ff' }}>🛏 Phòng đơn – Ca đêm</div>
            <div style={{ fontSize: 12, color: '#6b6f84', marginBottom: 12 }}>Áp dụng 23h – 5h</div>
            <PriceField label="Giờ đầu tiên" path="nightShift.single.hourly_first" note="120k/giờ" />
            <PriceField label="Phụ thu mỗi giờ thêm" path="nightShift.single.hourly_extra" note="Từ giờ thứ 2 trở đi" />
          </div>
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 4, color: '#f472b6' }}>🛏🛏 Phòng đôi – Ca đêm</div>
            <div style={{ fontSize: 12, color: '#6b6f84', marginBottom: 12 }}>Áp dụng 23h – 5h</div>
            <PriceField label="Giờ đầu tiên" path="nightShift.double.hourly_first" />
            <PriceField label="Phụ thu mỗi giờ thêm" path="nightShift.double.hourly_extra" />
          </div>
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div style={{ background: 'rgba(59,130,246,0.08)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#60a5fa' }}>
              📌 Quy tắc ca đêm: Dưới 15 tiếng thu 100% giá qua đêm. Sau 0h: 120k/h, mỗi giờ thêm +40k (đơn).
            </div>
          </div>
        </div>
      )}

      {tab === 'services' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700 }}>Danh sách dịch vụ</div>
            <button className="btn btn-primary btn-sm" onClick={addService}>+ Thêm dịch vụ</button>
          </div>
          {(edited.services || []).map((svc, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 10, marginBottom: 10, alignItems: 'center' }}>
              <input className="form-control" placeholder="Tên dịch vụ" value={svc.name}
                onChange={e => setService(i, 'name', e.target.value)} />
              <input className="form-control" type="number" placeholder="Giá" value={svc.price}
                onChange={e => setService(i, 'price', e.target.value)} />
              <input className="form-control" placeholder="Đơn vị" value={svc.unit}
                onChange={e => setService(i, 'unit', e.target.value)} />
              <button className="btn btn-sm"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                onClick={() => removeService(i)}>✕</button>
            </div>
          ))}
          {(!edited.services || edited.services.length === 0) && (
            <div style={{ textAlign: 'center', padding: 30, color: '#6b6f84' }}>Chưa có dịch vụ nào</div>
          )}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? '...' : '💾 Lưu bảng giá'}
            </button>
          </div>
        </div>
      )}

      {/* Price summary preview */}
      {tab !== 'services' && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>📊 Tóm tắt bảng giá hiện tại</div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Loại phòng</th>
                  <th>Ngày đêm 24h</th>
                  <th>Qua đêm</th>
                  <th>Giờ đầu (ngày)</th>
                  <th>Giờ đầu (đêm)</th>
                </tr>
              </thead>
              <tbody>
                {['single', 'double'].map(type => (
                  <tr key={type}>
                    <td style={{ fontWeight: 600 }}>{type === 'single' ? '🛏 Đơn' : '🛏🛏 Đôi'}</td>
                    <td>{fmt(edited.dayShift?.[type]?.fullday)}đ</td>
                    <td>{fmt(edited.dayShift?.[type]?.overnight)}đ</td>
                    <td>{fmt(edited.dayShift?.[type]?.hourly_2h || edited.dayShift?.[type]?.hourly_first)}đ</td>
                    <td>{fmt(edited.nightShift?.[type]?.hourly_first)}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
