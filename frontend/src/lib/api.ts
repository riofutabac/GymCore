const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Obtener token del localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const error: ApiError = {
          response: {
            data: data,
            status: response.status,
          },
          message: data?.message || response.statusText,
        };
        throw error;
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      throw error;
    }
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Helper functions para endpoints específicos
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post("/auth/login", credentials),
  
  register: (userData: { email: string; password: string; name?: string }) =>
    apiClient.post("/auth/register", userData),
  
  getProfile: () =>
    apiClient.get("/auth/profile"),
};

export const gymApi = {
  getAll: () =>
    apiClient.get("/gyms"),
  
  create: (gymData: any) =>
    apiClient.post("/gyms", gymData),
  
  joinByCode: (joinCode: string) =>
    apiClient.post("/gyms/join-by-code", { joinCode }),
  
  getMyGym: () =>
    apiClient.get("/gyms/my-gym"),
};

export const membershipApi = {
  getMy: () =>
    apiClient.get("/memberships/my-membership"),
  
  renew: (membershipId: string, paymentData: any) =>
    apiClient.post(`/memberships/${membershipId}/renew`, paymentData),
};

export const accessControlApi = {
  getMyQR: () =>
    apiClient.get("/access-control/my-qr"),
  
  validateQR: (qrData: string) =>
    apiClient.post("/access-control/validate-qr", { qrData }),
};

export const inventoryApi = {
  getProducts: () =>
    apiClient.get("/inventory/products"),
  
  createProduct: (productData: any) =>
    apiClient.post("/inventory/products", productData),
  
  recordSale: (saleData: any) =>
    apiClient.post("/inventory/sales", saleData),
  
  getSales: () =>
    apiClient.get("/inventory/sales"),
};
