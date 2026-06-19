import React, { useRef, useEffect, useCallback } from "react";

const STATUS_STYLE = {
  issued: { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Đã xuất" },
  cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "Đã hủy" },
};

function fmt(n) {
  return (n || 0).toLocaleString("vi-VN") + "đ";
}
function fmtDate(d) {
  if (!d) return "--";
  return new Date(d).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Skeleton row cho lần tải đầu tiên ────────────────────────────
function SkeletonRow() {
  return (
    <tr className="skeleton-row">
      {[140, 60, 120, 100, 130, 130, 70].map((w, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <div className="skeleton-bar" style={{ width: w, height: 14, borderRadius: 6 }} />
        </td>
      ))}
    </tr>
  );
}

export default function InvoiceTable({
  loading,
  invoices,
  setSelected,
  page,
  totalPages,
  load,
  hasMore,
  loadingMore,
}) {
  const stateRef = useRef({ hasMore, loadingMore, loading, page, load });
  useEffect(() => {
    stateRef.current = { hasMore, loadingMore, loading, page, load };
  });

  const observer = useRef(null);

  const sentinelRef = useCallback((node) => {
    if (observer.current) observer.current.disconnect();

    if (node) {
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          const st = stateRef.current;
          if (st.hasMore && !st.loadingMore && !st.loading) {
            st.load(st.page + 1);
          }
        }
      }, {
        root: null,
        rootMargin: "250px", // Load đón đầu 250px
        threshold: 0,
      });
      observer.current.observe(node);
    }
  }, []);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <style>{`
        /* ── Skeleton shimmer ── */
        @keyframes shimmer {
            0%   { background-position: -600px 0; }
            100% { background-position:  600px 0; }
        }
        .skeleton-bar {
            background: linear-gradient(
                90deg,
                rgba(255,255,255,0.06) 25%,
                rgba(255,255,255,0.13) 50%,
                rgba(255,255,255,0.06) 75%
            );
            background-size: 600px 100%;
            animation: shimmer 1.4s infinite linear;
        }

        /* ── Spinner (load more) ── */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
            width: 20px; height: 20px;
            border: 2.5px solid rgba(139,133,255,0.25);
            border-top-color: #8b85ff;
            border-radius: 50%;
            animation: spin 0.75s linear infinite;
            display: inline-block;
        }

        /* ── ĐÃ FIX LỖI GIẬT BẢNG ── */
        @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
        }
        .invoice-row {
            /* Chỉ dùng opacity, cấm tuyệt đối transform trên thẻ <tr> */
            animation: fadeIn 0.4s ease-in-out;
        }
        .invoice-row:hover td { background: rgba(108,99,255,0.06); }
        
        .responsive-table {
            width: 100%;
            border-collapse: collapse;
        }
        .responsive-table th, .responsive-table td {
            text-align: left;
            padding: 14px 16px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
            .responsive-table {
                border-collapse: separate;
                border-spacing: 0 12px;
            }
            .responsive-table thead { display: none; }
            .responsive-table, .responsive-table tbody { display: block; width: 100%; }
            .responsive-table tr {
                display: block; width: 100%;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 0;
                margin-bottom: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .responsive-table td {
                display: flex; justify-content: space-between; align-items: center;
                text-align: right; padding: 12px 16px !important;
                border-bottom: 1px solid rgba(255,255,255,0.03) !important;
            }
            .responsive-table td:last-child { border-bottom: none !important; }
            .responsive-table td::before {
                content: attr(data-label); font-weight: 600; color: #6b6f84;
                font-size: 13px; text-align: left; margin-right: 16px;
            }
            .skeleton-row { display: block !important; }
            .skeleton-row td { display: flex !important; justify-content: flex-end !important; }
        }
      `}</style>

      {loading ? (
        <div className="table-wrap" style={{ padding: "0 16px" }}>
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Số hóa đơn</th><th>Phòng</th><th>Khách</th>
                <th>Giá trị thanh toán</th><th>Nhận phòng</th>
                <th>Trả phòng</th><th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="table-wrap" style={{ padding: "0 16px" }}>
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Số hóa đơn</th><th>Phòng</th><th>Khách</th>
                  <th>Giá trị thanh toán</th><th>Nhận phòng</th>
                  <th>Trả phòng</th><th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", color: "#6b6f84", padding: 40, display: "block" }}>
                      Không có hóa đơn nào
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => {
                    const ss = STATUS_STYLE[inv.status] || STATUS_STYLE.issued;
                    return (
                      <tr key={inv._id} className="invoice-row" onClick={() => setSelected(inv)} style={{ cursor: "pointer" }}>
                        <td data-label="Số hóa đơn"><span style={{ fontWeight: 700, fontSize: 13, color: "#8b85ff" }}>{inv.invoiceNumber}</span></td>
                        <td data-label="Phòng"><span style={{ fontWeight: 700 }}>{inv.roomNumber}</span></td>
                        <td data-label="Khách"><div style={{ fontWeight: 600 }}>{inv.guestName}</div></td>
                        <td data-label="Giá trị thanh toán"><span style={{ fontWeight: 700, color: "#10b981" }}>{fmt(inv.payableAmount)}</span></td>
                        <td data-label="Nhận phòng" style={{ fontSize: 12.5 }}>{fmtDate(inv.checkIn)}</td>
                        <td data-label="Trả phòng" style={{ fontSize: 12.5 }}>{fmtDate(inv.issuedAt)}</td>
                        <td data-label="Trạng thái">
                          <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: ss.bg, color: ss.color }}>
                            {ss.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}

                {/* Đã gỡ bỏ 3 dòng Skeleton dư thừa ở đây để tránh giật chiều cao DOM */}
              </tbody>
            </table>
          </div>

          <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />

          {loadingMore && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, padding: "14px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="spinner" />
              <span style={{ fontSize: 13, color: "#6b6f84" }}>Đang tải thêm...</span>
            </div>
          )}

          {!hasMore && invoices.length > 0 && !loadingMore && (
            <div style={{ textAlign: "center", padding: "12px 0", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "#6b6f84" }}>
              ✓ Đã tải tất cả {invoices.length} hóa đơn
            </div>
          )}
        </>
      )}
    </div>
  );
}