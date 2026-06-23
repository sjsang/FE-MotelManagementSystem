import React from "react";
import { formatTime, formatCurrency } from "../../utils/RoomDetailHelpers";

export default function TabCheckout({
  booking, preview, previewLoading, elapsed, serviceTotal,
  discount, setDiscount,
  taxType, setTaxType, taxInput, setTaxInput,
  previewTotal, taxVnd, payableAmount,
  deposit, paidAmount,
  depositOverride = 0, setDepositOverride = () => { },
}) {
  const safeDeposit = depositOverride ?? 0;

  return (
    <div>
      {!booking.is_reported && (
        <div style={{
          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: 10, padding: "10px 14px", marginBottom: 14,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 600 }}>
            ⚠️ Phòng chưa khai báo lưu trú
          </span>
        </div>
      )}

      <div style={{
        background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
        borderRadius: 12, padding: 16, marginBottom: 16,
      }}>
        {/* Giờ vào / ra / thời gian ở */}
        <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {[
            ["Giờ vào", formatTime(booking.checkIn)],
            ["Giờ ra (hiện tại)", formatTime(preview?.checkOutEstimated || new Date())],
            ["Thời gian ở", elapsed.text],
          ].map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 12.5, color: "#6b6f84" }}>{label}</span>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Chi tiết giá */}
        {previewLoading && !preview ? (
          <div style={{ textAlign: "center", padding: "12px 0", color: "#6b6f84", fontSize: 13 }}>
            ⏳ Đang tính...
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, color: "#6b6f84", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Chi tiết
            </div>

            {[
              ["Giá cơ bản", formatCurrency(preview?.basePrice ?? booking.basePrice)],
              ...((preview?.earlyCheckInCharge ?? booking.earlyCheckInCharge ?? 0) > 0 ? [[
                `Vào sớm ${preview?.earlyCheckInHours ? `(${preview.earlyCheckInHours}h)` : ""}`.trim(),
                formatCurrency(preview?.earlyCheckInCharge ?? booking.earlyCheckInCharge),
              ]] : []),
              ...((preview?.extraCharge ?? 0) > 0 ? [[
                `Ra trễ (${preview.extraHours}h)`,
                formatCurrency(preview.extraCharge),
              ]] : []),
              ["Dịch vụ", formatCurrency(preview?.servicesCharge ?? serviceTotal)],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 15, color: "#424f42" }}>{label}</span>
                <span style={{ fontSize: 15 }}>{val}</span>
              </div>
            ))}

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 10, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Tổng cộng</span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{formatCurrency(previewTotal)}</span>
            </div>
          </>
        )}

        {/* Giảm giá */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#f87171" }}>Giảm giá (đ)</span>
          <input
            type="text" className="form-control"
            value={discount === 0 ? "" : discount.toLocaleString("vi-VN")}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              const val = raw ? Number(raw) : 0;
              setDiscount(Math.min(val, previewTotal)); // [+]
            }}
            placeholder="0"
            style={{ width: 110, textAlign: "right", padding: "6px 10px", borderColor: "rgba(248,113,113,0.3)" }}
          />
        </div>

        {/* Thuế / VAT */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b" }}>Thuế / VAT</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <select
              className="form-control" value={taxType}
              onChange={(e) => { setTaxType(e.target.value); setTaxInput(""); }}
              style={{ width: 60, padding: "6px 4px", borderColor: "rgba(245,158,11,0.3)", color: "#f59e0b", fontWeight: 600 }}
            >
              <option value="percent">%</option>
              <option value="vnd">VNĐ</option>
            </select>
            <input
              type="text" className="form-control"
              value={taxType === "percent" ? taxInput : taxInput === "" ? "" : Number(taxInput).toLocaleString("vi-VN")}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                if (!raw) { setTaxInput(""); return; }
                if (taxType === "percent" && Number(raw) > 100) { setTaxInput("100"); return; }
                setTaxInput(raw);
              }}
              placeholder="0"
              style={{ width: 110, textAlign: "right", padding: "6px 10px", borderColor: "rgba(245,158,11,0.3)" }}
            />
          </div>
        </div>

        {taxType === "percent" && taxInput > 0 && (
          <div style={{ textAlign: "right", fontSize: 11.5, color: "#f59e0b", marginTop: 4, fontWeight: 600 }}>
            ≈ + {formatCurrency(taxVnd)}
          </div>
        )}

        {/* Giá trị thanh toán */}
        <div style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: 12, marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Giá trị thanh toán</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#10b981" }}>{formatCurrency(payableAmount)}</span>
        </div>

        {/* Tạm ứng + Thực thu */}
        {(deposit > 0 || safeDeposit >= 0) && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <span style={{ fontSize: 15, color: "#424f42" }}>Tạm ứng</span>
              <input
                type="text" className="form-control"
                value={safeDeposit === 0 ? "" : safeDeposit.toLocaleString("vi-VN")}
                onChange={(e) => { const raw = e.target.value.replace(/\D/g, ""); setDepositOverride(raw ? Number(raw) : 0); }}
                placeholder="0"
                style={{ width: 110, textAlign: "right", padding: "6px 10px", borderColor: "rgba(16,185,129,0.3)" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, paddingTop: 8, borderTop: "1px dashed rgba(255,255,255,0.1)" }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Thực thu</span>
              <span style={{ fontSize: 17, fontWeight: 800, color: "#f59e0b" }}>
                {formatCurrency(Math.max(0, payableAmount - safeDeposit))}
              </span>
            </div>
          </>
        )}
      </div>


    </div>
  );
}