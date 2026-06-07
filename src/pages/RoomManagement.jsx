import React, { useState, useEffect } from "react";
import { getRooms, createRoom, updateRoom, deleteRoom } from "../utils/api";
import { useToast } from "../hooks/useToast";

const ROOM_STATUS = ["available", "occupied", "cleaning", "maintenance"];
const STATUS_LABEL = {
  available: "Trống",
  occupied: "Có khách",
  cleaning: "Dọn phòng",
  maintenance: "Bảo trì",
};
const STATUS_CLASS = {
  available: "badge-available",
  occupied: "badge-occupied",
  cleaning: "badge-cleaning",
  maintenance: "badge-maintenance",
};

const emptyForm = { roomNumber: "", type: "single", floor: 1, notes: "" };

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { addToast, ToastContainer } = useToast();

  const load = async () => {
    try {
      const res = await getRooms();
      const validData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setRooms(validData);
    } catch {
      addToast("Lỗi tải danh sách phòng", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setModal("edit");
  };
  const openEdit = (room) => {
    setForm({
      roomNumber: room.roomNumber,
      type: room.type,
      floor: room.floor,
      status: room.status,
      notes: room.notes || "",
    });
    setEditId(room._id);
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.roomNumber.trim()) {
      addToast("Vui lòng nhập số phòng", "error");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await updateRoom(editId, form);
        addToast("Đã cập nhật phòng");
      } else {
        await createRoom(form);
        addToast("Đã thêm phòng mới");
      }
      setModal(null);
      load();
    } catch (e) {
      addToast(e.response?.data?.error || "Lỗi lưu phòng", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`Xóa phòng ${room.roomNumber}?`)) return;
    try {
      await deleteRoom(room._id);
      addToast("Đã xóa phòng");
      load();
    } catch (e) {
      addToast(e.response?.data?.error || "Lỗi xóa phòng", "error");
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const floors = [...new Set(rooms.map((r) => r.floor))].sort();

  return (
    <div>
      <ToastContainer />
      <div className="page-header">
        <div>
          <div className="page-title">Quản lý phòng</div>
          <div className="page-subtitle">
            Thêm, chỉnh sửa, xóa và cập nhật trạng thái phòng
          </div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          + Thêm phòng
        </button>
      </div>

      {/* Stats */}
      <div
        className="stats-grid"
        style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 20 }}
      >
        <div className="stat-card">
          <div className="stat-label">Phòng đơn</div>
          <div className="stat-value" style={{ color: "#8b85ff" }}>
            {rooms.filter((r) => r.type === "single").length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Phòng đôi</div>
          <div className="stat-value" style={{ color: "#f472b6" }}>
            {rooms.filter((r) => r.type === "double").length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tổng phòng</div>
          <div className="stat-value" style={{ color: "#10b981" }}>
            {rooms.length}
          </div>
        </div>
      </div>

      {/* Rooms grouped by floor */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6b6f84" }}>
          Đang tải...
        </div>
      ) : (
        floors.map((floor) => (
          <div key={floor} className="card" style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#8b85ff",
                marginBottom: 14,
              }}
            >
              Tầng {floor}
            </div>

            {/* ── Desktop: table ── */}
            <div className="rm-table-wrap table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Số phòng</th>
                    <th>Loại</th>
                    <th>Trạng thái</th>
                    <th>Ghi chú</th>
                    <th style={{ textAlign: "right" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms
                    .filter((r) => r.floor === floor)
                    .map((room) => (
                      <tr key={room._id}>
                        <td>
                          <span style={{ fontWeight: 700, fontSize: 15 }}>
                            {room.roomNumber}
                          </span>
                        </td>
                        <td>{room.type === "single" ? "🛏 Đơn" : "🛏🛏 Đôi"}</td>
                        <td>
                          <span
                            className={`badge ${STATUS_CLASS[room.status]}`}
                          >
                            {STATUS_LABEL[room.status]}
                          </span>
                        </td>
                        <td style={{ color: "#9fa3b8" }}>
                          {room.notes || "--"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              justifyContent: "flex-end",
                            }}
                          >
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => openEdit(room)}
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{
                                background: "rgba(239,68,68,0.1)",
                                color: "#ef4444",
                                border: "1px solid rgba(239,68,68,0.2)",
                              }}
                              onClick={() => handleDelete(room)}
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile: cards ── */}
            <div className="rm-card-list">
              {rooms
                .filter((r) => r.floor === floor)
                .map((room) => (
                  <div key={room._id} className="rm-room-card">
                    <div className="rm-room-card-top">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span style={{ fontWeight: 800, fontSize: 18 }}>
                          {room.roomNumber}
                        </span>
                        <span style={{ fontSize: 13, color: "#9fa3b8" }}>
                          {room.type === "single" ? "🛏 Đơn" : "🛏🛏 Đôi"}
                        </span>
                      </div>
                      <span className={`badge ${STATUS_CLASS[room.status]}`}>
                        {STATUS_LABEL[room.status]}
                      </span>
                    </div>
                    {room.notes && (
                      <div
                        style={{
                          fontSize: 12.5,
                          color: "#6b6f84",
                          marginTop: 6,
                        }}
                      >
                        📝 {room.notes}
                      </div>
                    )}
                    <div className="rm-room-card-actions">
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => openEdit(room)}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{
                          flex: 1,
                          background: "rgba(239,68,68,0.1)",
                          color: "#ef4444",
                          border: "1px solid rgba(239,68,68,0.2)",
                        }}
                        onClick={() => handleDelete(room)}
                      >
                        🗑 Xóa
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))
      )}

      {/* Add / Edit Modal */}
      {modal === "edit" && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                {editId ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="input-row">
                <div className="form-group">
                  <label className="form-label">Số phòng *</label>
                  <input
                    className="form-control"
                    placeholder="101"
                    value={form.roomNumber}
                    onChange={(e) => set("roomNumber", e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tầng</label>
                  <input
                    className="form-control"
                    type="number"
                    min="1"
                    value={form.floor}
                    onChange={(e) => set("floor", Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Loại phòng</label>
                <select
                  className="form-control"
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                >
                  <option value="single">🛏 Phòng đơn</option>
                  <option value="double">🛏🛏 Phòng đôi</option>
                </select>
              </div>
              {editId && (
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select
                    className="form-control"
                    value={form.status}
                    onChange={(e) => set("status", e.target.value)}
                  >
                    {ROOM_STATUS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Ghi chú</label>
                <input
                  className="form-control"
                  placeholder="Ghi chú về phòng..."
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "..." : editId ? "💾 Lưu thay đổi" : "+ Thêm phòng"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Desktop: show table, hide cards */
        .rm-card-list { display: none; }
        .rm-table-wrap { display: block; }

        /* Mobile (≤640px): hide table, show cards */
        @media (max-width: 640px) {
          .rm-table-wrap { display: none !important; }
          .rm-card-list  { display: flex; flex-direction: column; gap: 10px; }

          .rm-room-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            padding: 13px 14px;
          }
          .rm-room-card-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .rm-room-card-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
          }

          /* Modal full-width on mobile */
          .modal {
            width: 94vw !important;
            max-width: 94vw !important;
            margin: 0 auto;
          }
          .input-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
