import React, { useState, useEffect } from 'react';
import AddressSelector from './AddressSelector';

export default function AddCustomerModal({ customer = null, options = null, onClose, onSave, addToast = null }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
  };

  const [form, setForm] = useState({
    hoten: '',
    gioitinh: 'Nam',
    ngaythangnamsinh: '',
    quoctich: 'Việt Nam',
    cccd: '',
    ngaycap: '',
    noicap: '',
    thuongtru: '',
    passport: '',
    visaType: '',
    visaExpiredDate: '',
    entryDate: '',
  });

  const [addressMode, setAddressMode] = useState('select'); // 'select' or 'manual'
  const [addrDetail, setAddrDetail] = useState('');
  const [addrProvince, setAddrProvince] = useState('');
  const [addrDistrict, setAddrDistrict] = useState('');
  const [addrWard, setAddrWard] = useState('');
  const [loading, setLoading] = useState(false);

  // Khởi tạo/đồng bộ form state khi customer thay đổi (dành cho chế độ edit)
  useEffect(() => {
    const defaultVisa = options?.visaTypes?.[0] || 'DL (Du lịch)';
    if (customer) {
      setForm({
        hoten: customer.hoten || '',
        gioitinh: customer.gioitinh || 'Nam',
        ngaythangnamsinh: formatDate(customer.ngaythangnamsinh),
        quoctich: customer.quoctich || 'Việt Nam',
        cccd: customer.cccd || '',
        ngaycap: formatDate(customer.ngaycap),
        noicap: customer.noicap || '',
        thuongtru: customer.thuongtru || '',
        passport: customer.passport || '',
        visaType: customer.visaType || defaultVisa,
        visaExpiredDate: formatDate(customer.visaExpiredDate),
        entryDate: formatDate(customer.entryDate),
      });
      setAddressMode('manual');
    } else {
      setForm({
        hoten: '',
        gioitinh: 'Nam',
        ngaythangnamsinh: '',
        quoctich: 'Việt Nam',
        cccd: '',
        ngaycap: '',
        noicap: '',
        thuongtru: '',
        passport: '',
        visaType: defaultVisa,
        visaExpiredDate: '',
        entryDate: '',
      });
      setAddressMode('select');
      setAddrDetail('');
      setAddrProvince('');
      setAddrDistrict('');
      setAddrWard('');
    }
  }, [customer, options]);

  // Cập nhật trường thuongtru tự động từ AddressSelector
  useEffect(() => {
    if (addressMode === 'select' && !customer) {
      const parts = [];
      if (addrDetail.trim()) parts.push(addrDetail.trim());
      if (addrWard) parts.push(addrWard);
      if (addrDistrict) parts.push(addrDistrict);
      if (addrProvince) parts.push(addrProvince);
      setForm(prev => ({ ...prev, thuongtru: parts.join(', ') }));
    }
  }, [addressMode, addrDetail, addrWard, addrDistrict, addrProvince, customer]);

  const showMsg = (msg, type = 'error') => {
    if (addToast) addToast(msg, type);
    else alert(msg);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev };
      if (name === 'cccd') {
        const numericValue = value.replace(/\D/g, '');
        updated.cccd = numericValue.slice(0, 12);
      } else if (name === 'passport') {
        const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        updated.passport = alphanumericValue.slice(0, 9);
      } else {
        updated[name] = value;
      }

      if (name === 'quoctich') {
        if (value === 'Việt Nam') {
          updated.thuongtru = '';
          setAddressMode('select');
        } else {
          updated.visaType = updated.visaType || options?.visaTypes?.[0] || 'DL (Du lịch)';
        }
      }
      return updated;
    });
  };

  const getMinNgayCap = () => {
    if (!form.ngaythangnamsinh) return "1900-01-01";
    const dobDate = new Date(form.ngaythangnamsinh);
    dobDate.setFullYear(dobDate.getFullYear() + 14);
    return dobDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hoten.trim()) {
      showMsg('Vui lòng nhập họ tên khách hàng');
      return;
    }

    const dob = new Date(form.ngaythangnamsinh);
    const dobYear = dob.getFullYear();
    const currentYear = new Date().getFullYear();

    if (isNaN(dob.getTime())) {
      showMsg('Ngày sinh không hợp lệ');
      return;
    }
    if (dobYear < 1900) {
      showMsg('Năm sinh phải từ năm 1900 trở đi');
      return;
    }
    if (dob > new Date()) {
      showMsg('Ngày sinh không thể ở tương lai');
      return;
    }

    const payload = {
      hoten: form.hoten,
      gioitinh: form.gioitinh,
      ngaythangnamsinh: form.ngaythangnamsinh,
      quoctich: form.quoctich,
    };

    if (form.quoctich === 'Việt Nam') {
      if (dobYear > currentYear - 14) {
        showMsg(`Công dân Việt Nam phải từ 14 tuổi trở lên (sinh năm ${currentYear - 14} trở về trước)`);
        return;
      }
      
      if (addressMode === 'select') {
        if (!addrProvince) { showMsg('Vui lòng chọn Tỉnh/Thành phố'); return; }
        if (!addrDistrict) { showMsg('Vui lòng chọn Quận/Huyện'); return; }
        if (!addrWard) { showMsg('Vui lòng chọn Xã/Phường'); return; }
      } else {
        if (!form.thuongtru || !form.thuongtru.trim()) { showMsg('Vui lòng nhập địa chỉ thường trú'); return; }
      }

      const cccdRegex = /^0\d{11}$/;
      if (!cccdRegex.test(form.cccd)) {
        showMsg('Số CCCD bắt buộc phải gồm đúng 12 chữ số và bắt đầu bằng số 0');
        return;
      }

      if (form.ngaycap) {
        const issueDate = new Date(form.ngaycap);
        const issueYear = issueDate.getFullYear();
        if (isNaN(issueDate.getTime())) { showMsg('Ngày cấp CCCD không hợp lệ'); return; }
        if (issueYear < 1900) { showMsg('Năm cấp CCCD phải từ năm 1900 trở đi'); return; }
        const dobPlus14 = new Date(dob);
        dobPlus14.setFullYear(dobPlus14.getFullYear() + 14);
        if (issueDate < dobPlus14) {
          showMsg('Ngày cấp CCCD phải sau ngày sinh ít nhất 14 năm');
          return;
        }
        if (issueYear > currentYear) { showMsg('Năm cấp CCCD không được lớn hơn năm hiện tại'); return; }
      }

      payload.cccd = form.cccd;
      payload.ngaycap = form.ngaycap || null;
      payload.noicap = form.noicap || '';
      payload.thuongtru = form.thuongtru;
    } else {
      const passportRegex = /^[A-Z0-9]{1,9}$/;
      if (!passportRegex.test(form.passport)) {
        showMsg('Số Hộ chiếu phải từ 1 đến 9 ký tự chữ hoặc số');
        return;
      }

      const entry = new Date(form.entryDate);
      const entryYear = entry.getFullYear();
      if (isNaN(entry.getTime())) { showMsg('Ngày nhập cảnh không hợp lệ'); return; }
      if (entryYear < 1900) { showMsg('Năm nhập cảnh phải từ năm 1900 trở đi'); return; }
      if (entry <= dob) { showMsg('Ngày nhập cảnh phải sau ngày sinh'); return; }
      if (entry > new Date()) { showMsg('Ngày nhập cảnh không thể ở tương lai'); return; }

      const expiry = new Date(form.visaExpiredDate);
      const expiryYear = expiry.getFullYear();
      if (isNaN(expiry.getTime())) { showMsg('Ngày hết hạn Visa không hợp lệ'); return; }
      if (expiryYear < 1900) { showMsg('Năm hết hạn Visa phải từ năm 1900 trở đi'); return; }
      if (expiry <= entry) { showMsg('Ngày hết hạn Visa phải sau ngày nhập cảnh'); return; }

      payload.passport = form.passport;
      payload.visaType = form.visaType;
      payload.visaExpiredDate = form.visaExpiredDate || null;
      payload.entryDate = form.entryDate || null;
    }

    setLoading(true);
    const success = await onSave(payload);
    setLoading(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <form onSubmit={handleSubmit} className="modal" style={{ maxWidth: '520px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{customer ? 'Chỉnh sửa thông tin khách' : 'Thêm mới khách lưu trú'}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
              Nhập thông tin khách để lưu vào cơ sở dữ liệu
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
          <div className="input-row">
            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <input
                name="hoten"
                className="form-control"
                value={form.hoten}
                onChange={handleChange}
                placeholder="Nhập đầy đủ họ và tên khách hàng"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Giới tính *</label>
              <select name="gioitinh" className="form-control" value={form.gioitinh} onChange={handleChange}>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>

          <div className="input-row">
            <div className="form-group">
              <label className="form-label">Ngày sinh *</label>
              <input
                type="date"
                name="ngaythangnamsinh"
                className="form-control"
                value={form.ngaythangnamsinh}
                onChange={handleChange}
                min="1900-01-01"
                max={form.quoctich === 'Việt Nam' ? `${new Date().getFullYear() - 14}-12-31` : new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Quốc tịch *</label>
              <select name="quoctich" className="form-control" value={form.quoctich} onChange={handleChange}>
                {options?.nationalities?.map(nat => (
                  <option key={nat} value={nat}>{nat}</option>
                ))}
              </select>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '14px 0' }} />

          {form.quoctich === 'Việt Nam' ? (
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent)', marginBottom: '10px' }}>
                THÔNG TIN ĐỊNH DANH (VIỆT NAM)
              </div>
              <div className="form-group">
                <label className="form-label">Số CCCD *</label>
                <input
                  name="cccd"
                  className="form-control"
                  value={form.cccd}
                  onChange={handleChange}
                  maxLength={12}
                  placeholder="Nhập đúng 12 chữ số căn cước bắt đầu bằng số 0"
                  required
                />
              </div>
              <div className="input-row">
                <div className="form-group">
                  <label className="form-label">Ngày cấp</label>
                  <input
                    type="date"
                    name="ngaycap"
                    className="form-control"
                    value={form.ngaycap}
                    onChange={handleChange}
                    min={getMinNgayCap()}
                    max={`${new Date().getFullYear()}-12-31`}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nơi cấp</label>
                  <input
                    name="noicap"
                    className="form-control"
                    value={form.noicap}
                    onChange={handleChange}
                    placeholder="Nhập cơ quan hoặc nơi cấp giấy tờ tùy thân"
                  />
                </div>
              </div>
              <AddressSelector
                mode={addressMode}
                onChangeMode={setAddressMode}
                province={addrProvince}
                onChangeProvince={setAddrProvince}
                district={addrDistrict}
                onChangeDistrict={setAddrDistrict}
                ward={addrWard}
                onChangeWard={setAddrWard}
                detail={addrDetail}
                onChangeDetail={setAddrDetail}
                manualValue={form.thuongtru}
                onChangeManual={(val) => setForm(prev => ({ ...prev, thuongtru: val }))}
              />
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent)', marginBottom: '10px' }}>
                THÔNG TIN ĐỊNH DANH (NGƯỜI NƯỚC NGOÀI)
              </div>
              <div className="input-row">
                <div className="form-group">
                  <label className="form-label">Số Hộ chiếu (Passport) *</label>
                  <input
                    name="passport"
                    className="form-control"
                    value={form.passport}
                    onChange={handleChange}
                    maxLength={9}
                    placeholder="Nhập số hộ chiếu gồm tối đa 9 ký tự chữ và số"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Loại Visa *</label>
                  <select name="visaType" className="form-control" value={form.visaType} onChange={handleChange} required>
                    {options?.visaTypes?.map(vt => (
                      <option key={vt} value={vt}>{vt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="input-row">
                <div className="form-group">
                  <label className="form-label">Ngày hết hạn Visa *</label>
                  <input
                    type="date"
                    name="visaExpiredDate"
                    className="form-control"
                    value={form.visaExpiredDate}
                    onChange={handleChange}
                    min={form.entryDate || "1900-01-01"}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày nhập cảnh *</label>
                  <input
                    type="date"
                    name="entryDate"
                    className="form-control"
                    value={form.entryDate}
                    onChange={handleChange}
                    min={form.ngaythangnamsinh || "1900-01-01"}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? '...' : '✓ Lưu thông tin'}
          </button>
        </div>
      </form>
    </div>
  );
}
