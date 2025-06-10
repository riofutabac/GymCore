import axios from 'axios';
import type { User, Gym, Member, Product, Sale, AccessLog, ApiResponse, PaginatedResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Función de utilidad para manejar respuestas
const handleResponse = <T>(response: any): T => {
  if (!response || !response.data) {
    throw new Error('Respuesta vacía del servidor');
  }
  
  // Si la respuesta ya es del tipo esperado, devolverla
  if (response.data.data !== undefined) {
    return response.data.data;
  }
  
  // Si la respuesta es directamente lo que necesitamos
  return response.data;
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post<any>('/auth/login', {
      email,
      password,
    });
    
    console.log("Respuesta login completa:", response);
    
    if (response.status >= 200 && response.status < 300) {
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
      
      if (data) {
        console.warn('Estructura de respuesta desconocida, intentando adaptar:', data);
        
        const possibleUser = data.user || data.userData || data.userInfo || data;
        const possibleToken = data.token || data.accessToken || data.jwt || '';
        
        if (typeof possibleUser === 'object' && possibleToken) {
          if (!possibleUser.role) {
            possibleUser.role = 'CLIENT';
          }
          
          console.log('Usando estructura adaptada:', { user: possibleUser, token: possibleToken });
          return { user: possibleUser, token: possibleToken };
        }
      }

      console.error('No se pudo extraer user y token de la respuesta:', data);
    }
    
    throw new Error('Respuesta inválida del servidor');
  },

  register: async (email: string, password: string, name: string): Promise<{ user: User; token: string }> => {
    const response = await api.post<any>('/auth/register', {
      email,
      password,
      name,
    });
    
    console.log("Respuesta registro completa:", response);
    
    if (response.status >= 200 && response.status < 300) {
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
      
      if (data) {
        const possibleUser = data.user || data.userData || data.userInfo || data;
        const possibleToken = data.token || data.accessToken || data.jwt || '';
        
        if (typeof possibleUser === 'object' && possibleToken) {
          return { user: possibleUser, token: possibleToken };
        }
      }
    }
    
    throw new Error('Respuesta inválida del servidor');
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

  getMyQR: async (): Promise<{ qrCode: string; qrData: string; expiresIn: number; user: any }> => {
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
  getMyMembership: async (): Promise<any> => {
    const response = await api.get('/memberships/my');
    return handleResponse(response);
  },

  getAllMemberships: async (): Promise<any[]> => {
    const response = await api.get('/memberships/all');
    return handleResponse(response);
  },

  renew: async (membershipId: string, renewData: any): Promise<any> => {
    const response = await api.post(`/memberships/${membershipId}/renew`, renewData);
    return handleResponse(response);
  },

  suspend: async (membershipId: string): Promise<any> => {
    const response = await api.post(`/memberships/${membershipId}/suspend`);
    return handleResponse(response);
  }
};

// Inventory API
export const inventoryAPI = {
  getProducts: async (): Promise<Product[]> => {
    const response = await api.get('/inventory/products');
    return handleResponse(response);
  },

  createProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const response = await api.post('/inventory/products', productData);
    return handleResponse(response);
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/inventory/products/${id}`, productData);
    return handleResponse(response);
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/inventory/products/${id}`);
  },

  getSales: async (): Promise<Sale[]> => {
    const response = await api.get('/inventory/sales');
    return handleResponse(response);
  },

  recordSale: async (saleData: any): Promise<Sale> => {
    const response = await api.post('/inventory/sales', saleData);
    return handleResponse(response);
  }
};

// Access Control API
export const accessControlAPI = {
  getMyQR: async (): Promise<{ qrCode: string; qrData: string; expiresIn: number; user: any }> => {
    const response = await api.get('/access-control/my-qr');
    return handleResponse(response);
  },

  validateQR: async (qrData: string): Promise<{ access: 'GRANTED' | 'DENIED'; reason?: string; user: any }> => {
    const response = await api.post('/access-control/validate-qr', { qrData });
    return handleResponse(response);
  }
};

// Legacy aliases for backward compatibility
export const membershipApi = membershipsAPI;
export const inventoryApi = inventoryAPI;
export const accessControlApi = accessControlAPI;

export default api;