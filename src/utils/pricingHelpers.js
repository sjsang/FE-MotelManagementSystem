// Fallback mặc định khi priceConfig không cấu hình lateEarlyFee — CHỈ dùng khi
// priceConfig.lateEarlyFee không tồn tại, để khớp với booking_controller.js
// (nơi luôn ưu tiên priceConfig.lateEarlyFee ?? 20000). Không dùng hằng số này
// trực tiếp để tính tiền nữa — xem getLateEarlyFee().
export const LATE_EARLY_FEE = 20000;

// Khớp 1:1 với STANDARD_DURATION_HOURS trong booking_controller.js
// overnight: 17h -> 8h sáng hôm sau = 15 giờ
// fullday  : 12h -> 12h trưa hôm sau = 24 giờ
const STANDARD_DURATION_HOURS = {
    overnight: 15,
    fullday: 24,
};

// BUGFIX: trước đây hard-code 20000, không đọc priceConfig.lateEarlyFee nên khi
// admin đổi phí phụ thu giờ trong bảng giá, panel preview vẫn hiển thị sai 20k/giờ
// trong khi backend (booking_controller.js) đã tính đúng theo giá mới.
function getLateEarlyFee(priceConfig) {
    return priceConfig?.lateEarlyFee ?? LATE_EARLY_FEE;
}

export function fmtMoney(n) {
    return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ";
}

export function fmtHours(h) {
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

export function ceilWithGrace(hours) {
    const fl = Math.floor(hours);
    return hours - fl > 0.25 ? fl + 1 : fl;
}

// Lấy giờ trong ngày theo giờ Việt Nam (UTC+7) — copy từ booking_controller.js
// để cả 2 phía dùng chung 1 cách xác định "khách vào lúc mấy giờ".
function getVNHour(date) {
    const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
    return new Date(date.getTime() + VN_OFFSET_MS).getUTCHours();
}

export function calcBillingFromConfig(
    priceConfig,
    roomType,
    shift,
    bookingType,
    hours,
    checkInTime // optional — truyền vào (thường là new Date() lúc check-in) để
    // tái hiện đúng case "khách vào 23h-24h & ở dưới 15h -> tính giá overnight
    // cố định" giống hệt booking_controller.js. Nếu không truyền, hàm vẫn chạy
    // được như cũ (không áp dụng case đặc biệt này).
) {
    if (!priceConfig) return null;
    try {
        const shiftPrices =
            shift === "night" ? priceConfig.nightShift : priceConfig.dayShift;
        const p = roomType === "double" ? shiftPrices.double : shiftPrices.single;
        if (!p) return null;

        const lateEarlyFee = getLateEarlyFee(priceConfig);

        let base = 0,
            extra = 0,
            extraH = 0,
            threshold = 0;
        let breakdowns = [],
            note = "";

        if (bookingType === "fullday") {
            base = p.fullday ?? 0;
            threshold = STANDARD_DURATION_HOURS.fullday; // 24
            if (hours > threshold) {
                extraH = ceilWithGrace(hours - threshold);
                extra = extraH * lateEarlyFee;
            }
            note = `Gói cả ngày: ${fmtMoney(
                base
            )} cho ${threshold} giờ đầu. Vượt quá tính thêm ${fmtMoney(
                lateEarlyFee
            )}/giờ (grace 15 phút).`;
            breakdowns = [{ l: `Giá cả ngày (≤ ${threshold}h)`, v: fmtMoney(base) }];
            if (extraH > 0)
                breakdowns.push({
                    l: `Phụ trội ${extraH}h × ${fmtMoney(lateEarlyFee)}`,
                    v: fmtMoney(extra),
                });
        } else if (bookingType === "overnight") {
            base = p.overnight ?? 0;
            // BUGFIX: ngưỡng cũ là 14, không khớp STANDARD_DURATION_HOURS.overnight
            // (=15) bên booking_controller.js (17h -> 8h sáng hôm sau = 15 giờ).
            threshold = STANDARD_DURATION_HOURS.overnight; // 15
            if (hours > threshold) {
                extraH = ceilWithGrace(hours - threshold);
                extra = extraH * lateEarlyFee;
            }
            note = `Gói qua đêm: ${fmtMoney(
                base
            )} cho ${threshold} giờ đầu. Vượt quá tính thêm ${fmtMoney(
                lateEarlyFee
            )}/giờ.`;
            breakdowns = [{ l: `Giá qua đêm (≤ ${threshold}h)`, v: fmtMoney(base) }];
            if (extraH > 0)
                breakdowns.push({
                    l: `Phụ trội ${extraH}h × ${fmtMoney(lateEarlyFee)}`,
                    v: fmtMoney(extra),
                });
        } else {
            if (shift === "night") {
                // Case đặc biệt giống booking_controller.js: khách vào trong khung
                // 23h-24h và tổng thời gian ở dưới 15 tiếng -> thu trọn gói bằng
                // đúng giá "qua đêm" (không tính theo giờ).
                const checkInHourVN =
                    checkInTime instanceof Date ? getVNHour(checkInTime) : null;
                const isBeforeMidnightArrival =
                    checkInHourVN !== null && checkInHourVN >= 23;

                if (isBeforeMidnightArrival && hours < STANDARD_DURATION_HOURS.overnight) {
                    // Giống booking_controller.js: basePrice = dayPrices.overnight
                    // (luôn lấy từ dayShift, kể cả khi đang ở nhánh ca đêm).
                    const dayPricesForOvernight =
                        roomType === "double"
                            ? priceConfig.dayShift.double
                            : priceConfig.dayShift.single;
                    base = dayPricesForOvernight?.overnight ?? 0;
                    threshold = STANDARD_DURATION_HOURS.overnight;
                    note = `Vào trước nửa đêm (23h-24h) và ở dưới ${threshold}h: tính trọn gói giá qua đêm ${fmtMoney(
                        base
                    )}.`;
                    breakdowns = [{ l: "Giá qua đêm (vào trước 0h)", v: fmtMoney(base) }];
                } else {
                    base = p.hourly_first ?? 0;
                    threshold = 1;
                    if (hours > 1) {
                        extraH = ceilWithGrace(hours - 1);
                        extra = extraH * (p.hourly_extra ?? 0);
                    }
                    note = `Ca đêm: ${fmtMoney(
                        base
                    )} giờ đầu. Từ giờ thứ 2 mỗi giờ thêm ${fmtMoney(
                        p.hourly_extra ?? 0
                    )} (grace 15 phút).`;
                    breakdowns = [{ l: "Giờ đầu tiên", v: fmtMoney(base) }];
                    if (extraH > 0)
                        breakdowns.push({
                            l: `${extraH} giờ tiếp × ${fmtMoney(p.hourly_extra ?? 0)}`,
                            v: fmtMoney(extra),
                        });
                }
            } else {
                threshold = 2;
                const minutes = hours * 60;
                if (minutes <= 30) {
                    base = p.hourly_first ?? p.hourly_2h ?? 0;
                    note = `Ở ≤ 30 phút: tính giá mở phòng cố định ${fmtMoney(base)}.`;
                    breakdowns = [{ l: "Mở phòng (≤ 30 phút)", v: fmtMoney(base) }];
                } else if (hours <= 2) {
                    base = p.hourly_2h ?? p.hourly_first ?? 0;
                    note = `Ở 30 phút – 2 giờ: tính gói 2 giờ cố định ${fmtMoney(base)}.`;
                    breakdowns = [{ l: "Gói 2 giờ đầu", v: fmtMoney(base) }];
                } else {
                    base = p.hourly_2h ?? p.hourly_first ?? 0;
                    extraH = ceilWithGrace(hours - 2);
                    extra = extraH * (p.hourly_extra ?? 0);
                    note = `Hơn 2 giờ: gói 2 giờ ${fmtMoney(
                        base
                    )} + mỗi giờ thêm ${fmtMoney(p.hourly_extra ?? 0)} (grace 15 phút).`;
                    breakdowns = [{ l: "Gói 2 giờ đầu", v: fmtMoney(base) }];
                    if (extraH > 0)
                        breakdowns.push({
                            l: `${extraH} giờ tiếp × ${fmtMoney(p.hourly_extra ?? 0)}`,
                            v: fmtMoney(extra),
                        });
                }
            }
        }

        return { base, extra, total: base + extra, threshold, note, breakdowns };
    } catch {
        return null;
    }
}