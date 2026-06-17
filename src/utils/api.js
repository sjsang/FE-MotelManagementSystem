import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: BASE });

// Tự động đính kèm JWT token vào header của tất cả request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Tự động đăng xuất nếu token hết hạn hoặc không khớp chữ ký (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getUserInfo = () => api.get('/auth/me');

// Rooms
export const getRooms = () => api.get('/rooms');
export const createRoom = (data) => api.post('/rooms', data);
export const updateRoom = (id, data) => api.put(`/rooms/${id}`, data);
export const deleteRoom = (id) => api.delete(`/rooms/${id}`);
// Bookings
export const getBookings = (params) => api.get('/bookings', { params });
export const getBookingById = (id) => api.get(`/bookings/${id}`); // Mới thêm
export const checkIn = (data) => api.post('/bookings/checkin', data);
export const previewCheckout = (bookingId) => api.get(`/bookings/preview-checkout/${bookingId}`); // Mới thêm
export const checkOut = (bookingId, data) => api.post(`/bookings/checkout/${bookingId}`, data);
export const updateBooking = (id, data) => api.put(`/bookings/${id}`, data);
export const getRevenue = (params) => api.get('/bookings/stats/revenue', { params });

// Prices
export const getActivePrice = () => api.get('/prices/active');
export const getPrices = () => api.get('/prices');
export const createPrice = (data) => api.post('/prices', data);
export const updatePrice = (id, data) => api.put(`/prices/${id}`, data);
export const deletePrice = (id) => api.delete(`/prices/${id}`);

// Price services (dịch vụ trong bảng giá)
export const addPriceService = (priceId, data) => api.post(`/prices/${priceId}/services`, data);
export const deletePriceService = (priceId, serviceId) => api.delete(`/prices/${priceId}/services/${serviceId}`);

// Customers
export const getCustomers = (params) => api.get("/customers", { params });
export const getCustomerById = (id) => api.get(`/customers/${id}`);
export const getCustomerOptions = () => api.get('/customers/options');
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

// Invoices
export const createInvoice = (data) => api.post('/invoices', data);
export const getInvoices = (params) => api.get('/invoices', { params });
export const getInvoiceById = (id) => api.get(`/invoices/${id}`);
export const cancelInvoice = (id, data) => api.patch(`/invoices/${id}/cancel`, data);

// Reports
export const getReportSummary = (params) =>
  api.get('/reports/summary', { params });

export const getDailyRevenueReport = (params) =>
  api.get('/reports/daily', { params });

export const getMonthlyRevenueReport = (params) =>
  api.get('/reports/monthly', { params });

export const getReportInvoices = (params) =>
  api.get('/reports/invoices', { params });

export const exportReportExcel = (params) =>
  api.get('/reports/export/excel', {
    params,
    responseType: 'blob',
  });

// THÊM ĐOẠN NÀY VÀO DƯỚI CÙNG:
export const exportReportBCA = (params) =>
  api.get('/reports/export/bca', {
    params,
    responseType: 'blob', // Rất quan trọng để tải được file Excel về
  });