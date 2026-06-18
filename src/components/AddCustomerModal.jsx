import React, { useState, useEffect, useRef } from 'react';
import AddressSelector from './AddressSelector';

export default function AddCustomerModal({ customer = null, options = null, onClose, onSave, addToast = null }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
  };

  const [form, setForm] = useState({
    hoten: '',
    gioitinh: '',
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
  const [qrInput, setQrInput] = useState('');
  const isScanningRef = useRef(false);
  const qrTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (qrTimeoutRef.current) {
        clearTimeout(qrTimeoutRef.current);
      }
    };
  }, []);

  const processQrCode = (value) => {
    if (!value) return;

    // Hỗ trợ tự động phân tích qua nhiều ký tự phân tách khác nhau
    const delimiters = ['|', '\\', ';'];
    let parts = null;
    for (const delim of delimiters) {
      const splitParts = value.split(delim);
      // CCCD có từ 6 đến 7 trường thông tin (6 cho CCCD cũ, 7 cho CCCD gắn chip mới)
      if (splitParts.length >= 6) {
        parts = splitParts;
        break;
      }
    }

    if (parts) {
      isScanningRef.current = true;
      const cccd = parts[0] ? parts[0].trim() : '';
      const name = parts[2] ? parts[2].trim() : '';
      const dobStr = parts[3] ? parts[3].trim() : '';
      const gender = parts[4] ? parts[4].trim() : 'Nam';
      const address = parts[5] ? parts[5].trim() : '';
      const issueDateStr = parts[6] ? parts[6].trim() : '';

      // Định dạng ngày từ DDMMYYYY sang YYYY-MM-DD
      const formatDob = (str) => {
        if (!str) return '';
        const cleaned = str.replace(/\D/g, '');
        if (cleaned.length === 8) {
          const day = cleaned.slice(0, 2);
          const month = cleaned.slice(2, 4);
          const year = cleaned.slice(4, 8);
          return `${year}-${month}-${day}`;
        }
        return '';
      };

      const dob = formatDob(dobStr);
      const ngaycap = formatDob(issueDateStr);

      setForm(prev => ({
        ...prev,
        hoten: name || prev.hoten,
        gioitinh: gender === 'Nữ' ? 'Nữ' : 'Nam',
        ngaythangnamsinh: dob || prev.ngaythangnamsinh,
        quoctich: 'Việt Nam',
        cccd: cccd || prev.cccd,
        thuongtru: address || prev.thuongtru,
        ngaycap: ngaycap || prev.ngaycap,
        noicap: 'Cục Cảnh sát QLHC về TTXH' // Tất cả CCCD gắn chip mới đều do Cục Cảnh sát QLHC về TTXH cấp
      }));

      setAddressMode('manual');
      setQrInput('');

      if (addToast) {
        addToast('Đã tự động điền thông tin Căn cước công dân!', 'success');
      }

      setTimeout(() => {
        isScanningRef.current = false;
      }, 300);
    }
  };

  const handleQrScan = (e) => {
    const value = e.target.value;
    setQrInput(value);

    // Debounce fallback: tự động phân tích nếu ngừng gõ 150ms
    if (qrTimeoutRef.current) {
      clearTimeout(qrTimeoutRef.current);
    }
    qrTimeoutRef.current = setTimeout(() => {
      processQrCode(value);
    }, 150);
  };

  const handleQrKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (qrTimeoutRef.current) {
        clearTimeout(qrTimeoutRef.current);
      }
      processQrCode(e.target.value);
    }
  };

  // Khởi tạo/đồng bộ form state khi customer thay đổi (dành cho chế độ edit)
  useEffect(() => {
    const defaultVisa = options?.visaTypes?.[0] || 'DL (Du lịch)';
    if (customer) {
      setForm({
        hoten: customer.hoten || '',
        gioitinh: customer.gioitinh || '',
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
        gioitinh: '',
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
    if (isScanningRef.current) return;
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

    let dob = null;
    let dobYear = null;
    const currentYear = new Date().getFullYear();

    if (form.ngaythangnamsinh) {
      dob = new Date(form.ngaythangnamsinh);
      dobYear = dob.getFullYear();
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
    }

    const payload = {
      hoten: form.hoten.trim(),
      gioitinh: form.gioitinh || null,
      ngaythangnamsinh: form.ngaythangnamsinh || null,
      quoctich: form.quoctich || 'Việt Nam',
    };

    if (form.quoctich === 'Việt Nam') {
      if (dobYear && dobYear > currentYear - 14) {
        showMsg(`Công dân Việt Nam phải từ 14 tuổi trở lên (sinh năm ${currentYear - 14} trở về trước)`);
        return;
      }

      // Address is optional now
      if (addressMode === 'select') {
        const hasAddressSelection = addrProvince || addrDistrict || addrWard;
        if (hasAddressSelection) {
          if (!addrProvince) { showMsg('Vui lòng chọn Tỉnh/Thành phố'); return; }
          if (!addrDistrict) { showMsg('Vui lòng chọn Quận/Huyện'); return; }
          if (!addrWard) { showMsg('Vui lòng chọn Xã/Phường'); return; }
        }
      }

      if (form.cccd && form.cccd.trim()) {
        const cccdRegex = /^0\d{11}$/;
        if (!cccdRegex.test(form.cccd)) {
          showMsg('Số CCCD bắt buộc phải gồm đúng 12 chữ số và bắt đầu bằng số 0');
          return;
        }
      }

      if (form.ngaycap) {
        const issueDate = new Date(form.ngaycap);
        const issueYear = issueDate.getFullYear();
        if (isNaN(issueDate.getTime())) { showMsg('Ngày cấp CCCD không hợp lệ'); return; }
        if (issueYear < 1900) { showMsg('Năm cấp CCCD phải từ năm 1900 trở đi'); return; }
        if (dob) {
          const dobPlus14 = new Date(dob);
          dobPlus14.setFullYear(dobPlus14.getFullYear() + 14);
          if (issueDate < dobPlus14) {
            showMsg('Ngày cấp CCCD phải sau ngày sinh ít nhất 14 năm');
            return;
          }
        }
        if (issueYear > currentYear) { showMsg('Năm cấp CCCD không được lớn hơn năm hiện tại'); return; }
      }

      payload.cccd = form.cccd || null;
      payload.ngaycap = form.ngaycap || null;
      payload.noicap = form.noicap || '';
      payload.thuongtru = form.thuongtru || '';
    } else {
      if (form.passport && form.passport.trim()) {
        const passportRegex = /^[A-Z0-9]{1,9}$/;
        if (!passportRegex.test(form.passport)) {
          showMsg('Số Hộ chiếu phải từ 1 đến 9 ký tự chữ hoặc số');
          return;
        }
      }

      if (form.entryDate) {
        const entry = new Date(form.entryDate);
        const entryYear = entry.getFullYear();
        if (isNaN(entry.getTime())) { showMsg('Ngày nhập cảnh không hợp lệ'); return; }
        if (entryYear < 1900) { showMsg('Năm nhập cảnh phải từ năm 1900 trở đi'); return; }
        if (dob && entry <= dob) { showMsg('Ngày nhập cảnh phải sau ngày sinh'); return; }
        if (entry > new Date()) { showMsg('Ngày nhập cảnh không thể ở tương lai'); return; }
      }

      if (form.visaExpiredDate) {
        const expiry = new Date(form.visaExpiredDate);
        const expiryYear = expiry.getFullYear();
        if (isNaN(expiry.getTime())) { showMsg('Ngày hết hạn Visa không hợp lệ'); return; }
        if (expiryYear < 1900) { showMsg('Năm hết hạn Visa phải từ năm 1900 trở đi'); return; }
        if (form.entryDate) {
          const entry = new Date(form.entryDate);
          if (!isNaN(entry.getTime()) && expiry <= entry) {
            showMsg('Ngày hết hạn Visa phải sau ngày nhập cảnh');
            return;
          }
        }
      }

      payload.passport = form.passport || null;
      payload.visaType = form.visaType || '';
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
          {/* QR Code Scanner Input */}
          <div className="form-group" style={{
            marginBottom: '16px',
            background: 'rgba(22,163,74,0.06)',
            border: '1px dashed #16a34a',
            borderRadius: '8px',
            padding: '12px 14px'
          }}>
            <label className="form-label" style={{ color: '#16a34a', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              Quét mã QR từ Căn cước công dân (CCCD)
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Nhấp chuột vào đây rồi quét mã QR trên CCCD..."
              value={qrInput}
              onChange={handleQrScan}
              onKeyDown={handleQrKeyDown}
              style={{ background: 'var(--bg)', borderColor: 'rgba(22,163,74,0.4)', color: 'var(--text)' }}
            />
          </div>

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
              <label className="form-label">Giới tính</label>
              <select name="gioitinh" className="form-control" value={form.gioitinh} onChange={handleChange}>
                <option value="">-- Chọn giới tính --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>

          <div className="input-row">
            <div className="form-group">
              <label className="form-label">Ngày sinh</label>
              <input
                type="date"
                name="ngaythangnamsinh"
                className="form-control"
                value={form.ngaythangnamsinh}
                onChange={handleChange}
                min="1900-01-01"
                max={form.quoctich === 'Việt Nam' ? `${new Date().getFullYear() - 14}-12-31` : new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Quốc tịch</label>
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
                <label className="form-label">Số CCCD</label>
                <input
                  name="cccd"
                  className="form-control"
                  value={form.cccd}
                  onChange={handleChange}
                  maxLength={12}
                  placeholder="Nhập đúng 12 chữ số căn cước bắt đầu bằng số 0"
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
                  <label className="form-label">Số Hộ chiếu (Passport)</label>
                  <input
                    name="passport"
                    className="form-control"
                    value={form.passport}
                    onChange={handleChange}
                    maxLength={9}
                    placeholder="Nhập số hộ chiếu gồm tối đa 9 ký tự chữ và số"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Loại Visa</label>
                  <select name="visaType" className="form-control" value={form.visaType} onChange={handleChange}>
                    <option value="">-- Chọn loại Visa --</option>
                    {options?.visaTypes?.map(vt => (
                      <option key={vt} value={vt}>{vt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="input-row">
                <div className="form-group">
                  <label className="form-label">Ngày hết hạn Visa</label>
                  <input
                    type="date"
                    name="visaExpiredDate"
                    className="form-control"
                    value={form.visaExpiredDate}
                    onChange={handleChange}
                    min={form.entryDate || "1900-01-01"}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày nhập cảnh</label>
                  <input
                    type="date"
                    name="entryDate"
                    className="form-control"
                    value={form.entryDate}
                    onChange={handleChange}
                    min={form.ngaythangnamsinh || "1900-01-01"}
                    max={new Date().toISOString().split('T')[0]}
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
