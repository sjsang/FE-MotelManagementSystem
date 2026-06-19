import React, { useState, useEffect, useRef } from "react";
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

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  const { addToast, ToastContainer } = useToast();

  const loadData = async (query = searchQuery, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setPage(1);
      }

      const currentPage = isLoadMore ? page + 1 : 1;

      const [custRes, optRes] = await Promise.all([
        getCustomers({ search: query, page: currentPage, sort: "hoten" }),
        isLoadMore ? Promise.resolve({ data: options }) : getCustomerOptions(),
      ]);

      const resData = custRes.data?.data || custRes.data || [];
      const resHasMore = custRes.data?.hasMore || false;

      if (isLoadMore) {
        setCustomers((prev) => [...prev, ...resData]);
        setPage(currentPage);
      } else {
        setCustomers(resData);
      }
      setHasMore(resHasMore);

      if (!isLoadMore) {
        setOptions(
          optRes.data || { nationalities: [], provinces: [], visaTypes: [] }
        );
      }
    } catch (e) {
      addToast("Không thể tải danh sách khách hàng hoặc cấu hình", "error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadData(searchQuery, true);
        }
      },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, searchQuery]);

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
        // 1. Kiểm tra nhanh trong danh sách khách hàng cục bộ
        const localExisting = customers.find(
          (c) =>
            (payload.cccd && c.cccd === payload.cccd) ||
            (payload.passport && c.passport === payload.passport)
        );

        if (localExisting) {
          await updateCustomer(localExisting._id, payload);
          addToast("Khách hàng đã tồn tại, đã tự động cập nhật thông tin mới nhất!", "success");
          loadData();
          return true;
        }

        // 2. Thử tạo mới
        await createCustomer(payload);
        addToast("Thêm mới khách lưu trú thành công", "success");
      }
      loadData();
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || "Có lỗi xảy ra khi lưu thông tin";
      
      // 3. Nếu bị lỗi trùng CCCD/Hộ chiếu (khách cũ đã có trong DB nhưng chưa tải về cục bộ)
      if (!editingCustomer && errMsg.includes("đã tồn tại")) {
        try {
          const searchRes = await getCustomers({ search: payload.cccd || payload.passport });
          const searchList = Array.isArray(searchRes.data)
            ? searchRes.data
            : searchRes.data?.data || [];
          
          const found = searchList.find(
            (c) =>
              (payload.cccd && c.cccd === payload.cccd) ||
              (payload.passport && c.passport === payload.passport)
          );

          if (found) {
            await updateCustomer(found._id, payload);
            addToast("Khách hàng đã tồn tại trong hệ thống, đã tự động cập nhật thông tin mới nhất!", "success");
            loadData();
            return true;
          }
        } catch (fallbackErr) {
          console.error("Lỗi khi xử lý cập nhật fallback:", fallbackErr);
        }
      }

      addToast(errMsg, "error");
      return false;
    }
  };



  const filteredCustomers = customers;

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
          Thêm khách hàng
        </button>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: "14px 18px", marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
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
                            Sửa
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(c._id, c.hoten)}
                            style={{ padding: "6px 10px", fontSize: 12 }}
                          >
                            Xóa
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
                    {c.gioitinh && <span>{c.gioitinh}</span>}
                    {c.ngaythangnamsinh && (
                      <span> {formatDateDisplay(c.ngaythangnamsinh)}</span>
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
                      Sửa
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleDelete(c._id, c.hoten)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div
                ref={sentinelRef}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  padding: "24px 0",
                  color: "var(--text3)",
                  fontSize: "13px",
                }}
              >
                <span
                  className="loading-spinner"
                  style={{
                    width: "18px",
                    height: "18px",
                    border: "2px solid rgba(255,255,255,0.1)",
                    borderTopColor: "var(--accent)",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Đang tải thêm...
              </div>
            )}
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

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
