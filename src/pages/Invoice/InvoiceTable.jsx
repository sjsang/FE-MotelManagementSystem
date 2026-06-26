import React, { useRef, useEffect, useCallback } from "react";

const STATUS_STYLE = {
  issued: { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Đã xuất" },
  cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "Đã hủy" },
};

function fmt(n) {
  return (n || 0).toLocaleString("vi-VN") + "đ";
}

function splitDateTime(d) {
  if (!d) return { date: "--", time: "" };
  const dt = new Date(d);
  const date = dt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = dt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

function DateTimeCell({ value }) {
  const { date, time } = splitDateTime(value);
  if (!time) return <span className="text-[#6b6f84]">--</span>;
  return (
    <span className="text-[12.5px] leading-tight">
      <span className="font-bold">{time} </span>
      <span className="text-[#6b6f84]"> {date}</span>
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="skeleton-row">
      {[140, 60, 120, 100, 130, 130, 70].map((w, i) => (
        <td key={i} className="px-4 py-[14px]">
          <div className="skeleton-bar rounded-md" style={{ width: w, height: 14 }} />
        </td>
      ))}
    </tr>
  );
}

export default function InvoiceTable({ loading, invoices, setSelected, page, load, hasMore, loadingMore }) {
  const stateRef = useRef({ hasMore, loadingMore, loading, page, load });
  useEffect(() => { stateRef.current = { hasMore, loadingMore, loading, page, load }; });

  const observer = useRef(null);
  const sentinelRef = useCallback((node) => {
    if (observer.current) observer.current.disconnect();
    if (node) {
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          const st = stateRef.current;
          if (st.hasMore && !st.loadingMore && !st.loading) st.load(st.page + 1);
        }
      }, { rootMargin: "250px", threshold: 0 });
      observer.current.observe(node);
    }
  }, []);

  const cols = [
    { label: "Số hóa đơn", w: "13%" },
    { label: "Phòng", w: "8%" },
    { label: "Khách", w: "21%" },
    { label: "Giá trị thanh toán", w: "16%" },
    { label: "Nhận phòng", w: "14%" },
    { label: "Xuất hóa đơn", w: "14%" },
    { label: "Trạng thái", w: "14%" },
  ];

  const thead = (
    <thead>
      <tr>
        {cols.map(c => (
          <th key={c.label} style={{ width: c.w }}
            className="text-left px-4 py-[14px] text-xl font-semibold text-[#11b5cf] uppercase tracking-wide border-b border-black/5">
            {c.label}
          </th>
        ))}
      </tr>
    </thead>
  );

  return (
    <div>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .skeleton-bar {
          background: linear-gradient(90deg,rgba(0,0,0,0.06) 25%,rgba(0,0,0,0.1) 50%,rgba(0,0,0,0.06) 75%);
          background-size: 600px 100%;
          animation: shimmer 1.4s infinite linear;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 20px; height: 20px;
          border: 2.5px solid rgba(139,133,255,0.25);
          border-top-color: #8b85ff;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
          display: inline-block;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .invoice-row { animation: fadeIn 0.4s ease-in-out; }
        .invoice-row:hover td { background: #e8f8fa; }

        /* PC: bg trắng, bo góc */
        .inv-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          border-radius: 12px;
          overflow: hidden;
        }
        .inv-table th, .inv-table td {
          text-align: left;
          padding: 11px 16px;
        }
        .inv-table th {
          background: #d3eff2;
        }
        .inv-table td {
          background: #fff;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .inv-table tbody tr:last-child td { border-bottom: none; }

        /* Mobile: mỗi row là 1 card trắng có gap */
        @media (max-width: 768px) {
          .inv-table {
            border-collapse: separate;
            border-spacing: 0 8px;
            background: transparent;
            border-radius: 0;
            overflow: visible;
          }
          .inv-table thead { display: none; }
          .inv-table, .inv-table tbody { display: block; width: 100%; }
          .inv-table tr {
            display: block;
            width: 100%;
            background: #fff;
            border: 1px solid rgba(0,0,0,0.08);
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 8px;
          }
          .inv-table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            text-align: right;
            padding: 11px 14px !important;
            border-bottom: 1px solid rgba(0,0,0,0.05) !important;
          }
          .inv-table td:last-child { border-bottom: none !important; }
          .inv-table td::before {
            content: attr(data-label);
            font-weight: 600;
            color: #6b6f84;
            font-size: 13px;
            text-align: left;
            margin-right: 16px;
            flex-shrink: 0;
          }
          .skeleton-row { display: block !important; }
          .skeleton-row td { display: flex !important; justify-content: flex-end !important; }
        }
      `}</style>

      {loading ? (
        <table className="inv-table">
          {thead}
          <tbody>{Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
        </table>
      ) : (
        <>
          <table className="inv-table">
            {thead}
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-[#6b6f84] py-10">
                    Không có hóa đơn nào
                  </td>
                </tr>
              ) : invoices.map((inv) => {
                const ss = STATUS_STYLE[inv.status] || STATUS_STYLE.issued;
                return (
                  <tr key={inv._id} className="invoice-row cursor-pointer" onClick={() => setSelected(inv)}>
                    <td data-label="Số hóa đơn">
                      <span className="font-bold text-[13px] text-[#8b85ff]">{inv.invoiceNumber}</span>
                    </td>
                    <td data-label="Phòng">
                      <span className="font-bold">{inv.roomNumber}</span>
                    </td>
                    <td data-label="Khách">
                      <div className="font-semibold truncate" title={inv.guestName}>{inv.guestName}</div>
                    </td>
                    <td data-label="Giá trị thanh toán">
                      <span className="font-bold text-[#10b981]">{fmt(inv.payableAmount)}</span>
                    </td>
                    <td data-label="Nhận phòng">
                      <DateTimeCell value={inv.checkIn} />
                    </td>
                    <td data-label="Xuất hóa đơn">
                      <DateTimeCell value={inv.issuedAt} />
                    </td>
                    <td data-label="Trạng thái">
                      <span className="text-[12px] font-semibold px-[10px] py-[3px] rounded-full"
                        style={{ background: ss.bg, color: ss.color }}>
                        {ss.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />

          {loadingMore && (
            <div className="flex justify-center items-center gap-[10px] py-[14px] mt-2">
              <span className="spinner" />
              <span className="text-[13px] text-[#6b6f84]">Đang tải thêm...</span>
            </div>
          )}

          {!hasMore && invoices.length > 0 && !loadingMore && (
            <div className="text-center py-3 mt-2 text-[12px] text-[#6b6f84]">
              ✓ Đã tải tất cả {invoices.length} hóa đơn
            </div>
          )}
        </>
      )}
    </div>
  );
}