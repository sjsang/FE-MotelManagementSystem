import React, { useState, useEffect, useRef, useCallback } from "react";
import { updateBooking, previewCheckout } from "../../utils/api";
import InvoiceDetailModal from "../Invoice/InvoiceDetailModal";
import { formatTime, calcElapsed } from "../../utils/RoomDetailHelpers";

import TabInfo from "./TabInfo";
import TabServices from "./TabServices";
import TabCheckout from "./TabCheckout";

export default function RoomDetailModal({
  room,
  priceConfig,
  onClose,
  onCheckOut,
  onRefresh,
  addToast,
  onChangeRoom,
}) {
  const [booking, setBooking] = useState(room.currentBooking);
  const [elapsed, setElapsed] = useState(calcElapsed(booking?.checkIn));

  // State cho đợt dịch vụ mới chờ tạo phiếu xuất kho
  const [pendingServices, setPendingServices] = useState([]);
  const [newService, setNewService] = useState({
    name: "",
    price: "",
    quantity: 1,
  });
  const [submittingExport, setSubmittingExport] = useState(false);

  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("checkout");
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [showConfirmCheckout, setShowConfirmCheckout] = useState(false);

  const [discount, setDiscount] = useState(0);
  const [taxInput, setTaxInput] = useState("");
  const [taxType, setTaxType] = useState("vnd");
  const [depositOverride, setDepositOverride] = useState(booking?.deposit || 0);

  const previewIntervalRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchPreview = useCallback(async () => {
    if (!booking?._id) return;
    try {
      const res = await previewCheckout(booking._id, depositOverride);
      setPreview(res.data);
    } catch {
      // Giữ preview cũ nếu lỗi mạng
    }
  }, [booking?._id, depositOverride]);

  useEffect(() => {
    if (tab === "checkout") {
      setPreviewLoading(true);
      fetchPreview().finally(() => setPreviewLoading(false));
      previewIntervalRef.current = setInterval(fetchPreview, 60000);
    } else {
      clearInterval(previewIntervalRef.current);
      previewIntervalRef.current = null;
    }
    return () => clearInterval(previewIntervalRef.current);
  }, [tab, fetchPreview]);

  const currentBookingId = room.currentBooking?._id;
  useEffect(() => {
    setBooking(room.currentBooking);
    setPendingServices([]);
    setElapsed(calcElapsed(room.currentBooking?.checkIn));
    setTab("checkout");
    setDepositOverride(room.currentBooking?.deposit || 0);
  }, [currentBookingId]);

  useEffect(() => {
    const t = setInterval(
      () => setElapsed(calcElapsed(booking?.checkIn)),
      30000
    );
    return () => clearInterval(t);
  }, [booking?.checkIn]);

  // --- Calculations ---
  const savedServices = booking?.services || [];
  const serviceTotal = savedServices.reduce(
    (s, sv) => s + (sv.price || 0) * (sv.quantity || 1),
    0
  );
  const previewTotal =
    preview?.totalAmount ?? (booking?.basePrice || 0) + serviceTotal;

  const taxVnd =
    taxType === "percent"
      ? Math.round(
          Math.max(0, previewTotal - discount) * (Number(taxInput || 0) / 100)
        )
      : Number(taxInput || 0);

  const payableAmount = previewTotal - discount + taxVnd;
  const deposit = booking?.deposit || 0;
  const paidAmount = Math.max(0, payableAmount - deposit);

  // --- Service Stock & Export Slip Handlers ---
  const getStockLimit = (svcName) => {
    if (!priceConfig || !priceConfig.services) return Infinity;
    const pcSvc = priceConfig.services.find(
      (s) => s.name.trim().toLowerCase() === svcName.trim().toLowerCase()
    );
    if (!pcSvc || pcSvc.trackInventory === false) return Infinity;
    return pcSvc.quantity != null ? Number(pcSvc.quantity) : 0;
  };

  const addServiceFromList = (svc) => {
    const limit = getStockLimit(svc.name);
    const existsInPending = pendingServices.find((s) => s.name === svc.name);
    const pendingQty = existsInPending ? Number(existsInPending.quantity) || 0 : 0;
    const remaining = Math.max(0, limit - pendingQty);

    if (pendingQty + 1 > limit) {
      if (addToast) {
        addToast(
          remaining === 0
            ? `⚠️ Dịch vụ "${svc.name}" hiện đã hết hàng trong kho, không thể chọn thêm!`
            : `⚠️ Dịch vụ "${svc.name}" chỉ còn tồn kho ${remaining} ${svc.unit || 'cái'}, không đủ để chọn thêm!`,
          "error"
        );
      }
      return;
    }

    if (existsInPending) {
      setPendingServices((prev) =>
        prev.map((s) =>
          s.name === svc.name ? { ...s, quantity: s.quantity + 1 } : s
        )
      );
    } else {
      setPendingServices((prev) => [
        ...prev,
        { name: svc.name, price: svc.price, unit: svc.unit || 'cái', quantity: 1 },
      ]);
    }
  };

  const addCustomService = () => {
    if (!newService.name || !newService.price) return;
    const qtyToAdd = Number(newService.quantity) || 1;
    const limit = getStockLimit(newService.name);
    const existsInPending = pendingServices.find((s) => s.name === newService.name);
    const pendingQty = existsInPending ? Number(existsInPending.quantity) || 0 : 0;
    const remaining = Math.max(0, limit - pendingQty);

    if (pendingQty + qtyToAdd > limit) {
      if (addToast) {
        addToast(
          remaining === 0
            ? `⚠️ Dịch vụ "${newService.name}" hiện đã hết hàng trong kho, không thể chọn thêm!`
            : `⚠️ Dịch vụ "${newService.name}" chỉ còn tồn kho ${remaining}, không đủ để chọn thêm!`,
          "error"
        );
      }
      return;
    }

    if (existsInPending) {
      setPendingServices((prev) =>
        prev.map((s) =>
          s.name === newService.name
            ? { ...s, quantity: s.quantity + qtyToAdd }
            : s
        )
      );
    } else {
      setPendingServices((prev) => [
        ...prev,
        {
          name: newService.name,
          price: Number(newService.price),
          quantity: qtyToAdd,
        },
      ]);
    }
    setNewService({ name: "", price: "", quantity: 1 });
  };

  const updatePendingQuantity = (idx, newQty) => {
    if (newQty < 1) {
      removePendingService(idx);
      return;
    }
    const targetService = pendingServices[idx];
    if (targetService) {
      const limit = getStockLimit(targetService.name);
      if (newQty > limit) {
        if (addToast) {
          addToast(
            `⚠️ Dịch vụ "${targetService.name}" chỉ còn tồn kho ${limit} ${targetService.unit || 'cái'}, không thể chọn thêm!`,
            "error"
          );
        }
        return;
      }
    }

    setPendingServices((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, quantity: newQty } : s))
    );
  };

  const removePendingService = (idx) =>
    setPendingServices((prev) => prev.filter((_, i) => i !== idx));

  // Nút chính: "Tạo phiếu xuất kho" -> Lưu dịch vụ mới vào booking và tự động tạo phiếu xuất kho
  const handleCreateExportSlip = async () => {
    if (pendingServices.length === 0) {
      if (addToast) addToast("Vui lòng chọn ít nhất 1 dịch vụ mới để tạo phiếu xuất kho", "error");
      return;
    }

    setSubmittingExport(true);
    try {
      const currentSaved = booking?.services || [];
      const mergedMap = new Map();
      currentSaved.forEach((s) => {
        mergedMap.set(s.name, {
          name: s.name,
          price: Number(s.price) || 0,
          quantity: Number(s.quantity) || 1,
        });
      });

      pendingServices.forEach((ps) => {
        if (mergedMap.has(ps.name)) {
          const existing = mergedMap.get(ps.name);
          existing.quantity += Number(ps.quantity) || 1;
        } else {
          mergedMap.set(ps.name, {
            name: ps.name,
            price: Number(ps.price) || 0,
            quantity: Number(ps.quantity) || 1,
          });
        }
      });

      const updatedServicesList = Array.from(mergedMap.values());

      const res = await updateBooking(booking._id, { services: updatedServicesList });
      setBooking(res.data);
      setPendingServices([]);
      if (addToast) addToast(`✅ Đã lưu dịch vụ & tạo phiếu xuất kho thành công cho Phòng ${booking.roomNumber}!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      if (addToast) addToast(err.response?.data?.error || "Lỗi tạo phiếu xuất kho dịch vụ", "error");
    } finally {
      setSubmittingExport(false);
    }
  };

  const handleReport = async () => {
    setLoading(true);
    try {
      const res = await updateBooking(booking._id, {
        is_reported: true,
        reported: new Date(),
      });
      setBooking(res.data);
      addToast("Đã ghi nhận khai báo lưu trú thành công");
      if (onRefresh) onRefresh();
    } catch {
      addToast("Lỗi khi ghi nhận khai báo lưu trú", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setShowConfirmCheckout(false);
    setLoading(true);
    try {
      const invoiceData = await onCheckOut(
        booking._id,
        savedServices,
        booking.notes,
        discount,
        taxVnd,
        depositOverride
      );
      if (invoiceData) setCreatedInvoice(invoiceData);
    } catch {
      addToast("Lỗi check-out", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!booking) {
    return (
      <div
        className="modal-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="modal">
          <div className="modal-header">
            <div className="modal-title">Phòng {room.roomNumber}</div>
            <button className="modal-close" onClick={onClose}>
              ✕
            </button>
          </div>
          <div
            className="modal-body"
            style={{ textAlign: "center", padding: 40, color: "#9fa3b8" }}
          >
            Không có booking active
          </div>
        </div>
      </div>
    );
  }

  const savedCount = savedServices.length;
  const pendingCount = pendingServices.length;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: 760, width: "94%" }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">
              Phòng {room.roomNumber} — Chi tiết lưu trú
            </div>
            <div style={{ fontSize: 13, color: "#9fa3b8", marginTop: 2 }}>
              Check-in: {formatTime(booking.checkIn)} • Đã ở: {elapsed.text}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 0,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            padding: "0 24px",
          }}
        >
          {[
            ["checkout", "Check-out"],
            ["info", "Thông tin"],
            [
              "services",
              `Dịch vụ (${savedCount}${pendingCount > 0 ? ` + ${pendingCount} mới` : ""})`,
            ],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: "11px 16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: tab === key ? 700 : 400,
                color: tab === key ? "#38bdf8" : "#9fa3b8",
                borderBottom:
                  tab === key ? "2px solid #38bdf8" : "2px solid transparent",
                marginBottom: -1,
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          className="modal-body"
          style={{
            overflowY: "auto",
          }}
        >
          {tab === "info" && <TabInfo booking={booking} />}

          {tab === "services" && (
            <TabServices
              savedServices={savedServices}
              pendingServices={pendingServices}
              availableServices={priceConfig?.services || []}
              newService={newService}
              setNewService={setNewService}
              addServiceFromList={addServiceFromList}
              addCustomService={addCustomService}
              updatePendingQuantity={updatePendingQuantity}
              removePendingService={removePendingService}
              handleCreateExportSlip={handleCreateExportSlip}
              submittingExport={submittingExport}
              serviceTotal={serviceTotal}
            />
          )}

          {tab === "checkout" && (
            <TabCheckout
              booking={booking}
              preview={preview}
              previewLoading={previewLoading}
              elapsed={elapsed}
              serviceTotal={serviceTotal}
              discount={discount}
              setDiscount={setDiscount}
              taxType={taxType}
              setTaxType={setTaxType}
              taxInput={taxInput}
              setTaxInput={setTaxInput}
              previewTotal={previewTotal}
              taxVnd={taxVnd}
              payableAmount={payableAmount}
              deposit={deposit}
              paidAmount={paidAmount}
              depositOverride={depositOverride}
              setDepositOverride={setDepositOverride}
            />
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Đóng
          </button>
          {onChangeRoom && (
            <button
              className="btn"
              onClick={onChangeRoom}
              disabled={loading}
              style={{
                background: "rgba(139,133,255,0.12)",
                color: "#8b85ff",
                border: "1px solid rgba(139,133,255,0.3)",
              }}
            >
              🔄 Đổi phòng
            </button>
          )}

          {!booking.is_reported ? (
            <button
              className="btn btn-success"
              onClick={handleReport}
              disabled={loading}
              style={{
                background: "#2e7d52",
                borderColor: "#2e7d52",
                color: "#ffffff",
                fontWeight: 600,
              }}
            >
              {loading ? "..." : "👮 Đã khai báo lưu trú"}
            </button>
          ) : (
            <span
              style={{
                fontSize: 12.5,
                color: "#10b981",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 12px",
                background: "rgba(16, 185, 129, 0.12)",
                borderRadius: 6,
                border: "1px solid rgba(16, 185, 129, 0.25)",
              }}
            >
              ✓ Đã khai báo lưu trú
            </span>
          )}

          {tab === "checkout" && (
            <button
              className="btn btn-danger"
              onClick={() => setShowConfirmCheckout(true)}
              disabled={loading}
              style={{
                background: "#ef4444",
                borderColor: "#ef4444",
                color: "#ffffff",
                fontWeight: 700,
              }}
            >
              {loading ? "..." : "Xác nhận - Check-out"}
            </button>
          )}
        </div>
      </div>

      {/* --- Modal Xác Nhận Check-out --- */}
      {showConfirmCheckout && (
        <div
          className="modal-overlay"
          style={{ zIndex: 1100 }}
          onClick={() => setShowConfirmCheckout(false)}
        >
          <div
            className="modal"
            style={{ maxWidth: 360, width: "90%", height: "auto", maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ padding: "14px 18px" }}>
              <div className="modal-title" style={{ color: "#ef4444", fontSize: 15 }}>
                ⚠️ Xác nhận Check-out
              </div>
              <button
                className="modal-close"
                onClick={() => setShowConfirmCheckout(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ padding: "14px 18px", fontSize: 13.5, color: "#334155", flex: "none" }}>
              <p style={{ marginBottom: 10 }}>
                Bạn có chắc chắn muốn trả phòng{" "}
                <strong style={{ color: "#0f172a" }}>Phòng {room.roomNumber}</strong>{" "}
                không?
              </p>
              <div
                style={{
                  background: "#f8fafc",
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span>Tổng tiền thanh toán:</span>
                  <strong style={{ color: "#10b981" }}>
                    {payableAmount.toLocaleString("vi-VN")} đ
                  </strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span>Tiền cọc / Tạm ứng:</span>
                  <span>{deposit.toLocaleString("vi-VN")} đ</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#0f172a",
                    borderTop: "1px dashed #cbd5e1",
                    paddingTop: 4,
                  }}
                >
                  <span>Khách cần trả thêm:</span>
                  <span style={{ color: "#ef4444" }}>
                    {paidAmount.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ padding: "10px 18px" }}>
              <button
                className="btn btn-ghost"
                onClick={() => setShowConfirmCheckout(false)}
              >
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleCheckOut}>
                Xác nhận Trả phòng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal Hiển Thị Hóa Đơn Sau Khi Check-out --- */}
      {createdInvoice && (
        <InvoiceDetailModal
          invoice={createdInvoice}
          onClose={() => {
            setCreatedInvoice(null);
            onClose();
          }}
        />
      )}
    </div>
  );
}
