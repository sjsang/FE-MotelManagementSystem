import React, { useState, useEffect } from "react";
import { formatCurrency } from "../../utils/RoomDetailHelpers";

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

export default function TabServices({
  savedServices = [],
  pendingServices = [],
  availableServices = [],
  newService,
  setNewService,
  addServiceFromList,
  addCustomService,
  updatePendingQuantity,
  removePendingService,
  handleCreateExportSlip,
  submittingExport,
  serviceTotal,
}) {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 480;

  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setNewService((s) => ({ ...s, price: raw }));
  };

  const displayPrice = newService.price
    ? Number(newService.price).toLocaleString("vi-VN")
    : "";

  const pendingTotal = pendingServices.reduce(
    (sum, ps) => sum + (Number(ps.price) || 0) * (Number(ps.quantity) || 1),
    0
  );

  return (
    <div>


      {/* ── THÊM NHANH DỊCH VỤ ── */}
      {availableServices.length > 0 &&
        (() => {
          const pendingMap = new Map();
          pendingServices.forEach((ps) => pendingMap.set(ps.name, ps.quantity));

          const renderBtn = (svc, i) => {
            const pendingQty = pendingMap.get(svc.name) || 0;
            const isSelected = pendingQty > 0;
            const isTracked = svc.trackInventory !== false;
            const isOutOfStock = isTracked && svc.quantity === 0;

            return (
              <button
                key={i}
                disabled={isOutOfStock}
                onClick={() => addServiceFromList(svc)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  background: isOutOfStock
                    ? "rgba(148, 163, 184, 0.08)"
                    : isSelected
                      ? "rgba(16, 185, 129, 0.18)"
                      : "rgba(255,255,255,0.03)",

                  border: isOutOfStock
                    ? "1px solid rgba(148, 163, 184, 0.2)"
                    : isSelected
                      ? "1px solid #10b981"
                      : "1px solid rgba(255,255,255,0.08)",

                  borderRadius: 8,
                  cursor: isOutOfStock ? "not-allowed" : "pointer",
                  opacity: isOutOfStock ? 0.55 : 1,
                  width: "100%",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      fontSize: 13.5,
                      color: isOutOfStock ? "#94a3b8" : isSelected ? "#10b981" : "#424f42",
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  >
                    {svc.name}
                  </span>

                  {isTracked ? (
                    isOutOfStock ? (
                      <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>
                        (Hết hàng)
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: "#64748b" }}>
                        (Tồn: {svc.quantity})
                      </span>
                    )
                  ) : null}

                  {isSelected && (
                    <span
                      style={{
                        fontSize: 11,
                        background: "#10b981",
                        color: "#fff",
                        padding: "1px 6px",
                        borderRadius: 10,
                        fontWeight: 700,
                      }}
                    >
                      +{pendingQty}
                    </span>
                  )}
                </div>

                <span style={{ fontSize: 12, color: isOutOfStock ? "#94a3b8" : "#232636" }}>
                  {Number(svc.price).toLocaleString("vi-VN")}đ
                </span>
              </button>
            );
          };

          return (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#232636", marginBottom: 8 }}>
                Thêm nhanh dịch vụ vào đợt mới:
              </div>

              {isMobile ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {availableServices.map((svc, i) => renderBtn(svc, i))}
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    alignItems: "start",
                  }}
                >
                  {Array.from({
                    length: Math.ceil(availableServices.length / 2),
                  }).map((_, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                      {availableServices[rowIndex * 2] &&
                        renderBtn(availableServices[rowIndex * 2], rowIndex * 2)}
                      {availableServices[rowIndex * 2 + 1] &&
                        renderBtn(availableServices[rowIndex * 2 + 1], rowIndex * 2 + 1)}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

      {/* ── DỊCH VỤ KHÁC (NHẬP THỦ CÔNG) ── */}
      <div className="mb-14 grid grid-cols-1 gap-2 md:grid-cols-[4fr_2fr_1fr_1fr] md:items-end">
        <div>
          <div className="mb-1 text-[13px] font-semibold text-[#232636]">Nhập dịch vụ khác</div>
          <input
            className="form-control"
            placeholder="Tên dịch vụ mới..."
            value={newService.name}
            onChange={(e) =>
              setNewService((s) => ({ ...s, name: e.target.value }))
            }
          />
        </div>

        <div className="flex items-end gap-2 md:contents">
          <div className="flex-1 md:flex-none">
            <div className="mb-1 text-[13px] font-semibold text-[#232636]">Giá (đ)</div>
            <input
              className="form-control"
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={displayPrice}
              onChange={handlePriceChange}
            />
          </div>

          <div className="w-[70px] md:w-auto">
            <div className="mb-1 text-[13px] font-semibold text-[#232636] text-center">
              Số lượng
            </div>
            <input
              className="form-control"
              type="number"
              min="1"
              value={newService.quantity}
              onChange={(e) =>
                setNewService((s) => ({ ...s, quantity: e.target.value }))
              }
            />
          </div>

          <button
            className="btn btn-primary btn-sm h-[42px] w-[42px] shrink-0 md:w-auto justify-center"
            onClick={addCustomService}
            title="Thêm vào đợt mới"
          >
            + Thêm
          </button>
        </div>
      </div>

      <div
        style={{
          height: 1,
          background: "rgba(255,255,255,0.08)",
          margin: "16px 0",
        }}
      />

      {/* ── 1. DỊCH VỤ MỚI CHỜ TẠO PHIẾU XUẤT KHO (DỰ THẢO) ── */}
      {pendingServices.length > 0 && (
        <div
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: 10,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 15, color: "#f59e0b" }}>
              Các dịch vụ mới chuẩn bị xuất kho ({pendingServices.length} món)
            </div>
            <span style={{ fontSize: 12, color: "#f59e0b", background: "rgba(245,158,11,0.15)", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
              Chưa lưu
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {pendingServices.map((ps, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#fff",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", flex: 1 }}>
                  {ps.name}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Chỉnh số lượng cho đợt mới */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => updatePendingQuantity(idx, ps.quantity - 1)}
                      style={{
                        width: 28,
                        height: 28,
                        border: "none",
                        background: "#f1f5f9",
                        color: "#0f172a",
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      −
                    </button>
                    <span
                      style={{
                        width: 32,
                        textAlign: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      {ps.quantity}
                    </span>
                    <button
                      onClick={() => updatePendingQuantity(idx, ps.quantity + 1)}
                      style={{
                        width: 28,
                        height: 28,
                        border: "none",
                        background: "#f1f5f9",
                        color: "#0f172a",
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      +
                    </button>
                  </div>

                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", width: 85, textAlign: "right" }}>
                    {((ps.price || 0) * (ps.quantity || 1)).toLocaleString("vi-VN")}đ
                  </span>

                  <button
                    onClick={() => removePendingService(idx)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontSize: 16,
                      padding: "2px 6px",
                    }}
                    title="Xóa món này khỏi đợt"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid rgba(245,158,11,0.2)",
              paddingTop: 12,
            }}
          >
            <div>
              Tổng đợt mới: <strong style={{ color: "#f59e0b", fontSize: 16 }}>{formatCurrency(pendingTotal)}</strong>
            </div>

            <button
              className="btn"
              style={{
                background: "#10b981",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                padding: "8px 18px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
              }}
              onClick={handleCreateExportSlip}
              disabled={submittingExport}
            >
              {submittingExport ? "Đang xử lý..." : "Tạo phiếu xuất kho"}
            </button>
          </div>
        </div>
      )}

      {/* ── 2. LỊCH SỬ DỊCH VỤ ĐÃ TẠO PHIẾU XUẤT KHO (ĐÃ LƯU & KHÓA) ── */}
      <div style={{ marginTop: 10 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >

          <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>
            Đã lưu
          </span>
        </div>

        {savedServices.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {savedServices.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#232636" }}>
                    {s.name}
                  </span>
                  <span
                    className="badge"
                    style={{
                      fontSize: 11,
                      background: "rgba(16, 185, 129, 0.12)",
                      color: "#10b981",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                    }}
                  >
                    ✓ Đã xuất kho
                  </span>
                </div>

                {/* KHÔNG CÓ NÚT SỬA/XÓA - KHÓA HOÀN TOÀN THEO YÊU CẦU */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ fontSize: 13.5, color: "#8a94a6" }}>
                    Đơn giá: {Number(s.price).toLocaleString("vi-VN")}đ
                  </div>

                  <div
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      padding: "3px 10px",
                      borderRadius: 6,
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: "#232636",
                    }}
                  >
                    SL: {s.quantity} {s.unit || ""}
                  </div>

                  <span style={{ fontSize: 14, fontWeight: 700, color: "#8b85ff", minWidth: 80, textAlign: "right" }}>
                    {((s.price || 0) * (s.quantity || 1)).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 12,
                paddingTop: 12,
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span style={{ fontWeight: 600, color: "#232636" }}>Tổng tiền dịch vụ đã xuất:</span>
              <span style={{ fontWeight: 800, color: "#8b85ff", fontSize: 16 }}>
                {formatCurrency(serviceTotal)}
              </span>
            </div>
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "24px 0",
              color: "#8a94a6",
              fontSize: 13.5,
              background: "rgba(255,255,255,0.02)",
              borderRadius: 8,
              border: "1px dashed rgba(255,255,255,0.08)",
            }}
          >
            Chưa có dịch vụ nào được tạo phiếu xuất kho cho đợt lưu trú này.
          </div>
        )}
      </div>
    </div>
  );
}
