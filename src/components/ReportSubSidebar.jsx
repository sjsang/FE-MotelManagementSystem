import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Box, Drawer, List, ListItem, ListItemButton,
    Tooltip, IconButton, useMediaQuery, useTheme,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import HistoryIcon from "@mui/icons-material/History";

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
];

const TRANSITION = "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)";

function SidebarContent({ collapsed, onCollapse, onClose }) {
    const navigate = useNavigate();
    const location = useLocation();

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
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
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
                {/* Desktop: nút collapse */}
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

                {/* Mobile: nút đóng */}
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
                    const isActive = location.pathname === item.to;
                    const { colors } = item;

                    const button = (
                        <ListItemButton
                            onClick={() => { navigate(item.to); onClose?.(); }}
                            sx={getItemSx(isActive)}
                        >
                            {/* Icon vòng tròn màu */}
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

                            {/* Label trượt mờ khi collapsed */}
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
                        <ListItem key={item.to} disablePadding>
                            {collapsed ? (
                                <Tooltip title={item.label} placement="right" arrow>
                                    {button}
                                </Tooltip>
                            ) : button}
                        </ListItem>
                    );
                })}
            </List>
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

    const sidebarWidth = open ? (collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED) : 0;

    /* ── Mobile: MUI Drawer ── */
    if (isMobile) {
        return (
            <Drawer anchor="left" open={open} onClose={onClose}>
                <Box sx={{ width: SIDEBAR_EXPANDED }} role="presentation">
                    <SidebarContent collapsed={false} onCollapse={() => { }} onClose={onClose} />
                </Box>
            </Drawer>
        );
    }

    /* ── Desktop: panel inline, width animate 0 ↔ expanded ── */
    return (
        <Box
            sx={{
                width: sidebarWidth,
                flexShrink: 0,
                transition: TRANSITION,
                overflow: "hidden",
                bgcolor: "#fff",
                borderRight: open ? "1px solid #e5e7eb" : "none",
                boxShadow: open ? "2px 0 6px rgba(0,0,0,0.04)" : "none",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <SidebarContent
                collapsed={collapsed}
                onCollapse={toggleCollapsed}
            />
        </Box>
    );
}