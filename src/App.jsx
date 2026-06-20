import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import RoomMap from "./pages/RoomMap";
import RoomManagement from "./pages/RoomManagement";
import PriceManagement from "./pages/PriceManagement";
import BookingHistory from "./pages/BookingHistory";
import CustomerManagement from "./pages/CustomerManagement";
import Auth from "./pages/Auth";
import "./styles/App.css";

// MUI Components
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Tooltip,
  useMediaQuery,
  useTheme,
  CssBaseline,
} from "@mui/material";

// MUI Icons
import GridViewIcon from "@mui/icons-material/GridView";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import EastIcon from "@mui/icons-material/East";

import InvoiceHistory from "./pages/Invoice/InvoiceHistory";
import ReportPage from "./pages/Report";
import ReportSubSidebar from "./components/ReportSubSidebar";

const FIRST_REPORT_PATH = "/reports/revenue";

// Kích thước chuẩn để khi trượt vào icon sẽ nằm ngay chính giữa
const SIDEBAR_FULL = 230;
const SIDEBAR_RAIL = 76;

// ── MÃ MÀU ──
const COLORS = {
  bgDark: "#14261C",
  bgActive: "#357A55",
  bgHover: "#1E3B2D",
  textTitle: "#6B8A7A",
  brandBg: "#1C3E2D",
  logoutBg: "#3A2424",
  logoutIcon: "#F87171",
};

// ── Inner layout ─────────────────────────────────────────────────────────────
function AppLayout({ handleLogout }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileReportOpen, setMobileReportOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("main-sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });

  const isInReport = location.pathname.startsWith("/reports");
  const currentSidebarWidth = isMobile
    ? SIDEBAR_FULL
    : collapsed
    ? SIDEBAR_RAIL
    : SIDEBAR_FULL;

  const toggleCollapse = () => {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem("main-sidebar-collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const handleNavClick = (path) => {
    if (path === "report") {
      navigate(FIRST_REPORT_PATH);
      if (isMobile) setMobileReportOpen(true); // Mở drawer báo cáo trên mobile
    } else {
      navigate(path);
    }
    if (isMobile) setMobileOpen(false);
  };

  const menuItems = [
    { label: "TỔNG QUAN", isSection: true },
    { label: "Sơ đồ phòng", icon: <GridViewIcon />, path: "/", exact: true },

    { label: "QUẢN LÝ", isSection: true },
    { label: "Quản lý phòng", icon: <MeetingRoomIcon />, path: "/rooms" },
    { label: "Bảng giá", icon: <PriceChangeIcon />, path: "/prices" },
    { label: "Khách lưu trú", icon: <PeopleIcon />, path: "/customers" },
    { label: "Hóa đơn", icon: <ReceiptIcon />, path: "/invoices" },

    { label: "BÁO CÁO", isSection: true },
    {
      label: "Báo cáo",
      icon: <AssessmentIcon />,
      path: "report",
      isAction: true,
      activeCheck: isInReport,
    },
  ];

  // ── Render Sidebar Content ──
  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: COLORS.bgDark,
        color: "white",
        overflow: "hidden",
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          height: 76,
          pl: "18px",
          pr: "18px",
          flexShrink: 0,
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        <IconButton
          onClick={isMobile ? () => setMobileOpen(false) : toggleCollapse}
          sx={{
            color: "white",
            flexShrink: 0,
            width: 40,
            height: 40,
            mr: "16px",
            "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
          }}
        >
          {isMobile ? <CloseIcon /> : <MenuIcon />}
        </IconButton>

        <Typography
          variant="subtitle1"
          fontWeight={800}
          color="white"
          noWrap
          letterSpacing={0.5}
          fontSize={17}
          fontFamily="inherit"
        >
          NHÀ NGHỈ 79
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.04)", mx: 3, mb: 0 }} />

      {/* Navigation List */}
      <List sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden", px: 0 }}>
        {menuItems.map((item, index) => {
          if (item.isSection) {
            return (
              <Box
                key={index}
                sx={{
                  px: "30px",
                  pt: 0,
                  pb: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  opacity: collapsed && !isMobile ? 0 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: COLORS.textTitle,
                    letterSpacing: 0.5,
                    fontSize: 11,
                    fontFamily: "inherit",
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            );
          }

          const isActive =
            item.activeCheck !== undefined
              ? item.activeCheck
              : item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

          return (
            <Tooltip
              key={index}
              title={collapsed && !isMobile ? item.label : ""}
              placement="right"
              arrow
              disableHoverListener={!collapsed || isMobile}
            >
              <ListItem disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  onClick={() => handleNavClick(item.path)}
                  sx={{
                    justifyContent: "flex-start", // Cố định thẳng hàng trái
                    width: "calc(100% - 24px)", // Chừa margin 2 bên
                    margin: "4px 12px", // Margin cố định
                    pl: "14px", // Padding trái cố định
                    pr: "14px", // Padding phải cố định
                    borderRadius: "12px",
                    color: "white",
                    bgcolor: isActive ? COLORS.bgActive : "transparent",
                    overflow: "hidden", // QUAN TRỌNG: để khung cắt chữ khi thu hẹp
                    "&:hover": {
                      bgcolor: isActive ? COLORS.bgActive : COLORS.bgHover,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 24,
                      width: 24,
                      mr: "20px",
                      justifyContent: "center",
                      color: "white",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 14.5,
                      fontWeight: isActive ? 700 : 600,
                      noWrap: true,
                      fontFamily: "inherit",
                    }}
                    sx={{ m: 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      {/* User Footer */}
      <Box
        sx={{
          p: "18px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            mr: "16px",
            bgcolor: COLORS.bgActive,
            color: "white",
            fontWeight: 700,
            fontSize: 15,
            borderRadius: 2,
          }}
        >
          QT
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0, mr: 2, overflow: "hidden" }}>
          <Typography
            variant="body2"
            fontWeight={700}
            color="white"
            fontSize={14}
            noWrap
            fontFamily="inherit"
          >
            Quản Trị Viên
          </Typography>
          <Typography
            variant="caption"
            color={COLORS.textTitle}
            fontSize={12}
            noWrap
            fontFamily="inherit"
          >
            Administrator
          </Typography>
        </Box>
        <Tooltip title="Đăng xuất" placement="top" arrow>
          <IconButton
            size="small"
            onClick={handleLogout}
            sx={{
              width: 36,
              height: 36,
              flexShrink: 0,
              color: COLORS.logoutIcon,
              bgcolor: COLORS.logoutBg,
              borderRadius: 2,
              "&:hover": { bgcolor: "#EF4444", color: "white" },
            }}
          >
            <EastIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "#F3F5F9",
        fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
      }}
    >
      {/* ── Nút nổi Menu trên Mobile ── */}
      {isMobile && (
        <IconButton
          onClick={() => setMobileOpen(!mobileOpen)}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1100,
            bgcolor: "white",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
            color: COLORS.bgDark,
            "&:hover": { bgcolor: "#f3f4f6" },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* ── Main Sidebar ── */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: currentSidebarWidth,
          flexShrink: 0,
          whiteSpace: "nowrap",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          "& .MuiDrawer-paper": {
            width: currentSidebarWidth,
            boxSizing: "border-box",
            borderRight: "none",
            overflowY: "auto",
            overflowX: "hidden", // Cắt nội dung mượt mà theo width giống Sidebar.jsx
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(255,255,255,0.1)",
              borderRadius: "10px",
            },
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* ── Report Sub-sidebar ── */}
      <ReportSubSidebar
        open={isInReport}
        onClose={() => navigate("/")}
        mobileOpen={mobileReportOpen}
        onMobileClose={() => setMobileReportOpen(false)}
      />

      {/* ── Main Content Area ── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          pt: { xs: 8, md: 3 },
          width: { md: `calc(100% - ${currentSidebarWidth}px)` },
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <Routes>
          <Route path="/" element={<RoomMap />} />
          <Route path="/rooms" element={<RoomManagement />} />
          <Route path="/prices" element={<PriceManagement />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/invoices" element={<InvoiceHistory />} />
          <Route path="/reports/revenue" element={<ReportPage />} />
          <Route path="/reports/history" element={<BookingHistory />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const handleAuthSuccess = () => setIsAuthenticated(true);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
    }
  };

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <BrowserRouter>
      <AppLayout handleLogout={handleLogout} />
    </BrowserRouter>
  );
}
