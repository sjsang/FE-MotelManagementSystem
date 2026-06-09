"use client";

import { useState, useMemo } from "react";
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

const QUICK_MINUTES = {
  hourly: [30, 60, 90, 120, 180, 360, 720],
  overnight: [14 * 60, 15 * 60, 16 * 60, 20 * 60, 24 * 60],
  fullday: [24 * 60, 30 * 60, 36 * 60, 48 * 60, 72 * 60, 120 * 60],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ";
}

function fmtDur(m) {
  if (m === 0) return "0 phút";
  const days = Math.floor(m / 1440);
  const hrs = Math.floor((m % 1440) / 60);
  const mins = m % 60;
  const parts = [];
  if (days) parts.push(days + " ngày");
  if (hrs) parts.push(hrs + " giờ");
  if (mins) parts.push(mins + " phút");
  return parts.join(" ");
}

function ceilWithGrace(hours) {
  const fl = Math.floor(hours);
  return hours - fl > 0.25 ? fl + 1 : fl;
}

function calcBilling({ roomType, shift, bookingType, minutes }) {
  const p = PRICES[shift][roomType];
  const hours = minutes / 60;
  let base = 0, extra = 0, extraH = 0, threshold = 0;
  let note = "", breakdowns = [];

  if (bookingType === "fullday") {
    base = p.fullday ?? PRICES.day[roomType].fullday;
    threshold = 24 * 60;
    if (minutes > threshold) {
      extraH = ceilWithGrace(hours - 24);
      extra = extraH * PRICES.lateEarlyFee;
    }
    note = `Gói <b>cả ngày</b>: ${fmt(base)} cho 24 giờ đầu. Vượt quá tính thêm ${fmt(PRICES.lateEarlyFee)}/giờ (grace 15 phút).`;
    breakdowns = [{ l: "Giá cả ngày (≤ 24h)", v: fmt(base), tag: "teal" }];
    if (extraH > 0) breakdowns.push({ l: `Phụ trội ${extraH}h × ${fmt(PRICES.lateEarlyFee)}`, v: fmt(extra), tag: "amber" });

  } else if (bookingType === "overnight") {
    base = p.overnight ?? PRICES.day[roomType].overnight;
    threshold = 14 * 60;
    if (minutes > threshold) {
      extraH = ceilWithGrace(hours - 14);
      extra = extraH * PRICES.lateEarlyFee;
    }
    note = `Gói <b>qua đêm</b>: ${fmt(base)} cho 14 giờ đầu. Vượt quá tính thêm ${fmt(PRICES.lateEarlyFee)}/giờ.`;
    breakdowns = [{ l: "Giá qua đêm (≤ 14h)", v: fmt(base), tag: "teal" }];
    if (extraH > 0) breakdowns.push({ l: `Phụ trội ${extraH}h × ${fmt(PRICES.lateEarlyFee)}`, v: fmt(extra), tag: "amber" });

  } else {
    if (shift === "night") {
      base = p.hourly_first;
      threshold = 60;
      if (minutes > 60) {
        extraH = ceilWithGrace(hours - 1);
        extra = extraH * p.hourly_extra;
      }
      note = `Ca đêm: <b>${fmt(base)}</b> giờ đầu. Từ giờ thứ 2 mỗi giờ thêm ${fmt(p.hourly_extra)} (grace 15 phút).`;
      breakdowns = [{ l: "Giờ đầu tiên", v: fmt(base), tag: "purple" }];
      if (extraH > 0) breakdowns.push({ l: `${extraH} giờ tiếp × ${fmt(p.hourly_extra)}`, v: fmt(extra), tag: "amber" });

    } else {
      threshold = 120;
      if (minutes <= 30) {
        base = p.hourly_first ?? p.hourly_2h ?? 0;
        note = `Ở <b>≤ 30 phút</b>: tính giá mở phòng cố định <b>${fmt(base)}</b>.`;
        breakdowns = [{ l: "Mở phòng (≤ 30 phút)", v: fmt(base), tag: "teal" }];
      } else if (hours <= 2) {
        base = p.hourly_2h ?? p.hourly_first ?? 0;
        note = `Ở <b>30 phút – 2 giờ</b>: tính gói 2 giờ cố định <b>${fmt(base)}</b>.`;
        breakdowns = [{ l: "Gói 2 giờ đầu", v: fmt(base), tag: "teal" }];
      } else {
        base = p.hourly_2h ?? p.hourly_first ?? 0;
        extraH = ceilWithGrace(hours - 2);
        extra = extraH * (p.hourly_extra ?? 0);
        note = `<b>Hơn 2 giờ</b>: gói 2 giờ <b>${fmt(base)}</b> + mỗi giờ thêm ${fmt(p.hourly_extra)} (grace 15 phút).`;
        breakdowns = [{ l: "Gói 2 giờ đầu", v: fmt(base), tag: "teal" }];
        if (extraH > 0) breakdowns.push({ l: `${extraH} giờ tiếp × ${fmt(p.hourly_extra)}`, v: fmt(extra), tag: "amber" });
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

function Timeline({ minutes, threshold, bookingType, shift }) {
  const maxMap = {
    fullday: 5 * 24 * 60,
    overnight: 5 * 24 * 60,
    hourly: shift === "night" ? 12 * 60 : 8 * 60,
  };
  const maxMins = maxMap[bookingType];
  const pct = (v) => Math.min(100, Math.round((v / maxMins) * 100));

  const baseW = pct(Math.min(minutes, threshold));
  const extraOff = pct(Math.min(minutes, threshold));
  const extraW = minutes > threshold ? pct(minutes) - pct(threshold) : 0;

  return (
    <div className={styles.timelineWrap}>
      <div className={styles.timeline}>
        <div className={styles.tlBase} style={{ width: `${baseW}%` }} />
        <div className={styles.tlExtra} style={{ left: `${extraOff}%`, width: `${extraW}%` }} />
        <div className={`${styles.tlLabel} ${styles.tlBaseLbl}`}></div>
        {extraW > 10 && (
          <div className={`${styles.tlLabel} ${styles.tlExtraLbl}`} style={{ left: `${extraOff + 1}%` }}>
          </div>
        )}
      </div>
      <div className={styles.legend}>
        <span><span className={`${styles.legendDot} ${styles.legendDotBase}`} />Trong ngưỡng</span>
        <span><span className={`${styles.legendDot} ${styles.legendDotExtra}`} />Phụ trội</span>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function PricingCalculator() {
  const [roomType, setRoomType] = useState("single");
  const [shift, setShift] = useState("day");
  const [bookingType, setBookingType] = useState("hourly");
  const [minutes, setMinutes] = useState(90);

  const isNight = shift === "night";

  function handleShift(val) {
    setShift(val);
    if (val === "night" && bookingType !== "hourly") setBookingType("hourly");
  }

  const { total, threshold, note, breakdowns } = useMemo(
    () => calcBilling({ roomType, shift, bookingType, minutes }),
    [roomType, shift, bookingType, minutes]
  );

  const quickList = QUICK_MINUTES[bookingType] ?? [];

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

      {/* Thời gian */}
      <div className={styles.card}>
        <p className={styles.sectionLabel}>Thời gian thuê</p>
        <div className={styles.durationWrap}>
          <div className={styles.sliderRow}>
            <input
              type="range"
              className={styles.slider}
              min={0} max={7200} step={5}
              value={Math.min(minutes, 7200)}
              onChange={(e) => setMinutes(parseInt(e.target.value))}
            />
            <div className={styles.durationInputs}>
              <input
                type="number"
                className={styles.numInput}
                min={0}
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
              />
              <span className={styles.unitLabel}>phút</span>
            </div>
          </div>

          <p className={styles.durDisplay}>{fmtDur(minutes)}</p>

          {quickList.length > 0 && (
            <div className={styles.quickBtns}>
              {quickList.map((m) => (
                <button key={m} className={styles.quickBtn} onClick={() => setMinutes(m)}>
                  {fmtDur(m)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Breakdown */}
      <div className={styles.card}>
        <Timeline minutes={minutes} threshold={threshold} bookingType={bookingType} shift={shift} />
        <div className={styles.divider} />
        <p className={styles.sectionLabel}>Chi tiết tính tiền</p>
        <div className={styles.breakdownRows}>
          {breakdowns.map((b, i) => (
            <div key={i} className={styles.rowItem}>
              <span className={styles.rowLabel}>{b.l}</span>
              <span className={styles.rowValue}>{b.v}</span>
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
        dangerouslySetInnerHTML={{ __html: note }}
      />
    </div>
  );
}