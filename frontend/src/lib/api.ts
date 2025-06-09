// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_TIMEOUT = 10000;
const DEBUG = process.env.NEXT_PUBLIC_DEBUG === 'true';

// Debug logging function
const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[API DEBUG] ${message}`, data || '');
  }
};

// Connection debugging function
const debugConnection = async () => {
  if (!DEBUG) return;
  
  console.group('🔍 [CONNECTION DEBUG] Checking server status...');
  
  try {
    // Test basic connectivity
    debugLog('Testing basic connectivity to:', API_BASE_URL);
    
    const testResponse = await fetch(API_BASE_URL, {
      method: 'GET',
      mode: 'cors',
      signal: AbortSignal.timeout(5000)
    });
    
    debugLog(`Server responded with status: ${testResponse.status}`);
    
    if (testResponse.ok) {
      console.log('✅ Server is reachable');
    } else {
      console.log('❌ Server responded but with error status');
    }
    
  } catch (error) {
    console.log('❌ Cannot reach server');
    
    if (error instanceof Error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.log('🔌 Network Error: Server might be offline or CORS issue');
      } else if (error.name === 'AbortError') {
        console.log('⏱️ Timeout: Server is taking too long to respond');
      } else {
        console.log('🚫 Unknown connection error:', error.message);
      }
    }
  }
  
  // Test specific auth endpoint
  try {
    debugLog('Testing auth endpoint availability...');
    const authTest = await fetch(`${API_BASE_URL}/api/auth`, {
      method: 'OPTIONS',
      mode: 'cors',
      signal: AbortSignal.timeout(3000)
    });
    
    debugLog(`Auth endpoint status: ${authTest.status}`);
    
    if (authTest.status === 200 || authTest.status === 404) {
      console.log('✅ Auth endpoint is reachable');
    }
    
  } catch (authError) {
    console.log('❌ Auth endpoint not reachable:', authError);
  }
  
  console.groupEnd();
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

// Generic API request function with enhanced debugging
const apiRequest = async (endpoint: string, options: RequestInit) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Run connection debug on first API call
  if (DEBUG && !window.connectionDebugRun) {
    window.connectionDebugRun = true;
    await debugConnection();
  }
  
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
      mode: 'cors',
      credentials: 'omit'
    });
    
    const endTime = performance.now();
    debugLog(`📥 Response received in ${Math.round(endTime - startTime)}ms`);
    
    clearTimeout(timeoutId);
    
    // Enhanced response debugging
    debugLog(`📊 Response details:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      url: response.url,
      redirected: response.redirected
    });
    
    return await handleResponse(response);
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Enhanced error debugging
    console.group('🚨 [API ERROR] Request failed');
    debugLog('Error details:', error);
    
    if (error instanceof Error) {
      debugLog('Error name:', error.name);
      debugLog('Error message:', error.message);
      
      if (error.name === 'AbortError') {
        console.log('⏱️ Request was aborted (timeout)');
      } else if (error.name === 'TypeError') {
        if (error.message.includes('fetch')) {
          console.log('🔌 Network error: Cannot connect to server');
          console.log('❓ Possible causes:');
          console.log('  - Backend server is not running');
          console.log('  - Wrong API URL in .env.local');
          console.log('  - CORS configuration issue');
          console.log('  - Firewall blocking the connection');
        } else if (error.message.includes('CORS')) {
          console.log('🚫 CORS error: Server is not allowing frontend connections');
        }
      }
    }
    
    console.groupEnd();
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('NetworkError'))) {
      debugLog('🔌 Network error - server might be down');
      throw new Error('Network error - cannot connect to server. Check if backend is running.');
    }
    throw error;
  }
};

// Auth API functions with enhanced debugging
export const authAPI = {
  login: async (email: string, password: string) => {
    console.group('🔐 [AUTH] Login attempt');
    debugLog('Credentials:', { email, passwordLength: password.length });
    try {
      const result = await apiRequest('/api/auth/login', createFetchOptions('POST', { email, password }));
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
      const result = await apiRequest('/api/auth/register', createFetchOptions('POST', { email, password, name }));
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
      const result = await apiRequest('/api/auth/logout', createFetchOptions('POST'));
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
      const result = await apiRequest('/api/auth/me', createFetchOptions('GET'));
      debugLog('AUTH: Got current user', result);
      return result;
    } catch (error) {
      debugLog('AUTH: Failed to get current user', error);
      throw error;
    }
  }
};

// Gyms API functions
export const gymsAPI = {
  getAll: async () => {
    return await apiRequest('/api/gyms', createFetchOptions('GET'));
  },
  
  getById: async (id: string) => {
    return await apiRequest(`/api/gyms/${id}`, createFetchOptions('GET'));
  },
  
  create: async (gymData: any) => {
    return await apiRequest('/api/gyms', createFetchOptions('POST', gymData));
  },
  
  update: async (id: string, gymData: any) => {
    return await apiRequest(`/api/gyms/${id}`, createFetchOptions('PUT', gymData));
  },
  
  delete: async (id: string) => {
    return await apiRequest(`/api/gyms/${id}`, createFetchOptions('DELETE'));
  }
};

// Memberships API functions
export const membershipsAPI = {
  getAll: async () => {
    return await apiRequest('/api/memberships', createFetchOptions('GET'));
  },
  
  create: async (membershipData: any) => {
    return await apiRequest('/api/memberships', createFetchOptions('POST', membershipData));
  },
  
  update: async (id: string, membershipData: any) => {
    return await apiRequest(`/api/memberships/${id}`, createFetchOptions('PUT', membershipData));
  }
};

// Access Control API functions
export const accessControlAPI = {
  checkAccess: async (memberId: string) => {
    return await apiRequest('/api/access-control/check', createFetchOptions('POST', { memberId }));
  },
  
  getAccessLogs: async () => {
    return await apiRequest('/api/access-control/logs', createFetchOptions('GET'));
  }
};

// Inventory API functions
export const inventoryAPI = {
  getAll: async () => {
    return await apiRequest('/api/inventory', createFetchOptions('GET'));
  },
  
  create: async (itemData: any) => {
    return await apiRequest('/api/inventory', createFetchOptions('POST', itemData));
  },
  
  update: async (id: string, itemData: any) => {
    return await apiRequest(`/api/inventory/${id}`, createFetchOptions('PUT', itemData));
  },
  
  delete: async (id: string) => {
    return await apiRequest(`/api/inventory/${id}`, createFetchOptions('DELETE'));
  }
};

// Export default API request function for custom usage
export default apiRequest;

// Export apiClient alias for backward compatibility
export const apiClient = apiRequest;
