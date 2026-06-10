"use client";

import { useState, useMemo, useEffect } from "react";
import styles from "./PricingCalculator.module.css";

// ─── Dữ liệu giá ────────────────────────────────────────────────────────────
const PRICES = {
  day: {
    single: { fullday: 300000, overnight: 200000, hourly_first: 80000, hourly_2h: 100000, hourly_extra: 20000 },
    double: { fullday: 450000, overnight: 350000, hourly_first: null, hourly_2h: 150000, hourly_extra: 30000 },
  },
  night: {
    single: { hourly_first: 120000, hourly_extra: 40000 },
    double: { hourly_first: 150000, hourly_extra: 50000 },
  },
  lateEarlyFee: 20000,
};

// Quick pick tính bằng GIỜ (thay vì phút)
const QUICK_HOURS = {
  hourly: [0.5, 1, 1.5, 2, 3, 6, 12],
  overnight: [14, 15, 16, 20, 24],
  fullday: [24, 30, 36, 48, 72, 120],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ";
}

function fmtHours(h) {
  if (h === 0) return "0 giờ";
  const days = Math.floor(h / 24);
  const hrs = Math.floor(h % 24);
  const mins = Math.round((h % 1) * 60);
  const parts = [];
  if (days) parts.push(days + " ngày");
  if (hrs) parts.push(hrs + " giờ");
  if (mins) parts.push(mins + " phút");
  return parts.join(" ");
}

// Tách date string "YYYY-MM-DD" và time string "HH:MM" từ Date
function splitDatetime(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function combineDatetime(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00`);
}

function ceilWithGrace(hours) {
  const fl = Math.floor(hours);
  return hours - fl > 0.25 ? fl + 1 : fl;
}

function calcBilling({ roomType, shift, bookingType, hours }) {
  const minutes = hours * 60;
  const p = PRICES[shift][roomType];
  let base = 0, extra = 0, extraH = 0, threshold = 0;
  let note = "", breakdowns = [];

  if (bookingType === "fullday") {
    base = p.fullday ?? PRICES.day[roomType].fullday;
    threshold = 24;
    if (hours > threshold) {
      extraH = ceilWithGrace(hours - 24);
      extra = extraH * PRICES.lateEarlyFee;
    }
    note = `Gói <b>cả ngày</b>: ${fmt(base)} cho 24 giờ đầu. Vượt quá tính thêm ${fmt(PRICES.lateEarlyFee)}/giờ (grace 15 phút).`;
    breakdowns = [{ l: "Giá cả ngày (≤ 24h)", v: fmt(base) }];
    if (extraH > 0) breakdowns.push({ l: `Phụ trội ${extraH}h × ${fmt(PRICES.lateEarlyFee)}`, v: fmt(extra) });

  } else if (bookingType === "overnight") {
    base = p.overnight ?? PRICES.day[roomType].overnight;
    threshold = 14;
    if (hours > threshold) {
      extraH = ceilWithGrace(hours - 14);
      extra = extraH * PRICES.lateEarlyFee;
    }
    note = `Gói <b>qua đêm</b>: ${fmt(base)} cho 14 giờ đầu. Vượt quá tính thêm ${fmt(PRICES.lateEarlyFee)}/giờ.`;
    breakdowns = [{ l: "Giá qua đêm (≤ 14h)", v: fmt(base) }];
    if (extraH > 0) breakdowns.push({ l: `Phụ trội ${extraH}h × ${fmt(PRICES.lateEarlyFee)}`, v: fmt(extra) });

  } else {
    if (shift === "night") {
      base = p.hourly_first;
      threshold = 1;
      if (hours > 1) {
        extraH = ceilWithGrace(hours - 1);
        extra = extraH * p.hourly_extra;
      }
      note = `Ca đêm: <b>${fmt(base)}</b> giờ đầu. Từ giờ thứ 2 mỗi giờ thêm ${fmt(p.hourly_extra)} (grace 15 phút).`;
      breakdowns = [{ l: "Giờ đầu tiên", v: fmt(base) }];
      if (extraH > 0) breakdowns.push({ l: `${extraH} giờ tiếp × ${fmt(p.hourly_extra)}`, v: fmt(extra) });

    } else {
      threshold = 2;
      if (minutes <= 30) {
        base = p.hourly_first ?? p.hourly_2h ?? 0;
        note = `Ở <b>≤ 30 phút</b>: tính giá mở phòng cố định <b>${fmt(base)}</b>.`;
        breakdowns = [{ l: "Mở phòng (≤ 30 phút)", v: fmt(base) }];
      } else if (hours <= 2) {
        base = p.hourly_2h ?? p.hourly_first ?? 0;
        note = `Ở <b>30 phút – 2 giờ</b>: tính gói 2 giờ cố định <b>${fmt(base)}</b>.`;
        breakdowns = [{ l: "Gói 2 giờ đầu", v: fmt(base) }];
      } else {
        base = p.hourly_2h ?? p.hourly_first ?? 0;
        extraH = ceilWithGrace(hours - 2);
        extra = extraH * (p.hourly_extra ?? 0);
        note = `<b>Hơn 2 giờ</b>: gói 2 giờ <b>${fmt(base)}</b> + mỗi giờ thêm ${fmt(p.hourly_extra)} (grace 15 phút).`;
        breakdowns = [{ l: "Gói 2 giờ đầu", v: fmt(base) }];
        if (extraH > 0) breakdowns.push({ l: `${extraH} giờ tiếp × ${fmt(p.hourly_extra)}`, v: fmt(extra) });
      }
    }
  }

  return { base, extra, extraH, total: base + extra, threshold, note, breakdowns };
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function SegGroup({ options, value, onChange }) {
  return (
    <div className={styles.segGroup}>
      {options.map((opt, i) => (
        <button
          key={opt.value}
          disabled={opt.disabled}
          className={[
            styles.segBtn,
            value === opt.value ? styles.segBtnActive : "",
            i === 0 ? styles.segFirst : "",
            i === options.length - 1 ? styles.segLast : "",
          ].join(" ")}
          onClick={() => !opt.disabled && onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Timeline({ hours, threshold, bookingType, shift }) {
  const maxMap = {
    fullday: 5 * 24,
    overnight: 5 * 24,
    hourly: shift === "night" ? 12 : 8,
  };
  const maxH = maxMap[bookingType];
  const pct = (v) => Math.min(100, Math.round((v / maxH) * 100));

  const baseW = pct(Math.min(hours, threshold));
  const extraOff = pct(Math.min(hours, threshold));
  const extraW = hours > threshold ? pct(hours) - pct(threshold) : 0;

  return (
    <div className={styles.timelineWrap}>
      <div className={styles.timeline}>
        <div className={styles.tlBase} style={{ width: `${baseW}%` }} />
        <div className={styles.tlExtra} style={{ left: `${extraOff}%`, width: `${extraW}%` }} />
      </div>
      <div className={styles.legend}>
        <span><span className={`${styles.legendDot} ${styles.legendDotBase}`} />Trong ngưỡng</span>
        <span><span className={`${styles.legendDot} ${styles.legendDotExtra}`} />Phụ trội</span>
      </div>
    </div>
  );
}

// Picker ngày + giờ tách riêng — đảm bảo 24h, chữ to, dễ bấm
function DateTimePicker({ label, dateVal, timeVal, onDateChange, onTimeChange, minDate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text, #222)" }}>{label}</span>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="date"
          value={dateVal}
          min={minDate}
          onChange={(e) => onDateChange(e.target.value)}
          style={pickerStyle}
        />
        <input
          type="time"
          value={timeVal}
          step={60}
          onChange={(e) => onTimeChange(e.target.value)}
          style={{ ...pickerStyle, width: 110 }}
        />
      </div>
    </div>
  );
}

const pickerStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1.5px solid var(--border, #ccc)",
  fontSize: 18,
  fontWeight: 500,
  background: "var(--surface, #fff)",
  color: "var(--text, #222)",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "textfield",
  touchAction: "manipulation",
  minHeight: 48,
};

// ─── Main component ──────────────────────────────────────────────────────────
export default function PricingCalculator() {
  const [roomType, setRoomType] = useState("single");
  const [shift, setShift] = useState("day");
  const [bookingType, setBookingType] = useState("hourly");
  // Đơn vị GIỜ (float), mặc định 1.5h
  const [hours, setHours] = useState(1.5);
  const [hoursInput, setHoursInput] = useState("1.5");

  // Time picker — luôn hiển thị
  const useTimePicker = true;
  const [ciDate, setCiDate] = useState(() => splitDatetime(new Date()).date);
  const [ciTime, setCiTime] = useState(() => splitDatetime(new Date()).time);
  const [coDate, setCoDate] = useState(() => splitDatetime(new Date(Date.now() + 1.5 * 3600000)).date);
  const [coTime, setCoTime] = useState(() => splitDatetime(new Date(Date.now() + 1.5 * 3600000)).time);

  const isNight = shift === "night";

  // Sync minutes từ time picker
  useEffect(() => {
    if (!useTimePicker) return;
    const ci = combineDatetime(ciDate, ciTime);
    const co = combineDatetime(coDate, coTime);
    const diff = (co - ci) / 3600000;
    if (diff > 0) {
      const rounded = Math.round(diff * 4) / 4; // làm tròn 15 phút
      setHours(rounded);
      setHoursInput(String(rounded));
    }
  }, [ciDate, ciTime, coDate, coTime, useTimePicker]);

  function handleHoursInput(val) {
    setHoursInput(val);
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0) setHours(n);
  }

  function handleShift(val) {
    setShift(val);
    if (val === "night" && bookingType !== "hourly") setBookingType("hourly");
  }

  const checkOutInvalid = useTimePicker &&
    combineDatetime(coDate, coTime) <= combineDatetime(ciDate, ciTime);

  const { total, threshold, note, breakdowns } = useMemo(
    () => calcBilling({ roomType, shift, bookingType, hours }),
    [roomType, shift, bookingType, hours]
  );

  const quickList = QUICK_HOURS[bookingType] ?? [];

  return (
    <div className={styles.container}>

      {/* Loại phòng */}
      <div className={styles.card}>
        <SegGroup
          value={roomType}
          onChange={setRoomType}
          options={[
            { value: "single", label: "Phòng đơn" },
            { value: "double", label: "Phòng đôi" },
          ]}
        />
      </div>

      {/* Ca */}
      <div className={styles.card}>
        <SegGroup
          value={shift}
          onChange={handleShift}
          options={[
            { value: "day", label: "Ca ngày (5h–23h)" },
            { value: "night", label: "Ca đêm (23h–5h)" },
          ]}
        />
      </div>

      {/* Kiểu thuê */}
      <div className={styles.card}>
        <SegGroup
          value={bookingType}
          onChange={setBookingType}
          options={[
            { value: "hourly", label: "Theo giờ" },
            { value: "overnight", label: "Qua đêm", disabled: isNight },
            { value: "fullday", label: "Cả ngày", disabled: isNight },
          ]}
        />
      </div>

      {/* Thời gian thuê */}
      <div className={styles.card}>
        <p className={styles.sectionLabel}>Thời gian thuê</p>
        <div className={styles.durationWrap}>

          {/* Slider + input giờ */}
          <div className={styles.sliderRow}>
            <input
              type="range"
              className={styles.slider}
              min={0} max={120} step={0.25}
              value={Math.min(hours, 120)}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setHours(v);
                setHoursInput(String(v));
              }}
            />
            <div className={styles.durationInputs}>
              <input
                type="number"
                inputMode="decimal"
                className={styles.numInput}
                min={0}
                step={0.5}
                value={hoursInput}
                onChange={(e) => handleHoursInput(e.target.value)}
                onBlur={() => setHoursInput(String(hours))}
                style={{
                  MozAppearance: "textfield",
                  appearance: "textfield",
                  WebkitAppearance: "none",
                  fontSize: 20,
                  fontWeight: 600,
                  minHeight: 48,
                  width: 72,
                  textAlign: "center",
                }}
              />
              <span className={styles.unitLabel} style={{ fontSize: 16 }}>giờ</span>
            </div>
          </div>

          {/* Hiển thị tổng thời gian dạng chữ */}
          <p className={styles.durDisplay} style={{ fontSize: 17, marginTop: 4 }}>
            {fmtHours(hours)}
          </p>

          {/* Quick pick */}
          {quickList.length > 0 && (
            <div className={styles.quickBtns}>
              {quickList.map((h) => (
                <button
                  key={h}
                  className={styles.quickBtn}
                  style={{ fontSize: 15, padding: "8px 14px", minHeight: 44 }}
                  onClick={() => { setHours(h); setHoursInput(String(h)); }}
                >
                  {fmtHours(h)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Check-in / Check-out picker — luôn hiển thị */}
      <div className={styles.card}>
        <p className={styles.sectionLabel} style={{ marginBottom: 12 }}>Check-in / Check-out</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <DateTimePicker
            label="🟢 Check-in"
            dateVal={ciDate}
            timeVal={ciTime}
            onDateChange={setCiDate}
            onTimeChange={setCiTime}
          />
          <DateTimePicker
            label="🔴 Check-out"
            dateVal={coDate}
            timeVal={coTime}
            minDate={ciDate}
            onDateChange={setCoDate}
            onTimeChange={setCoTime}
          />
          {checkOutInvalid && (
            <p style={{ margin: 0, fontSize: 15, color: "#e53e3e", fontWeight: 500 }}>
              ⚠ Check-out phải sau Check-in
            </p>
          )}
          {!checkOutInvalid && (
            <p style={{ margin: 0, fontSize: 15, color: "var(--text-secondary, #555)" }}>
              ⏱ Thời gian: <b>{fmtHours(hours)}</b>
            </p>
          )}
        </div>
      </div>

      {/* Breakdown */}
      <div className={styles.card}>
        <Timeline hours={hours} threshold={threshold} bookingType={bookingType} shift={shift} />
        <div className={styles.divider} />
        <p className={styles.sectionLabel}>Chi tiết tính tiền</p>
        <div className={styles.breakdownRows}>
          {breakdowns.map((b, i) => (
            <div key={i} className={styles.rowItem}>
              <span className={styles.rowLabel} style={{ fontSize: 15 }}>{b.l}</span>
              <span className={styles.rowValue} style={{ fontSize: 15 }}>{b.v}</span>
            </div>
          ))}
        </div>
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Tổng (chưa có dịch vụ)</span>
          <span className={styles.totalValue}>{fmt(total)}</span>
        </div>
      </div>

      {/* Giải thích */}
      <div
        className={styles.explainBox}
        style={{ fontSize: 15 }}
        dangerouslySetInnerHTML={{ __html: note }}
      />
    </div>
  );
}