// API Configuration and Base URL
import { logger } from './logger';

// Use environment variable, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Handle session expiration - redirect to login and clear tokens
function handleSessionExpired() {
  logger.auth.warn('Session expired - redirecting to login');
  
  // Dispatch custom event for UI components to show notifications 
  window.dispatchEvent(new CustomEvent('session-expired', {
    detail: { message: 'Your session has expired. Please log in again.' }
  }));
  
  // Clear authentication tokens part
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  // Small delay to allow notifications to show
  setTimeout(() => {
    // Redirect to login page
    window.location.href = '/login';
  }, 100);
}

// Disable verbose API debug logging in production
const DEBUG_API = import.meta.env.DEV === true;

export const API_ENDPOINTS = {
  // Auth API 
  auth: {
    login: `${API_BASE_URL}/auth/login/`,
    register: `${API_BASE_URL}/auth/register/`,
    logout: `${API_BASE_URL}/auth/logout/`,
    refresh: `${API_BASE_URL}/auth/token/refresh/`,
    user: `${API_BASE_URL}/auth/user/me/`,
    changePassword: `${API_BASE_URL}/auth/change-password/`,
    googleAuth: `${API_BASE_URL}/auth/google/`,
    googleCallback: `${API_BASE_URL}/auth/google/callback/`,
    profile: `${API_BASE_URL}/auth/profiles/me/`,
    profiles: `${API_BASE_URL}/auth/profiles/`,
    profileDetail: (id: number) => `${API_BASE_URL}/auth/profiles/${id}/`,
    aiContexts: `${API_BASE_URL}/auth/ai-contexts/`,
    aiContextDetail: (id: number) => `${API_BASE_URL}/auth/ai-contexts/${id}/`,
    chatSessions: `${API_BASE_URL}/auth/chat-sessions/`,
    chatSessionDetail: (id: number) => `${API_BASE_URL}/auth/chat-sessions/${id}/`,
    chat: `${API_BASE_URL}/auth/chat/`,
    health: `${API_BASE_URL}/auth/health/`,
  },
  // Strategy API
  strategies: {
    list: `${API_BASE_URL}/strategies/strategies/`,
    detail: (id: number) => `${API_BASE_URL}/strategies/strategies/${id}/`,
    templates: `${API_BASE_URL}/strategies/templates/`,
    templateDetail: (id: number) => `${API_BASE_URL}/strategies/templates/${id}/`,
    categories: `${API_BASE_URL}/strategies/api/categories/`,
    health: `${API_BASE_URL}/strategies/api/health/`,
    validate: `${API_BASE_URL}/strategies/validate/`,
    validateFile: `${API_BASE_URL}/strategies/validate-file/`,
    validateWithAI: `${API_BASE_URL}/strategies/api/validate_strategy_with_ai/`,
    createWithAI: `${API_BASE_URL}/strategies/api/create_strategy_with_ai/`,
    updateWithAI: (id: number) => `${API_BASE_URL}/strategies/api/${id}/update_strategy_with_ai/`,
    strategyValidate: (id: number) => `${API_BASE_URL}/strategies/strategies/${id}/validate/`,
    strategyBacktest: (id: number) => `${API_BASE_URL}/strategies/strategies/${id}/backtest/`,
    strategyClone: (id: number) => `${API_BASE_URL}/strategies/strategies/${id}/clone/`,
    validations: `${API_BASE_URL}/strategies/validations/`,
    validationDetail: (id: number) => `${API_BASE_URL}/strategies/validations/${id}/`,
    performance: `${API_BASE_URL}/strategies/performance/`,
    performanceDetail: (id: number) => `${API_BASE_URL}/strategies/performance/${id}/`,
    comments: `${API_BASE_URL}/strategies/comments/`,
    commentDetail: (id: number) => `${API_BASE_URL}/strategies/comments/${id}/`,
    tags: `${API_BASE_URL}/strategies/tags/`,
    tagDetail: (id: number) => `${API_BASE_URL}/strategies/tags/${id}/`,
    chat: `${API_BASE_URL}/strategies/chat/`,
    chatDetail: (id: number) => `${API_BASE_URL}/strategies/chat/${id}/`,
    // Code generation endpoints
    generateExecutableCode: `${API_BASE_URL}/strategies/api/generate_executable_code/`,
    generateWithFixing: `${API_BASE_URL}/strategies/api/generate_with_auto_fix/`,
    generateStrategyUnified: `${API_BASE_URL}/strategies/api/generate_strategy_unified/`,  // NEW: Unified endpoint with Copilot support
    // Bot performance endpoints
    botPerformance: `${API_BASE_URL}/strategies/bot-performance/`,
    botPerformanceDetail: (id: number) => `${API_BASE_URL}/strategies/bot-performance/${id}/`,
    verifiedBots: `${API_BASE_URL}/strategies/bot-performance/verified_bots/`,
    verifyBot: `${API_BASE_URL}/strategies/bot-performance/verify_bot/`,
    verifyAllBots: `${API_BASE_URL}/strategies/bot-performance/verify_all/`,
    botTestHistory: (id: number) => `${API_BASE_URL}/strategies/bot-performance/${id}/test_history/`,
  },
  // Data API
  data: {
    symbols: `${API_BASE_URL}/data/symbols/`,
    symbolDetail: (id: number) => `${API_BASE_URL}/data/symbols/${id}/`,
    fetchData: `${API_BASE_URL}/data/api/fetch_data/`,
    marketData: `${API_BASE_URL}/data/market-data/`,
    marketDataDetail: (id: number) => `${API_BASE_URL}/data/market-data/${id}/`,
    dataRequests: `${API_BASE_URL}/data/data-requests/`,
    dataRequestDetail: (id: number) => `${API_BASE_URL}/data/data-requests/${id}/`,
    indicators: `${API_BASE_URL}/data/api/available_indicators/`,
    indicatorsList: `${API_BASE_URL}/data/indicators/`,
    indicatorDetail: (id: number) => `${API_BASE_URL}/data/indicators/${id}/`,
    indicatorData: `${API_BASE_URL}/data/indicator-data/`,
    indicatorDataDetail: (id: number) => `${API_BASE_URL}/data/indicator-data/${id}/`,
    health: `${API_BASE_URL}/data/api/health/`,
  },
  // Backtest API
  backtest: {
    run: `${API_BASE_URL}/backtests/api/run_backtest/`,
    quickRun: `${API_BASE_URL}/backtests/api/quick_run/`,
    configs: `${API_BASE_URL}/backtests/configs/`,
    configDetail: (id: number) => `${API_BASE_URL}/backtests/configs/${id}/`,
    runs: `${API_BASE_URL}/backtests/runs/`,
    runDetail: (id: number) => `${API_BASE_URL}/backtests/runs/${id}/`,
    results: `${API_BASE_URL}/backtests/results/`,
    resultDetail: (id: number) => `${API_BASE_URL}/backtests/results/${id}/`,
    trades: `${API_BASE_URL}/backtests/trades/`,
    tradeDetail: (id: number) => `${API_BASE_URL}/backtests/trades/${id}/`,
    alerts: `${API_BASE_URL}/backtests/alerts/`,
    alertDetail: (id: number) => `${API_BASE_URL}/backtests/alerts/${id}/`,
    performance: `${API_BASE_URL}/backtests/api/performance_metrics/`,
    monitor: `${API_BASE_URL}/backtests/api/monitor/`,
    status: `${API_BASE_URL}/backtests/api/status/`,
    health: `${API_BASE_URL}/backtests/api/health/`,
    // Latest backtest results per strategy (replaces previous on new backtest)
    latestResults: `${API_BASE_URL}/strategies/backtest-results/`,
    latestResultByStrategy: (strategyId: number) => `${API_BASE_URL}/strategies/backtest-results/${strategyId}/`,
    latestResultByStrategyQuery: (strategyId: number) => `${API_BASE_URL}/strategies/backtest-results/by_strategy/?strategy_id=${strategyId}`,
  },
  // Live Trading API
  trading: {
    credentials: `${API_BASE_URL}/trading/credentials/`,
    credentialDetail: (id: number) => `${API_BASE_URL}/trading/credentials/${id}/`,
    sessions: `${API_BASE_URL}/trading/sessions/`,
    sessionDetail: (id: number) => `${API_BASE_URL}/trading/sessions/${id}/`,
    sessionStop: (id: number) => `${API_BASE_URL}/trading/sessions/${id}/stop/`,
    sessionPositions: (id: number) => `${API_BASE_URL}/trading/sessions/${id}/positions/`,
    sessionClosePosition: (id: number) => `${API_BASE_URL}/trading/sessions/${id}/close_position/`,
  },
  // Production API
  production: {
    strategies: {
      validateSchema: `${API_BASE_URL}/production/strategies/validate-schema/`,
      validateCode: `${API_BASE_URL}/production/strategies/validate-code/`,
      sandboxTest: `${API_BASE_URL}/production/strategies/sandbox-test/`,
      lifecycle: (id: number) => `${API_BASE_URL}/production/strategies/${id}/lifecycle/`,
      deploy: (id: number) => `${API_BASE_URL}/production/strategies/${id}/deploy/`,
      rollback: (id: number) => `${API_BASE_URL}/production/strategies/${id}/rollback/`,
      health: `${API_BASE_URL}/production/strategies/health/`,
    },
    backtests: {
      validateConfig: `${API_BASE_URL}/production/backtests/validate-config/`,
      runSandbox: `${API_BASE_URL}/production/backtests/run-sandbox/`,
      status: (id: number) => `${API_BASE_URL}/production/backtests/${id}/status/`,
      health: `${API_BASE_URL}/production/backtests/health/`,
    },
  },
};

// Helper function for making API calls with error handling
export async function apiCall<T>(
  url: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string }> {
  const startTime = performance.now();
  const method = options?.method || 'GET';
  
  try {
    // Get token from localStorage
    const token = localStorage.getItem('access_token');
    
    if (DEBUG_API) {
      logger.api.request(method, url, options?.body ? JSON.parse(options.body as string) : undefined);
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    const duration = Math.round(performance.now() - startTime);
    
    if (DEBUG_API) {
      logger.api.response(response.status, url, duration);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle 401 Unauthorized - session expired or invalid token
      if (response.status === 401) {
        if (DEBUG_API) {
          logger.api.warn('Unauthorized (401) - session expired, redirecting to login', { url, method, duration });
        }
        handleSessionExpired();
        return { error: 'Session expired. Please log in again.' };
      }
      
      // Handle 404 Not Found - treat as no data rather than an error for GET requests
      if (response.status === 404 && method === 'GET') {
        if (DEBUG_API) {
          logger.api.debug('Resource not found (404) - returning empty result', { url, method, duration });
        }
        return { data: undefined as T };
      }
      
      if (DEBUG_API) {
        logger.api.error(`HTTP ${response.status} error`, new Error(response.statusText), {
          url,
          method,
          status: response.status,
          duration,
        });
      }

      // Redirect 5xx server errors to the error page - do not expose internals
      if (response.status >= 500) {
        window.location.href = `/error/${response.status}`;
        return { error: 'Server error. Please try again later.' };
      }

      // Handle validation errors (field-specific errors) - 400
      if (
        response.status === 400 &&
        errorData &&
        typeof errorData === 'object' &&
        !errorData.message &&
        !errorData.detail &&
        !errorData.error
      ) {
        const fieldErrors = Object.entries(errorData)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ');
        throw new Error(fieldErrors || 'Invalid request. Please check your input.');
      }

      // Return a safe, generic user-facing message for all other errors
      const safeMessage =
        response.status === 403
          ? 'You do not have permission to perform this action.'
          : response.status === 404
          ? 'The requested resource could not be found.'
          : response.status === 429
          ? 'Too many requests. Please slow down and try again.'
          : errorData?.message || errorData?.detail || errorData?.error || 'An error occurred. Please try again.';

      throw new Error(safeMessage);
    }

    // Handle 204 No Content responses (DELETE operations typically return this)
    if (response.status === 204) {
      if (DEBUG_API) {
        logger.api.debug('API request successful (204 No Content)', { url, method, duration });
      }
      return { data: undefined as T };
    }

    const data = await response.json();
    if (DEBUG_API) {
      logger.api.debug('API request successful', { url, method, duration, dataKeys: Object.keys(data) });
    }
    return { data };
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    
    // Check if it's a network error (server not reachable)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = '🔌 Cannot connect to server';
      logger.api.error('Network error - server unreachable', error as Error, { url, method, duration });
      return { error: networkError };
    }

    if (DEBUG_API) {
      logger.api.error('API call failed', error as Error, { url, method, duration });
    }

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
    return { error: errorMessage };
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

// PATCH request helper
export async function apiPatch<T>(
  url: string,
  body: unknown
): Promise<{ data?: T; error?: string }> {
  return apiCall<T>(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

// DELETE request helper
export async function apiDelete<T>(url: string): Promise<{ data?: T; error?: string }> {
  return apiCall<T>(url, { method: 'DELETE' });
}
