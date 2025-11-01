import axios from 'axios';

// API base URL - deployed backend server
const API_BASE_URL = 'https://expiry-shine-dash-4.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api };

// Database types
export interface Product {
  _id?: string;
  id: string;
  name: string;
  category: 'food' | 'medicine' | 'cosmetic' | 'other';
  expiryDate: string;
  status: 'active' | 'soon-expiring' | 'expired';
  imageUrl?: string;
  addedDate: string;
  daysUntilExpiry: number;
  userId: string;
}

export interface Donation {
  _id?: string;
  id: string;
  productId: string;
  donatedBy: string;
  location: string;
  contactInfo: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface User {
  _id?: string;
  id: string;
  email: string;
  password?: string;
  createdAt: string;
}