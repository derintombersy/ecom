import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth API
export const register = async (data: { name: string; email: string; password: string }) => {
  const response = await api.post('/auth/register', data);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
  }
  return response.data;
};

export const login = async (data: { email: string; password: string }) => {
  const response = await api.post('/auth/login', data);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
  }
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Products API
export const getProducts = async (params?: any) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProduct = async (id: string) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Categories API
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

// Cart API
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

export const addToCart = async (productId: string, quantity: number) => {
  const response = await api.post('/cart/items', { productId, quantity });
  return response.data;
};

export const updateCartItem = async (itemId: string, quantity: number) => {
  const response = await api.put(`/cart/items/${itemId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (itemId: string) => {
  const response = await api.delete(`/cart/items/${itemId}`);
  return response.data;
};

// Orders API
export const createOrder = async (shippingAddress: any) => {
  const response = await api.post('/orders', { shippingAddress });
  return response.data;
};

export const verifyPayment = async (orderId: string, paymentData: any) => {
  const response = await api.post(`/orders/${orderId}/verify-payment`, paymentData);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get('/orders/myorders');
  return response.data;
};

export const getOrder = async (id: string) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

// Reviews API
export const getReviews = async (productId: string) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

export const createReview = async (data: { product: string; rating: number; comment: string }) => {
  const response = await api.post('/reviews', data);
  return response.data;
};

// Users API
export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateUserProfile = async (data: { name?: string; email?: string }) => {
  const response = await api.put('/users/profile', data);
  return response.data;
};

export const addAddress = async (address: any) => {
  const response = await api.post('/users/address', address);
  return response.data;
};

export const updateAddress = async (addressId: string, address: any) => {
  const response = await api.put(`/users/address/${addressId}`, address);
  return response.data;
};

export const deleteAddress = async (addressId: string) => {
  const response = await api.delete(`/users/address/${addressId}`);
  return response.data;
};

export default api;

