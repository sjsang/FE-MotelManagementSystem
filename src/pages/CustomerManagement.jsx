import React, { useState, useEffect } from "react";
import {
  getCustomers,
  getCustomerOptions,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../utils/api";
import { useToast } from "../hooks/useToast";
import AddCustomerModal from "../components/AddCustomerModal";

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [options, setOptions] = useState({
    nationalities: [],
    provinces: [],
    visaTypes: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

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
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa khách hàng "${name}" khỏi danh sách?`
      )
    ) {
      try {
        await deleteCustomer(id);
        addToast("Xóa khách hàng thành công", "success");
        loadData();
      } catch (err) {
        addToast(
          err.response?.data?.message || "Lỗi khi xóa khách hàng",
          "error"
        );
      }
    }
  };

  const handleSaveCustomer = async (payload) => {
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer._id, payload);
        addToast("Cập nhật thông tin thành công", "success");
      } else {
        await createCustomer(payload);
        addToast("Thêm mới khách lưu trú thành công", "success");
      }
      loadData();
      return true;
    } catch (err) {
      addToast(
        err.response?.data?.message || "Có lỗi xảy ra khi lưu thông tin",
        "error"
      );
      return false;
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      c.hoten?.toLowerCase().includes(query) ||
      c.cccd?.toLowerCase().includes(query) ||
      c.passport?.toLowerCase().includes(query)
    );
  });

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1
    ).padStart(2, "0")}/${date.getFullYear()}`;
  };

  // Shared identity info renderer (used in both table cell and card)
  const IdentityInfo = ({ c }) =>
    c.quoctich === "Việt Nam" ? (
      <div style={{ fontSize: 13 }}>
        <div>
          <strong>CCCD:</strong> {c.cccd || "---"}
        </div>
        {c.ngaycap && (
          <div style={{ fontSize: 12, color: "#9fa3b8" }}>
            Cấp ngày: {formatDateDisplay(c.ngaycap)}
            {c.noicap ? ` tại ${c.noicap}` : ""}
          </div>
        )}
        {c.thuongtru && (
          <div style={{ fontSize: 12, color: "#9fa3b8" }}>
            Thường trú: {c.thuongtru}
          </div>
        )}
      </div>
    ) : (
      <div style={{ fontSize: 13 }}>
        <div>
          <strong>Hộ chiếu:</strong> {c.passport || "---"}
        </div>
        <div style={{ fontSize: 12, color: "#9fa3b8" }}>
          Loại Visa: {c.visaType || "---"}
        </div>
        {c.visaExpiredDate && (
          <div style={{ fontSize: 12, color: "#9fa3b8" }}>
            Hạn Visa: {formatDateDisplay(c.visaExpiredDate)}
          </div>
        )}
        {c.entryDate && (
          <div style={{ fontSize: 12, color: "#9fa3b8" }}>
            Nhập cảnh: {formatDateDisplay(c.entryDate)}
          </div>
        )}
      </div>
    );

  return (
    <div>
      <ToastContainer />

      <div className="page-header">
        <div>
          <div className="page-title">Quản lý Khách lưu trú</div>
          <div className="page-subtitle">
            Xem danh sách, thêm, sửa, và xóa khách hàng trong nước/nước ngoài
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          ➕ Thêm khách hàng
        </button>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: "14px 18px", marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 18 }}>🔍</span>
          <input
            className="form-control"
            placeholder="Tìm kiếm theo Tên, Số CCCD hoặc Số Hộ chiếu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              padding: "6px",
            }}
          />
          {searchQuery && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setSearchQuery("")}
              style={{ padding: "4px 8px" }}
            >
              Xóa
            </button>
          )}
        </div>
      </div>

      {/* Table + Card list */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div
            style={{ textAlign: "center", padding: 50, color: "var(--text3)" }}
          >
            Đang tải dữ liệu...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: 50, color: "var(--text3)" }}
          >
            {searchQuery
              ? "Không tìm thấy khách hàng nào khớp với bộ lọc"
              : "Danh sách khách lưu trú trống"}
          </div>
        ) : (
          <>
            {/* ── Desktop: table ── */}
            <div className="cm-table-wrap table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Họ tên</th>
                    <th>Giới tính</th>
                    <th>Ngày sinh</th>
                    <th>Quốc tịch</th>
                    <th>Thông tin giấy tờ định danh</th>
                    <th style={{ width: 130, textAlign: "center" }}>
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c) => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 700 }}>{c.hoten}</td>
                      <td>{c.gioitinh}</td>
                      <td>{formatDateDisplay(c.ngaythangnamsinh)}</td>
                      <td>
                        <span
                          className={`badge ${
                            c.quoctich === "Việt Nam"
                              ? "badge-available"
                              : "badge-maintenance"
                          }`}
                        >
                          {c.quoctich}
                        </span>
                      </td>
                      <td>
                        <IdentityInfo c={c} />
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            justifyContent: "center",
                          }}
                        >
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleOpenEdit(c)}
                          >
                            📝 Sửa
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(c._id, c.hoten)}
                            style={{ padding: "6px 10px", fontSize: 12 }}
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

            {/* ── Mobile: cards ── */}
            <div className="cm-card-list">
              {filteredCustomers.map((c) => (
                <div key={c._id} className="cm-customer-card">
                  {/* Top row: name + nationality badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 15 }}>
                      {c.hoten}
                    </div>
                    <span
                      className={`badge ${
                        c.quoctich === "Việt Nam"
                          ? "badge-available"
                          : "badge-maintenance"
                      }`}
                      style={{ flexShrink: 0 }}
                    >
                      {c.quoctich}
                    </span>
                  </div>

                  {/* Meta row: gender + dob */}
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      marginBottom: 8,
                      fontSize: 13,
                      color: "#9fa3b8",
                    }}
                  >
                    {c.gioitinh && <span>👤 {c.gioitinh}</span>}
                    {c.ngaythangnamsinh && (
                      <span>🎂 {formatDateDisplay(c.ngaythangnamsinh)}</span>
                    )}
                  </div>

                  {/* Identity info */}
                  <div
                    style={{
                      marginBottom: 10,
                      paddingTop: 8,
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <IdentityInfo c={c} />
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleOpenEdit(c)}
                    >
                      📝 Sửa
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleDelete(c._id, c.hoten)}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <AddCustomerModal
          customer={editingCustomer}
          options={options}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveCustomer}
          addToast={addToast}
        />
      )}

      <style>{`
        /* Desktop: table visible, cards hidden */
        .cm-card-list  { display: none; }
        .cm-table-wrap { display: block; }

        /* Mobile (≤640px): table hidden, cards visible */
        @media (max-width: 640px) {
          .cm-table-wrap { display: none !important; }
          .cm-card-list  { display: flex; flex-direction: column; padding: 12px; gap: 10px; }

          .cm-customer-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            padding: 14px;
          }

          /* Modal full-width */
          .modal {
            width: 94vw !important;
            max-width: 94vw !important;
          }
        }
      `}</style>
    </div>
  );
}
