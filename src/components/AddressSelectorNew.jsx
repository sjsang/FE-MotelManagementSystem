import React, { useState, useEffect, useRef } from 'react';

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

  // States cho ô tìm kiếm Tỉnh thành mới
  const [searchProvinceQuery, setSearchProvinceQuery] = useState('');
  const [provinceDropdownOpen, setProvinceDropdownOpen] = useState(false);
  const provinceDropdownRef = useRef(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (provinceDropdownRef.current && !provinceDropdownRef.current.contains(e.target)) {
        setProvinceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đồng bộ searchProvinceQuery khi province prop thay đổi
  useEffect(() => {
    setSearchProvinceQuery(province || '');
  }, [province]);

  // Sync province code if province name changes (e.g. on reset or initialization)
  useEffect(() => {
    if (province) {
      const match = postMergerProvinces.find(p => p.name === province || `${p.code} - ${p.name}` === province);
      if (match) {
        setSelectedProvinceCode(match.code);
        setWards(postMergerWards[match.code] || []);
      } else if (postMergerProvinces.length > 0) {
        // Nếu không khớp với danh sách tỉnh thành sau sáp nhập, tự động chuyển sang nhập tay
        onChangeMode('manual');
      }
    } else {
      setSelectedProvinceCode('');
      setWards([]);
    }
  }, [province, postMergerProvinces, onChangeMode]);

  // Kiểm tra khớp Xã/Phường mới (edit mode)
  useEffect(() => {
    if (!ward || wards.length === 0) return;
    const match = wards.find(w => w === ward);
    if (!match) {
      // Nếu có tên Xã/Phường mới nhưng không khớp với danh sách sau sáp nhập, chuyển về manual
      onChangeMode('manual');
    }
  }, [ward, wards, onChangeMode]);

  const selectProvinceDirectly = (name, code) => {
    const displayProvince = `${code} - ${name}`;
    onChangeProvince(displayProvince);
    setSelectedProvinceCode(code);
    onChangeWard('');
    setWards(postMergerWards[code] || []);
  };

  const filteredProvinces = postMergerProvinces.filter(p =>
    p.name.toLowerCase().includes(searchProvinceQuery.toLowerCase()) ||
    `${p.code} - ${p.name}`.toLowerCase().includes(searchProvinceQuery.toLowerCase())
  );

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
            <div className="form-group" style={{ flex: 1, marginBottom: 0, position: 'relative' }} ref={provinceDropdownRef}>
              <label className="form-label" style={{ fontSize: '11px', color: 'var(--text3)' }}>Tỉnh / Thành phố mới</label>
              
              <input
                type="text"
                className="form-control"
                placeholder="Gõ để tìm kiếm Tỉnh..."
                value={searchProvinceQuery}
                onChange={(e) => {
                  setSearchProvinceQuery(e.target.value);
                  setProvinceDropdownOpen(true);
                  if (e.target.value === '') {
                    onChangeProvince('');
                    setSelectedProvinceCode('');
                    onChangeWard('');
                    setWards([]);
                  }
                }}
                onFocus={() => setProvinceDropdownOpen(true)}
              />

              {provinceDropdownOpen && filteredProvinces.length > 0 && (
                <ul style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  background: 'var(--modal-bg, #fff)',
                  border: '1px solid var(--border, #e2e8f0)',
                  borderRadius: '6px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  padding: '4px 0',
                  margin: '4px 0 0 0',
                  listStyle: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}>
                  {filteredProvinces.map(p => {
                    const displayProvince = `${p.code} - ${p.name}`;
                    return (
                      <li
                        key={p.code}
                        onClick={() => {
                          selectProvinceDirectly(p.name, p.code);
                          setSearchProvinceQuery(displayProvince);
                          setProvinceDropdownOpen(false);
                        }}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          background: displayProvince === province ? 'var(--primary-light, #ede9fe)' : 'transparent',
                          color: displayProvince === province ? 'var(--primary, #7c3aed)' : 'inherit',
                        }}
                        onMouseEnter={(e) => {
                          if (displayProvince !== province) e.currentTarget.style.background = 'var(--hover-bg, #f3f4f6)';
                        }}
                        onMouseLeave={(e) => {
                          if (displayProvince !== province) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {displayProvince}
                      </li>
                    );
                  })}
                </ul>
              )}
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
