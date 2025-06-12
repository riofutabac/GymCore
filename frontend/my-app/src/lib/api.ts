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
      const response = await axiosInstance.get<ApiResponse<User[]>>(`/api/auth/users/role/${role}`);
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
  
  getMyManagers: async (): Promise<User[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<User[]>>('/api/auth/managers');
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener gerentes:', error);
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
      const response = await axiosInstance.get<ApiResponse<Gym>>(`/api/gyms/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al obtener gimnasio ${id}:`, error);
      throw error;
    }
  },

  create: async (gymData: CreateGymRequest): Promise<Gym> => {
    try {
      const response = await axiosInstance.post<ApiResponse<Gym>>('/api/gyms', gymData);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al crear gimnasio:', error);
      throw error;
    }
  },

  update: async (id: string, gymData: UpdateGymRequest): Promise<Gym> => {
    try {
      const response = await axiosInstance.put<ApiResponse<Gym>>(`/api/gyms/${id}`, gymData);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al actualizar gimnasio ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete<ApiResponse<void>>(`/api/gyms/${id}`);
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
      const response = await axiosInstance.get<ApiResponse<Gym[]>>('/api/gyms');
      const gyms = handleResponse(response);
      return {
        totalGyms: gyms.length,
        activeGyms: gyms.filter(gym => gym.active).length,
        totalUsers: gyms.reduce((acc, gym) => acc + (gym.memberCount || 0), 0),
        totalRevenue: gyms.reduce((acc, gym) => acc + (gym.revenue || 0), 0)
      };
    } catch (error) {
      console.error('Error al obtener métricas del dashboard:', error);
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
      const response = await axiosInstance.get<ApiResponse<User[]>>('/api/auth/users');
      const users = handleResponse(response);
      return users;
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

  createUser: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    gymId?: string;
  }): Promise<User> => {
    try {
      const response = await axiosInstance.post<ApiResponse<User>>('/api/auth/users', userData);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    try {
      const response = await axiosInstance.put<ApiResponse<User>>(`/api/auth/users/${id}`, userData);
      const updatedUser = handleResponse(response);
      return updatedUser;
    } catch (error) {
      console.error(`Error al actualizar usuario ${id}:`, error);
      throw error;
    }
  },

  updateUserStatus: async (id: string, isActive: boolean): Promise<User> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<User>>(`/api/auth/users/${id}/status`, { isActive });
      const updatedUser = handleResponse(response);
      return updatedUser;
    } catch (error) {
      console.error(`Error al actualizar estado de usuario ${id}:`, error);
      throw error;
    }
  },

  resetPassword: async (id: string): Promise<void> => {
    try {
      const response = await axiosInstance.post<ApiResponse<void>>(`/api/auth/users/${id}/reset-password`);
      handleResponse(response);
    } catch (error) {
      console.error(`Error al resetear contraseña de usuario ${id}:`, error);
      throw error;
    }
  },

  getMyProfile: async (): Promise<User> => {
    try {
      const response = await axiosInstance.get<ApiResponse<User>>('/api/users/me');
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener mi perfil:', error);
      throw error;
    }
  },
  
  updateMyProfile: async (profileData: {
    name?: string;
    phone?: string;
    address?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    birthDate?: string;
    medicalInfo?: string;
    // Campos específicos para staff
    department?: string;
    employeeId?: string;
  }): Promise<User> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<User>>('/api/users/me', profileData);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al actualizar mi perfil:', error);
      throw error;
    }
  },

  // Método específico para que managers/owners actualicen perfiles de empleados
  updateEmployeeProfile: async (userId: string, profileData: {
    name?: string;
    phone?: string;
    department?: string;
    employeeId?: string;
    isActive?: boolean;
  }): Promise<User> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<User>>(`/api/users/${userId}/profile`, profileData);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al actualizar perfil de empleado ${userId}:`, error);
      throw error;
    }
  },
  
  updateMyAvatar: async (avatarFile: File): Promise<User> => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await axiosInstance.post<ApiResponse<User>>('/api/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error al actualizar avatar:', error);
      throw error;
    }
  },
  
  changeMyPassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    try {
      await axiosInstance.patch<ApiResponse<void>>('/api/users/me/password', passwordData);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
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

// Módulo de configuraciones/settings
export const settingsApi = {
  getMySettings: async (): Promise<User> => {
    try {
      const response = await axiosInstance.get<ApiResponse<User>>('/api/settings/profile');
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener configuraciones:', error);
      // Fallback: usar el endpoint de perfil existente
      return usersApi.getMyProfile();
    }
  },

  updateMySettings: async (settingsData: {
    name?: string;
    phone?: string;
    address?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    birthDate?: string;
    medicalInfo?: string;
    department?: string;
    employeeId?: string;
  }): Promise<User> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<User>>('/api/settings/profile', settingsData);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al actualizar configuraciones:', error);
      // Fallback: usar el endpoint de perfil existente
      return usersApi.updateMyProfile(settingsData);
    }
  },

  updateMyPassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    try {
      await axiosInstance.patch<ApiResponse<void>>('/api/settings/password', passwordData);
    } catch (error) {
      console.error('Error al cambiar contraseña en settings:', error);
      // Fallback: usar el endpoint de usuarios existente
      return usersApi.changeMyPassword(passwordData);
    }
  },

  updateMyAvatar: async (avatarFile: File): Promise<User> => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await axiosInstance.post<ApiResponse<User>>('/api/settings/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error al actualizar avatar en settings:', error);
      // Fallback: usar el endpoint de usuarios existente
      return usersApi.updateMyAvatar(avatarFile);
    }
  },
};

// Módulo de chat
export const chatApi = {
  getConversations: async (): Promise<Conversation[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Conversation[]>>('/api/chat/conversations');
      const data = handleResponse(response);
      return data;
    } catch (error) {
      console.error('Error al obtener conversaciones:', error);
      return []; // Devolver array vacío en lugar de lanzar error para evitar bloquear la UI
    }
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Message[]>>(`/api/chat/conversations/${conversationId}/messages`);
      const data = handleResponse(response);
      return data;
    } catch (error) {
      console.error(`Error al obtener mensajes de la conversación ${conversationId}:`, error);
      return []; // Devolver array vacío en lugar de lanzar error
    }
  },

  initiateConversation: async (gymId: string, managerId?: string): Promise<Conversation> => {
    try {
      const payload = managerId ? { gymId, managerId } : { gymId };
      const response = await axiosInstance.post<ApiResponse<Conversation>>('/api/chat/conversations/initiate', payload);
      const data = handleResponse(response);
      return data;
    } catch (error) {
      console.error('Error al iniciar conversación:', error);
      throw error;
    }
  },

  closeConversation: async (conversationId: string): Promise<Conversation> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<Conversation>>(`/api/chat/conversations/${conversationId}/close`);
      const data = handleResponse(response);
      return data;
    } catch (error) {
      console.error('Error al cerrar conversación:', error);
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
  settings: settingsApi,
  chat: chatApi,
};

export default api;