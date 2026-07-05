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
  const [services, setServices] = useState(booking?.services || []);
  const [elapsed, setElapsed] = useState(calcElapsed(booking?.checkIn));
  const [newService, setNewService] = useState({
    name: "",
    price: "",
    quantity: 1,
  });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("checkout");
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [showConfirmCheckout, setShowConfirmCheckout] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const [discount, setDiscount] = useState(0);
  const [taxInput, setTaxInput] = useState("");
  const [taxType, setTaxType] = useState("vnd");
  const [depositOverride, setDepositOverride] = useState(booking?.deposit || 0);

  const [savedDraft, setSavedDraft] = useState({
    discount: 0,
    taxType: "vnd",
    taxInput: "",
    depositOverride: 0,
  });

  const [saveStatus, setSaveStatus] = useState("saved");
  const debounceRef = useRef(null);
  const isFirstRender = useRef(true);

  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewIntervalRef = useRef(null);

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
    isFirstRender.current = true;
    setBooking(room.currentBooking);
    setServices(room.currentBooking?.services || []);
    setElapsed(calcElapsed(room.currentBooking?.checkIn));
    setSaveStatus("saved");
    setTab("checkout");

    let draft = null;
    try {
      draft = JSON.parse(localStorage.getItem(`checkout-draft-${currentBookingId}`));
    } catch { }

    const initDiscount = draft?.discount ?? 0;
    const initTaxType = draft?.taxType ?? "vnd";
    const initTaxInput = draft?.taxInput ?? "";
    const initDepositOverride = draft?.depositOverride ?? (room.currentBooking?.deposit || 0);

    setDiscount(initDiscount);
    setTaxType(initTaxType);
    setTaxInput(initTaxInput);
    setDepositOverride(initDepositOverride);
    setSavedDraft({
      discount: initDiscount,
      taxType: initTaxType,
      taxInput: initTaxInput,
      depositOverride: initDepositOverride,
    });
  }, [currentBookingId, room.currentBooking]);

  useEffect(() => {
    setBooking((prev) => {
      if (!prev || prev._id !== room.currentBooking?._id) return prev;
      return { ...room.currentBooking, services: prev.services };
    });
  }, [room.currentBooking]);

  useEffect(() => {
    const t = setInterval(
      () => setElapsed(calcElapsed(booking?.checkIn)),
      30000
    );
    return () => clearInterval(t);
  }, [booking?.checkIn]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSaveStatus("pending");
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await updateBooking(booking._id, { services });
        setSaveStatus("saved");
        if (onRefresh) onRefresh();
      } catch {
        setSaveStatus("error");
      }
    }, 800);
    return () => clearTimeout(debounceRef.current);
  }, [services]);

  const isCheckoutDirty =
    discount !== savedDraft.discount ||
    taxType !== savedDraft.taxType ||
    taxInput !== savedDraft.taxInput ||
    depositOverride !== savedDraft.depositOverride;

  const handleCloseAttempt = () => {
    if (isCheckoutDirty) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSaveCheckoutDraft = () => {
    const draftData = { discount, taxType, taxInput, depositOverride };
    localStorage.setItem(`checkout-draft-${currentBookingId}`, JSON.stringify(draftData));
    setSavedDraft(draftData);
    if (addToast) addToast("Đã lưu thay đổi thành công");
  };

  if (!booking) {
    return (
      <div
        className="modal-overlay"
        onClick={(e) => e.target === e.currentTarget && handleCloseAttempt()}
      >
        <div className="modal">
          <div className="modal-header">
            <div className="modal-title">Phòng {room.roomNumber}</div>
            <button className="modal-close" onClick={handleCloseAttempt}>
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

  // --- Calculations ---
  const serviceTotal = services.reduce(
    (s, sv) => s + sv.price * sv.quantity,
    0
  );
  const previewTotal =
    preview?.totalAmount ?? (booking.basePrice || 0) + serviceTotal;

  const taxVnd =
    taxType === "percent"
      ? Math.round(
        Math.max(0, previewTotal - discount) * (Number(taxInput || 0) / 100)
      )
      : Number(taxInput || 0);

  const payableAmount = previewTotal - discount + taxVnd;
  const deposit = booking.deposit || 0;
  const paidAmount = Math.max(0, payableAmount - deposit);

  // --- Handlers ---
  const addServiceFromList = (svc) => {
    const exists = services.find((s) => s.name === svc.name);
    if (exists) {
      setServices((prev) =>
        prev.map((s) =>
          s.name === svc.name ? { ...s, quantity: s.quantity + 1 } : s
        )
      );
    } else {
      setServices((prev) => [
        ...prev,
        { name: svc.name, price: svc.price, quantity: 1 },
      ]);
    }
  };

  const addCustomService = () => {
    if (!newService.name || !newService.price) return;
    setServices((prev) => [
      ...prev,
      {
        name: newService.name,
        price: Number(newService.price),
        quantity: Number(newService.quantity) || 1,
      },
    ]);
    setNewService({ name: "", price: "", quantity: 1 });
  };

  const removeService = (idx) =>
    setServices((prev) => prev.filter((_, i) => i !== idx));

  const updateServiceQuantity = (idx, newQty) => {
    if (newQty < 1) return;
    setServices((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, quantity: newQty } : s))
    );
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
        services,
        booking.notes,
        discount,
        taxVnd,
        depositOverride
      );
      if (invoiceData) {
        setCreatedInvoice(invoiceData);
        localStorage.removeItem(`checkout-draft-${booking._id}`);
      }
    } catch {
      addToast("Lỗi check-out", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && handleCloseAttempt()}
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
          <button className="modal-close" onClick={handleCloseAttempt}>
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
            ["services", `Dịch vụ (${services.length})`],
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
                fontWeight: tab === key ? 600 : 400,
                color: tab === key ? "#8b85ff" : "#9fa3b8",
                borderBottom:
                  tab === key ? "2px solid #8b85ff" : "2px solid transparent",
                marginBottom: -1,
                fontFamily: "inherit",
                position: "relative",
              }}
            >
              {label}
              {key === "services" && saveStatus === "pending" && (
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 2,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#f59e0b",
                    display: "inline-block",
                  }}
                />
              )}
            </button>
          ))}
        </div>

        <div
          className="modal-body"
          style={{
            overflowY: "auto",
          }}
        >
          {tab === "info" && (
            <TabInfo
              booking={booking}
              addToast={addToast}
              onUpdateBooking={async (updatedFields) => {
                try {
                  const res = await updateBooking(booking._id, {
                    ...updatedFields,
                    is_reported: false,
                    reported: null,
                    reported_by: "",
                  });
                  setBooking(res.data);
                  if (onRefresh) onRefresh();
                } catch (err) {
                  console.error("Lỗi khi cập nhật khách lưu trú:", err);
                  addToast("Lỗi khi cập nhật khách lưu trú", "error");
                }
              }}
            />
          )}

          {tab === "services" && (
            <TabServices
              services={services}
              availableServices={priceConfig?.services || []}
              newService={newService}
              setNewService={setNewService}
              saveStatus={saveStatus}
              addServiceFromList={addServiceFromList}
              addCustomService={addCustomService}
              removeService={removeService}
              updateServiceQuantity={updateServiceQuantity}
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
          <style>
            {`
              @keyframes buttonPop {
                0% { transform: scale(0.8); opacity: 0; }
                50% { transform: scale(1.2); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
              }
            `}
          </style>

          {isCheckoutDirty && (
            <button
              className="btn mr-2 bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600 transition-colors duration-200"
              onClick={handleSaveCheckoutDraft}
              style={{
                animation: "buttonPop 0.3s ease-out forwards",
              }}
            >
              Lưu
            </button>
          )}

          <button className="btn btn-ghost" onClick={handleCloseAttempt}>
            Đóng
          </button>

          {tab !== "checkout" && onChangeRoom && (
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
          {tab === "checkout" && (
            <button
              className="btn btn-danger"
              onClick={() => setShowConfirmCheckout(true)}
              disabled={loading}
            >
              {loading ? "..." : "Xác nhận Check-out"}
            </button>
          )}
          {tab !== "checkout" &&
            (!booking.is_reported ? (
              <button
                className="btn btn-success"
                onClick={handleReport}
                disabled={loading}
                style={{
                  background: "#2e7d52",
                  borderColor: "#2e7d52",
                  color: "#ffffff",
                }}
              >
                {loading ? "..." : "👮 Đã khai báo lưu trú"}
              </button>
            ) : (
              <button
                className="btn"
                onClick={() => setTab("checkout")}
                style={{
                  background: "rgba(239,68,68,0.15)",
                  color: "#f87171",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                Chuyển sang Check-out →
              </button>
            ))}
        </div>
      </div>

      {createdInvoice && (
        <InvoiceDetailModal
          invoice={createdInvoice}
          onClose={() => {
            setCreatedInvoice(null);
            onClose();
          }}
          onCancel={() => {
            setCreatedInvoice(null);
            onClose();
          }}
          addToast={addToast}
        />
      )}

      {showConfirmCheckout && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(3px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#d8f0e5",
              padding: 24,
              borderRadius: 12,
              width: "340px",
              border: "1px solid rgba(16,185,129,0.3)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
            }}
          >
            <h4
              style={{
                margin: "0 0 16px 0",
                color: "black",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Xác nhận trả phòng?
            </h4>
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <button
                onClick={() => setShowConfirmCheckout(false)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: "#e03d52",
                  color: "#e9f7f6",
                  border: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleCheckOut}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#10b981",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(3px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >

          <div
            style={{
              background: "#ffffff",
              padding: 24,
              borderRadius: 12,
              width: "360px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
              color: "#333333",
            }}
          >
            <h4 style={{ margin: "0 0 12px 0", fontSize: 16, fontWeight: 600 }}>
              Bạn có chắc muốn thoát mà không lưu?
            </h4>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setShowExitConfirm(false)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  color: "#374151",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onClose();
                }}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: "#ef4444",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Thoát
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}