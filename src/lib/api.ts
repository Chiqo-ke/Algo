// API Configuration and Base URL
const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const API_ENDPOINTS = {
  // Strategy API
  strategies: {
    list: `${API_BASE_URL}/strategies/strategies/`,
    detail: (id: number) => `${API_BASE_URL}/strategies/strategies/${id}/`,
    templates: `${API_BASE_URL}/strategies/templates/`,
    categories: `${API_BASE_URL}/strategies/api/categories/`,
    health: `${API_BASE_URL}/strategies/api/health/`,
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
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        errorData.detail || 
        `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('API call failed:', error);
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
