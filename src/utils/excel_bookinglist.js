export function exportBookingsToExcel(bookings, customers) {
  // 1. Tạo bản đồ tra cứu khách hàng theo _id, cccd và passport để tối ưu hiệu năng
  const customerMapById = {};
  const customerMapByCard = {};
  
  customers.forEach(c => {
    if (c._id) customerMapById[c._id] = c;
    if (c.cccd) customerMapByCard[c.cccd] = c;
    if (c.passport) customerMapByCard[c.passport] = c;
  });

  // 2. Lọc các booking và giải nén danh sách khách người Việt Nam
  const rows = [];
  bookings.forEach(b => {
    // Ưu tiên dùng guestCustomerId mới để tra cứu chính xác bằng MongoDB ID
    const guestCustIds = b.guestCustomerId ? b.guestCustomerId.split(',').map(s => s.trim()) : [];
    
    if (guestCustIds.length > 0) {
      guestCustIds.forEach(cid => {
        const cust = customerMapById[cid];
        if (cust && (cust.quoctich === 'Việt Nam' || cust.quoctich === 'VNM - Viet Nam')) {
          rows.push({
            booking: b,
            customer: cust
          });
        }
      });
    } else {
      // Fallback cho dữ liệu cũ (tra cứu bằng CCCD/Passport)
      if (!b.guestId) return;
      const guestIds = b.guestId.split(',').map(s => s.trim());

      guestIds.forEach(gid => {
        const cust = customerMapByCard[gid];
        if (cust && (cust.quoctich === 'Việt Nam' || cust.quoctich === 'VNM - Viet Nam')) {
          rows.push({
            booking: b,
            customer: cust
          });
        }
      });
    }
  });

  // 3. Thiết lập mã HTML giả lập Excel XML có cấu trúc chuẩn giống mẫu
  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Khach Luu Tru VN</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table {
          border-collapse: collapse;
        }
        th {
          border: 0.5pt solid #000000;
          font-family: "Times New Roman", Times, serif;
          font-size: 10pt;
          font-weight: bold;
          text-align: center;
          vertical-align: middle;
          background-color: #f2f2f2;
          padding: 5px;
        }
        td {
          border: 0.5pt solid #000000;
          font-family: "Times New Roman", Times, serif;
          font-size: 10pt;
          text-align: center;
          vertical-align: middle;
          padding: 5px;
        }
        .title {
          font-size: 14pt;
          font-weight: bold;
          text-align: center;
          border: none;
        }
      </style>
    </head>
    <body>
      <table>
        <!-- Dòng Tiêu Đề Lớn -->
        <tr>
          <td colspan="21" class="title" style="height: 35px; font-size: 14pt; font-weight: bold; text-align: center;">
            QUẢN LÝ KHÁCH LƯU TRÚ
          </td>
        </tr>
        <tr><td colspan="21" style="border: none; height: 10px;"></td></tr>
        
        <!-- Hàng Tiêu Đề Cột Cấp 1 -->
        <tr>
          <th rowspan="2" style="width: 45px;">STT</th>
          <th rowspan="2" style="width: 180px;">HỌ VÀ TÊN KHÁCH LƯU TRÚ</th>
          <th colspan="2">NGÀY, THÁNG, NĂM SINH</th>
          <th rowspan="2" style="width: 90px;">QUỐC TỊCH</th>
          <th colspan="3">SỐ CCCD, NGÀY CẤP, NƠI CẤP</th>
          <th rowspan="2" style="width: 250px;">ĐỊA CHỈ THƯỜNG TRÚ (TRƯỚC SÁP NHẬP)</th>
          <th rowspan="2" style="width: 220px;">ĐỊA CHỈ CHI TIẾT (TRƯỚC SÁP NHẬP)</th>
          <th rowspan="2" style="width: 150px;">TỈNH THÀNH PHỐ</th>
          <th rowspan="2" style="width: 180px;">PHƯỜNG/XÃ/BẢN KHU</th>
          <th rowspan="2" style="width: 220px;">ĐỊA CHỈ CHI TIẾT (SAU SÁP NHẬP)</th>
          <th colspan="4">THỜI GIAN LƯU TRÚ</th>
          <th rowspan="2" style="width: 80px;">SỐ PHÒNG LƯU TRÚ</th>
          <th rowspan="2" style="width: 280px;">HỌ VÀ TÊN NGƯỜI THÔNG BÁO LƯU TRÚ; THỜI GIAN THÔNG BÁO LƯU TRÚ</th>
          <th rowspan="2" style="width: 280px;">HỌ VÀ TÊN CÁN BỘ CÔNG AN TIẾP NHẬN THÔNG BÁO (NẾU THÔNG BÁO TRỰC TIẾP)</th>
          <th rowspan="2" style="width: 150px;">GHI CHÚ</th>
        </tr>
        
        <!-- Hàng Tiêu Đề Cột Cấp 2 -->
        <tr>
          <th style="width: 90px;">NAM</th>
          <th style="width: 90px;">NỮ</th>
          <th style="width: 110px;">CCCD</th>
          <th style="width: 90px;">NGÀY CẤP</th>
          <th style="width: 130px;">NƠI CẤP</th>
          <th style="width: 80px;">ĐẾN: GIỜ, PHÚT</th>
          <th style="width: 110px;">ĐẾN: NGÀY, THÁNG, NĂM</th>
          <th style="width: 80px;">ĐI: GIỜ, PHÚT</th>
          <th style="width: 110px;">ĐI: NGÀY, THÁNG, NĂM</th>
        </tr>
  `;

  // 4. Sinh các hàng dữ liệu từ danh sách đã lọc
  rows.forEach((r, idx) => {
    const cust = r.customer;
    const b = r.booking;

    const dobStr = cust.ngaythangnamsinh ? formatExcelDate(cust.ngaythangnamsinh) : '';
    const isNam = cust.gioitinh === 'Nam';

    // Địa chỉ Trước sáp nhập
    let thuongTruVal = cust.thuongtrucu || cust.thuongtru || '';
    let diaChiChiTietVal = cust.diachichitietcu || cust.diachichitiet || '';

    // LOGIC TỰ ĐỘNG PHÂN TÁCH: Nếu địa chỉ chi tiết trống nhưng địa chỉ thường trú chứa chuỗi gộp (từ 4 phần trở lên)
    if (!diaChiChiTietVal.trim() && thuongTruVal.includes(',')) {
      const parts = thuongTruVal.split(',').map(s => s.trim());
      if (parts.length >= 4) {
        diaChiChiTietVal = parts[0]; // Phần đầu tiên (Số nhà/Khu phố) đưa vào Địa chỉ chi tiết
        thuongTruVal = parts.slice(1).join(', '); // Phần còn lại đưa vào Địa chỉ thường trú
      }
    }

    // Địa chỉ Sau sáp nhập (Tỉnh thành mới, Phường xã mới, Chi tiết mới)
    let tinhThanhMoiVal = '';
    let phuongXaMoiVal = '';
    let diaChiChiTietMoiVal = cust.diachichitietmoi || '';

    if (cust.thuongtrumoi) {
      const parts = cust.thuongtrumoi.split(',').map(s => s.trim());
      if (parts.length >= 1) {
        tinhThanhMoiVal = parts[parts.length - 1] || '';
      }
      if (parts.length >= 2) {
        phuongXaMoiVal = parts[parts.length - 2] || '';
      }
    }

    // Fall back to expectedCheckOut if checkOut is empty (for active bookings)
    // If expectedCheckOut is also missing, fall back to checkIn + 1 day at 00:00
    let finalCheckOut = b.checkOut;
    if (!finalCheckOut) {
      if (b.expectedCheckOut) {
        finalCheckOut = b.expectedCheckOut;
      } else {
        const fallback = new Date(b.checkIn);
        fallback.setDate(fallback.getDate() + 1);
        fallback.setHours(0, 0, 0, 0);
        finalCheckOut = fallback;
      }
    }

    const checkInTime = formatExcelTime(b.checkIn);
    const checkInDate = formatExcelDate(b.checkIn);
    const checkOutTime = formatExcelTime(finalCheckOut);
    const checkOutDate = formatExcelDate(finalCheckOut);

    const ngayCapStr = cust.ngaycap ? formatExcelDate(cust.ngaycap) : '';
    const noiCapStr = cust.noicap || '';

    // Thông tin người báo lưu trú + Thời gian báo
    const reporterName = b.reported_by || 'Quản trị viên';
    const reportTimeStr = b.reported ? formatExcelTime(b.reported) + ' ' + formatExcelDate(b.reported) : '';
    const reporterInfo = b.is_reported ? `${reporterName}; ${reportTimeStr}` : 'Chưa khai báo';

    html += `
        <tr>
          <td>${idx + 1}</td>
          <td style="text-align: left;">${cust.hoten}</td>
          <!-- Nếu là Nam thì xuất ngày sinh vào cột NAM, ngược lại Nữ vào cột NỮ -->
          <td style="mso-number-format:'\\@';">${isNam ? dobStr : ''}</td>
          <td style="mso-number-format:'\\@';">${!isNam ? dobStr : ''}</td>
          <td>${cust.quoctich}</td>
          <!-- Ép định dạng Text bằng mso-number-format để không bị Excel tự động cắt mất số 0 đầu tiên -->
          <td style="mso-number-format:'\\@';">${cust.cccd || ''}</td>
          <td style="mso-number-format:'\\@';">${ngayCapStr}</td>
          <td style="text-align: left;">${noiCapStr}</td>
          <td style="text-align: left;">${thuongTruVal}</td>
          <td style="text-align: left;">${diaChiChiTietVal}</td>
          <td style="text-align: left;">${tinhThanhMoiVal}</td>
          <td style="text-align: left;">${phuongXaMoiVal}</td>
          <td style="text-align: left;">${diaChiChiTietMoiVal}</td>
          <td style="mso-number-format:'\\@';">${checkInTime}</td>
          <td style="mso-number-format:'\\@';">${checkInDate}</td>
          <td style="mso-number-format:'\\@';">${checkOutTime}</td>
          <td style="mso-number-format:'\\@';">${checkOutDate}</td>
          <td style="font-weight: bold;">${b.roomNumber}</td>
          <td style="text-align: left;">${reporterInfo}</td>
          <td></td>
          <td></td>
        </tr>
    `;
  });

  html += `
      </table>
    </body>
    </html>
  `;

  // 5. Xuất file bằng Blob
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Danh_sach_khach_luu_tru_${new Date().toISOString().split('T')[0]}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}

function formatExcelTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatExcelDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function exportLuutruToExcel(bookings, customers) {
  // 1. Tạo bản đồ tra cứu khách hàng để tối ưu hiệu năng tìm kiếm
  const customerMapById = {};
  const customerMapByCard = {};
  customers.forEach(c => {
    if (c._id) customerMapById[c._id] = c;
    if (c.cccd) customerMapByCard[c.cccd] = c;
    if (c.passport) customerMapByCard[c.passport] = c;
  });

  // 2. Lọc các booking và giải nén danh sách khách người Việt Nam
  const rows = [];
  bookings.forEach(b => {
    // Ưu tiên dùng guestCustomerId mới để tra cứu chính xác bằng MongoDB ID
    const guestCustIds = b.guestCustomerId ? b.guestCustomerId.split(',').map(s => s.trim()) : [];
    
    if (guestCustIds.length > 0) {
      guestCustIds.forEach(cid => {
        const cust = customerMapById[cid];
        if (cust && (cust.quoctich === 'Việt Nam' || cust.quoctich === 'VNM - Viet Nam')) {
          rows.push({
            booking: b,
            customer: cust
          });
        }
      });
    } else {
      // Fallback cho dữ liệu cũ (tra cứu bằng CCCD/Passport)
      if (!b.guestId) return;
      const guestIds = b.guestId.split(',').map(s => s.trim());

      guestIds.forEach(gid => {
        const cust = customerMapByCard[gid];
        if (cust && (cust.quoctich === 'Việt Nam' || cust.quoctich === 'VNM - Viet Nam')) {
          rows.push({
            booking: b,
            customer: cust
          });
        }
      });
    }
  });

  // 3. Thiết lập mã HTML giả lập Excel XML có cấu trúc chuẩn giống mẫu
  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Khach Luu Tru VN</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table {
          border-collapse: collapse;
        }
        th {
          border: 0.5pt solid #000000;
          font-family: "Times New Roman", Times, serif;
          font-size: 10pt;
          font-weight: bold;
          text-align: center;
          vertical-align: middle;
          background-color: #f2f2f2;
          padding: 5px;
        }
        td {
          border: 0.5pt solid #000000;
          font-family: "Times New Roman", Times, serif;
          font-size: 10pt;
          text-align: center;
          vertical-align: middle;
          padding: 5px;
        }
        .title {
          font-size: 14pt;
          font-weight: bold;
          text-align: center;
          border: none;
        }
      </style>
    </head>
    <body>
      <table>
        <!-- Dòng Tiêu Đề Lớn -->
        <tr>
          <td colspan="21" class="title" style="height: 35px; font-size: 14pt; font-weight: bold; text-align: center;">
            DANH SÁCH THÔNG BÁO LƯU TRÚ CHO CÔNG DÂN VIỆT NAM
          </td>
        </tr>
        <tr>
          <td colspan="21" style="font-size: 10pt; font-style: italic; color: red; text-align: center; border: none; height: 20px;">
            (*Lưu ý: Người khai báo chịu trách nhiệm trước pháp luật về các nội dung thông tin cung cấp)
          </td>
        </tr>
        <tr><td colspan="21" style="border: none; height: 10px;"></td></tr>
        
        <!-- Hàng Tiêu Đề Cột -->
        <tr>
          <th style="width: 45px;">STT</th>
          <th style="width: 180px;">HỌ TÊN (*)</th>
          <th style="width: 90px;">NGÀY SINH (*)</th>
          <th style="width: 90px;">GIỚI TÍNH (*)</th>
          <th style="width: 110px;">QUỐC TỊCH (*)</th>
          <th style="width: 150px;">LOẠI GIẤY TỜ (*)</th>
          <th style="width: 150px;">TÊN GIẤY TỜ</th>
          <th style="width: 120px;">SỐ GIẤY TỜ (*)</th>
          <th style="width: 100px;">SỐ ĐIỆN THOẠI</th>
          <th style="width: 150px;">NƠI CƯ TRÚ HIỆN NAY</th>
          <th style="width: 250px;">ĐỊA CHỈ THƯỜNG TRÚ (TRƯỚC SÁP NHẬP)</th>
          <th style="width: 220px;">ĐỊA CHỈ CHI TIẾT (TRƯỚC SÁP NHẬP)</th>
          <th style="width: 150px;">TỈNH THÀNH PHỐ</th>
          <th style="width: 180px;">PHƯỜNG/XÃ/BẢN KHU</th>
          <th style="width: 220px;">ĐỊA CHỈ CHI TIẾT (SAU SÁP NHẬP)</th>
          <th style="width: 100px;">NGÀY ĐẾN (*)</th>
          <th style="width: 120px;">NGÀY ĐI DỰ KIẾN (*)</th>
          <th style="width: 80px;">SỐ PHÒNG/ KHÓA</th>
          <th style="width: 150px;">LÝ DO CƯ TRÚ (*)</th>
          <th style="width: 150px;">NHẬP LÝ DO</th>
          <th style="width: 150px;">GHI CHÚ</th>
        </tr>
  `;

  // 4. Sinh các hàng dữ liệu thực tế
  rows.forEach((r, idx) => {
    const cust = r.customer;
    const b = r.booking;

    const dobStr = cust.ngaythangnamsinh ? formatExcelDate(cust.ngaythangnamsinh) : '';

    // Giới tính
    let gioitinhVal = '';
    if (cust.gioitinh === 'Nam' || cust.gioitinh === 'M') {
      gioitinhVal = 'M - Nam';
    } else if (cust.gioitinh === 'Nữ' || cust.gioitinh === 'F') {
      gioitinhVal = 'F - Nữ';
    } else {
      gioitinhVal = cust.gioitinh || '';
    }

    // Địa chỉ Trước sáp nhập
    let thuongTruVal = cust.thuongtrucu || cust.thuongtru || '';
    let diaChiChiTietVal = cust.diachichitietcu || cust.diachichitiet || '';

    // LOGIC TỰ ĐỘNG PHÂN TÁCH: Nếu địa chỉ chi tiết trống nhưng địa chỉ thường trú chứa chuỗi gộp (từ 4 phần trở lên)
    if (!diaChiChiTietVal.trim() && thuongTruVal.includes(',')) {
      const parts = thuongTruVal.split(',').map(s => s.trim());
      if (parts.length >= 4) {
        diaChiChiTietVal = parts[0]; // Phần đầu tiên (Số nhà/Khu phố) đưa vào Địa chỉ chi tiết
        thuongTruVal = parts.slice(1).join(', '); // Phần còn lại đưa vào Địa chỉ thường trú
      }
    }

    // Địa chỉ Sau sáp nhập (Tỉnh thành mới, Phường xã mới, Chi tiết mới)
    let tinhThanhMoiVal = '';
    let phuongXaMoiVal = '';
    let diaChiChiTietMoiVal = cust.diachichitietmoi || '';

    if (cust.thuongtrumoi) {
      const parts = cust.thuongtrumoi.split(',').map(s => s.trim());
      if (parts.length >= 1) {
        tinhThanhMoiVal = parts[parts.length - 1] || '';
      }
      if (parts.length >= 2) {
        phuongXaMoiVal = parts[parts.length - 2] || '';
      }
    }

    // Thời gian lưu trú
    let finalCheckOut = b.checkOut;
    if (!finalCheckOut) {
      if (b.expectedCheckOut) {
        finalCheckOut = b.expectedCheckOut;
      } else {
        const fallback = new Date(b.checkIn);
        fallback.setDate(fallback.getDate() + 1);
        fallback.setHours(0, 0, 0, 0);
        finalCheckOut = fallback;
      }
    }

    const checkInDate = b.checkIn ? `${formatExcelTime(b.checkIn)} ${formatExcelDate(b.checkIn)}` : '';
    const checkOutDate = finalCheckOut ? `${formatExcelTime(finalCheckOut)} ${formatExcelDate(finalCheckOut)}` : '';

    html += `
        <tr>
          <td>${idx + 1}</td>
          <td style="text-align: left;">${(cust.hoten || '').toUpperCase()}</td>
          <td style="mso-number-format:'\\@';">${dobStr}</td>
          <td>${gioitinhVal}</td>
          <td>VNM - Viet Nam</td>
          <td>${cust.loaigiayto || '1 - Thẻ CCCD'}</td>
          <td>${cust.loaigiayto === '9 - Giấy Tờ Khác' ? (cust.tengiayto || '') : ''}</td>
          <td style="mso-number-format:'\\@';">${cust.cccd || cust.passport || ''}</td>
          <td style="mso-number-format:'\\@';">${cust.sodienthoai || b.guestPhone || ''}</td>
          <td>${cust.noicutruhiennay || '1 - Thường trú'}</td>
          <td style="text-align: left;">${thuongTruVal}</td>
          <td style="text-align: left;">${diaChiChiTietVal}</td>
          <td style="text-align: left;">${tinhThanhMoiVal}</td>
          <td style="text-align: left;">${phuongXaMoiVal}</td>
          <td style="text-align: left;">${diaChiChiTietMoiVal}</td>
          <td style="mso-number-format:'\\@';">${checkInDate}</td>
          <td style="mso-number-format:'\\@';">${checkOutDate}</td>
          <td style="font-weight: bold;">${b.roomNumber}</td>
          <td>${b.lydocutru || '1 - Du lịch'}</td>
          <td style="text-align: left;">${b.nhaplydo || ''}</td>
          <td style="text-align: left;">${b.notes || ''}</td>
        </tr>
    `;
  });

  html += `
      </table>
    </body>
    </html>
  `;

  // 5. Xuất file bằng Blob
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Danh_sach_thong_bao_luu_tru_VN_${new Date().toISOString().split('T')[0]}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}
