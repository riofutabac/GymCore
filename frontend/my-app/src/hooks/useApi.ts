import { useState, useCallback } from 'react';
import { useAuthStore } from '@/lib/store';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse } from '@/lib/types';

interface UseApiOptions {
  withAuth?: boolean;
  baseURL?: string;
}

export function useApi<T = any>(options: UseApiOptions = { withAuth: true }) {
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseURL = options.baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const apiClient = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Agregar token de autenticación si es necesario
  if (options.withAuth && token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Interceptor para manejar errores
  apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Si hay error de autenticación, podríamos redirigir al login o limpiar el token
        console.error('Error de autenticación');
      }
      return Promise.reject(error);
    }
  );

  const handleResponse = <R>(response: AxiosResponse<ApiResponse<R>>): R => {
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error en la respuesta del servidor');
    }
    return response.data.data;
  };

  const request = useCallback(async <R = T>(
    config: AxiosRequestConfig
  ): Promise<R> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient(config);
      const data = handleResponse<R>(response);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiClient]);

  const get = useCallback(<R = T>(
    url: string,
    params?: any
  ): Promise<R> => {
    return request<R>({ method: 'GET', url, params });
  }, [request]);

  const post = useCallback(<R = T>(
    url: string,
    data?: any
  ): Promise<R> => {
    return request<R>({ method: 'POST', url, data });
  }, [request]);

  const put = useCallback(<R = T>(
    url: string,
    data?: any
  ): Promise<R> => {
    return request<R>({ method: 'PUT', url, data });
  }, [request]);

  const del = useCallback(<R = T>(
    url: string
  ): Promise<R> => {
    return request<R>({ method: 'DELETE', url });
  }, [request]);

  return {
    get,
    post,
    put,
    delete: del,
    isLoading,
    error,
  };
}
