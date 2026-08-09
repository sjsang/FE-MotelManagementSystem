import React, { useState, useEffect } from "react";
import {
  getInventoryStock,
  updateInventoryStock,
  createImportSlip,
  createExportSlip,
  getInventorySlips,
  exportInventoryExcel,
} from "../utils/api";
import { useToast } from "../hooks/useToast";

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "0 đ";
  return Number(val).toLocaleString("vi-VN") + " đ";
};

const formatNumber = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return Number(val).toLocaleString("vi-VN");
};

const formatNumberWithDots = (val) => {
  if (val === null || val === undefined || val === "") return "";
  const str = val.toString().replace(/\D/g, "");
  if (!str) return "";
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Return ISO format string for datetime-local input
const toLocalISOString = (d) => {
  const date = d || new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function ServiceInventory() {
  const { addToast, ToastContainer } = useToast();
  const [activeTab, setActiveTab] = useState("stock"); // 'stock' | 'slips'

  // Stock state
  const [stockData, setStockData] = useState({ services: [], summary: {} });
  const [stockLoading, setStockLoading] = useState(true);
  const [stockSearch, setStockSearch] = useState("");

  // Slips state
  const [slips, setSlips] = useState([]);
  const [slipsLoading, setSlipsLoading] = useState(false);
  const [slipTypeFilter, setSlipTypeFilter] = useState("all"); // 'all' | 'import' | 'export'
  const [slipPreset, setSlipPreset] = useState("all");
  const [slipFrom, setSlipFrom] = useState("");
  const [slipTo, setSlipTo] = useState("");
  const [slipSearch, setSlipSearch] = useState("");

  // Modals state
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showEditStockModal, setShowEditStockModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editQtyInput, setEditQtyInput] = useState("");
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Form State cho Phiếu Nhập Kho (bảng danh sách dịch vụ với checkbox)
  const [importSearch, setImportSearch] = useState("");
  const [importForm, setImportForm] = useState({
    date: toLocalISOString(),
    notes: "",
    items: [],
  });

  // Form State cho Phiếu Xuất Kho (bảng danh sách dịch vụ với checkbox)
  const [exportSearch, setExportSearch] = useState("");
  const [exportForm, setExportForm] = useState({
    date: toLocalISOString(),
    notes: "",
    items: [],
  });

  // Load Stock Data
  const loadStock = async () => {
    setStockLoading(true);
    try {
      const res = await getInventoryStock();
      setStockData(res.data);
    } catch (err) {
      addToast(err.response?.data?.error || "Lỗi tải tồn kho dịch vụ", "error");
    } finally {
      setStockLoading(false);
    }
  };

  // Load Slips Data
  const loadSlips = async () => {
    setSlipsLoading(true);
    try {
      const params = {};
      if (slipTypeFilter !== "all") params.type = slipTypeFilter;
      if (slipPreset !== "all") params.preset = slipPreset;
      if (slipFrom) params.from = slipFrom;
      if (slipTo) params.to = slipTo;
      if (slipSearch) params.search = slipSearch;

      const res = await getInventorySlips(params);
      setSlips(res.data.slips || []);
    } catch (err) {
      addToast(err.response?.data?.error || "Lỗi tải phiếu xuất nhập kho", "error");
    } finally {
      setSlipsLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  useEffect(() => {
    if (activeTab === "slips") {
      loadSlips();
    }
  }, [activeTab, slipTypeFilter, slipPreset, slipFrom, slipTo]);

  const handleSlipSearchSubmit = (e) => {
    e.preventDefault();
    loadSlips();
  };

  // Export Excel Handler
  const handleExportExcel = async () => {
    try {
      const res = await exportInventoryExcel();
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute("download", `Ton-kho-dich-vu-${dateStr}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addToast("✅ Đã xuất file Excel tồn kho thành công");
    } catch (err) {
      addToast("Lỗi xuất file Excel", "error");
    }
  };

  // Quick edit stock quantity
  const handleSaveStockQty = async () => {
    if (!editingService) return;
    const qty = Number(editQtyInput);
    if (isNaN(qty) || qty < 0) {
      addToast("Vui lòng nhập số lượng hợp lệ (>= 0)", "error");
      return;
    }

    setModalSubmitting(true);
    try {
      await updateInventoryStock(editingService._id, { quantity: qty });
      addToast(`✅ Đã cập nhật tồn kho cho "${editingService.name}"`);
      setShowEditStockModal(false);
      setEditingService(null);
      loadStock();
    } catch (err) {
      addToast(err.response?.data?.error || "Lỗi cập nhật tồn kho", "error");
    } finally {
      setModalSubmitting(false);
    }
  };

  // Open Import Modal (Bảng dạng checkbox)
  const openImportModal = () => {
    const list = (stockData.services || []).map((s) => ({
      serviceId: s._id,
      serviceName: s.name,
      unit: s.unit || "cái",
      price: s.price != null ? s.price : 0,
      currentStock: s.quantity != null ? s.quantity : 0,
      checked: false,
      quantity: 1,
    }));

    setImportForm({
      date: toLocalISOString(),
      notes: "",
      items: list,
    });
    setImportSearch("");
    setShowImportModal(true);
  };

  // Open Export Modal (Bảng dạng checkbox)
  const openExportModal = () => {
    const list = (stockData.services || []).map((s) => ({
      serviceId: s._id,
      serviceName: s.name,
      unit: s.unit || "cái",
      price: s.price != null ? s.price : 0,
      currentStock: s.quantity != null ? s.quantity : 0,
      checked: false,
      quantity: 1,
    }));

    setExportForm({
      date: toLocalISOString(),
      notes: "",
      items: list,
    });
    setExportSearch("");
    setShowExportModal(true);
  };

  // Handle Import Submit
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    const checkedItems = importForm.items.filter(
      (it) => it.checked && Number(it.quantity) > 0
    );

    if (checkedItems.length === 0) {
      addToast("Vui lòng tích chọn ít nhất 1 dịch vụ cần nhập kho với số lượng > 0", "error");
      return;
    }

    setModalSubmitting(true);
    try {
      await createImportSlip({
        date: importForm.date,
        notes: importForm.notes,
        items: checkedItems.map((it) => ({
          serviceId: it.serviceId,
          serviceName: it.serviceName,
          unit: it.unit,
          price: Number(it.price) || 0,
          quantity: Number(it.quantity) || 1,
        })),
      });
      addToast("✅ Nhập kho thành công!");
      setShowImportModal(false);
      loadStock();
      if (activeTab === "slips") loadSlips();
    } catch (err) {
      addToast(err.response?.data?.error || "Lỗi nhập kho", "error");
    } finally {
      setModalSubmitting(false);
    }
  };

  // Handle Export Submit
  const handleExportSubmit = async (e) => {
    e.preventDefault();
    const checkedItems = exportForm.items.filter(
      (it) => it.checked && Number(it.quantity) > 0
    );

    if (checkedItems.length === 0) {
      addToast("Vui lòng tích chọn ít nhất 1 dịch vụ cần xuất kho với số lượng > 0", "error");
      return;
    }

    // Kiểm tra từng dịch vụ có bị xuất quá số lượng tồn kho hay không
    for (const it of checkedItems) {
      const qty = Number(it.quantity) || 0;
      const stock = Number(it.currentStock) || 0;
      if (qty > stock) {
        addToast(
          `⚠️ Không thể xuất kho! Dịch vụ "${it.serviceName}" hiện chỉ tồn ${stock} ${it.unit}, không đủ để xuất ${qty} ${it.unit}.`,
          "error"
        );
        return;
      }
    }

    setModalSubmitting(true);
    try {
      await createExportSlip({
        date: exportForm.date,
        notes: exportForm.notes,
        items: checkedItems.map((it) => ({
          serviceId: it.serviceId,
          serviceName: it.serviceName,
          unit: it.unit,
          price: Number(it.price) || 0,
          quantity: Number(it.quantity) || 1,
        })),
      });
      addToast("✅ Xuất kho thành công!");
      setShowExportModal(false);
      loadStock();
      if (activeTab === "slips") loadSlips();
    } catch (err) {
      addToast(err.response?.data?.error || "Lỗi xuất kho", "error");
    } finally {
      setModalSubmitting(false);
    }
  };

  // Filtered Stock Services
  const filteredServices = (stockData.services || []).filter((s) =>
    s.name.toLowerCase().includes(stockSearch.toLowerCase().trim())
  );

  // Filtered Import Items in Modal
  const filteredImportItems = importForm.items.filter((it) =>
    it.serviceName.toLowerCase().includes(importSearch.toLowerCase().trim())
  );

  // Filtered Export Items in Modal
  const filteredExportItems = exportForm.items.filter((it) =>
    it.serviceName.toLowerCase().includes(exportSearch.toLowerCase().trim())
  );

  // Import stats summary inside modal
  const checkedImportCount = importForm.items.filter((it) => it.checked).length;
  const totalImportQty = importForm.items.reduce(
    (sum, it) => sum + (it.checked ? Number(it.quantity) || 0 : 0),
    0
  );
  const totalImportAmount = importForm.items.reduce(
    (sum, it) => sum + (it.checked ? (Number(it.quantity) || 0) * (Number(it.price) || 0) : 0),
    0
  );

  // Export stats summary inside modal
  const checkedExportCount = exportForm.items.filter((it) => it.checked).length;
  const totalExportQty = exportForm.items.reduce(
    (sum, it) => sum + (it.checked ? Number(it.quantity) || 0 : 0),
    0
  );
  const totalExportAmount = exportForm.items.reduce(
    (sum, it) => sum + (it.checked ? (Number(it.quantity) || 0) * (Number(it.price) || 0) : 0),
    0
  );

  return (
    <div style={{ paddingBottom: 40 }}>
      <ToastContainer />

      {/* ── HEADER ── */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="page-title" style={{ fontSize: 24, fontWeight: 800 }}>
            Quản lý kho dịch vụ
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            className="btn"
            style={{
              background: "#10b981",
              color: "#fff",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onClick={openImportModal}
          >
            Nhập kho
          </button>

          <button
            className="btn"
            style={{
              background: "#f59e0b",
              color: "#fff",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onClick={openExportModal}
          >
            Xuất kho
          </button>

          <button
            className="btn"
            style={{
              background: "rgba(34, 197, 94, 0.12)",
              color: "#22c55e",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onClick={handleExportExcel}
          >
            Xuất file Excel
          </button>
        </div>
      </div>

      {/* ── STATS CARDS ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div className="card" style={{ padding: "10px 16px" }}>
          <div style={{ fontSize: 11, color: "#8a94a6", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            TỔNG DỊCH VỤ
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#3b82f6", marginTop: 2 }}>
            {formatNumber(stockData.summary?.totalItems || 0)}
          </div>
        </div>

        <div className="card" style={{ padding: "10px 16px" }}>
          <div style={{ fontSize: 11, color: "#8a94a6", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            TỔNG TỒN KHO
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#10b981", marginTop: 2 }}>
            {formatNumber(stockData.summary?.totalQuantity || 0)} <span style={{ fontSize: 13, fontWeight: 500 }}>món</span>
          </div>
        </div>

        <div className="card" style={{ padding: "10px 16px" }}>
          <div style={{ fontSize: 11, color: "#8a94a6", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            GIÁ TRỊ KHO
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#8b85ff", marginTop: 2 }}>
            {formatCurrency(stockData.summary?.totalValue || 0)}
          </div>
        </div>
      </div>

      {/* ── TABS NAV ── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          marginBottom: 20,
        }}
      >
        <button
          onClick={() => setActiveTab("stock")}
          style={{
            padding: "12px 20px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 15,
            fontWeight: activeTab === "stock" ? 700 : 500,
            color: activeTab === "stock" ? "#357A55" : "#8a94a6",
            borderBottom: activeTab === "stock" ? "3px solid #357A55" : "3px solid transparent",
            transition: "all 0.2s",
            fontFamily: "inherit",
          }}
        >
          Bảng tồn kho
        </button>

        <button
          onClick={() => setActiveTab("slips")}
          style={{
            padding: "12px 20px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 15,
            fontWeight: activeTab === "slips" ? 700 : 500,
            color: activeTab === "slips" ? "#357A55" : "#8a94a6",
            borderBottom: activeTab === "slips" ? "3px solid #357A55" : "3px solid transparent",
            transition: "all 0.2s",
            fontFamily: "inherit",
          }}
        >
          Phiếu xuất / nhập kho
        </button>
      </div>

      {/* ── TAB 1: BẢNG TỒN KHO ── */}
      {activeTab === "stock" && (
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 16 }}>Bảng tồn kho hiện tại</div>
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Tìm kiếm dịch vụ..."
              style={{ maxWidth: 300, width: "100%" }}
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
            />
          </div>

          {stockLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#8a94a6" }}>
              Đang tải dữ liệu tồn kho...
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", textTransform: "uppercase", fontSize: 12, color: "#8a94a6" }}>
                    <th style={{ padding: "12px 10px", textAlign: "center" }}>STT</th>
                    <th style={{ padding: "12px 10px", textAlign: "left" }}>Tên dịch vụ</th>
                    <th style={{ padding: "12px 10px", textAlign: "center" }}>Đơn vị tính</th>
                    <th style={{ padding: "12px 10px", textAlign: "right" }}>Đơn giá (đ)</th>
                    <th style={{ padding: "12px 10px", textAlign: "center" }}>Số lượng tồn kho</th>
                    <th style={{ padding: "12px 10px", textAlign: "right" }}>Giá trị tồn (đ)</th>
                    <th style={{ padding: "12px 10px", textAlign: "center" }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.map((svc, idx) => {
                    const qty = svc.quantity || 0;
                    let statusBadge = (
                      <span className="badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>
                        Còn hàng
                      </span>
                    );
                    if (qty === 0) {
                      statusBadge = (
                        <span className="badge" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                          Hết hàng
                        </span>
                      );
                    } else if (qty <= 5) {
                      statusBadge = (
                        <span className="badge" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
                          Sắp hết ({qty})
                        </span>
                      );
                    }

                    return (
                      <tr
                        key={svc._id || idx}
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <td style={{ padding: "12px 10px", textAlign: "center", color: "#8a94a6" }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: "12px 10px", fontWeight: 600 }}>
                          {svc.name}
                        </td>
                        <td style={{ padding: "12px 10px", textAlign: "center", color: "#8a94a6" }}>
                          {svc.unit}
                        </td>
                        <td style={{ padding: "12px 10px", textAlign: "right" }}>
                          {formatNumber(svc.price)}đ
                        </td>
                        <td style={{ padding: "12px 10px", textAlign: "center", fontWeight: 700, fontSize: 15 }}>
                          {formatNumber(qty)}
                        </td>
                        <td style={{ padding: "12px 10px", textAlign: "right", fontWeight: 600, color: "#8b85ff" }}>
                          {formatCurrency(svc.totalValue)}
                        </td>
                        <td style={{ padding: "12px 10px", textAlign: "center" }}>
                          {statusBadge}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredServices.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: 30, color: "#8a94a6" }}>
                        Không tìm thấy dịch vụ phù hợp
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: PHIẾU XUẤT / NHẬP KHO ── */}
      {activeTab === "slips" && (
        <div className="card">
          {/* Filters Bar */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 20,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {/* Type Filter */}
              <select
                className="form-control"
                style={{ width: "auto" }}
                value={slipTypeFilter}
                onChange={(e) => setSlipTypeFilter(e.target.value)}
              >
                <option value="all">-- Tất cả loại phiếu --</option>
                <option value="import">Phiếu nhập kho</option>
                <option value="export">Phiếu xuất kho</option>
              </select>

              {/* Preset Date Filter */}
              <select
                className="form-control"
                style={{ width: "auto" }}
                value={slipPreset}
                onChange={(e) => setSlipPreset(e.target.value)}
              >
                <option value="all">-- Mọi thời gian --</option>
                <option value="today">Hôm nay</option>
                <option value="yesterday">Hôm qua</option>
                <option value="this_week">Tuần này</option>
                <option value="this_month">Tháng này</option>
              </select>
            </div>

            {/* Search Box */}
            <form onSubmit={handleSlipSearchSubmit} style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Tìm mã phiếu, ghi chú, phòng..."
                style={{ width: 260 }}
                value={slipSearch}
                onChange={(e) => setSlipSearch(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                Tìm
              </button>
            </form>
          </div>

          {/* Slips Table */}
          {slipsLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#8a94a6" }}>
              Đang tải danh sách phiếu xuất/nhập...
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", textTransform: "uppercase", fontSize: 12, color: "#8a94a6" }}>
                    <th style={{ padding: "12px 10px", textAlign: "left" }}>Mã phiếu</th>
                    <th style={{ padding: "12px 10px", textAlign: "center" }}>Loại phiếu</th>
                    <th style={{ padding: "12px 10px", textAlign: "left" }}>Ngày giờ</th>
                    <th style={{ padding: "12px 10px", textAlign: "left" }}>Dịch vụ / Số lượng</th>
                    <th style={{ padding: "12px 10px", textAlign: "center" }}>Tổng số lượng</th>
                    <th style={{ padding: "12px 10px", textAlign: "right" }}>Tổng giá trị (đ)</th>
                    <th style={{ padding: "12px 10px", textAlign: "left" }}>Ghi chú / Nguồn</th>
                    <th style={{ padding: "12px 10px", textAlign: "center" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {slips.map((slip) => {
                    const isImport = slip.type === "import";
                    const typeBadge = isImport ? (
                      <span className="badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>
                        Nhập kho
                      </span>
                    ) : (
                      <span className="badge" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
                        Xuất kho
                      </span>
                    );

                    return (
                      <tr
                        key={slip._id}
                        onClick={() => setSelectedSlip(slip)}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <td style={{ padding: "12px 10px", fontWeight: 700, fontFamily: "monospace", color: "#38bdf8" }}>
                          {slip.code}
                        </td>
                        <td style={{ padding: "12px 10px", textAlign: "center" }}>
                          {typeBadge}
                        </td>
                        <td style={{ padding: "12px 10px", fontSize: 13, color: "#8a94a6" }}>
                          {formatDate(slip.date)}
                        </td>
                        <td style={{ padding: "12px 10px", fontSize: 13 }}>
                          {slip.items.map((it, i) => (
                            <div key={i} style={{ marginBottom: 2 }}>
                              • {it.serviceName} ({it.quantity} {it.unit})
                            </div>
                          ))}
                        </td>
                        <td style={{ padding: "12px 10px", textAlign: "center", fontWeight: 700 }}>
                          {slip.totalQuantity}
                        </td>
                        <td style={{ padding: "12px 10px", textAlign: "right", fontWeight: 700, color: isImport ? "#10b981" : "#f59e0b" }}>
                          {formatCurrency(slip.totalAmount)}
                        </td>
                        <td style={{ padding: "12px 10px", fontSize: 13, color: "#8a94a6", maxWidth: 220 }}>
                          {slip.notes || (slip.roomNumber ? `Xuất cho phòng ${slip.roomNumber}` : "-")}
                        </td>
                        <td style={{ padding: "12px 10px", textAlign: "center" }}>
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{
                              background: "rgba(59, 130, 246, 0.12)",
                              color: "#60a5fa",
                              border: "1px solid rgba(59, 130, 246, 0.3)",
                              fontSize: 12,
                              fontWeight: 600,
                              padding: "4px 12px",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSlip(slip);
                            }}
                          >
                            Xem
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {slips.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: 30, color: "#8a94a6" }}>
                        Chưa có phiếu xuất/nhập kho nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL CHỈNH SỬA SỐ LƯỢNG TỒN ── */}
      {showEditStockModal && editingService && (
        <div className="modal-overlay" onClick={() => !modalSubmitting && setShowEditStockModal(false)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Cập nhật số lượng tồn kho</div>
              <button className="modal-close" onClick={() => setShowEditStockModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 12, fontSize: 14 }}>
                Dịch vụ: <strong>{editingService.name}</strong> ({editingService.unit})
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: "#8a94a6", display: "block", marginBottom: 6 }}>
                  Số lượng tồn mới
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  style={{ width: "100%", color: "#0f172a", fontWeight: 700 }}
                  value={editQtyInput}
                  onChange={(e) => setEditQtyInput(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowEditStockModal(false)} disabled={modalSubmitting}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleSaveStockQty} disabled={modalSubmitting}>
                {modalSubmitting ? "..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL NHẬP KHO (BẢNG DẠNG CHECKBOX XUẤT SỐ LƯỢNG) ── */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => !modalSubmitting && setShowImportModal(false)}>
          <div className="modal" style={{ maxWidth: 850, width: "95%" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Phiếu Nhập Kho Dịch Vụ</div>
              <button className="modal-close" onClick={() => setShowImportModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleImportSubmit}>
              <div className="modal-body" style={{ maxHeight: "75vh", overflowY: "auto" }}>
                {/* Ngày giờ nhập & Ghi chú */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, color: "#8a94a6", display: "block", marginBottom: 6 }}>
                      Ngày giờ nhập kho *
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      style={{ width: "100%", color: "#0f172a", fontWeight: 600 }}
                      value={importForm.date}
                      onChange={(e) => setImportForm({ ...importForm, date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 13, color: "#8a94a6", display: "block", marginBottom: 6 }}>
                      Ghi chú / Nhà cung cấp
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập ghi chú hoặc nhà cung cấp..."
                      style={{ width: "100%", color: "#0f172a" }}
                      value={importForm.notes}
                      onChange={(e) => setImportForm({ ...importForm, notes: e.target.value })}
                    />
                  </div>
                </div>

                {/* Bảng Dịch Vụ Với Checkbox & Tìm kiếm */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    Chọn các dịch vụ nhập kho (Tích checkbox để nhập số lượng):
                  </div>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="🔍 Tìm dịch vụ..."
                    style={{ maxWidth: 240, fontSize: 13, color: "#0f172a" }}
                    value={importSearch}
                    onChange={(e) => setImportSearch(e.target.value)}
                  />
                </div>

                <div
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    overflow: "hidden",
                    marginBottom: 16,
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          borderBottom: "1px solid rgba(255,255,255,0.08)",
                          fontSize: 12,
                          color: "#8a94a6",
                          textTransform: "uppercase",
                        }}
                      >
                        <th style={{ padding: "10px 8px", textAlign: "center", width: 40 }}>
                          <input
                            type="checkbox"
                            checked={importForm.items.length > 0 && importForm.items.every((it) => it.checked)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setImportForm({
                                ...importForm,
                                items: importForm.items.map((it) => ({
                                  ...it,
                                  checked,
                                  quantity: checked ? (Number(it.quantity) > 0 ? it.quantity : 1) : it.quantity,
                                })),
                              });
                            }}
                            style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#10b981" }}
                          />
                        </th>
                        <th style={{ padding: "10px 8px", textAlign: "left" }}>Tên dịch vụ</th>
                        <th style={{ padding: "10px 8px", textAlign: "center" }}>Đơn vị</th>
                        <th style={{ padding: "10px 8px", textAlign: "center" }}>Tồn kho</th>
                        <th style={{ padding: "10px 8px", textAlign: "right" }}>Đơn giá nhập (đ)</th>
                        <th style={{ padding: "10px 8px", textAlign: "center", width: 120 }}>Số lượng nhập</th>
                        <th style={{ padding: "10px 8px", textAlign: "right" }}>Thành tiền (đ)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredImportItems.map((item) => {
                        const origIndex = importForm.items.findIndex(
                          (it) => (it.serviceId ? it.serviceId === item.serviceId : it.serviceName === item.serviceName)
                        );
                        return (
                          <tr
                            key={item.serviceId || item.serviceName}
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.05)",
                              background: item.checked ? "rgba(16, 185, 129, 0.08)" : "transparent",
                              transition: "background 0.15s",
                            }}
                          >
                            <td style={{ padding: "10px 8px", textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => {
                                  const updated = [...importForm.items];
                                  updated[origIndex].checked = !updated[origIndex].checked;
                                  if (
                                    updated[origIndex].checked &&
                                    (!updated[origIndex].quantity || Number(updated[origIndex].quantity) <= 0)
                                  ) {
                                    updated[origIndex].quantity = 1;
                                  }
                                  setImportForm({ ...importForm, items: updated });
                                }}
                                style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#10b981" }}
                              />
                            </td>
                            <td style={{ padding: "10px 8px", fontWeight: item.checked ? 700 : 500, color: item.checked ? "#10b981" : "inherit" }}>
                              {item.serviceName}
                            </td>
                            <td style={{ padding: "10px 8px", textAlign: "center", color: "#8a94a6", fontSize: 13 }}>
                              {item.unit}
                            </td>
                            <td style={{ padding: "10px 8px", textAlign: "center" }}>
                              <span style={{ fontSize: 12, color: "#8a94a6", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 10 }}>
                                {item.currentStock} {item.unit}
                              </span>
                            </td>
                            <td style={{ padding: "10px 8px", textAlign: "right" }}>
                              <input
                                type="text"
                                inputMode="numeric"
                                className="form-control"
                                style={{
                                  width: 110,
                                  textAlign: "right",
                                  padding: "4px 8px",
                                  fontSize: 13,
                                  color: item.checked ? "#0f172a" : "#64748b",
                                  fontWeight: 600,
                                }}
                                disabled={!item.checked}
                                value={formatNumberWithDots(item.price)}
                                onChange={(e) => {
                                  const raw = e.target.value.replace(/\D/g, "");
                                  const updated = [...importForm.items];
                                  updated[origIndex].price = raw;
                                  setImportForm({ ...importForm, items: updated });
                                }}
                              />
                            </td>
                            <td style={{ padding: "10px 8px", textAlign: "center" }}>
                              {item.checked ? (
                                <input
                                  type="number"
                                  min="1"
                                  className="form-control"
                                  style={{
                                    width: 85,
                                    textAlign: "center",
                                    fontWeight: 700,
                                    fontSize: 14,
                                    padding: "4px 8px",
                                    borderColor: "#10b981",
                                    background: "rgba(16, 185, 129, 0.18)",
                                    color: "#0f172a",
                                  }}
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const updated = [...importForm.items];
                                    updated[origIndex].quantity = e.target.value;
                                    setImportForm({ ...importForm, items: updated });
                                  }}
                                />
                              ) : (
                                <span style={{ color: "#6b7280", fontSize: 13 }}>-</span>
                              )}
                            </td>
                            <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 600, color: item.checked ? "#8b85ff" : "#6b7280" }}>
                              {item.checked ? formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 0)) : "-"}
                            </td>
                          </tr>
                        );
                      })}

                      {filteredImportItems.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: 24, color: "#8a94a6" }}>
                            Không tìm thấy dịch vụ nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Tóm tắt nhập kho */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    padding: "12px 16px",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                >
                  <div>
                    Đã chọn: <strong style={{ color: "#10b981" }}>{checkedImportCount}</strong> dịch vụ | Tổng số lượng nhập: <strong style={{ color: "#10b981" }}>{formatNumber(totalImportQty)}</strong>
                  </div>
                  <div>
                    Tổng tiền nhập kho: <strong style={{ color: "#10b981", fontSize: 16 }}>{formatCurrency(totalImportAmount)}</strong>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowImportModal(false)} disabled={modalSubmitting}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn" style={{ background: "#10b981", color: "#fff", fontWeight: 700 }} disabled={modalSubmitting || checkedImportCount === 0}>
                  {modalSubmitting ? "..." : `Xác nhận Nhập Kho (${checkedImportCount})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL XUẤT KHO (BẢNG DẠNG CHECKBOX XUẤT SỐ LƯỢNG) ── */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => !modalSubmitting && setShowExportModal(false)}>
          <div className="modal" style={{ maxWidth: 850, width: "95%" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Phiếu Xuất Kho Dịch Vụ</div>
              <button className="modal-close" onClick={() => setShowExportModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleExportSubmit}>
              <div className="modal-body" style={{ maxHeight: "75vh", overflowY: "auto" }}>
                {/* Ngày giờ xuất & Ghi chú */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, color: "#8a94a6", display: "block", marginBottom: 6 }}>
                      Ngày giờ xuất kho *
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      style={{ width: "100%", color: "#0f172a", fontWeight: 600 }}
                      value={exportForm.date}
                      onChange={(e) => setExportForm({ ...exportForm, date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 13, color: "#8a94a6", display: "block", marginBottom: 6 }}>
                      Ghi chú / Lý do xuất
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập ghi chú xuất kho..."
                      style={{ width: "100%", color: "#0f172a" }}
                      value={exportForm.notes}
                      onChange={(e) => setExportForm({ ...exportForm, notes: e.target.value })}
                    />
                  </div>
                </div>

                {/* Bảng Dịch Vụ Với Checkbox & Tìm kiếm */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    Chọn các dịch vụ xuất kho (Tích checkbox để nhập số lượng xuất):
                  </div>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="🔍 Tìm dịch vụ..."
                    style={{ maxWidth: 240, fontSize: 13, color: "#0f172a" }}
                    value={exportSearch}
                    onChange={(e) => setExportSearch(e.target.value)}
                  />
                </div>

                <div
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    overflow: "hidden",
                    marginBottom: 16,
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          borderBottom: "1px solid rgba(255,255,255,0.08)",
                          fontSize: 12,
                          color: "#8a94a6",
                          textTransform: "uppercase",
                        }}
                      >
                        <th style={{ padding: "10px 8px", textAlign: "center", width: 40 }}>
                          <input
                            type="checkbox"
                            checked={exportForm.items.length > 0 && exportForm.items.every((it) => it.checked)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setExportForm({
                                ...exportForm,
                                items: exportForm.items.map((it) => ({
                                  ...it,
                                  checked,
                                  quantity: checked ? (Number(it.quantity) > 0 ? it.quantity : 1) : it.quantity,
                                })),
                              });
                            }}
                            style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#f59e0b" }}
                          />
                        </th>
                        <th style={{ padding: "10px 8px", textAlign: "left" }}>Tên dịch vụ</th>
                        <th style={{ padding: "10px 8px", textAlign: "center" }}>Đơn vị</th>
                        <th style={{ padding: "10px 8px", textAlign: "center" }}>Tồn kho</th>
                        <th style={{ padding: "10px 8px", textAlign: "right" }}>Đơn giá (đ)</th>
                        <th style={{ padding: "10px 8px", textAlign: "center", width: 120 }}>Số lượng xuất</th>
                        <th style={{ padding: "10px 8px", textAlign: "right" }}>Thành tiền (đ)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExportItems.map((item) => {
                        const origIndex = exportForm.items.findIndex(
                          (it) => (it.serviceId ? it.serviceId === item.serviceId : it.serviceName === item.serviceName)
                        );
                        return (
                          <tr
                            key={item.serviceId || item.serviceName}
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.05)",
                              background: item.checked ? "rgba(245, 158, 11, 0.08)" : "transparent",
                              transition: "background 0.15s",
                            }}
                          >
                            <td style={{ padding: "10px 8px", textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => {
                                  const updated = [...exportForm.items];
                                  updated[origIndex].checked = !updated[origIndex].checked;
                                  if (
                                    updated[origIndex].checked &&
                                    (!updated[origIndex].quantity || Number(updated[origIndex].quantity) <= 0)
                                  ) {
                                    updated[origIndex].quantity = 1;
                                  }
                                  setExportForm({ ...exportForm, items: updated });
                                }}
                                style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#f59e0b" }}
                              />
                            </td>
                            <td style={{ padding: "10px 8px", fontWeight: item.checked ? 700 : 500, color: item.checked ? "#f59e0b" : "inherit" }}>
                              {item.serviceName}
                            </td>
                            <td style={{ padding: "10px 8px", textAlign: "center", color: "#8a94a6", fontSize: 13 }}>
                              {item.unit}
                            </td>
                            <td style={{ padding: "10px 8px", textAlign: "center" }}>
                              <span style={{ fontSize: 12, color: item.currentStock === 0 ? "#ef4444" : "#8a94a6", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 10 }}>
                                Tồn: {item.currentStock} {item.unit}
                              </span>
                            </td>
                            <td style={{ padding: "10px 8px", textAlign: "right" }}>
                              <input
                                type="text"
                                inputMode="numeric"
                                className="form-control"
                                style={{
                                  width: 110,
                                  textAlign: "right",
                                  padding: "4px 8px",
                                  fontSize: 13,
                                  color: item.checked ? "#0f172a" : "#64748b",
                                  fontWeight: 600,
                                }}
                                disabled={!item.checked}
                                value={formatNumberWithDots(item.price)}
                                onChange={(e) => {
                                  const raw = e.target.value.replace(/\D/g, "");
                                  const updated = [...exportForm.items];
                                  updated[origIndex].price = raw;
                                  setExportForm({ ...exportForm, items: updated });
                                }}
                              />
                            </td>
                            <td style={{ padding: "10px 8px", textAlign: "center" }}>
                              {item.checked ? (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <input
                                    type="number"
                                    min="1"
                                    max={item.currentStock}
                                    className="form-control"
                                    style={{
                                      width: 85,
                                      textAlign: "center",
                                      fontWeight: 700,
                                      fontSize: 14,
                                      padding: "4px 8px",
                                      borderColor: Number(item.quantity) > Number(item.currentStock) ? "#ef4444" : "#f59e0b",
                                      background: Number(item.quantity) > Number(item.currentStock) ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.18)",
                                      color: Number(item.quantity) > Number(item.currentStock) ? "#ef4444" : "#0f172a",
                                    }}
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const updated = [...exportForm.items];
                                      updated[origIndex].quantity = e.target.value;
                                      setExportForm({ ...exportForm, items: updated });
                                    }}
                                  />
                                  {Number(item.quantity) > Number(item.currentStock) && (
                                    <span style={{ fontSize: 10, color: "#ef4444", marginTop: 2, fontWeight: 700 }}>
                                      Vượt tồn ({item.currentStock})
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span style={{ color: "#6b7280", fontSize: 13 }}>-</span>
                              )}
                            </td>
                            <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 600, color: item.checked ? "#f59e0b" : "#6b7280" }}>
                              {item.checked ? formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 0)) : "-"}
                            </td>
                          </tr>
                        );
                      })}

                      {filteredExportItems.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: 24, color: "#8a94a6" }}>
                            Không tìm thấy dịch vụ nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Tóm tắt xuất kho */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "rgba(245, 158, 11, 0.08)",
                    border: "1px solid rgba(245, 158, 11, 0.2)",
                    padding: "12px 16px",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                >
                  <div>
                    Đã chọn: <strong style={{ color: "#f59e0b" }}>{checkedExportCount}</strong> dịch vụ | Tổng số lượng xuất: <strong style={{ color: "#f59e0b" }}>{formatNumber(totalExportQty)}</strong>
                  </div>
                  <div>
                    Tổng giá trị xuất kho: <strong style={{ color: "#f59e0b", fontSize: 16 }}>{formatCurrency(totalExportAmount)}</strong>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowExportModal(false)} disabled={modalSubmitting}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn" style={{ background: "#f59e0b", color: "#fff", fontWeight: 700 }} disabled={modalSubmitting || checkedExportCount === 0}>
                  {modalSubmitting ? "..." : `Xác nhận Xuất Kho (${checkedExportCount})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL XEM CHI TIẾT PHIẾU ── */}
      {selectedSlip && (
        <div className="modal-overlay" onClick={() => setSelectedSlip(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Chi tiết phiếu {selectedSlip.code}</div>
                <div style={{ fontSize: 13, color: "#8a94a6", marginTop: 2 }}>
                  Loại phiếu: {selectedSlip.type === "import" ? "📥 Nhập kho" : "📤 Xuất kho"} • Ngày: {formatDate(selectedSlip.date)}
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedSlip(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: 12, fontSize: 13, color: "#8a94a6" }}>
                <div>Ghi chú: {selectedSlip.notes || "Không có ghi chú"}</div>
                {selectedSlip.roomNumber && (
                  <div style={{ color: "#38bdf8", marginTop: 4 }}>Phòng order: Phòng {selectedSlip.roomNumber}</div>
                )}
                <div>Người tạo: {selectedSlip.created_by || "Hệ thống"}</div>
              </div>

              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>
                Danh sách sản phẩm ({selectedSlip.totalQuantity} món)
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 12, color: "#8a94a6" }}>
                    <th style={{ padding: "8px 4px", textAlign: "left" }}>Tên dịch vụ</th>
                    <th style={{ padding: "8px 4px", textAlign: "center" }}>SL</th>
                    <th style={{ padding: "8px 4px", textAlign: "right" }}>Đơn giá</th>
                    <th style={{ padding: "8px 4px", textAlign: "right" }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSlip.items.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 13 }}>
                      <td style={{ padding: "8px 4px" }}>{it.serviceName}</td>
                      <td style={{ padding: "8px 4px", textAlign: "center", fontWeight: 600 }}>
                        {it.quantity} {it.unit}
                      </td>
                      <td style={{ padding: "8px 4px", textAlign: "right" }}>
                        {formatNumber(it.price)}đ
                      </td>
                      <td style={{ padding: "8px 4px", textAlign: "right", fontWeight: 700 }}>
                        {formatNumber(it.totalAmount)}đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                <span>Tổng cộng:</span>
                <span style={{ color: selectedSlip.type === "import" ? "#10b981" : "#f59e0b" }}>
                  {formatCurrency(selectedSlip.totalAmount)}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelectedSlip(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
