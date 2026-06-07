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
export const checkIn = (data) => api.post('/bookings/checkin', data);
export const checkOut = (bookingId, data) => api.post(`/bookings/checkout/${bookingId}`, data);
export const updateBooking = (id, data) => api.put(`/bookings/${id}`, data);
export const getRevenue = (params) => api.get('/bookings/stats/revenue', { params });

// Prices
export const getActivePrice = () => api.get('/prices/active');
export const getPrices = () => api.get('/prices');
export const createPrice = (data) => api.post('/prices', data);
export const updatePrice = (id, data) => api.put(`/prices/${id}`, data);
export const deletePrice = (id) => api.delete(`/prices/${id}`);

// Customers
export const getCustomers = (params) => api.get("/customers", { params });
export const getCustomerById = (id) => api.get(`/customers/${id}`);
export const getCustomerOptions = () => api.get('/customers/options');
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);
