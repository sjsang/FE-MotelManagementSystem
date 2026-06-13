import React, { useState, useEffect } from "react";
import {
  getActivePrice,
  updatePrice,
  addPriceService,
  deletePriceService,
} from "../utils/api";
import { useToast } from "../hooks/useToast";

const formatNumberWithDots = (val) => {
  if (val === null || val === undefined || val === "") return "";
  const str = val.toString().replace(/\D/g, "");
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const PriceField = ({ label, path, note, edited, onChange }) => {
  const value = path.split(".").reduce((obj, k) => obj?.[k], edited) ?? "";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</div>
        {note && (
          <div style={{ fontSize: 11.5, color: "#6b6f84", marginTop: 2 }}>
            {note}
          </div>
        )}
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}
      >
        <input
          type="text"
          className="form-control"
          style={{ width: 120, textAlign: "right" }}
          value={formatNumberWithDots(value)}
          onChange={(e) => onChange(path, e.target.value.replace(/\D/g, ""))}
        />
        <span style={{ fontSize: 12, color: "#6b6f84", width: 16 }}>đ</span>
      </div>
    </div>
  );
};

export default function PriceManagement() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edited, setEdited] = useState(null);
  const [tab, setTab] = useState("day");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    price: "",
    unit: "cái",
  });
  const [modalSaving, setModalSaving] = useState(false);
  const { addToast, ToastContainer } = useToast();

  useEffect(() => {
    getActivePrice()
      .then((r) => {
        setConfig(r.data);
        setEdited(JSON.parse(JSON.stringify(r.data)));
      })
      .catch(() => addToast("Lỗi tải bảng giá", "error"))
      .finally(() => setLoading(false));
  }, []);

  const set = (path, value) => {
    setEdited((prev) => {
      const clone = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let obj = clone;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = value === "" ? "" : Number(value);
      return clone;
    });
  };

  const setService = (i, field, value) => {
    setEdited((prev) => {
      const clone = JSON.parse(JSON.stringify(prev));
      clone.services[i][field] =
        field === "price" ? (value === "" ? "" : Number(value)) : value;
      return clone;
    });
  };

  const handleAddService = async () => {
    if (!newService.name.trim() || newService.price === "") {
      addToast("Vui lòng nhập tên và giá dịch vụ", "error");
      return;
    }
    setModalSaving(true);
    try {
      const res = await addPriceService(config._id, {
        name: newService.name.trim(),
        price: Number(newService.price),
        unit: newService.unit || "cái",
      });
      const svc = res.data;
      const newEdited = {
        ...edited,
        services: [...(edited.services || []), svc],
      };
      const newConfig = {
        ...config,
        services: [...(config.services || []), svc],
      };
      setConfig(newConfig);
      setEdited(newEdited);

      // Lưu ngay bảng giá để không cần bấm nút "Lưu bảng giá"
      try {
        await updatePrice(config._id, newEdited);
        setConfig(JSON.parse(JSON.stringify(newEdited)));
      } catch (err) {
        addToast(
          err.response?.data?.error ||
            "Đã thêm dịch vụ nhưng lưu bảng giá thất bại",
          "error"
        );
      }

      setNewService({ name: "", price: "", unit: "cái" });
      setShowAddModal(false);
      addToast("✅ Đã thêm dịch vụ");
    } catch (e) {
      addToast(e.response?.data?.error || "Lỗi thêm dịch vụ", "error");
    } finally {
      setModalSaving(false);
    }
  };

  const removeService = async (i) => {
    const svc = edited.services[i];

    if (
      !window.confirm(
        `⚠️ Bạn có chắc muốn xóa dịch vụ "${svc?.name}"?\nHành động này không thể hoàn tác.`
      )
    )
      return;

    // Dịch vụ chưa có _id (chưa từng lưu lên server) thì bỏ khỏi state và lưu lại bảng giá ngay
    if (!svc?._id) {
      const newEdited = {
        ...edited,
        services: edited.services.filter((_, idx) => idx !== i),
      };
      setEdited(newEdited);
      setSaving(true);
      try {
        await updatePrice(config._id, newEdited);
        setConfig(JSON.parse(JSON.stringify(newEdited)));
        addToast("✅ Đã xóa dịch vụ");
      } catch (e) {
        addToast(e.response?.data?.error || "Lỗi lưu bảng giá", "error");
      } finally {
        setSaving(false);
      }
      return;
    }

    try {
      await deletePriceService(config._id, svc._id);
      const newEdited = {
        ...edited,
        services: edited.services.filter((_, idx) => idx !== i),
      };
      setEdited(newEdited);
      setConfig((prev) => ({
        ...prev,
        services: (prev.services || []).filter((s) => s._id !== svc._id),
      }));
      addToast("✅ Đã xóa dịch vụ");
    } catch (e) {
      addToast(e.response?.data?.error || "Lỗi xóa dịch vụ", "error");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePrice(config._id, edited);
      setConfig(JSON.parse(JSON.stringify(edited)));
      addToast("✅ Đã lưu bảng giá");
    } catch (e) {
      addToast(e.response?.data?.error || "Lỗi lưu bảng giá", "error");
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n) => (n ? n.toLocaleString("vi-VN") : "0");

  const field = (label, path, note) => (
    <PriceField
      label={label}
      path={path}
      note={note}
      edited={edited}
      onChange={set}
    />
  );

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: 60, color: "#6b6f84" }}>
        Đang tải...
      </div>
    );
  if (!edited) return null;

  return (
    <div>
      <ToastContainer />

      {/* ── MODAL THÊM DỊCH VỤ ── */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => !modalSaving && setShowAddModal(false)}
        >
          <div
            className="card"
            style={{ width: 380, maxWidth: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 700, marginBottom: 16 }}>
              Thêm dịch vụ mới
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div
                  style={{ fontSize: 12, color: "#6b6f84", marginBottom: 4 }}
                >
                  Tên dịch vụ
                </div>
                <input
                  className="form-control"
                  style={{ width: "100%" }}
                  placeholder="Tên dịch vụ"
                  value={newService.name}
                  onChange={(e) =>
                    setNewService((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>

              <div>
                <div
                  style={{ fontSize: 12, color: "#6b6f84", marginBottom: 4 }}
                >
                  Giá
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    className="form-control"
                    type="text"
                    style={{ width: "100%", textAlign: "right" }}
                    placeholder="Giá"
                    value={formatNumberWithDots(newService.price)}
                    onChange={(e) =>
                      setNewService((p) => ({
                        ...p,
                        price: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                  />
                  <span style={{ fontSize: 12, color: "#6b6f84", width: 16 }}>
                    đ
                  </span>
                </div>
              </div>

              <div>
                <div
                  style={{ fontSize: 12, color: "#6b6f84", marginBottom: 4 }}
                >
                  Đơn vị
                </div>
                <input
                  className="form-control"
                  style={{ width: "100%" }}
                  placeholder="Đơn vị (cái, lon, ly, ...)"
                  value={newService.unit}
                  onChange={(e) =>
                    setNewService((p) => ({ ...p, unit: e.target.value }))
                  }
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 20,
              }}
            >
              <button
                className="btn btn-sm"
                style={{
                  background: "var(--bg3)",
                  color: "#9fa3b8",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onClick={() => setShowAddModal(false)}
                disabled={modalSaving}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddService}
                disabled={modalSaving}
              >
                {modalSaving ? "..." : "Thêm dịch vụ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Bảng giá</div>
          <div className="page-subtitle">
            Cấu hình giá phòng theo ca và loại phòng
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "..." : " Lưu bảng giá"}
        </button>
      </div>

      {/* ── TABS ── */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}
      >
        {[
          ["day", " Ca ngày"],
          ["night", " Ca đêm"],
          ["services", "Dịch vụ"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 600,
              fontSize: 13,
              background: tab === key ? "var(--accent)" : "var(--bg3)",
              color: tab === key ? "#fff" : "#9fa3b8",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── CA NGÀY ── */}
      {tab === "day" && (
        <div className="price-grid-2">
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 4, color: "#8b85ff" }}>
              Phòng đơn – Ca ngày
            </div>
            <div style={{ fontSize: 12, color: "#6b6f84", marginBottom: 12 }}>
              Áp dụng 5h – 23h
            </div>
            {field(
              "Ngày đêm (24h)",
              "dayShift.single.fullday",
              "Tính từ 12h hôm nay đến 12h mai"
            )}
            {field(
              "Qua đêm",
              "dayShift.single.overnight",
              "Từ 18h đến 8h sáng"
            )}
            {field("Nghỉ giờ – Đầu (≤30 phút)", "dayShift.single.hourly_first")}
            {field("Nghỉ giờ – Đến 2 giờ", "dayShift.single.hourly_2h")}
            {field("Phụ thu mỗi giờ thêm", "dayShift.single.hourly_extra")}
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 4, color: "#f472b6" }}>
              Phòng đôi – Ca ngày
            </div>
            <div style={{ fontSize: 12, color: "#6b6f84", marginBottom: 12 }}>
              Áp dụng 5h – 23h
            </div>
            {field("Ngày đêm (24h)", "dayShift.double.fullday")}
            {field("Qua đêm", "dayShift.double.overnight")}
            {field("Nghỉ giờ – Đến 2 giờ", "dayShift.double.hourly_2h")}
            {field("Phụ thu mỗi giờ thêm", "dayShift.double.hourly_extra")}
          </div>

          <div className="card price-span-2">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>
              Phụ thu chung
            </div>
            {field(
              "Check-in sớm / Check-out muộn",
              "lateEarlyFee",
              "Mỗi giờ phụ thu thêm"
            )}
          </div>
        </div>
      )}

      {/* ── CA ĐÊM ── */}
      {tab === "night" && (
        <div className="price-grid-2">
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 4, color: "#8b85ff" }}>
              Phòng đơn – Ca đêm
            </div>
            <div style={{ fontSize: 12, color: "#6b6f84", marginBottom: 12 }}>
              Áp dụng 23h – 5h
            </div>
            {field(
              "Giờ đầu tiên",
              "nightShift.single.hourly_first",
              "120k/giờ"
            )}
            {field(
              "Phụ thu mỗi giờ thêm",
              "nightShift.single.hourly_extra",
              "Từ giờ thứ 2 trở đi"
            )}
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 4, color: "#f472b6" }}>
              Phòng đôi – Ca đêm
            </div>
            <div style={{ fontSize: 12, color: "#6b6f84", marginBottom: 12 }}>
              Áp dụng 23h – 5h
            </div>
            {field("Giờ đầu tiên", "nightShift.double.hourly_first")}
            {field("Phụ thu mỗi giờ thêm", "nightShift.double.hourly_extra")}
          </div>

          <div className="card price-span-2">
            <div
              style={{
                background: "rgba(59,130,246,0.08)",
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: 13,
                color: "#60a5fa",
              }}
            >
              Quy tắc ca đêm: Dưới 15 tiếng thu 100% giá qua đêm. Sau 0h:
              120k/h, mỗi giờ thêm +40k (đơn).
            </div>
          </div>
        </div>
      )}

      {/* ── DỊCH VỤ ── */}
      {tab === "services" && (
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ fontWeight: 700 }}>Danh sách dịch vụ</div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddModal(true)}
            >
              + Thêm dịch vụ
            </button>
          </div>

          {(edited.services || []).map((svc, i) => (
            <div key={i} className="svc-row">
              <input
                className="form-control"
                placeholder="Tên dịch vụ"
                value={svc.name}
                onChange={(e) => setService(i, "name", e.target.value)}
              />
              <input
                className="form-control"
                type="text"
                placeholder="Giá"
                value={formatNumberWithDots(svc.price)}
                onChange={(e) =>
                  setService(i, "price", e.target.value.replace(/\D/g, ""))
                }
                style={{ textAlign: "right" }}
              />
              <input
                className="form-control"
                placeholder="Đơn vị"
                value={svc.unit}
                onChange={(e) => setService(i, "unit", e.target.value)}
              />
              <button
                className="btn btn-sm"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.2)",
                  flexShrink: 0,
                }}
                onClick={() => removeService(i)}
              >
                ✕
              </button>
            </div>
          ))}

          {(!edited.services || edited.services.length === 0) && (
            <div style={{ textAlign: "center", padding: 30, color: "#6b6f84" }}>
              Chưa có dịch vụ nào
            </div>
          )}

          <div
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "..." : "Lưu bảng giá"}
            </button>
          </div>
        </div>
      )}

      {/* ── TÓM TẮT ── */}
      {tab !== "services" && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>
            Tóm tắt bảng giá hiện tại
          </div>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Loại phòng</th>
                  <th>Ngày đêm 24h</th>
                  <th>Qua đêm</th>
                  <th>Giờ đầu (ngày)</th>
                  <th>Giờ đầu (đêm)</th>
                </tr>
              </thead>
              <tbody>
                {["single", "double"].map((type) => (
                  <tr key={type}>
                    <td style={{ fontWeight: 600 }}>
                      {type === "single" ? " Đơn" : "Đôi"}
                    </td>
                    <td>{fmt(edited.dayShift?.[type]?.fullday)}đ</td>
                    <td>{fmt(edited.dayShift?.[type]?.overnight)}đ</td>
                    <td>
                      {fmt(
                        edited.dayShift?.[type]?.hourly_2h ||
                          edited.dayShift?.[type]?.hourly_first
                      )}
                      đ
                    </td>
                    <td>{fmt(edited.nightShift?.[type]?.hourly_first)}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        /* Desktop: 2-col grid */
        .price-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .price-span-2 {
          grid-column: span 2;
        }

        /* Service row: 4 columns */
        .svc-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr auto;
          gap: 10px;
          margin-bottom: 10px;
          align-items: center;
        }

        /* Tablet (≤768px): single column */
        @media (max-width: 768px) {
          .price-grid-2 {
            grid-template-columns: 1fr;
          }
          .price-span-2 {
            grid-column: span 1;
          }
        }

        /* Mobile (≤520px): service row stacks */
        @media (max-width: 520px) {
          .svc-row {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto;
          }
          /* Tên dịch vụ spans full width */
          .svc-row > input:first-child {
            grid-column: span 2;
          }
          /* Nút xóa căn phải */
          .svc-row > button {
            grid-column: 2;
            justify-self: end;
            width: 40px;
          }

          /* Tóm tắt: ẩn cột ít quan trọng hơn */
          table th:nth-child(4),
          table td:nth-child(4) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
