import axios from 'axios';
import type { User, Gym, Member, Product, Sale, AccessLog, ApiResponse, PaginatedResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para agregar token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('gymcore_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gymcore_token');
        localStorage.removeItem('gymcore_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      email,
      password,
    });
    return response.data.data;
  },

  register: async (email: string, password: string, name: string): Promise<{ user: User; token: string }> => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', {
      email,
      password,
      name,
    });
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gymcore_token');
      localStorage.removeItem('gymcore_user');
    }
  },

  me: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  joinGym: async (joinCode: string): Promise<{ gym: Gym; member: Member }> => {
    const response = await api.post<ApiResponse<{ gym: Gym; member: Member }>>('/auth/join-gym', { joinCode });
    return response.data.data;
  },
};

// Gyms API
export const gymsAPI = {
  getAll: async (): Promise<Gym[]> => {
    const response = await api.get<ApiResponse<Gym[]>>('/gyms');
    return response.data.data;
  },

  getById: async (id: string): Promise<Gym> => {
    const response = await api.get<ApiResponse<Gym>>(`/gyms/${id}`);
    return response.data.data;
  },

  create: async (gymData: Omit<Gym, 'id' | 'createdAt' | 'updatedAt' | 'joinCode'>): Promise<Gym> => {
    const response = await api.post<ApiResponse<Gym>>('/gyms', gymData);
    return response.data.data;
  },

  update: async (id: string, gymData: Partial<Gym>): Promise<Gym> => {
    const response = await api.put<ApiResponse<Gym>>(`/gyms/${id}`, gymData);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/gyms/${id}`);
  },

  joinByCode: async (joinCode: string): Promise<Gym> => {
    const response = await api.post<ApiResponse<Gym>>('/gyms/join', { joinCode });
    return response.data.data;
  },
};

// Members API
export const membersAPI = {
  getAll: async (gymId: string, page = 1, limit = 10): Promise<PaginatedResponse<Member>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Member>>>(
      `/gyms/${gymId}/members?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  getById: async (gymId: string, memberId: string): Promise<Member> => {
    const response = await api.get<ApiResponse<Member>>(`/gyms/${gymId}/members/${memberId}`);
    return response.data.data;
  },

  create: async (gymId: string, memberData: Omit<Member, 'id' | 'gymId' | 'qrCode'>): Promise<Member> => {
    const response = await api.post<ApiResponse<Member>>(`/gyms/${gymId}/members`, memberData);
    return response.data.data;
  },

  update: async (gymId: string, memberId: string, memberData: Partial<Member>): Promise<Member> => {
    const response = await api.put<ApiResponse<Member>>(`/gyms/${gymId}/members/${memberId}`, memberData);
    return response.data.data;
  },

  delete: async (gymId: string, memberId: string): Promise<void> => {
    await api.delete(`/gyms/${gymId}/members/${memberId}`);
  },

  refreshQR: async (gymId: string, memberId: string): Promise<{ qrCode: string }> => {
    const response = await api.post<ApiResponse<{ qrCode: string }>>(`/gyms/${gymId}/members/${memberId}/refresh-qr`);
    return response.data.data;
  },
};

// Products API
export const productsAPI = {
  getAll: async (gymId: string): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>(`/gyms/${gymId}/products`);
    return response.data.data;
  },

  getById: async (gymId: string, productId: string): Promise<Product> => {
    const response = await api.get<ApiResponse<Product>>(`/gyms/${gymId}/products/${productId}`);
    return response.data.data;
  },

  create: async (gymId: string, productData: Omit<Product, 'id' | 'gymId'>): Promise<Product> => {
    const response = await api.post<ApiResponse<Product>>(`/gyms/${gymId}/products`, productData);
    return response.data.data;
  },

  update: async (gymId: string, productId: string, productData: Partial<Product>): Promise<Product> => {
    const response = await api.put<ApiResponse<Product>>(`/gyms/${gymId}/products/${productId}`, productData);
    return response.data.data;
  },

  delete: async (gymId: string, productId: string): Promise<void> => {
    await api.delete(`/gyms/${gymId}/products/${productId}`);
  },
};

// Sales API
export const salesAPI = {
  getAll: async (gymId: string, page = 1, limit = 10): Promise<PaginatedResponse<Sale>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Sale>>>(
      `/gyms/${gymId}/sales?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  create: async (gymId: string, saleData: Omit<Sale, 'id' | 'gymId' | 'createdAt'>): Promise<Sale> => {
    const response = await api.post<ApiResponse<Sale>>(`/gyms/${gymId}/sales`, saleData);
    return response.data.data;
  },

  getReports: async (gymId: string, startDate: string, endDate: string): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(
      `/gyms/${gymId}/sales/reports?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data.data;
  },
};

// Access Control API
export const accessAPI = {
  scanQR: async (gymId: string, qrCode: string): Promise<{ success: boolean; member: Member; message: string }> => {
    const response = await api.post<ApiResponse<{ success: boolean; member: Member; message: string }>>(
      `/gyms/${gymId}/access/scan`,
      { qrCode }
    );
    return response.data.data;
  },

  manualEntry: async (gymId: string, memberId: string): Promise<AccessLog> => {
    const response = await api.post<ApiResponse<AccessLog>>(`/gyms/${gymId}/access/manual`, { memberId });
    return response.data.data;
  },

  getLogs: async (gymId: string, page = 1, limit = 20): Promise<PaginatedResponse<AccessLog>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<AccessLog>>>(
      `/gyms/${gymId}/access/logs?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },
};

// Users API (for admin)
export const usersAPI = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>(`/users?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  update: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, userData);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export default api;