export const LATE_EARLY_FEE = 20000;

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

export function calcBillingFromConfig(
    priceConfig,
    roomType,
    shift,
    bookingType,
    hours
) {
    if (!priceConfig) return null;
    try {
        const shiftPrices =
            shift === "night" ? priceConfig.nightShift : priceConfig.dayShift;
        const p = roomType === "double" ? shiftPrices.double : shiftPrices.single;
        if (!p) return null;

        let base = 0,
            extra = 0,
            extraH = 0,
            threshold = 0;
        let breakdowns = [],
            note = "";

        if (bookingType === "fullday") {
            base = p.fullday ?? 0;
            threshold = 24;
            if (hours > threshold) {
                extraH = ceilWithGrace(hours - 24);
                extra = extraH * LATE_EARLY_FEE;
            }
            note = `Gói cả ngày: ${fmtMoney(
                base
            )} cho 24 giờ đầu. Vượt quá tính thêm ${fmtMoney(
                LATE_EARLY_FEE
            )}/giờ (grace 15 phút).`;
            breakdowns = [{ l: "Giá cả ngày (≤ 24h)", v: fmtMoney(base) }];
            if (extraH > 0)
                breakdowns.push({
                    l: `Phụ trội ${extraH}h × ${fmtMoney(LATE_EARLY_FEE)}`,
                    v: fmtMoney(extra),
                });
        } else if (bookingType === "overnight") {
            base = p.overnight ?? 0;
            threshold = 14;
            if (hours > threshold) {
                extraH = ceilWithGrace(hours - 14);
                extra = extraH * LATE_EARLY_FEE;
            }
            note = `Gói qua đêm: ${fmtMoney(
                base
            )} cho 14 giờ đầu. Vượt quá tính thêm ${fmtMoney(LATE_EARLY_FEE)}/giờ.`;
            breakdowns = [{ l: "Giá qua đêm (≤ 14h)", v: fmtMoney(base) }];
            if (extraH > 0)
                breakdowns.push({
                    l: `Phụ trội ${extraH}h × ${fmtMoney(LATE_EARLY_FEE)}`,
                    v: fmtMoney(extra),
                });
        } else {
            if (shift === "night") {
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