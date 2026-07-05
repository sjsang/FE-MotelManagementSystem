import React, { useState, useEffect } from "react";
import { getUsers, createUser, updateUser, deleteUser, getUserInfo } from "../utils/api";
import { useToast } from "../hooks/useToast";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);
  
  // States cho Custom Delete Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [cannotDeleteModalOpen, setCannotDeleteModalOpen] = useState(false);
  
  const { addToast, ToastContainer } = useToast();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data || []);
    } catch (err) {
      addToast(err.response?.data?.message || "Lỗi khi tải danh sách tài khoản", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchLoggedUser = async () => {
    try {
      const res = await getUserInfo();
      setLoggedUser(res.data);
    } catch {}
  };

  useEffect(() => {
    loadUsers();
    fetchLoggedUser();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setForm({ username: "", password: "" });
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setForm({ username: u.username, password: u.password_raw || "" });
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleOpenDelete = (u) => {
    if (loggedUser && loggedUser._id === u._id) {
      // Nếu cố tình tự xóa chính mình -> Hiện modal báo lỗi không cho xóa
      setCannotDeleteModalOpen(true);
    } else {
      // Trường hợp xóa tài khoản khác -> Mở modal xác nhận
      setDeletingUser(u);
      setDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      const res = await deleteUser(deletingUser._id);
      addToast(res.data.message || "Xóa tài khoản thành công", "success");
      setDeleteModalOpen(false);
      setDeletingUser(null);
      loadUsers();
    } catch (err) {
      addToast(err.response?.data?.message || "Lỗi khi xóa tài khoản", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim()) {
      addToast("Tên đăng nhập không được để trống", "error");
      return;
    }

    // Nếu tạo mới, bắt buộc nhập mật khẩu
    if (!editingUser && !form.password) {
      addToast("Vui lòng nhập mật khẩu", "error");
      return;
    }

    try {
      if (editingUser) {
        // Cập nhật tài khoản
        const res = await updateUser(editingUser._id, {
          username: form.username.trim(),
          password: form.password || undefined,
        });
        addToast(res.data.message || "Cập nhật tài khoản thành công!", "success");
      } else {
        // Tạo mới
        const res = await createUser({
          username: form.username.trim(),
          password: form.password,
        });
        addToast(res.data.message || "Thêm tài khoản thành công!", "success");
      }
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      addToast(err.response?.data?.message || "Lỗi khi lưu thông tin tài khoản", "error");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <ToastContainer />

      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <div className="page-title" style={{ fontSize: "24px", fontWeight: "bold", color: "var(--text)" }}>Quản lý tài khoản</div>
          <div className="page-subtitle" style={{ fontSize: "14px", color: "var(--text3)", marginTop: "4px" }}>
            Xem danh sách, thêm, sửa, và xóa tài khoản truy cập vào hệ thống
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          + Thêm tài khoản
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px", color: "var(--text3)" }}>
            Đang tải danh sách tài khoản...
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", color: "var(--text3)" }}>
            Không có tài khoản quản trị nào trong danh sách
          </div>
        ) : (
          <div className="table-wrap">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "12px" }}>Tên đăng nhập</th>
                  <th style={{ textAlign: "center", padding: "12px", width: "180px" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "14px 12px", fontWeight: "600", color: "var(--text)" }}>{u.username}</td>
                    <td style={{ padding: "14px 12px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEdit(u)}>
                          Sửa
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleOpenDelete(u)}>
                          Xóa
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

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="modal" style={{ maxWidth: "420px", height: "auto", maxHeight: "fit-content" }}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{editingUser ? "Chỉnh sửa tài khoản" : "Tạo tài khoản mới"}</div>
                <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "2px" }}>
                  {editingUser ? "Nhập mật khẩu mới nếu muốn thay đổi thông tin đăng nhập" : "Nhập đầy đủ thông tin để cấp tài khoản truy cập"}
                </div>
              </div>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label className="form-label">Tên đăng nhập *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập tên đăng nhập..."
                  value={form.username}
                  onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: "6px", position: "relative" }}>
                <label className="form-label">
                  Mật khẩu {editingUser ? "(Mới nếu muốn thay đổi)" : "*"}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder={editingUser ? "Nhập mật khẩu mới nếu muốn thay đổi..." : "Nhập mật khẩu..."}
                    value={form.password}
                    onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                    required={!editingUser}
                    style={{ paddingRight: "45px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "var(--text3)",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    {showPassword ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Hủy</button>
              <button type="submit" className="btn btn-primary">✓ Lưu thông tin</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Xác nhận Xóa Tài khoản */}
      {deleteModalOpen && deletingUser && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setDeleteModalOpen(false)}>
          <div className="modal" style={{ maxWidth: "380px", height: "auto", maxHeight: "fit-content" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Xác nhận xóa tài khoản</div>
              <button type="button" className="modal-close" onClick={() => setDeleteModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: "20px" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--text)" }}>
                Bạn có chắc chắn muốn xóa tài khoản <strong>{deletingUser.username}</strong>? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="modal-footer" style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-ghost" onClick={() => setDeleteModalOpen(false)}>Hủy</button>
              <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>Xóa tài khoản</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Báo lỗi tự xóa chính mình */}
      {cannotDeleteModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setCannotDeleteModalOpen(false)}>
          <div className="modal" style={{ maxWidth: "380px", height: "auto", maxHeight: "fit-content" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ color: "#ef4444" }}>⚠️ Lỗi bảo mật</div>
              <button type="button" className="modal-close" onClick={() => setCannotDeleteModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: "20px" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--text)" }}>
                Bạn không thể tự xóa tài khoản quản trị đang đăng nhập của chính mình!
              </p>
            </div>
            <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-primary" onClick={() => setCannotDeleteModalOpen(false)}>Đã hiểu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

