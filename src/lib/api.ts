// API Configuration and Base URL
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Enable detailed logging for debugging
const DEBUG_API = true;

export const API_ENDPOINTS = {
  // Auth API
  auth: {
    login: `${API_BASE_URL}/auth/login/`,
    register: `${API_BASE_URL}/auth/register/`,
    logout: `${API_BASE_URL}/auth/logout/`,
    refresh: `${API_BASE_URL}/auth/token/refresh/`,
    user: `${API_BASE_URL}/auth/user/me/`,
    profile: `${API_BASE_URL}/auth/profiles/me/`,
  },
  // Strategy API
  strategies: {
    list: `${API_BASE_URL}/strategies/strategies/`,
    detail: (id: number) => `${API_BASE_URL}/strategies/strategies/${id}/`,
    templates: `${API_BASE_URL}/strategies/templates/`,
    categories: `${API_BASE_URL}/strategies/api/categories/`,
    health: `${API_BASE_URL}/strategies/api/health/`,
    validate: `${API_BASE_URL}/strategies/validate/`,
  },
  // Data API
  data: {
    symbols: `${API_BASE_URL}/data/symbols/`,
    symbolDetail: (id: number) => `${API_BASE_URL}/data/symbols/${id}/`,
    fetchData: `${API_BASE_URL}/data/api/fetch_data/`,
    marketData: `${API_BASE_URL}/data/market-data/`,
    indicators: `${API_BASE_URL}/data/api/available_indicators/`,
    health: `${API_BASE_URL}/data/api/health/`,
  },
  // Backtest API
  backtest: {
    run: `${API_BASE_URL}/backtests/api/run_backtest/`,
    quickRun: `${API_BASE_URL}/backtests/api/quick_run/`,
    results: `${API_BASE_URL}/backtests/results/`,
    trades: `${API_BASE_URL}/backtests/trades/`,
    performance: `${API_BASE_URL}/backtests/api/performance_metrics/`,
    monitor: `${API_BASE_URL}/backtests/api/monitor/`,
    status: `${API_BASE_URL}/backtests/api/status/`,
    health: `${API_BASE_URL}/backtests/api/health/`,
  },
};

// Helper function for making API calls with error handling
export async function apiCall<T>(
  url: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string }> {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('access_token');
    
    if (DEBUG_API) {
      console.log(`🌐 API Request: ${options?.method || 'GET'} ${url}`);
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    if (DEBUG_API) {
      console.log(`📡 API Response: ${response.status} ${response.statusText}`);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (DEBUG_API) {
        console.error('❌ API Error:', response.status, errorData);
      }
      
      // Handle validation errors (field-specific errors)
      if (errorData && typeof errorData === 'object' && !errorData.message && !errorData.detail && !errorData.error) {
        // Format field errors: { "username": ["This field is required"], "email": ["Invalid email"] }
        const fieldErrors = Object.entries(errorData)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ');
        throw new Error(fieldErrors || `HTTP error! status: ${response.status}`);
      }
      
      const errorMessage = errorData.message || 
        errorData.detail || 
        errorData.error ||
        `HTTP error! status: ${response.status}`;
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (DEBUG_API) {
      console.log('✅ API Success:', data);
    }
    return { data };
  } catch (error) {
    if (DEBUG_API) {
      console.error('❌ API call failed:', error);
    }
    
    // Check if it's a network error (server not reachable)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { 
        error: '🔌 Cannot connect to server. Make sure Django is running on http://127.0.0.1:8000' 
      };
    }
    
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

// GET request helper
export async function apiGet<T>(url: string): Promise<{ data?: T; error?: string }> {
  return apiCall<T>(url, { method: 'GET' });
}

// POST request helper
export async function apiPost<T>(
  url: string,
  body: unknown
): Promise<{ data?: T; error?: string }> {
  return apiCall<T>(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// PUT request helper
export async function apiPut<T>(
  url: string,
  body: unknown
): Promise<{ data?: T; error?: string }> {
  return apiCall<T>(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

// DELETE request helper
export async function apiDelete<T>(url: string): Promise<{ data?: T; error?: string }> {
  return apiCall<T>(url, { method: 'DELETE' });
}
