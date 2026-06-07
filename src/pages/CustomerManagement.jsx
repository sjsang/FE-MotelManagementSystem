import React, { useState, useEffect } from 'react';
import {
  getCustomers,
  getCustomerOptions,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../utils/api';
import { useToast } from '../hooks/useToast';
import AddCustomerModal from '../components/AddCustomerModal';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [options, setOptions] = useState({ nationalities: [], provinces: [], visaTypes: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null); // null if adding new

  const { addToast, ToastContainer } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [custRes, optRes] = await Promise.all([
        getCustomers(),
        getCustomerOptions(),
      ]);

      const validCustomers = Array.isArray(custRes.data) ? custRes.data : (custRes.data?.data || []);
      setCustomers(validCustomers);

      setOptions(optRes.data || { nationalities: [], provinces: [], visaTypes: [] });
    } catch (e) {
      addToast("Không thể tải danh sách khách hàng hoặc cấu hình", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer);
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

  const handleSaveCustomer = async (payload) => {
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer._id, payload);
        addToast('Cập nhật thông tin thành công', 'success');
      } else {
        await createCustomer(payload);
        addToast('Thêm mới khách lưu trú thành công', 'success');
      }
      loadData();
      return true; // Trả về true để AddCustomerModal tự động đóng modal
    } catch (err) {
      addToast(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin', 'error');
      return false; // Trả về false để giữ modal mở
    }
  };

  // Lọc khách hàng theo ô tìm kiếm
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

      {/* Thanh tìm kiếm */}
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

      {/* Danh sách bảng khách hàng */}
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

      {/* CRUD Modal tái sử dụng */}
      {modalOpen && (
        <AddCustomerModal
          customer={editingCustomer}
          options={options}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveCustomer}
          addToast={addToast}
        />
      )}
    </div>
  );
}
