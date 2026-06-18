// Đường dẫn: src/utils/printTemplate.js

export function buildPrintHTML(invoice) {
  const fmt = n => (n || 0).toLocaleString('vi-VN') + 'đ';

  const fmtDate = d => d ? new Date(d).toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric'
  }) : '--';

  const calculateUsageTime = (start, end) => {
    if (!start || !end) return '--';
    const diffMs = new Date(end) - new Date(start);
    if (diffMs <= 0) return '0 phút';

    const totalMins = Math.floor(diffMs / 60000);
    const d = Math.floor(totalMins / 1440);
    const h = Math.floor((totalMins % 1440) / 60);
    const m = totalMins % 60;

    let res = [];
    if (d > 0) res.push(`${d} ngày`);
    if (h > 0) res.push(`${h} giờ`);
    if (m > 0 || (d === 0 && h === 0)) res.push(`${m} phút`);

    return res.join(' ');
  };

  const usageTimeStr = calculateUsageTime(invoice.checkIn, invoice.checkOut);

  const btLabel = {
    hourly: 'Nghỉ giờ',
    overnight: 'Qua đêm',
    fullday: 'Ngày đêm (24h)'
  };

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
  *{
    margin:0;
    padding:0;
    box-sizing:border-box;
  }

  body{
    font-family:'Times New Roman', serif;
    font-size:13px;
    color:#000;
    padding:32px;
    max-width:400px;
    margin:0 auto;
  }

  .center{text-align:center;}

  .hotel-name{
    font-size:18px;
    font-weight:bold;
  }

  .hotel-address{
    font-size:12px;
    margin-top:4px;
  }

  .invoice-title{
    font-size:15px;
    font-weight:bold;
    margin:12px 0 4px;
  }

  .invoice-num{
    font-size:12px;
  }

  hr{
    border:none;
    border-top:1px dashed #000;
    margin:12px 0;
  }

  .row{
    display:flex;
    justify-content:space-between;
    margin-bottom:5px;
    font-size:13px;
  }

  .label{
    color:#000;
  }

  table{
    width:100%;
    border-collapse:collapse;
    font-size:12px;
    margin:8px 0;
  }

  th{
    border-bottom:1px solid #000;
    padding:4px 6px;
    text-align:left;
    font-size:11px;
  }

  td{
    padding:4px 6px;
    border-bottom:1px dotted #ccc;
  }

  .footer{
    margin-top:10px;
    font-size:11px;
    text-align:center;
  }

  .section-title{
    font-size:12px;
    margin:8px 0 2px;
    font-weight:bold;
  }

  .bold{
    font-weight:bold;
  }

  .total{
    font-weight:bold;
  }

  .paid{
    font-weight:bold;
    font-size:14px;
  }

  @media print{
    body{padding:16px;}
  }
</style>
</head>

<body>

<div class="center">
  <div class="hotel-name">NHÀ NGHỈ 79</div>
  <div class="hotel-address">Ấp 7, Xã Khánh An - U Minh, Cà Mau</div>
  <div class="hotel-address">SĐT: 0945 331 109</div>
  <div class="invoice-title">HÓA ĐƠN</div>
  <div class="invoice-num">${invoice.invoiceNumber}</div>
</div>

<hr/>

<div class="row"><span class="label">Phòng</span><span class="bold">${invoice.roomNumber}</span></div>
<div class="row"><span class="label">Khách</span><span>${invoice.guestName}</span></div>
<div class="row"><span class="label">Loại thuê</span><span>${btLabel[invoice.bookingType] || '--'}</span></div>
<div class="row"><span class="label">Nhận phòng</span><span>${fmtDate(invoice.checkIn)}</span></div>
<div class="row"><span class="label">Trả phòng</span><span>${fmtDate(invoice.checkOut)}</span></div>

<hr/>

<div class="row"><span class="label">Giá phòng</span><span>${fmt(invoice.basePrice)}</span></div>
<div class="row"><span class="label">Thời gian sử dụng</span><span>${usageTimeStr}</span></div>

${invoice.extraCharge > 0 ? `
<div class="row"><span class="label">Phụ thu (${invoice.extraHours}h)</span><span>${fmt(invoice.extraCharge)}</span></div>
` : ''}

${(invoice.services || []).length > 0 ? `
<div class="section-title">Dịch vụ</div>
<table>
  <thead>
    <tr>
      <th>Tên</th>
      <th style="text-align:center">SL</th>
      <th style="text-align:right">Đơn giá</th>
      <th style="text-align:right">Thành tiền</th>
    </tr>
  </thead>
  <tbody>
    ${serviceRows}
  </tbody>
</table>

<div class="row">
  <span class="label">Tổng dịch vụ</span>
  <span>${fmt(invoice.servicesCharge)}</span>
</div>
` : ''}

<hr/>

<div class="row total">
  <span>Tổng cộng</span>
  <span>${fmt(invoice.totalAmount)}</span>
</div>

${invoice.discount > 0 ? `
<div class="row">
  <span>Giảm giá</span>
  <span>- ${fmt(invoice.discount)}</span>
</div>
` : ''}

${invoice.tax > 0 ? `
<div class="row">
  <span>Thuế (VAT)</span>
  <span>+ ${fmt(invoice.tax)}</span>
</div>
` : ''}

<div class="row" style="border-top: 1px dashed #ccc; padding-top: 6px; margin-top: 4px;">
  <span style="font-weight:bold; color:#000;">Giá trị thanh toán</span>
  <span style="font-weight:bold;">${fmt(invoice.payableAmount)}</span>
</div>

${invoice.deposit > 0 ? `
<div class="row">
  <span>Tạm ứng</span>
  <span>${fmt(invoice.deposit)}</span>
</div>
` : ''}

<div class="row paid" style="border-top: 1px solid #000; padding-top: 6px; margin-top: 4px;">
  <span>Thực thu</span>
  <span>${fmt(invoice.paidAmount)}</span>
</div>

<hr/>

${invoice.paidAmount > 0 ? `
<div class="center">
  <div class="section-title">QUÉT MÃ THANH TOÁN</div>
  <img
    src="https://qr.sepay.vn/img?acc=945331109&bank=MBBank&amount=${invoice.paidAmount}&des=${invoice.invoiceNumber}"
    style="width:100px;height:100px;object-fit:contain;margin:5px auto;"
  />
</div>

<hr/>
` : ''}

<div class="footer">
  ${invoice.issuedBy ? `Nhân viên: ${invoice.issuedBy} • ` : ''}
  ${fmtDate(invoice.issuedAt)}<br/>
  Cảm ơn quý khách!
</div>

</body>
</html>`;
}