import axios from 'axios';


// Thay đổi ở đây:
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const api = axios.create({ baseURL: BASE });

// ... Các hàm Rooms, Bookings, Prices giữ nguyên

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
