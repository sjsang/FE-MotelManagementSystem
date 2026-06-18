import React, { useState, useEffect } from "react";
import { fmtMoney, fmtHours, calcBillingFromConfig } from "../../utils/pricingHelpers";

export default function PricingPanel({ priceConfig, roomType, shift, bookingType }) {
    const [hours, setHours] = useState(1); // Đặt mặc định là 1 thay vì 1.5 cho tròn
    const [hoursInput, setHoursInput] = useState("1");

    useEffect(() => {
        const defaults = { hourly: 1, overnight: 14, fullday: 24 };
        const h = defaults[bookingType] ?? 1;
        setHours(h);
        setHoursInput(String(h));
    }, [bookingType]);

    const billing = calcBillingFromConfig(
        priceConfig,
        roomType,
        shift,
        bookingType,
        hours
    );

    if (!billing) return null;

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

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <label
                    style={{
                        fontSize: 12,
                        color: "var(--text3)",
                    }}
                >
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


            <div
                style={{ borderTop: "1px solid rgba(108,99,255,0.15)", paddingTop: 10 }}
            >
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
                        {fmtMoney(billing.total)}
                    </span>
                </div>
            </div>

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
        </div>
    );
}