import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, CreateGymRequest, CreateMemberRequest, CreateProductRequest, CreateSaleRequest, Gym, Member, MembershipStatus, PaginatedResponse, Product, QRData, Sale, UpdateGymRequest, UpdateMembershipRequest, UpdateProductRequest, User, UserRole } from './types';
import { createSupabaseBrowserClient } from './supabase';

// Configuración base de axios
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de Supabase
axiosInstance.interceptors.request.use(
  async (config) => {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
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
  async (error: AxiosError) => {
    // Si el error es 401 (Unauthorized), redirigir al login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Cerrar sesión en Supabase
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
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
  // Ya no necesitamos login ni register porque se manejan con Supabase directamente

  getProfile: async (): Promise<User> => {
    try {
      const response = await axiosInstance.get<ApiResponse<User>>('/api/auth/me');
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  },

  // getCurrentUser ahora usa Supabase para verificar la sesión
  getCurrentUser: async (): Promise<User | null> => {
    if (typeof window === 'undefined') return null;

    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();

      if (!data.session) return null;

      // Obtener los datos completos del usuario desde nuestra API
      const user = await authApi.getProfile();
      return user;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  },

  // Método para obtener usuarios por rol (para administradores)
  getUsersByRole: async (role: UserRole): Promise<User[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<User[]>>(`/api/auth/users/${role}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al obtener usuarios con rol ${role}:`, error);
      throw error;
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
      const response = await axiosInstance.get<ApiResponse<Gym[]>>('/api/gyms');
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
      // Usar un endpoint existente o simular datos si no hay endpoint específico
      // Podemos usar /api/gyms para obtener gimnasios y construir las métricas
      const response = await axiosInstance.get<ApiResponse<Gym[]>>('/api/gyms');
      const gyms = handleResponse(response);

      // Construir métricas basadas en los gimnasios disponibles
      return {
        totalGyms: gyms.length,
        activeGyms: gyms.filter(gym => gym.active).length,
        totalUsers: gyms.reduce((acc, gym) => acc + (gym.memberCount || 0), 0),
        totalRevenue: gyms.reduce((acc, gym) => acc + (gym.revenue || 0), 0)
      };
    } catch (error) {
      console.error('Error al obtener métricas del dashboard:', error);
      // Devolver datos simulados en caso de error para evitar que la UI se rompa
      return {
        totalGyms: 0,
        activeGyms: 0,
        totalUsers: 0,
        totalRevenue: 0
      };
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
  joinGym: async (gymId: string): Promise<User> => {
    try {
      const response = await axiosInstance.post<ApiResponse<User>>('/api/members/join-gym', { gymId });
      // Después de unirse a un gimnasio, actualizamos el perfil del usuario
      const updatedUser = handleResponse(response);
      return updatedUser;
    } catch (error) {
      console.error('Error al unirse al gimnasio:', error);
      throw error;
    }
  },
  getAll: async (): Promise<Member[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Member[]>>('/api/members');
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener miembros:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Member> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Member>>(`/api/members/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al obtener miembro ${id}:`, error);
      throw error;
    }
  },

  getMembers: async (gymId: string): Promise<Member[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Member[]>>(`/api/members/gym/${gymId}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al obtener miembros del gimnasio ${gymId}:`, error);
      throw error;
    }
  },

  getMembershipTypes: async (gymId: string): Promise<any[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<any[]>>(`/api/gyms/${gymId}/membership-types`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al obtener tipos de membresía del gimnasio ${gymId}:`, error);
      // Devolver tipos por defecto si no hay endpoint específico
      return [
        { id: 'daily', code: 'daily', name: 'Diaria' },
        { id: 'weekly', code: 'weekly', name: 'Semanal' },
        { id: 'monthly', code: 'monthly', name: 'Mensual' },
        { id: 'quarterly', code: 'quarterly', name: 'Trimestral' },
        { id: 'semiannual', code: 'semiannual', name: 'Semestral' },
        { id: 'annual', code: 'annual', name: 'Anual' }
      ];
    }
  },

  createMember: async (memberData: CreateMemberRequest): Promise<Member> => {
    try {
      const response = await axiosInstance.post<ApiResponse<Member>>('/api/members', memberData);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al crear miembro:', error);
      throw error;
    }
  },

  updateMembership: async (id: string, membershipData: UpdateMembershipRequest): Promise<Member> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<Member>>(`/api/members/${id}/membership`, membershipData);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al actualizar membresía de miembro ${id}:`, error);
      throw error;
    }
  },

  suspendMembership: async (id: string): Promise<Member> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<Member>>(`/api/members/${id}/suspend`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al suspender membresía de miembro ${id}:`, error);
      throw error;
    }
  },

  validateQR: async (qrToken: string): Promise<{ user: User; membershipStatus: MembershipStatus }> => {
    try {
      const response = await axiosInstance.post<ApiResponse<{ user: User; membershipStatus: MembershipStatus }>>('/api/members/validate-qr', { token: qrToken });
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
      const response = await axiosInstance.get<ApiResponse<Product[]>>('/api/inventory/products');
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  getProductById: async (id: string): Promise<Product> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Product>>(`/api/inventory/products/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al obtener producto ${id}:`, error);
      throw error;
    }
  },

  createProduct: async (productData: CreateProductRequest): Promise<Product> => {
    try {
      const response = await axiosInstance.post<ApiResponse<Product>>('/api/inventory/products', productData);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },

  updateProduct: async (id: string, productData: UpdateProductRequest): Promise<Product> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<Product>>(`/api/inventory/products/${id}`, productData);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al actualizar producto ${id}:`, error);
      throw error;
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete<ApiResponse<void>>(`/api/inventory/products/${id}`);
    } catch (error) {
      console.error(`Error al eliminar producto ${id}:`, error);
      throw error;
    }
  },

  getSales: async (): Promise<Sale[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Sale[]>>('/api/inventory/sales');
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      throw error;
    }
  },

  getSaleById: async (id: string): Promise<Sale> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Sale>>(`/api/inventory/sales/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al obtener venta ${id}:`, error);
      throw error;
    }
  },

  recordSale: async (saleData: CreateSaleRequest): Promise<Sale> => {
    try {
      const response = await axiosInstance.post<ApiResponse<Sale>>('/api/inventory/sales', saleData);
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
      const response = await axiosInstance.get<ApiResponse<any[]>>('/api/access/logs');
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