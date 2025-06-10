import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { User, Gym, Member, Product, Sale, PaginatedResponse } from './types';

// Definición de interfaces utilizadas en la API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Membership {
  id: string;
  userId: string;
  gymId: string;
  membershipType: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  user?: User;
  gym?: Gym;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para agregar token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('gymcore_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor para manejo de errores
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gymcore_token');
        localStorage.removeItem('gymcore_user');
        window.location.href = '/login';
      }
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Función de utilidad para manejar respuestas
const handleResponse = <T>(response: AxiosResponse): T => {
  if (!response || !response.data) {
    throw new Error('Respuesta vacía del servidor');
  }
  
  // Nuevo formato estandarizado: { success: boolean, data: any, message?: string }
  if (response.data.success !== undefined && response.data.data !== undefined) {
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error en la operación');
    }
    return response.data.data;
  }
  
  // Formato anterior por compatibilidad
  return response.data;
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      // Nuevo formato estandarizado
      if (response.data.success && response.data.data) {
        const authData = response.data.data;
        
        if (authData.user && authData.token) {
          if (!authData.user.role) {
            authData.user.role = 'CLIENT';
          }
          return { user: authData.user, token: authData.token };
        }
      }
      
      // Formatos anteriores por compatibilidad
      const data = response.data;
      
      if (data.user && data.token) {
        if (!data.user.role) {
          data.user.role = 'CLIENT';
        }
        return { user: data.user, token: data.token };
      }
      
      if (data.data && data.data.user && data.data.token) {
        if (!data.data.user.role) {
          data.data.user.role = 'CLIENT';
        }
        return { user: data.data.user, token: data.data.token };
      }
      
      if (data.userData && data.accessToken) {
        if (!data.userData.role) {
          data.userData.role = 'CLIENT';
        }
        return { user: data.userData, token: data.accessToken };
      }
      
      console.error('No se pudo extraer user y token de la respuesta:', data);
      throw new Error('Formato de respuesta no reconocido');
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  register: async (email: string, password: string, name: string): Promise<{ user: User; token: string }> => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        name,
      });
      
      // Nuevo formato estandarizado
      if (response.data.success && response.data.data) {
        const authData = response.data.data;
        
        if (authData.user && authData.token) {
          if (!authData.user.role) {
            authData.user.role = 'CLIENT';
          }
          return { user: authData.user, token: authData.token };
        }
      }
      
      // Formatos anteriores por compatibilidad
      const data = response.data;
      
      if (data.user && data.token) {
        return { user: data.user, token: data.token };
      }
      
      if (data.data && data.data.user && data.data.token) {
        return { user: data.data.user, token: data.data.token };
      }
      
      if (data.userData && data.accessToken) {
        return { user: data.userData, token: data.accessToken };
      }
      
      console.error('No se pudo extraer user y token de la respuesta:', data);
      throw new Error('Formato de respuesta no reconocido');
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gymcore_token');
      localStorage.removeItem('gymcore_user');
    }
  },

  me: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return handleResponse(response);
  },

  joinGym: async (joinCode: string): Promise<{ gym: Gym; message: string }> => {
    const response = await api.post('/gyms/join', { joinCode });
    return handleResponse(response);
  },
};

// Gyms API
export const gymsAPI = {
  getAll: async (): Promise<Gym[]> => {
    const response = await api.get('/gyms');
    return handleResponse(response);
  },

  getById: async (id: string): Promise<Gym> => {
    const response = await api.get(`/gyms/${id}`);
    return handleResponse(response);
  },

  create: async (gymData: Omit<Gym, 'id' | 'createdAt' | 'updatedAt' | 'joinCode'>): Promise<Gym> => {
    const response = await api.post('/gyms', gymData);
    return handleResponse(response);
  },

  update: async (id: string, gymData: Partial<Gym>): Promise<Gym> => {
    const response = await api.put(`/gyms/${id}`, gymData);
    return handleResponse(response);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/gyms/${id}`);
  },

  getMyGym: async (): Promise<Gym> => {
    const response = await api.get('/gyms/my');
    return handleResponse(response);
  },
};

// Members API
export const membersAPI = {
  getAll: async (gymId?: string, page = 1, limit = 10): Promise<PaginatedResponse<Member>> => {
    const url = gymId ? `/gyms/${gymId}/members` : '/members';
    const response = await api.get(`${url}?page=${page}&limit=${limit}`);
    return handleResponse(response);
  },

  getById: async (memberId: string): Promise<Member> => {
    const response = await api.get(`/members/${memberId}`);
    return handleResponse(response);
  },

  create: async (memberData: Omit<Member, 'id' | 'qrCode'>): Promise<Member> => {
    const response = await api.post('/members', memberData);
    return handleResponse(response);
  },

  update: async (memberId: string, memberData: Partial<Member>): Promise<Member> => {
    const response = await api.put(`/members/${memberId}`, memberData);
    return handleResponse(response);
  },

  delete: async (memberId: string): Promise<void> => {
    await api.delete(`/members/${memberId}`);
  },

  getMyQR: async (): Promise<{ qrCode: string; qrData: string; expiresIn: number; user: User }> => {
    const response = await api.get('/access-control/my-qr');
    return handleResponse(response);
  },
};

// Users API
export const usersAPI = {
  getAll: async (page = 1, limit = 50): Promise<{ users: User[]; total: number }> => {
    const response = await api.get(`/users?page=${page}&limit=${limit}`);
    return handleResponse(response);
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return handleResponse(response);
  },

  create: async (userData: Partial<User>): Promise<User> => {
    const response = await api.post('/users', userData);
    return handleResponse(response);
  },

  update: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, userData);
    return handleResponse(response);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  toggleStatus: async (id: string): Promise<User> => {
    const response = await api.patch(`/users/${id}/toggle-status`);
    return handleResponse(response);
  },
};

// Memberships API
export const membershipsAPI = {
  getMyMembership: async (): Promise<Membership> => {
    try {
      const response = await api.get('/memberships/my');
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener membresía:', error);
      throw error;
    }
  },

  getAllMemberships: async (): Promise<Membership[]> => {
    try {
      const response = await api.get('/memberships/all');
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener todas las membresías:', error);
      throw error;
    }
  },

  renew: async (membershipId: string, renewData: { endDate: string; paymentMethod: string; amount: number }): Promise<Membership> => {
    try {
      const response = await api.post(`/memberships/${membershipId}/renew`, renewData);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al renovar membresía ${membershipId}:`, error);
      throw error;
    }
  },

  suspend: async (membershipId: string): Promise<Membership> => {
    try {
      const response = await api.post(`/memberships/${membershipId}/suspend`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al suspender membresía ${membershipId}:`, error);
      throw error;
    }
  }
};

// Inventory API
export const inventoryAPI = {
  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/inventory/products');
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  createProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    try {
      const response = await api.post('/inventory/products', productData);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    try {
      const response = await api.put(`/inventory/products/${id}`, productData);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al actualizar producto ${id}:`, error);
      throw error;
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    try {
      await api.delete(`/inventory/products/${id}`);
    } catch (error) {
      console.error(`Error al eliminar producto ${id}:`, error);
      throw error;
    }
  },

  getSales: async (filters?: { startDate?: string; endDate?: string; productId?: string }): Promise<Sale[]> => {
    try {
      const response = await api.get('/inventory/sales', { params: filters });
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      throw error;
    }
  },

  recordSale: async (saleData: { productId: string; quantity: number; amount: number; paymentMethod: string }): Promise<Sale> => {
    try {
      const response = await api.post('/inventory/sales', saleData);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al registrar venta:', error);
      throw error;
    }
  }
};

// Access Control API
export const accessControlAPI = {
  getMyQR: async (): Promise<{ qrCode: string; qrData: string; expiresIn: number; user: User }> => {
    try {
      const response = await api.get('/access-control/my-qr');
      return handleResponse<{ qrCode: string; qrData: string; expiresIn: number; user: User }>(response);
    } catch (error) {
      console.error('Error al obtener código QR:', error);
      throw error;
    }
  },

  validateQR: async (qrData: string): Promise<{ access: 'GRANTED' | 'DENIED'; reason?: string; user: User }> => {
    try {
      const response = await api.post('/access-control/validate-qr', { qrData });
      return handleResponse<{ access: 'GRANTED' | 'DENIED'; reason?: string; user: User }>(response);
    } catch (error) {
      console.error('Error al validar código QR:', error);
      throw error;
    }
  }
};

// Legacy aliases for backward compatibility
export const membershipApi = membershipsAPI;
export const inventoryApi = inventoryAPI;
export const accessControlApi = accessControlAPI;

// Exportar tipos adicionales para uso en componentes

export default api;