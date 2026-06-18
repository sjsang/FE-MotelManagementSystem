import React, { useState, useEffect } from 'react';
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
  addToast
}) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [provinceCode, setProvinceCode] = useState('');
  const [districtCode, setDistrictCode] = useState('');

  // Tải danh sách tỉnh thành khi khởi chạy ở chế độ chọn
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const res = await axios.get('https://provinces.open-api.vn/api/p/');
        setProvinces(res.data || []);
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

  const handleProvinceChange = async (e) => {
    const name = e.target.value;
    const option = e.target.options[e.target.selectedIndex];
    const code = option.getAttribute('data-code') || '';

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

  return (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label className="form-label" style={{ margin: 0 }}>Địa chỉ thường trú</label>
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
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px', color: 'var(--text3)' }}>Tỉnh / Thành phố</label>
              <select
                className="form-control"
                value={province}
                onChange={handleProvinceChange}
                disabled={loadingProvinces}
              >
                <option value="">-- Chọn Tỉnh --</option>
                {provinces.map(p => (
                  <option key={p.code} value={p.name} data-code={p.code}>{p.name}</option>
                ))}
              </select>
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
              <label className="form-label" style={{ fontSize: '11px', color: 'var(--text3)' }}>Số nhà, đường</label>
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
        <input
          name="thuongtru"
          className="form-control"
          value={manualValue}
          onChange={(e) => onChangeManual(e.target.value)}
          placeholder="Nhập địa chỉ đầy đủ (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
        />
      )}
    </div>
  );
}
