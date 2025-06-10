import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, AuthResponse, CreateGymRequest, CreateMemberRequest, CreateProductRequest, CreateSaleRequest, Gym, LoginRequest, Member, MembershipStatus, PaginatedResponse, Product, QRData, RegisterRequest, Sale, UpdateGymRequest, UpdateMembershipRequest, UpdateProductRequest, User, UserRole } from './types';

// Configuración base de axios
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
axiosInstance.interceptors.request.use(
  (config) => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Si el error es 401 (Unauthorized), limpiar el token y redirigir al login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Función para manejar las respuestas de la API
const handleResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (!response.data.success) {
    throw new Error(response.data.message || 'Error en la solicitud');
  }
  return response.data.data;
};

// Módulo de autenticación
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/api/auth/login', credentials);
      const authData = handleResponse(response);
      
      // Guardar token en cookie y datos de usuario en localStorage
      document.cookie = `token=${authData.token}; path=/`;
      localStorage.setItem('user', JSON.stringify(authData.user));
      
      return authData;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },
  
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/api/auth/register', userData);
      return handleResponse(response);
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  },
  
  logout: (): void => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    localStorage.removeItem('user');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },
  
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  },
  
  getMyQR: async (): Promise<QRData> => {
    try {
      const response = await axiosInstance.get<ApiResponse<QRData>>('/api/auth/qr');
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener QR:', error);
      throw error;
    }
  },
};

// Módulo de gimnasios
export const gymsApi = {
  getAll: async (): Promise<Gym[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Gym[]>>('/gyms');
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener gimnasios:', error);
      throw error;
    }
  },
  
  getById: async (id: string): Promise<Gym> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Gym>>(`/gyms/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al obtener gimnasio ${id}:`, error);
      throw error;
    }
  },
  
  create: async (gymData: CreateGymRequest): Promise<Gym> => {
    try {
      const response = await axiosInstance.post<ApiResponse<Gym>>('/gyms', gymData);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al crear gimnasio:', error);
      throw error;
    }
  },
  
  update: async (id: string, gymData: UpdateGymRequest): Promise<Gym> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<Gym>>(`/gyms/${id}`, gymData);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al actualizar gimnasio ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete<ApiResponse<void>>(`/gyms/${id}`);
    } catch (error) {
      console.error(`Error al eliminar gimnasio ${id}:`, error);
      throw error;
    }
  },
  
  getMyGym: async (): Promise<Gym> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Gym>>('/gyms/my-gym');
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener mi gimnasio:', error);
      throw error;
    }
  },

  getDashboardMetrics: async (): Promise<{
    totalGyms: number;
    totalUsers: number;
    totalRevenue: number;
    activeGyms: number;
  }> => {
    try {
      const response = await axiosInstance.get<ApiResponse<{
        totalGyms: number;
        totalUsers: number;
        totalRevenue: number;
        activeGyms: number;
      }>>('/api/owner/dashboard/metrics');
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener métricas del dashboard:', error);
      throw error;
    }
  },
};

// Módulo de usuarios
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<User[]>>('/users');
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },
  
  getByRole: async (role: UserRole): Promise<User[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<User[]>>(`/users/role/${role}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al obtener usuarios con rol ${role}:`, error);
      throw error;
    }
  },
  
  getById: async (id: string): Promise<User> => {
    try {
      const response = await axiosInstance.get<ApiResponse<User>>(`/users/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al obtener usuario ${id}:`, error);
      throw error;
    }
  },
  
  updateRole: async (id: string, role: UserRole): Promise<User> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<User>>(`/users/${id}/role`, { role });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al actualizar rol de usuario ${id}:`, error);
      throw error;
    }
  },
  
  resetPassword: async (id: string): Promise<void> => {
    try {
      await axiosInstance.post<ApiResponse<void>>(`/users/${id}/reset-password`);
    } catch (error) {
      console.error(`Error al resetear contraseña de usuario ${id}:`, error);
      throw error;
    }
  },
};

// Módulo de miembros
export const membersApi = {
  getAll: async (): Promise<Member[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Member[]>>('/members');
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener miembros:', error);
      throw error;
    }
  },
  
  getById: async (id: string): Promise<Member> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Member>>(`/members/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al obtener miembro ${id}:`, error);
      throw error;
    }
  },
  
  create: async (memberData: CreateMemberRequest): Promise<Member> => {
    try {
      const response = await axiosInstance.post<ApiResponse<Member>>('/members', memberData);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al crear miembro:', error);
      throw error;
    }
  },
  
  updateMembership: async (id: string, membershipData: UpdateMembershipRequest): Promise<Member> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<Member>>(`/members/${id}/membership`, membershipData);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al actualizar membresía de miembro ${id}:`, error);
      throw error;
    }
  },
  
  suspendMembership: async (id: string): Promise<Member> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<Member>>(`/members/${id}/suspend`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al suspender membresía de miembro ${id}:`, error);
      throw error;
    }
  },
  
  validateQR: async (qrToken: string): Promise<{ user: User; membershipStatus: MembershipStatus }> => {
    try {
      const response = await axiosInstance.post<ApiResponse<{ user: User; membershipStatus: MembershipStatus }>>('/members/validate-qr', { token: qrToken });
      return handleResponse(response);
    } catch (error) {
      console.error('Error al validar QR:', error);
      throw error;
    }
  },
};

// Módulo de productos e inventario
export const inventoryApi = {
  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Product[]>>('/inventory/products');
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },
  
  getProductById: async (id: string): Promise<Product> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Product>>(`/inventory/products/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al obtener producto ${id}:`, error);
      throw error;
    }
  },
  
  createProduct: async (productData: CreateProductRequest): Promise<Product> => {
    try {
      const response = await axiosInstance.post<ApiResponse<Product>>('/inventory/products', productData);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },
  
  updateProduct: async (id: string, productData: UpdateProductRequest): Promise<Product> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<Product>>(`/inventory/products/${id}`, productData);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al actualizar producto ${id}:`, error);
      throw error;
    }
  },
  
  deleteProduct: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete<ApiResponse<void>>(`/inventory/products/${id}`);
    } catch (error) {
      console.error(`Error al eliminar producto ${id}:`, error);
      throw error;
    }
  },
  
  getSales: async (): Promise<Sale[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Sale[]>>('/inventory/sales');
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      throw error;
    }
  },
  
  getSaleById: async (id: string): Promise<Sale> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Sale>>(`/inventory/sales/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al obtener venta ${id}:`, error);
      throw error;
    }
  },
  
  recordSale: async (saleData: CreateSaleRequest): Promise<Sale> => {
    try {
      const response = await axiosInstance.post<ApiResponse<Sale>>('/inventory/sales', saleData);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al registrar venta:', error);
      throw error;
    }
  },
};

// Módulo de accesos
export const accessApi = {
  getAccessLogs: async (): Promise<any[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<any[]>>('/access/logs');
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener logs de acceso:', error);
      throw error;
    }
  },
};

// Exportar todos los módulos de API
const api = {
  auth: authApi,
  gyms: gymsApi,
  users: usersApi,
  members: membersApi,
  inventory: inventoryApi,
  access: accessApi,
};

export default api;