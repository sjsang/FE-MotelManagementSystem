import { useState, useCallback } from "react";
import globalStyle from "./utils/globalStyle";
import ModalAddBooking from "./components/Modal/ModalAddBooking";
import ModalAddRoom from "./components/Modal/ModalAddRoom";
import ModalInvoice from "./components/Modal/ModalInvoice";
import ModalRoomDetail from "./components/Modal/ModalRoomDetail";
import PageDashboard from "./pages/PageDashboard"
import PageCalendar from "./pages/PageCalendar"
import PageCheckin from "./pages/PageCheckInOut"
import PageCustomers from "./pages/PageCustomers"
import PageInvoices from "./pages/PageInvoices"
import PageReports from "./pages/PageReports"
import PageRooms from "./pages/PageRooms"
import PageRevenue from "./pages/PageRevenue"
import PageSettings from "./pages/PageSettings"
import Sidebar from "./components/Sidebar"
import Topbar from "./components/Topbar"
import Toast from "./components/Toast"

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [toast, setToast] = useState({
    msg: "",
    icon: "ti-check",
    show: false,
  });
  const [modal, setModal] = useState({
    roomDetail: false,
    addRoom: false,
    addBooking: false,
    invoice: false,
  });
  const [selectedRoom, setSelectedRoom] = useState("101");
  const toastTimer = useState(null);

  const showToast = useCallback((msg, icon = "ti-check") => {
    setToast({ msg, icon, show: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(
      () => setToast((t) => ({ ...t, show: false })),
      2800
    );
  }, []);

  const openModal = (key) => setModal((m) => ({ ...m, [key]: true }));
  const closeModal = (key) => setModal((m) => ({ ...m, [key]: false }));

  const openRoomDetail = (num) => {
    setSelectedRoom(num);
    openModal("roomDetail");
  };

  const pageMap = {
    dashboard: (
      <PageDashboard
        onNavigate={setActivePage}
        onOpenRoomDetail={openRoomDetail}
        onOpenAddRoomModal={() => openModal("addRoom")}
        showToast={showToast}
      />
    ),
    rooms: (
      <PageRooms
        onNavigate={setActivePage}
        onOpenRoomDetail={openRoomDetail}
        onOpenAddRoomModal={() => openModal("addRoom")}
        showToast={showToast}
      />
    ),
    checkin: <PageCheckin showToast={showToast} />,
    customers: <PageCustomers showToast={showToast} />,
    invoices: (
      <PageInvoices
        onOpenInvoiceDetail={() => openModal("invoice")}
        showToast={showToast}
      />
    ),
    revenue: <PageRevenue />,
    reports: <PageReports />,
    calendar: <PageCalendar showToast={showToast} />,
    settings: <PageSettings showToast={showToast} />,
  };

  return (
    <>
      <style>{globalStyle}</style>

      <div className="flex min-h-screen overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />

        <div className="ml-(--sidebar-w) flex-1 flex flex-col h-screen overflow-hidden bg-(--bg)">
          <Topbar
            activePage={activePage}
            onAddClick={() => openModal("addBooking")}
            showToast={showToast}
          />
          <div className="flex-1 overflow-y-auto py-5.5 px-6">
            {pageMap[activePage]}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ModalRoomDetail
        open={modal.roomDetail}
        onClose={() => closeModal("roomDetail")}
        roomNum={selectedRoom}
        showToast={showToast}
      />
      <ModalAddRoom
        open={modal.addRoom}
        onClose={() => closeModal("addRoom")}
        showToast={showToast}
      />
      <ModalAddBooking
        open={modal.addBooking}
        onClose={() => closeModal("addBooking")}
        showToast={showToast}
      />
      <ModalInvoice
        open={modal.invoice}
        onClose={() => closeModal("invoice")}
        showToast={showToast}
      />

      {/* Toast */}
      <Toast msg={toast.msg} icon={toast.icon} show={toast.show} />
    </>
  );
}