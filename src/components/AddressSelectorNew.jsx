import React, { useState, useEffect } from 'react';

export default function AddressSelectorNew({
  mode,
  onChangeMode,
  province,
  onChangeProvince,
  ward,
  onChangeWard,
  detail,
  onChangeDetail,
  manualValue,
  onChangeManual,
  label = 'Địa chỉ thường trú mới',
  postMergerProvinces = [],
  postMergerWards = {}
}) {
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [wards, setWards] = useState([]);

  // Sync province code if province name changes (e.g. on reset or initialization)
  useEffect(() => {
    if (province) {
      const match = postMergerProvinces.find(p => p.name === province || `${p.code} - ${p.name}` === province);
      if (match) {
        setSelectedProvinceCode(match.code);
        setWards(postMergerWards[match.code] || []);
      }
    } else {
      setSelectedProvinceCode('');
      setWards([]);
    }
  }, [province]);

  const handleProvinceChange = (e) => {
    const name = e.target.value;
    const option = e.target.options[e.target.selectedIndex];
    const code = option.getAttribute('data-code') || '';

    onChangeProvince(name);
    setSelectedProvinceCode(code);
    onChangeWard('');
    setWards(code ? (postMergerWards[code] || []) : []);
  };

  return (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label className="form-label" style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: 'var(--text3)' }}>{label}</label>
        <button
          type="button"
          className="btn btn-link btn-sm"
          style={{ padding: 0, fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => onChangeMode(mode === 'select' ? 'manual' : 'select')}
        >
          {mode === 'select' ? '✍️ Nhập tay địa chỉ mới' : '🗺️ Chọn từ danh sách mới'}
        </button>
      </div>

      {mode === 'select' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="input-row" style={{ marginBottom: 0, gap: '10px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px', color: 'var(--text3)' }}>Tỉnh / Thành phố mới</label>
              <select
                className="form-control"
                value={province}
                onChange={handleProvinceChange}
              >
                <option value="">-- Chọn Tỉnh --</option>
                {postMergerProvinces.map(p => {
                  const displayProvince = `${p.code} - ${p.name}`;
                  return (
                    <option key={p.code} value={displayProvince} data-code={p.code}>{displayProvince}</option>
                  );
                })}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px', color: 'var(--text3)' }}>Phường / Xã / Đặc khu mới</label>
              <select
                className="form-control"
                value={ward}
                onChange={(e) => onChangeWard(e.target.value)}
                disabled={!province}
              >
                <option value="">-- Chọn Phường/Xã/Đặc khu --</option>
                {wards.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px', color: 'var(--text3)' }}>Địa chỉ chi tiết mới</label>
            <input
              className="form-control"
              value={detail}
              onChange={(e) => onChangeDetail(e.target.value)}
              placeholder="Nhập số nhà, tên ngõ, tên đường mới..."
            />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            name="thuongtrumoi"
            className="form-control"
            value={manualValue}
            onChange={(e) => onChangeManual(e.target.value)}
            placeholder="Nhập địa chỉ mới đầy đủ sau sáp nhập"
          />
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px', color: 'var(--text3)' }}>Địa chỉ chi tiết mới</label>
            <input
              className="form-control"
              value={detail}
              onChange={(e) => onChangeDetail(e.target.value)}
              placeholder="Nhập số nhà, tên ngõ, tên đường mới..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
