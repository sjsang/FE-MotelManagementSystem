import React, { useState, useEffect } from 'react';
import {
  getCustomers,
  getCustomerOptions,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../utils/api';
import { useToast } from '../hooks/useToast';
import AddressSelector from '../components/AddressSelector';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [options, setOptions] = useState({ nationalities: [], provinces: [], visaTypes: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null); // null if adding new
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

  const { addToast, ToastContainer } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [custRes, optRes] = await Promise.all([
        getCustomers(),
        getCustomerOptions()
      ]);
      setCustomers(custRes.data);
      setOptions(optRes.data);
    } catch (e) {
      addToast('Không thể tải danh sách khách hàng hoặc cấu hình', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (addressMode === 'select') {
      const parts = [];
      if (addrDetail.trim()) parts.push(addrDetail.trim());
      if (addrWard) parts.push(addrWard);
      if (addrDistrict) parts.push(addrDistrict);
      if (addrProvince) parts.push(addrProvince);
      setForm(prev => ({ ...prev, thuongtru: parts.join(', ') }));
    }
  }, [addressMode, addrDetail, addrWard, addrDistrict, addrProvince]);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
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
      visaType: options.visaTypes[0] || '',
      visaExpiredDate: '',
      entryDate: '',
    });
    setAddressMode('select');
    setAddrDetail('');
    setAddrProvince('');
    setAddrDistrict('');
    setAddrWard('');
    setModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer);
    // Format Dates to YYYY-MM-DD for HTML inputs
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      return new Date(dateStr).toISOString().split('T')[0];
    };

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
      visaType: customer.visaType || options.visaTypes[0] || '',
      visaExpiredDate: formatDate(customer.visaExpiredDate),
      entryDate: formatDate(customer.entryDate),
    });
    setAddressMode('manual');
    setAddrDetail('');
    setAddrProvince('');
    setAddrDistrict('');
    setAddrWard('');
    setModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${name}" khỏi danh sách?`)) {
      try {
        await deleteCustomer(id);
        addToast('Xóa khách hàng thành công', 'success');
        loadData();
      } catch (err) {
        addToast(err.response?.data?.message || 'Lỗi khi xóa khách hàng', 'error');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev };
      
      if (name === 'cccd') {
        // Chỉ cho phép nhập số và tối đa 12 chữ số
        const numericValue = value.replace(/\D/g, '');
        updated.cccd = numericValue.slice(0, 12);
      } else if (name === 'passport') {
        // Chỉ cho phép chữ và số, tối đa 9 ký tự, viết hoa toàn bộ
        const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        updated.passport = alphanumericValue.slice(0, 9);
      } else {
        updated[name] = value;
      }

      // Nếu thay đổi quốc tịch và chuyển sang VN/Nước ngoài, reset các dropdown phụ thuộc tương ứng
      if (name === 'quoctich') {
        if (value === 'Việt Nam') {
          updated.thuongtru = '';
          setAddressMode('select');
        } else {
          updated.visaType = updated.visaType || options.visaTypes[0] || '';
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hoten.trim()) {
      addToast('Vui lòng nhập họ tên khách hàng', 'error');
      return;
    }

    // Ràng buộc Ngày sinh
    const dob = new Date(form.ngaythangnamsinh);
    const dobYear = dob.getFullYear();
    const currentYear = new Date().getFullYear();

    if (isNaN(dob.getTime())) {
      addToast('Ngày sinh không hợp lệ', 'error');
      return;
    }
    if (dobYear < 1900) {
      addToast('Năm sinh không hợp lệ (phải từ năm 1900 trở đi)', 'error');
      return;
    }
    if (dob > new Date()) {
      addToast('Ngày sinh không thể ở tương lai', 'error');
      return;
    }

    if (form.quoctich === 'Việt Nam') {
      if (dobYear > currentYear - 14) {
        addToast(`Độ tuổi của công dân Việt Nam phải từ 14 tuổi trở lên (sinh năm ${currentYear - 14} trở về trước)`, 'error');
        return;
      }
    }

    try {
      const payload = {
        hoten: form.hoten,
        gioitinh: form.gioitinh,
        ngaythangnamsinh: form.ngaythangnamsinh,
        quoctich: form.quoctich,
      };

      if (form.quoctich === 'Việt Nam') {
        // Kiểm tra địa chỉ thường trú
        if (addressMode === 'select') {
          if (!addrProvince) {
            addToast('Vui lòng chọn Tỉnh/Thành phố thường trú', 'error');
            return;
          }
          if (!addrDistrict) {
            addToast('Vui lòng chọn Quận/Huyện thường trú', 'error');
            return;
          }
          if (!addrWard) {
            addToast('Vui lòng chọn Xã/Phường thường trú', 'error');
            return;
          }
        } else {
          if (!form.thuongtru || !form.thuongtru.trim()) {
            addToast('Vui lòng nhập địa chỉ thường trú', 'error');
            return;
          }
        }

        // Ràng buộc CCCD (12 số bắt đầu bằng số 0)
        const cccdRegex = /^0\d{11}$/;
        if (!cccdRegex.test(form.cccd)) {
          addToast('Số CCCD bắt buộc phải gồm đúng 12 chữ số và bắt đầu bằng số 0', 'error');
          return;
        }

        // Ràng buộc Ngày cấp CCCD (Phải sau ngày sinh ít nhất 14 năm)
        if (form.ngaycap) {
          const issueDate = new Date(form.ngaycap);
          const issueYear = issueDate.getFullYear();
          if (isNaN(issueDate.getTime())) {
            addToast('Ngày cấp CCCD không hợp lệ', 'error');
            return;
          }
          if (issueYear < 1900) {
            addToast('Năm cấp CCCD không hợp lệ (phải từ năm 1900 trở đi)', 'error');
            return;
          }
          
          const dobPlus14 = new Date(dob);
          dobPlus14.setFullYear(dobPlus14.getFullYear() + 14);
          if (issueDate < dobPlus14) {
            addToast('Ngày cấp CCCD phải sau ngày sinh ít nhất 14 năm (đủ tuổi cấp CCCD)', 'error');
            return;
          }
          if (issueYear > currentYear) {
            addToast('Năm cấp CCCD không được lớn hơn năm hiện tại', 'error');
            return;
          }
        }

        payload.cccd = form.cccd;
        payload.ngaycap = form.ngaycap || null;
        payload.noicap = form.noicap || '';
        payload.thuongtru = form.thuongtru;
      } else {
        // Ràng buộc Passport (chữ và số, 1-9 ký tự)
        const passportRegex = /^[A-Z0-9]{1,9}$/;
        if (!passportRegex.test(form.passport)) {
          addToast('Số Hộ chiếu không hợp lệ (phải từ 1 đến 9 ký tự chữ hoặc số)', 'error');
          return;
        }

        // Ràng buộc Ngày nhập cảnh
        const entry = new Date(form.entryDate);
        const entryYear = entry.getFullYear();
        if (isNaN(entry.getTime())) {
          addToast('Ngày nhập cảnh không hợp lệ', 'error');
          return;
        }
        if (entryYear < 1900) {
          addToast('Năm nhập cảnh không hợp lệ (phải từ năm 1900 trở đi)', 'error');
          return;
        }
        if (entry <= dob) {
          addToast('Ngày nhập cảnh phải sau ngày sinh', 'error');
          return;
        }
        if (entry > new Date()) {
          addToast('Ngày nhập cảnh không thể ở tương lai', 'error');
          return;
        }

        // Ràng buộc Ngày hết hạn Visa
        const expiry = new Date(form.visaExpiredDate);
        const expiryYear = expiry.getFullYear();
        if (isNaN(expiry.getTime())) {
          addToast('Ngày hết hạn Visa không hợp lệ', 'error');
          return;
        }
        if (expiryYear < 1900) {
          addToast('Năm hết hạn Visa không hợp lệ (phải từ năm 1900 trở đi)', 'error');
          return;
        }
        if (expiry <= entry) {
          addToast('Ngày hết hạn Visa phải sau ngày nhập cảnh', 'error');
          return;
        }

        payload.passport = form.passport;
        payload.visaType = form.visaType;
        payload.visaExpiredDate = form.visaExpiredDate || null;
        payload.entryDate = form.entryDate || null;
      }

      if (editingCustomer) {
        await updateCustomer(editingCustomer._id, payload);
        addToast('Cập nhật thông tin thành công', 'success');
      } else {
        await createCustomer(payload);
        addToast('Thêm mới khách lưu trú thành công', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin', 'error');
    }
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter(c => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const nameMatch = c.hoten?.toLowerCase().includes(query);
    const cccdMatch = c.cccd?.toLowerCase().includes(query);
    const passportMatch = c.passport?.toLowerCase().includes(query);
    return nameMatch || cccdMatch || passportMatch;
  });

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const getMinNgayCap = () => {
    if (!form.ngaythangnamsinh) return "1900-01-01";
    const dobDate = new Date(form.ngaythangnamsinh);
    dobDate.setFullYear(dobDate.getFullYear() + 14);
    return dobDate.toISOString().split('T')[0];
  };

  return (
    <div>
      <ToastContainer />
      <div className="page-header">
        <div>
          <div className="page-title">Quản lý Khách lưu trú</div>
          <div className="page-subtitle">Xem danh sách, thêm, sửa, và xóa khách hàng trong nước/nước ngoài</div>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          ➕ Thêm khách hàng
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '18px' }}>🔍</span>
          <input
            className="form-control"
            placeholder="Tìm kiếm theo Tên, Số CCCD hoặc Số Hộ chiếu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', padding: '6px' }}
          />
          {searchQuery && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setSearchQuery('')}
              style={{ padding: '4px 8px' }}
            >
              Xóa
            </button>
          )}
        </div>
      </div>

      {/* Main List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text3)' }}>Đang tải dữ liệu...</div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text3)' }}>
            {searchQuery ? 'Không tìm thấy khách hàng nào khớp với bộ lọc' : 'Danh sách khách lưu trú trống'}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Giới tính</th>
                  <th>Ngày sinh</th>
                  <th>Quốc tịch</th>
                  <th>Thông tin giấy tờ định danh</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: '700' }}>{c.hoten}</td>
                    <td>{c.gioitinh}</td>
                    <td>{formatDateDisplay(c.ngaythangnamsinh)}</td>
                    <td>
                      <span className={`badge ${c.quoctich === 'Việt Nam' ? 'badge-available' : 'badge-maintenance'}`}>
                        {c.quoctich}
                      </span>
                    </td>
                    <td>
                      {c.quoctich === 'Việt Nam' ? (
                        <div style={{ fontSize: '13px' }}>
                          <div><strong>CCCD:</strong> {c.cccd || '---'}</div>
                          {c.ngaycap && <div className="text-muted" style={{ fontSize: '12px' }}>Cấp ngày: {formatDateDisplay(c.ngaycap)} {c.noicap && `tại ${c.noicap}`}</div>}
                          {c.thuongtru && <div className="text-muted" style={{ fontSize: '12px' }}>Thường trú: {c.thuongtru}</div>}
                        </div>
                      ) : (
                        <div style={{ fontSize: '13px' }}>
                          <div><strong>Hộ chiếu:</strong> {c.passport || '---'}</div>
                          <div className="text-muted" style={{ fontSize: '12px' }}>Loại Visa: {c.visaType || '---'}</div>
                          {c.visaExpiredDate && <div className="text-muted" style={{ fontSize: '12px' }}>Hạn Visa: {formatDateDisplay(c.visaExpiredDate)}</div>}
                          {c.entryDate && <div className="text-muted" style={{ fontSize: '12px' }}>Nhập cảnh ngày: {formatDateDisplay(c.entryDate)}</div>}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEdit(c)}>
                          📝 Sửa
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(c._id, c.hoten)}
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <form 
            onSubmit={handleSubmit} 
            className="modal" 
            style={{ 
              maxWidth: '560px', 
              maxHeight: '90vh', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden' 
            }}
          >
            <div className="modal-header">
              <div>
                <div className="modal-title">{editingCustomer ? 'Chỉnh sửa thông tin khách' : 'Thêm mới khách lưu trú'}</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>
                  Điền các trường thông tin bên dưới để lưu vào cơ sở dữ liệu
                </div>
              </div>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            
            <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
              {/* Thông tin chung */}
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
                  <select
                    name="gioitinh"
                    className="form-control"
                    value={form.gioitinh}
                    onChange={handleChange}
                  >
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
                  <select
                    name="quoctich"
                    className="form-control"
                    value={form.quoctich}
                    onChange={handleChange}
                  >
                    {options.nationalities.map(nat => (
                      <option key={nat} value={nat}>{nat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '14px 0' }} />

              {/* Nhóm thông tin động dựa theo Quốc Tịch */}
              {form.quoctich === 'Việt Nam' ? (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)', marginBottom: '10px' }}>
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
                    addToast={addToast}
                  />
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)', marginBottom: '10px' }}>
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
                      <select
                        name="visaType"
                        className="form-control"
                        value={form.visaType}
                        onChange={handleChange}
                        required
                      >
                        {options.visaTypes.map(vt => (
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
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Hủy</button>
              <button type="submit" className="btn btn-success">✓ Lưu thông tin</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
