// API configuration for GymCore frontend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const API_TIMEOUT = 10000;
const DEBUG = process.env.NODE_ENV === 'development';

// Debug logging function
const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[API DEBUG] ${message}`, data || '');
  }
};

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    debugLog('Getting auth token', token ? 'Token found' : 'No token');
    return token;
  }
  debugLog('Getting auth token', 'Server side - no token');
  return null;
};

// Helper function to create fetch options
const createFetchOptions = (method: string, body?: any): RequestInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
    debugLog(`Creating ${method} request with body`, body);
  } else {
    debugLog(`Creating ${method} request without body`);
  }

  return options;
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  debugLog(`Response status: ${response.status} ${response.statusText}`);
  
  if (!response.ok) {
    debugLog(`Response not OK: ${response.status}`);
    
    if (response.status === 401) {
      debugLog('Unauthorized - clearing token and redirecting');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      debugLog('Error response data', errorData);
    } catch (parseError) {
      debugLog('Failed to parse error response', parseError);
    }
    
    throw new Error(errorMessage);
  }

  try {
    const data = await response.json();
    debugLog('Response data received', data);
    return data;
  } catch (parseError) {
    debugLog('Failed to parse response JSON', parseError);
    return null;
  }
};

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  debugLog(`🚀 Making request to: ${url}`, {
    method: options.method,
    headers: options.headers,
    body: options.body ? 'Body present' : 'No body'
  });
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    debugLog('⏱️ Request timeout - aborting');
    controller.abort();
  }, API_TIMEOUT);
  
  try {
    debugLog('📡 Sending fetch request...');
    const startTime = performance.now();
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    const endTime = performance.now();
    debugLog(`📥 Response received in ${Math.round(endTime - startTime)}ms`);
    
    clearTimeout(timeoutId);
    
    return await handleResponse(response);
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      debugLog('Error details:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        throw new Error('Network error - Cannot connect to API server.');
      }
    }
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  login: async (email: string, password: string) => {
    console.group('🔐 [AUTH] Login attempt');
    debugLog('Credentials:', { email, passwordLength: password.length });
    try {
      const result = await apiRequest('/auth/login', createFetchOptions('POST', { email, password }));
      console.log('✅ Login successful');
      console.groupEnd();
      return result;
    } catch (error) {
      console.log('❌ Login failed');
      console.groupEnd();
      throw error;
    }
  },
  
  register: async (email: string, password: string, name: string) => {
    console.group('📝 [AUTH] Register attempt');
    debugLog('User data:', { email, name, passwordLength: password.length });
    try {
      const result = await apiRequest('/auth/register', createFetchOptions('POST', { email, password, name }));
      console.log('✅ Register successful');
      console.groupEnd();
      return result;
    } catch (error) {
      console.log('❌ Register failed');
      console.groupEnd();
      throw error;
    }
  },
  
  logout: async () => {
    debugLog('AUTH: Attempting logout');
    try {
      const result = await apiRequest('/auth/logout', createFetchOptions('POST'));
      debugLog('AUTH: Logout successful');
      return result;
    } catch (error) {
      debugLog('AUTH: Logout failed', error);
      throw error;
    }
  },
  
  me: async () => {
    debugLog('AUTH: Getting current user');
    try {
      const result = await apiRequest('/auth/me', createFetchOptions('GET'));
      debugLog('AUTH: Got current user', result);
      return result;
    } catch (error) {
      debugLog('AUTH: Failed to get current user', error);
      throw error;
    }
  },

  // FIX: Añadir función para crear usuarios
  createUser: async (userData: any) => {
    debugLog('AUTH: Creating user', userData);
    try {
      const result = await apiRequest('/auth/create-user', createFetchOptions('POST', userData));
      debugLog('AUTH: User created successfully', result);
      return result;
    } catch (error) {
      debugLog('AUTH: Failed to create user', error);
      throw error;
    }
  }
};

// Access Control API functions
export const accessControlApi = {
  getMyQR: async () => {
    debugLog('ACCESS: Getting my QR code');
    try {
      const result = await apiRequest('/access-control/my-qr', createFetchOptions('GET'));
      debugLog('ACCESS: Got QR code', result);
      return { data: result };
    } catch (error) {
      debugLog('ACCESS: Failed to get QR code', error);
      throw error;
    }
  },
  
  validateQR: async (qrData: string) => {
    debugLog('ACCESS: Validating QR code');
    try {
      const result = await apiRequest('/access-control/validate-qr', createFetchOptions('POST', { qrData }));
      debugLog('ACCESS: QR validation result', result);
      return { data: result };
    } catch (error) {
      debugLog('ACCESS: QR validation failed', error);
      throw error;
    }
  },
  
  checkAccess: async (memberId: string) => {
    return await apiRequest('/access-control/check', createFetchOptions('POST', { memberId }));
  },
  
  getAccessLogs: async () => {
    return await apiRequest('/access-control/logs', createFetchOptions('GET'));
  }
};

// Inventory API functions
export const inventoryApi = {
  getProducts: async () => {
    debugLog('INVENTORY: Getting products');
    try {
      const result = await apiRequest('/inventory/products', createFetchOptions('GET'));
      debugLog('INVENTORY: Got products', result);
      return result;
    } catch (error) {
      debugLog('INVENTORY: Failed to get products', error);
      throw error;
    }
  },
  
  createProduct: async (productData: any) => {
    debugLog('INVENTORY: Creating product');
    try {
      const result = await apiRequest('/inventory/products', createFetchOptions('POST', productData));
      debugLog('INVENTORY: Product created', result);
      return result;
    } catch (error) {
      debugLog('INVENTORY: Failed to create product', error);
      throw error;
    }
  },
  
  recordSale: async (saleData: any) => {
    debugLog('INVENTORY: Recording sale');
    try {
      const result = await apiRequest('/inventory/sales', createFetchOptions('POST', saleData));
      debugLog('INVENTORY: Sale recorded', result);
      return result;
    } catch (error) {
      debugLog('INVENTORY: Failed to record sale', error);
      throw error;
    }
  },
  
  getSales: async () => {
    debugLog('INVENTORY: Getting sales');
    try {
      const result = await apiRequest('/inventory/sales', createFetchOptions('GET'));
      debugLog('INVENTORY: Got sales', result);
      return result;
    } catch (error) {
      debugLog('INVENTORY: Failed to get sales', error);
      throw error;
    }
  }
};

// Gyms API functions
export const gymsAPI = {
  getAll: async () => {
    return await apiRequest('/gyms', createFetchOptions('GET'));
  },
  
  getById: async (id: string) => {
    return await apiRequest(`/gyms/${id}`, createFetchOptions('GET'));
  },
  
  create: async (gymData: any) => {
    return await apiRequest('/gyms', createFetchOptions('POST', gymData));
  },
  
  update: async (id: string, gymData: any) => {
    return await apiRequest(`/gyms/${id}`, createFetchOptions('PUT', gymData));
  },
  
  delete: async (id: string) => {
    return await apiRequest(`/gyms/${id}`, createFetchOptions('DELETE'));
  },
  
  joinByCode: async (code: string) => {
    debugLog('GYMS: Joining by code');
    try {
      const result = await apiRequest('/gyms/join', createFetchOptions('POST', { joinCode: code }));
      debugLog('GYMS: Joined successfully', result);
      return result;
    } catch (error) {
      debugLog('GYMS: Failed to join', error);
      throw error;
    }
  }
};

// Memberships API functions
export const membershipApi = {
  getMy: async () => {
    debugLog('MEMBERSHIP: Getting my membership');
    try {
      const result = await apiRequest('/memberships/my', createFetchOptions('GET'));
      debugLog('MEMBERSHIP: Got my membership', result);
      return result;
    } catch (error) {
      debugLog('MEMBERSHIP: Failed to get my membership', error);
      throw error;
    }
  },
  
  renew: async (membershipId: string, renewData: any) => {
    return await apiRequest(`/memberships/${membershipId}/renew`, createFetchOptions('POST', renewData));
  }
};

export const gymApi = {
  getMyGym: async () => {
    debugLog('GYM: Getting my gym');
    try {
      const result = await apiRequest('/gyms/my', createFetchOptions('GET'));
      debugLog('GYM: Got my gym', result);
      return result;
    } catch (error) {
      debugLog('GYM: Failed to get my gym', error);
      throw error;
    }
  }
};

// Export aliases for backward compatibility
export const accessControlAPI = accessControlApi;
export const inventoryAPI = inventoryApi;
export const gymsApi = gymsAPI;
export const membershipsAPI = membershipApi;

// Export default API request function
export default apiRequest;
export const apiClient = apiRequest;