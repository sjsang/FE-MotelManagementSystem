import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function AddressSelector({
  mode,
  onChangeMode,
  province,
  onChangeProvince,
  district,
  onChangeDistrict,
  ward,
  onChangeWard,
  detail,
  onChangeDetail,
  manualValue,
  onChangeManual,
  addToast,
  label = 'Địa chỉ thường trú'
}) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [provinceCode, setProvinceCode] = useState('');
  const [districtCode, setDistrictCode] = useState('');

  // States cho ô tìm kiếm Tỉnh thành
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

  // Tải danh sách tỉnh thành khi khởi chạy ở chế độ chọn
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const res = await axios.get('https://provinces.open-api.vn/api/p/');
        const list = res.data || [];
        setProvinces(list);
      } catch (err) {
        console.error('Không thể tải danh sách tỉnh thành:', err);
        if (addToast) {
          addToast('Không thể tải danh sách Tỉnh/Thành phố từ API. Đã chuyển sang chế độ nhập tay.', 'warning');
        }
        onChangeMode('manual');
      } finally {
        setLoadingProvinces(false);
      }
    };

    if (mode === 'select' && provinces.length === 0) {
      fetchProvinces();
    }
  }, [mode, provinces.length, onChangeMode, addToast]);

  // Tự động tìm code và tải Quận/Huyện khi province đổi từ props (edit mode)
  useEffect(() => {
    if (!province || provinces.length === 0) return;
    const match = provinces.find(p => p.name === province);
    if (match) {
      if (match.code !== provinceCode) {
        setProvinceCode(match.code);
        axios.get(`https://provinces.open-api.vn/api/p/${match.code}?depth=2`)
          .then(res => {
            setDistricts(res.data.districts || []);
          })
          .catch(() => {});
      }
    } else {
      // Nếu không khớp với tỉnh thành nào, tự động chuyển về chế độ manual
      onChangeMode('manual');
    }
  }, [province, provinces, provinceCode, onChangeMode]);

  // Tự động tìm code và tải Xã/Phường khi district đổi từ props (edit mode)
  useEffect(() => {
    if (!district || districts.length === 0) return;
    const match = districts.find(d => d.name === district);
    if (match) {
      if (match.code !== districtCode) {
        setDistrictCode(match.code);
        axios.get(`https://provinces.open-api.vn/api/d/${match.code}?depth=2`)
          .then(res => {
            setWards(res.data.wards || []);
          })
          .catch(() => {});
      }
    } else {
      // Nếu có tên Quận/Huyện nhưng không khớp với danh sách API, chuyển về manual
      onChangeMode('manual');
    }
  }, [district, districts, districtCode, onChangeMode]);

  // Kiểm tra khớp Xã/Phường (edit mode)
  useEffect(() => {
    if (!ward || wards.length === 0) return;
    const match = wards.find(w => w.name === ward);
    if (!match) {
      // Nếu có tên Xã/Phường nhưng không khớp với danh sách API, chuyển về manual
      onChangeMode('manual');
    }
  }, [ward, wards, onChangeMode]);

  const selectProvinceDirectly = async (name, code) => {
    onChangeProvince(name);
    setProvinceCode(code);
    onChangeDistrict('');
    setDistrictCode('');
    onChangeWard('');
    setDistricts([]);
    setWards([]);

    if (code) {
      try {
        const res = await axios.get(`https://provinces.open-api.vn/api/p/${code}?depth=2`);
        setDistricts(res.data.districts || []);
      } catch (err) {
        if (addToast) addToast('Không thể tải danh sách Quận/Huyện từ API', 'warning');
      }
    }
  };

  const handleDistrictChange = async (e) => {
    const name = e.target.value;
    const option = e.target.options[e.target.selectedIndex];
    const code = option.getAttribute('data-code') || '';

    onChangeDistrict(name);
    setDistrictCode(code);
    onChangeWard('');
    setWards([]);

    if (code) {
      try {
        const res = await axios.get(`https://provinces.open-api.vn/api/d/${code}?depth=2`);
        setWards(res.data.wards || []);
      } catch (err) {
        if (addToast) addToast('Không thể tải danh sách Xã/Phường từ API', 'warning');
      }
    }
  };

  const filteredProvinces = provinces.filter(p =>
    p.name.toLowerCase().includes(searchProvinceQuery.toLowerCase())
  );

  return (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label className="form-label" style={{ margin: 0 }}>{label}</label>
        <button
          type="button"
          className="btn btn-link btn-sm"
          style={{ padding: 0, fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => onChangeMode(mode === 'select' ? 'manual' : 'select')}
        >
          {mode === 'select' ? '✍️ Nhập tay địa chỉ' : '🗺️ Chọn từ danh sách'}
        </button>
      </div>

      {mode === 'select' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="input-row" style={{ marginBottom: 0, gap: '10px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0, position: 'relative' }} ref={provinceDropdownRef}>
              <label className="form-label" style={{ fontSize: '11px', color: 'var(--text3)' }}>Tỉnh / Thành phố</label>
              
              <input
                type="text"
                className="form-control"
                placeholder="Gõ để tìm kiếm Tỉnh..."
                value={searchProvinceQuery}
                disabled={loadingProvinces}
                onChange={(e) => {
                  setSearchProvinceQuery(e.target.value);
                  setProvinceDropdownOpen(true);
                  if (e.target.value === '') {
                    onChangeProvince('');
                    setProvinceCode('');
                    onChangeDistrict('');
                    setDistrictCode('');
                    onChangeWard('');
                    setDistricts([]);
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
                  {filteredProvinces.map(p => (
                    <li
                      key={p.code}
                      onClick={() => {
                        selectProvinceDirectly(p.name, p.code);
                        setSearchProvinceQuery(p.name);
                        setProvinceDropdownOpen(false);
                      }}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        background: p.name === province ? 'var(--primary-light, #ede9fe)' : 'transparent',
                        color: p.name === province ? 'var(--primary, #7c3aed)' : 'inherit',
                      }}
                      onMouseEnter={(e) => {
                        if (p.name !== province) e.currentTarget.style.background = 'var(--hover-bg, #f3f4f6)';
                      }}
                      onMouseLeave={(e) => {
                        if (p.name !== province) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {p.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px', color: 'var(--text3)' }}>Quận / Huyện</label>
              <select
                className="form-control"
                value={district}
                onChange={handleDistrictChange}
                disabled={!province || loadingProvinces}
              >
                <option value="">-- Chọn Quận/Huyện --</option>
                {districts.map(d => (
                  <option key={d.code} value={d.name} data-code={d.code}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-row" style={{ marginBottom: 0, gap: '10px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px', color: 'var(--text3)' }}>Xã / Phường</label>
              <select
                className="form-control"
                value={ward}
                onChange={(e) => onChangeWard(e.target.value)}
                disabled={!district}
              >
                <option value="">-- Chọn Xã/Phường --</option>
                {wards.map(w => (
                  <option key={w.code} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px', color: 'var(--text3)' }}>Địa chỉ chi tiết</label>
              <input
                className="form-control"
                value={detail}
                onChange={(e) => onChangeDetail(e.target.value)}
                placeholder="Nhập số nhà, tên ngõ, tên đường..."
              />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            name="thuongtru"
            className="form-control"
            value={manualValue}
            onChange={(e) => onChangeManual(e.target.value)}
            placeholder="Nhập địa chỉ đầy đủ (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
          />
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px', color: 'var(--text3)' }}>Địa chỉ chi tiết</label>
            <input
              className="form-control"
              value={detail}
              onChange={(e) => onChangeDetail(e.target.value)}
              placeholder="Nhập số nhà, tên ngõ, tên đường..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
