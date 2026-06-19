import React, { useState, useEffect } from "react";
import {
  fmtMoney,
  fmtHours,
  calcBillingFromConfig,
} from "../../utils/pricingHelpers";

// Giờ check-in chuẩn cho từng loại (dùng để tính phụ thu check-in sớm)
const STANDARD_CHECKIN_HOUR = {
  overnight: 18,
  fullday: 12,
};

// Tính số giờ check-in sớm so với khung giờ chuẩn (làm tròn lên, grace 15 phút)
function calcEarlyHours(bookingType) {
  const standardHour = STANDARD_CHECKIN_HOUR[bookingType];
  if (standardHour == null) return 0;

  const now = new Date();
  const standard = new Date(now);
  standard.setHours(standardHour, 0, 0, 0);

  if (now >= standard) return 0;

  const earlyMs = standard - now;
  const earlyHoursRaw = earlyMs / (1000 * 60 * 60);
  const floored = Math.floor(earlyHoursRaw);
  // Grace period 15 phút
  return earlyHoursRaw - floored > 0.25 ? floored + 1 : floored;
}

export default function PricingPanel({
  priceConfig,
  roomType,
  shift,
  bookingType,
}) {
  const [hours, setHours] = useState(1);
  const [hoursInput, setHoursInput] = useState("1");
  // earlyH: số giờ check-in sớm tính theo giờ thực tế lúc mở modal
  const [earlyH, setEarlyH] = useState(0);

  // Reset giờ mặc định và tính earlyH mỗi khi bookingType thay đổi
  useEffect(() => {
    const defaults = { hourly: 1, overnight: 14, fullday: 24 };
    const h = defaults[bookingType] ?? 1;
    setHours(h);
    setHoursInput(String(h));
    setEarlyH(calcEarlyHours(bookingType));
  }, [bookingType]);

  const billing = calcBillingFromConfig(
    priceConfig,
    roomType,
    shift,
    bookingType,
    hours
  );

  if (!billing) return null;

  // Tính phụ thu check-in sớm từ priceConfig
  const dayPrices =
    priceConfig?.dayShift?.[roomType === "double" ? "double" : "single"];
  const feePerHour =
    priceConfig?.earlyCheckInFee ??
    dayPrices?.hourly_extra ??
    priceConfig?.lateEarlyFee ??
    20000;
  const earlyCheckInCharge = earlyH * feePerHour;
  const hasEarlyCheckIn =
    earlyH > 0 && (bookingType === "overnight" || bookingType === "fullday");

  const totalWithEarly =
    billing.total + (hasEarlyCheckIn ? earlyCheckInCharge : 0);

  // Label khung giờ chuẩn cho note
  const standardHourLabel =
    bookingType === "overnight"
      ? "18:00"
      : bookingType === "fullday"
      ? "12:00"
      : null;

  return (
    <div
      style={{
        background: "rgba(108,99,255,0.06)",
        border: "1px solid rgba(108,99,255,0.2)",
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 14,
        marginTop: 6,
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#8b85ff",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: 10,
        }}
      >
        Tính tiền dự kiến
      </div>

      {/* Input số giờ */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <label style={{ fontSize: 12, color: "var(--text3)" }}>
          Số giờ nghỉ
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={1}
            value={hoursInput}
            onChange={(e) => {
              setHoursInput(e.target.value);
              const n = parseFloat(e.target.value);
              if (!isNaN(n) && n >= 0) setHours(n);
            }}
            onBlur={() => setHoursInput(String(hours))}
            style={{
              width: 72,
              textAlign: "center",
              fontSize: 18,
              fontWeight: 700,
              padding: "6px 8px",
              border: "1.5px solid rgba(108,99,255,0.4)",
              borderRadius: 8,
              background: "var(--bg3)",
              color: "var(--text)",
              MozAppearance: "textfield",
              appearance: "textfield",
            }}
          />
          <span style={{ fontSize: 13, color: "var(--text3)" }}>giờ</span>
          <span style={{ fontSize: 12, color: "#8b85ff", marginLeft: 4 }}>
            ({fmtHours(hours)})
          </span>
        </div>
      </div>

      {/* Breakdown giá */}
      <div
        style={{ borderTop: "1px solid rgba(108,99,255,0.15)", paddingTop: 10 }}
      >
        {/* Các dòng breakdown từ calcBillingFromConfig */}
        {billing.breakdowns.map((b, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              color: "var(--text3)",
              marginBottom: 4,
            }}
          >
            <span>{b.l}</span>
            <span style={{ fontWeight: 600, color: "var(--text)" }}>{b.v}</span>
          </div>
        ))}

        {/* Dòng phụ thu check-in sớm — chỉ hiện khi có */}
        {hasEarlyCheckIn && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              marginBottom: 4,
            }}
          >
            <span style={{ color: "#f59e0b" }}>
              ⚡ Check-in sớm ({earlyH}h × {fmtMoney(feePerHour)})
            </span>
            <span style={{ fontWeight: 600, color: "#f59e0b" }}>
              +{fmtMoney(earlyCheckInCharge)}
            </span>
          </div>
        )}

        {/* Tổng */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
            paddingTop: 8,
            borderTop: "1px solid rgba(108,99,255,0.15)",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--text3)" }}>
            Tổng dự kiến
          </span>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#8b85ff" }}>
            {fmtMoney(totalWithEarly)}
          </span>
        </div>
      </div>

      {/* Note từ billing gốc */}
      {billing.note && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 10px",
            background: "rgba(245,158,11,0.08)",
            borderRadius: 8,
            fontSize: 12,
            color: "#f59e0b",
            lineHeight: 1.5,
          }}
        >
          {billing.note}
        </div>
      )}

      {/* Note check-in sớm */}
      {hasEarlyCheckIn && (
        <div
          style={{
            marginTop: 8,
            padding: "8px 10px",
            background: "rgba(245,158,11,0.08)",
            borderRadius: 8,
            fontSize: 12,
            color: "#f59e0b",
            lineHeight: 1.5,
          }}
        >
          ⚡ Khách check-in sớm hơn {earlyH} giờ so với khung giờ chuẩn (
          {standardHourLabel}). Phụ thu{" "}
          <strong>{fmtMoney(earlyCheckInCharge)}</strong> đã được cộng vào tổng.
        </div>
      )}
    </div>
  );
}
