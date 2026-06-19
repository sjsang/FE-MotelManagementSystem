import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Box, Drawer, List, ListItem, ListItemButton,
    Tooltip, IconButton, useMediaQuery, useTheme,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import HistoryIcon from "@mui/icons-material/History";
import AssignmentIcon from "@mui/icons-material/Assignment"; // Icon cho báo cáo BCA

const SIDEBAR_EXPANDED = 220;
const SIDEBAR_COLLAPSED = 56;

const REPORT_ITEMS = [
    {
        to: "/reports/revenue",
        label: "Doanh thu",
        icon: <RequestQuoteIcon fontSize="small" />,
        colors: { bg: "#ede9fe", border: "#a78bfa", icon: "#7c3aed" },
    },
    {
        to: "/reports/history",
        label: "Lịch sử đặt phòng",
        icon: <HistoryIcon fontSize="small" />,
        colors: { bg: "#dbeafe", border: "#60a5fa", icon: "#1d4ed8" },
    },
    {
        action: "bca", // Khai báo action thay vì route
        label: "Báo cáo theo quý",
        icon: <AssignmentIcon fontSize="small" />,
        colors: { bg: "#fef3c7", border: "#fbbf24", icon: "#d97706" }, // Màu cam nổi bật
    }
];

const TRANSITION = "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)";

function SidebarContent({ collapsed, onCollapse, onClose }) {
    const navigate = useNavigate();
    const location = useLocation();

    // ========================================================
    // LOGIC CHO MODAL XUẤT BÁO CÁO QUÝ (BCA)
    // ========================================================
    const [bcaModalOpen, setBcaModalOpen] = useState(false);
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentQuarter = Math.floor(today.getMonth() / 3) + 1;

    const availableYears = [];
    for (let i = 0; i < 5; i++) {
        const y = currentYear - i;
        if (y === currentYear && currentQuarter === 1) continue;
        availableYears.push(y);
    }

    const [selectedYear, setSelectedYear] = useState(availableYears[0] || currentYear - 1);

    const availableQuarters = selectedYear === currentYear
        ? Array.from({ length: currentQuarter - 1 }, (_, i) => i + 1)
        : [1, 2, 3, 4];

    const [selectedQuarter, setSelectedQuarter] = useState(availableQuarters[availableQuarters.length - 1]);

    useEffect(() => {
        const validQuarters = selectedYear === currentYear
            ? Array.from({ length: currentQuarter - 1 }, (_, i) => i + 1)
            : [1, 2, 3, 4];

        if (!validQuarters.includes(selectedQuarter)) {
            setSelectedQuarter(validQuarters[validQuarters.length - 1]);
        }
    }, [selectedYear]);

    const handleConfirmBCA = async () => {
        let fromMonth, toMonth, endDay;
        if (selectedQuarter === 1) { fromMonth = "01"; toMonth = "03"; endDay = "31"; }
        else if (selectedQuarter === 2) { fromMonth = "04"; toMonth = "06"; endDay = "30"; }
        else if (selectedQuarter === 3) { fromMonth = "07"; toMonth = "09"; endDay = "30"; }
        else if (selectedQuarter === 4) { fromMonth = "10"; toMonth = "12"; endDay = "31"; }

        const from = `${selectedYear}-${fromMonth}-01`;
        const to = `${selectedYear}-${toMonth}-${endDay}`;

        try {
            // Lấy token và API Base URL (Dùng relative URL nếu không có base)
            const token = localStorage.getItem("token");
            const baseUrl = import.meta.env?.VITE_API_URL || import.meta.env?.REACT_APP_API_URL || "";
            const url = `${baseUrl}/reports/export/bca?from=${from}&to=${to}`;

            // Fetch trực tiếp để tải file về
            const response = await fetch(url, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Lỗi tải báo cáo BCA");

            // Tạo link tải file Blob
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `PhuLuc_TT30_BCA_${from}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);

            setBcaModalOpen(false); // Thành công thì đóng modal
        } catch (error) {
            console.error("Lỗi xuất BCA:", error);
            alert("Lỗi xuất file! Vui lòng thử lại.");
        }
    };
    // ========================================================

    const getItemSx = (active) => ({
        justifyContent: "flex-start",
        width: "calc(100% - 12px)",
        margin: "3px 6px",
        pl: 1,
        pr: 1,
        py: 0.8,
        borderRadius: 2,
        backgroundColor: active ? "#bfdbfe" : "transparent",
        "&:hover": {
            backgroundColor: active ? "#93c5fd" : "rgba(0,0,0,0.04)",
        },
        overflow: "hidden",
        transition: TRANSITION,
    });

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "visible" }}>
            {/* Header */}
            <Box sx={{
                px: 1,
                bgcolor: "#FFF",
                display: "flex",
                alignItems: "center",
                justifyContent: onClose ? "flex-end" : "flex-start",
                minHeight: 48,
                borderBottom: "1px solid #e5e7eb",
            }}>
                {!onClose && (
                    <Tooltip title={collapsed ? "Mở rộng" : "Thu gọn"} placement="right" arrow>
                        <IconButton
                            onClick={onCollapse}
                            size="small"
                            sx={{
                                color: "white",
                                bgcolor: "#0EA5A4",
                                transition: TRANSITION,
                                "&:hover": { bgcolor: "#0D9488" },
                            }}
                        >
                            {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                )}

                {onClose && (
                    <Tooltip title="Đóng" placement="left" arrow>
                        <IconButton
                            onClick={onClose}
                            size="small"
                            sx={{
                                color: "white",
                                bgcolor: "#0EA5A4",
                                transition: TRANSITION,
                                "&:hover": { bgcolor: "#0D9488" },
                            }}
                        >
                            <ChevronLeftIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            {/* Menu items */}
            <List sx={{ pt: 1, flex: 1 }}>
                {REPORT_ITEMS.map((item) => {
                    const isActive = item.to ? location.pathname === item.to : false;
                    const { colors } = item;

                    const button = (
                        <ListItemButton
                            onClick={() => {
                                if (item.action === "bca") {
                                    setBcaModalOpen(true); // Bấm vào là mở Modal
                                } else {
                                    navigate(item.to);
                                    onClose?.();
                                }
                            }}
                            sx={getItemSx(isActive)}
                        >
                            <Box sx={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                backgroundColor: colors.bg,
                                border: `1.5px solid ${colors.border}`,
                                color: colors.icon,
                                transition: TRANSITION,
                            }}>
                                {item.icon}
                            </Box>

                            <Box sx={{
                                ml: 1.5,
                                overflow: "hidden",
                                maxWidth: collapsed ? 0 : 200,
                                opacity: collapsed ? 0 : 1,
                                transition: TRANSITION,
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                            }}>
                                <Box sx={{
                                    fontSize: "0.88rem",
                                    fontWeight: isActive ? 700 : 500,
                                    color: isActive ? "#1d4ed8" : "#1e293b",
                                    lineHeight: 1.4,
                                    pr: 1,
                                }}>
                                    {item.label}
                                </Box>
                            </Box>
                        </ListItemButton>
                    );

                    return (
                        <ListItem key={item.label} disablePadding>
                            {collapsed ? (
                                <Tooltip title={item.label} placement="right" arrow>
                                    {button}
                                </Tooltip>
                            ) : button}
                        </ListItem>
                    );
                })}
            </List>

            {/* MODAL BCA RENDER NỔI BÊN TRÊN */}
            {bcaModalOpen && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    zIndex: 9999, // Đẩy lên trên cùng
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(2px)",
                }}>
                    <div style={{
                        width: 400,
                        padding: 24,
                        backgroundColor: "#fff",
                        borderRadius: 12,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                    }}>
                        <h3 style={{ margin: "0 0 8px 0", fontSize: 18, color: "#1f2a37" }}>
                            Báo cáo theo quý (TT30/BCA)
                        </h3>

                        <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
                            <div style={{ flex: 1 }}>
                                <div className="form-label" style={{ fontSize: 13, color: "#6b7a90", marginBottom: 6, fontWeight: 600 }}>
                                    Chọn Năm
                                </div>
                                <select
                                    className="form-control"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    style={{
                                        width: "100%", padding: "10px 14px", cursor: "pointer",
                                        borderRadius: 8, border: "1px solid #d1d5db",
                                    }}
                                >
                                    {availableYears.map((y) => (<option key={y} value={y}>Năm {y}</option>))}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="form-label" style={{ fontSize: 13, color: "#6b7a90", marginBottom: 6, fontWeight: 600 }}>
                                    Chọn Quý
                                </div>
                                <select
                                    className="form-control"
                                    value={selectedQuarter}
                                    onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                                    style={{
                                        width: "100%", padding: "10px 14px", cursor: "pointer",
                                        borderRadius: 8, border: "1px solid #d1d5db",
                                    }}
                                >
                                    {availableQuarters.map((q) => (<option key={q} value={q}>Quý {q}</option>))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                            <button
                                className="btn btn-ghost"
                                onClick={() => setBcaModalOpen(false)}
                                style={{
                                    padding: "9px 20px", borderRadius: 8, color: "#4b5563",
                                    backgroundColor: "#f3f4f6", border: "none", cursor: "pointer"
                                }}
                            >Hủy</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleConfirmBCA}
                                style={{
                                    padding: "9px 24px", borderRadius: 8, background: "#f59e0b",
                                    color: "#fff", border: "none", fontWeight: 600,
                                    boxShadow: "0 2px 4px rgba(245,158,11,0.2)", cursor: "pointer"
                                }}
                            >Xuất file</button>
                        </div>
                    </div>
                </div>
            )}
        </Box>
    );
}

export default function ReportSubSidebar({ open, onClose }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [collapsed, setCollapsed] = useState(() => {
        try { return localStorage.getItem("report-sidebar-collapsed") === "true"; }
        catch { return false; }
    });

    const toggleCollapsed = () => setCollapsed((v) => {
        const next = !v;
        try { localStorage.setItem("report-sidebar-collapsed", String(next)); } catch { }
        return next;
    });

    if (isMobile) {
        return (
            <Drawer anchor="left" open={open} onClose={onClose}>
                <Box sx={{ width: SIDEBAR_EXPANDED }} role="presentation">
                    <SidebarContent collapsed={false} onCollapse={() => { }} onClose={onClose} />
                </Box>
            </Drawer>
        );
    }

    if (!open) return null;

    return (
        <Box
            sx={{
                width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
                flexShrink: 0,
                transition: TRANSITION,
                overflow: "visible", // Quan trọng: Đổi từ hidden sang visible để thả Modal nổi tự do
                bgcolor: "#fff",
                borderRight: "1px solid #e5e7eb",
                boxShadow: "2px 0 6px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <SidebarContent collapsed={collapsed} onCollapse={toggleCollapsed} />
        </Box>
    );
}