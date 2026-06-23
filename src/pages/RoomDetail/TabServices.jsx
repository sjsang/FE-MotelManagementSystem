import React, { useState, useEffect } from "react";
import {
  SAVE_STATUS_STYLE,
  formatCurrency,
} from "../../utils/RoomDetailHelpers";

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
  services,
  availableServices,
  newService,
  setNewService,
  saveStatus,
  addServiceFromList,
  addCustomService,
  removeService,
  updateServiceQuantity,
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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: SAVE_STATUS_STYLE[saveStatus].color,
            transition: "color 0.3s",
          }}
        >
          {SAVE_STATUS_STYLE[saveStatus].label}
        </span>
      </div>

      {availableServices.length > 0 && (() => {
        // các service đã có trong danh sách bên dưới (so theo tên)
        const addedNames = new Set(services.map((s) => s.name));

        const handleToggle = (svc) => {
          const idx = services.findIndex((s) => s.name === svc.name);
          if (idx >= 0) {
            removeService(idx); // đã có -> bấm để bỏ chọn, xoá luôn không quan tâm quantity
          } else {
            addServiceFromList(svc); // chưa có -> thêm vào
          }
        };

        const renderBtn = (svc, i) => {
          const isAdded = addedNames.has(svc.name);

          return (
            <button
              key={i}
              onClick={() => handleToggle(svc)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "7px 10px",
                background: isAdded
                  ? "rgba(16,185,129,0.22)"
                  : "rgba(255,255,255,0.03)",

                border: isAdded
                  ? "1px solid rgba(16,185,129,0.65)"
                  : "1px solid rgba(255,255,255,0.08)",

                borderRadius: 8,
                cursor: "pointer",
                width: "100%",
                transition: "border-color 0.12s, background 0.12s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(16,185,129,0.8)";
                e.currentTarget.style.background = isAdded
                  ? "rgba(16,185,129,0.28)"
                  : "rgba(16,185,129,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isAdded
                  ? "rgba(16,185,129,0.65)"
                  : "rgba(255,255,255,0.08)";

                e.currentTarget.style.background = isAdded
                  ? "rgba(16,185,129,0.22)"
                  : "rgba(255,255,255,0.03)";
              }}
            >
              <span style={{ fontSize: 13, color: isAdded ? "#5b54e8" : "#424f42" }}>
                {svc.name}
              </span>
              <span style={{ fontSize: 11, color: "#232636" }}>
                {svc.price.toLocaleString("vi-VN")}đ
              </span>
            </button>
          );
        };

        return (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, color: "#232636", marginBottom: 6 }}>
              Thêm nhanh
            </div>

            {isMobile ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
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
                      renderBtn(
                        availableServices[rowIndex * 2 + 1],
                        rowIndex * 2 + 1
                      )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 14 }} />

      <div className="mb-12 grid grid-cols-1 gap-2 md:grid-cols-[4fr_2fr_1fr_1fr] md:items-end">
        <div>
          <div className="mb-1 text-[13px] text-[#232636]">Tên dịch vụ</div>
          <input
            className="form-control"
            placeholder="Khác..."
            value={newService.name}
            onChange={(e) => setNewService((s) => ({ ...s, name: e.target.value }))}
          />
        </div>

        <div className="flex items-end gap-2 md:contents">
          <div className="flex-1 md:flex-none">
            <div className="mb-1 text-[13px] text-[#232636]">Giá (đ)</div>
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
            <div className="mb-1 text-[13px] text-[#232636] text-center">Số lượng</div>
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
            className="btn btn-primary btn-sm h-[42px] w-[42px] shrink-0  md:w-auto justify-center"
            onClick={addCustomService}
          >
            +
          </button>
        </div>
      </div>

      {services.length > 0 ? (
        <div style={{
          marginTop: "30px",
        }}>
          {services.map((s, i) => (
            <div
              key={s.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span style={{ flex: 1, fontSize: 13 }}>{s.name}</span>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => updateServiceQuantity(i, s.quantity - 1)}
                  style={{
                    width: 30, height: 30, border: "none",
                    background: "rgba(255,255,255,0.05)",
                    color: "#a0a0b0", fontSize: 20, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  −
                </button>
                <span
                  style={{
                    width: 28, textAlign: "center", fontSize: 13, fontWeight: 600,
                    color: "#424f42", background: "transparent",
                    borderLeft: "1px solid rgba(255,255,255,0.08)",
                    borderRight: "1px solid rgba(255,255,255,0.08)",
                    lineHeight: "30px",
                  }}
                >
                  {s.quantity}
                </span>
                <button
                  onClick={() => updateServiceQuantity(i, s.quantity + 1)}
                  style={{
                    width: 30, height: 30, border: "none",
                    background: "rgba(255,255,255,0.05)",
                    color: "#a0a0b0", fontSize: 30, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  +
                </button>
              </div>

              <span style={{ fontSize: 13, fontWeight: 600, minWidth: 72, textAlign: "right" }}>
                {(s.price * s.quantity).toLocaleString("vi-VN")}đ
              </span>

              <button
                onClick={() => removeService(i)}
                style={{
                  background: "none", border: "none",
                  color: "#232636", cursor: "pointer",
                  fontSize: 14, padding: "2px 4px", borderRadius: 4, lineHeight: 1,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#232636"; }}
              >
                ✕
              </button>
            </div>
          ))}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 10,
              paddingTop: 10,
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span style={{ fontWeight: 600 }}>Tổng dịch vụ</span>
            <span style={{ fontWeight: 700, color: "#8b85ff" }}>
              {formatCurrency(serviceTotal)}
            </span>
          </div>
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "20px 0",
            color: "#232636",
            fontSize: 13,

          }}
        >
          Chưa có dịch vụ
        </div>
      )
      }
    </div >
  );
}









