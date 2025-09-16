import axios from 'axios';
import { User, Material, Resin, Consumption, Inventory, AuthResponse } from '../types';

const API_BASE_URL = 'https://stock.eightcode.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  register: async (userData: Partial<User> & { password: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Users API
export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },
  create: async (userData: Partial<User> & { password: string }): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  update: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
  resetPassword: async (id: string, newPassword: string): Promise<void> => {
    await api.put(`/users/${id}/reset-password`, { newPassword });
  }
};

// Materials API
export const materialsAPI = {
  getAll: async (): Promise<Material[]> => {
    const response = await api.get('/materials');
    return response.data;
  },
  getById: async (id: string): Promise<Material> => {
    const response = await api.get(`/materials/${id}`);
    return response.data;
  },
  create: async (materialData: Partial<Material>): Promise<Material> => {
    const response = await api.post('/materials', materialData);
    return response.data;
  },
  update: async (id: string, materialData: Partial<Material>): Promise<Material> => {
    const response = await api.put(`/materials/${id}`, materialData);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/materials/${id}`);
  }
};

// Resins API (Sarze)
export const resinsAPI = {
  getAll: async (): Promise<Resin[]> => {
    const response = await api.get('/resins');
    return response.data;
  },
  getById: async (id: string): Promise<Resin> => {
    const response = await api.get(`/resins/${id}`);
    return response.data;
  },
  create: async (resinData: Partial<Resin>): Promise<Resin> => {
    const response = await api.post('/resins', resinData);
    return response.data;
  },
  update: async (id: string, resinData: Partial<Resin>): Promise<Resin> => {
    const response = await api.put(`/resins/${id}`, resinData);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/resins/${id}`);
  }
};

// Consumption API
export const consumptionAPI = {
  getAll: async (date?: string): Promise<Consumption[]> => {
    const params = date ? { date } : {};
    const response = await api.get('/consumption', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Consumption> => {
    const response = await api.get(`/consumption/${id}`);
    return response.data;
  },
  create: async (consumptionData: Partial<Consumption>): Promise<Consumption> => {
    const response = await api.post('/consumption', consumptionData);
    return response.data;
  },
  update: async (id: string, consumptionData: Partial<Consumption>): Promise<Consumption> => {
    const response = await api.put(`/consumption/${id}`, consumptionData);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/consumption/${id}`);
  }
};

// Inventory API
export const inventoryAPI = {
  getAll: async (): Promise<Inventory[]> => {
    const response = await api.get('/inventory');
    return response.data;
  },
  getByMaterialId: async (materialId: string): Promise<Inventory> => {
    const response = await api.get(`/inventory/material/${materialId}`);
    return response.data;
  },
  updateTotalWeight: async (materialId: string, totalWeight: number): Promise<Inventory> => {
    const response = await api.put(`/inventory/material/${materialId}`, { totalWeight });
    return response.data;
  },
  createForMaterial: async (materialId: string, totalWeight: number): Promise<Inventory> => {
    const response = await api.post(`/inventory/material/${materialId}`, { totalWeight });
    return response.data;
  }
};
