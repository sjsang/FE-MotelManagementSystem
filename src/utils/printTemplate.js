// Đường dẫn: src/utils/printTemplate.js

export function buildPrintHTML(invoice) {
    const fmt = n => (n || 0).toLocaleString('vi-VN') + 'đ';

    const fmtDate = d => d ? new Date(d).toLocaleString('vi-VN', {
        hour: '2-digit', minute: '2-digit',
        day: '2-digit', month: '2-digit', year: 'numeric'
    }) : '--';

    // Hàm tính thời gian sử dụng (ngày - giờ - phút)
    const calculateUsageTime = (start, end) => {
        if (!start || !end) return '--';
        const diffMs = new Date(end) - new Date(start);
        if (diffMs <= 0) return '0 phút';

        const totalMins = Math.floor(diffMs / 60000); // Đổi ra tổng số phút
        const d = Math.floor(totalMins / 1440); // 1 ngày = 1440 phút
        const h = Math.floor((totalMins % 1440) / 60);
        const m = totalMins % 60;

        let res = [];
        if (d > 0) res.push(`${d} ngày`);
        if (h > 0) res.push(`${h} giờ`);
        if (m > 0 || (d === 0 && h === 0)) res.push(`${m} phút`);

        return res.join(' ');
    };

    const usageTimeStr = calculateUsageTime(invoice.checkIn, invoice.checkOut);

    const pmLabel = { cash: 'Tiền mặt', transfer: 'Chuyển khoản', card: 'Thẻ' };
    const btLabel = { hourly: 'Nghỉ giờ', overnight: 'Qua đêm', fullday: 'Ngày đêm (24h)' };

    const serviceRows = (invoice.services || []).map(s => `
        <tr>
            <td>${s.name}</td>
            <td style="text-align:center">${s.quantity}</td>
            <td style="text-align:right">${fmt(s.price)}</td>
            <td style="text-align:right">${fmt(s.price * s.quantity)}</td>
        </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <title>Hóa đơn ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', serif; font-size: 13px; color: #111; padding: 32px; max-width: 400px; margin: 0 auto; }
    .center { text-align: center; }
    .hotel-name { font-size: 18px; font-weight: bold; letter-spacing: 1px; }
    .invoice-title { font-size: 15px; font-weight: bold; margin: 12px 0 4px; }
    .invoice-num { font-size: 12px; color: #555; }
    hr { border: none; border-top: 1px dashed #aaa; margin: 12px 0; }
    .row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 13px; }
    .label { color: #555; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 8px 0; }
    th { border-bottom: 1px solid #ccc; padding: 4px 6px; text-align: left; font-size: 11px; color: #555; }
    td { padding: 4px 6px; border-bottom: 1px dotted #eee; }
    .total-row { font-size: 15px; font-weight: bold; }
    .paid-row { font-size: 15px; font-weight: bold; }
    .footer { margin-top: 20px; font-size: 11px; color: #888; text-align: center; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <div class="center">
    <div class="hotel-name">NHÀ NGHỈ 79</div>
    <div class="invoice-title">HÓA ĐƠN</div>
    <div class="invoice-num">${invoice.invoiceNumber}</div>
  </div>

  <hr/>

  <div class="row"><span class="label">Phòng</span><span><b>${invoice.roomNumber}</b> (${invoice.roomType === 'double' ? 'Đôi' : 'Đơn'})</span></div>
  <div class="row"><span class="label">Khách</span><span>${invoice.guestName}</span></div>
  <div class="row"><span class="label">Loại thuê</span><span>${btLabel[invoice.bookingType] || invoice.bookingType || '--'}</span></div>
  <div class="row"><span class="label">Nhận phòng lúc</span><span>${fmtDate(invoice.checkIn)}</span></div>
  <div class="row"><span class="label">Trả phòng lúc</span><span>${fmtDate(invoice.checkOut)}</span></div>

  <hr/>

  <div class="row"><span class="label">Giá phòng</span><span>${fmt(invoice.basePrice)}</span></div>
  <div class="row"><span class="label">Thời gian sử dụng</span><span>${usageTimeStr}</span></div>
  ${invoice.extraCharge > 0 ? `<div class="row"><span class="label">Phụ thu (${invoice.extraHours}h)</span><span>${fmt(invoice.extraCharge)}</span></div>` : ''}

  ${(invoice.services || []).length > 0 ? `
  <div style="margin-top:8px;font-size:11px;color:#555;margin-bottom:2px">Dịch vụ:</div>
  <table>
    <thead><tr><th>Tên</th><th style="text-align:center">SL</th><th style="text-align:right">Đơn giá</th><th style="text-align:right">T.tiền</th></tr></thead>
    <tbody>${serviceRows}</tbody>
  </table>
  <div class="row"><span class="label">Tổng dịch vụ</span><span>${fmt(invoice.servicesCharge)}</span></div>
  ` : ''}

  <hr/>

  <div class="row total-row"><span>Tổng cộng</span><span>${fmt(invoice.totalAmount)}</span></div>
  ${invoice.discount > 0 ? `<div class="row paid-row" style="margin-top:6px"><span>GIẢM GIÁ</span><span>- ${fmt(invoice.discount)}</span></div>` : ''}
  <div class="row paid-row" style="margin-top:6px"><span>THỰC THU</span><span>${fmt(invoice.paidAmount)}</span></div>

  <hr/>

  <div class="footer">
    ${invoice.issuedBy ? `Nhân viên: ${invoice.issuedBy} •` : ''} ${fmtDate(invoice.issuedAt)}<br/>
    Cảm ơn quý khách!
  </div>
</body>
</html>`;
}