import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
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
export const authAPI = {
  login: async (email: string, password: string) => {
    // Simulación de respuesta exitosa para demo
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular diferentes roles basados en email
    let role = 'CLIENT';
    if (email.includes('admin')) role = 'MANAGER';
    if (email.includes('reception')) role = 'RECEPTION';
    if (email.includes('owner')) role = 'SYS_ADMIN';
    
    return {
      user: {
        id: '1',
        email,
        name: 'Usuario Demo',
        role,
      },
      token: 'demo-token-' + Date.now(),
    };
  },

  register: async (email: string, password: string, name: string) => {
    // Simulación de respuesta exitosa para demo
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      user: {
        id: '1',
        email,
        name,
        role: 'CLIENT',
      },
      token: 'demo-token-' + Date.now(),
    };
  },
};

// Gyms API
export const gymsAPI = {
  joinByCode: async (joinCode: string) => {
    // Simulación de respuesta exitosa para demo
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (joinCode === 'GYM123') {
      return {
        gym: {
          id: '1',
          name: 'GymCore Demo',
          joinCode: 'GYM123',
        },
      };
    }
    
    throw new Error('Código de gimnasio inválido');
  },
};

export default api;