/**
 * Production API Service
 * =====================
 * 
 * Integration with new production-hardened endpoints:
 * - Pydantic schema validation
 * - Code safety checks
 * - Sandbox testing
 * - Lifecycle tracking
 * - Backtest execution
 * - Git deployment
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const PRODUCTION_API = `${API_BASE_URL}/api/production`;

// Helper to get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ============================================================================
// SCHEMA VALIDATION
// ============================================================================

export interface SchemaValidationResponse {
  status: "valid" | "invalid";
  message: string;
  validated_data?: any;
  schema_version?: string;
  errors?: Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
  details?: string;
}

export const validateStrategySchema = async (
  strategyData: any
): Promise<SchemaValidationResponse> => {
  try {
    const response = await fetch(`${PRODUCTION_API}/strategies/validate-schema/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(strategyData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Schema validation error:", error);
    throw error;
  }
};

// ============================================================================
// CODE SAFETY VALIDATION
// ============================================================================

export interface CodeSafetyResponse {
  status: "validated" | "rejected";
  safe: boolean;
  message: string;
  formatted_code?: string;
  issues?: string[];
  severity?: "high" | "medium" | "low";
  checks_passed?: string[];
}

export const validateCodeSafety = async (
  code: string,
  strictMode: boolean = true
): Promise<CodeSafetyResponse> => {
  try {
    const response = await fetch(`${PRODUCTION_API}/strategies/validate-code/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        strategy_code: code,  // ✅ Fixed: Use strategy_code not code
        strict_mode: strictMode,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Code safety validation error:", error);
    throw error;
  }
};

// ============================================================================
// SANDBOX TESTING
// ============================================================================

export interface SandboxTestResponse {
  status: "completed" | "failed";
  success: boolean;
  execution_time: number;
  exit_code: number;
  output: string;
  errors: string;
  timed_out: boolean;
  resource_usage: {
    max_memory_mb: number;
    cpu_percent: number;
  };
}

export const runSandboxTest = async (
  strategyId: number,
  timeout: number = 60,
  resourceLimits?: {
    cpu?: string;
    memory?: string;
  }
): Promise<SandboxTestResponse> => {
  try {
    const response = await fetch(`${PRODUCTION_API}/strategies/sandbox-test/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        strategy_id: strategyId,
        timeout,
        resource_limits: resourceLimits || {
          cpu: "0.5",
          memory: "512m",
        },
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Sandbox test error:", error);
    throw error;
  }
};

// ============================================================================
// LIFECYCLE TRACKING
// ============================================================================

export interface LifecycleData {
  strategy_id: number;
  name: string;
  current_status: string;
  lifecycle_tracking: {
    generation_attempts: number;
    test_attempts: number;
    fix_attempts: number;
    error_count: number;
    last_error: string | null;
  };
  timestamps: {
    created_at: string | null;
    last_generation: string | null;
    last_test: string | null;
    last_success: string | null;
  };
  audit_log: Array<{
    timestamp: string;
    event: string;
    details: string;
  }>;
}

export const getStrategyLifecycle = async (
  strategyId: number
): Promise<LifecycleData> => {
  try {
    const response = await fetch(
      `${PRODUCTION_API}/strategies/${strategyId}/lifecycle/`,
      {
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lifecycle fetch error:", error);
    throw error;
  }
};

// ============================================================================
// DEPLOYMENT
// ============================================================================

export interface DeploymentResponse {
  status: "deployed" | "failed";
  strategy_id: number;
  branch: string;
  commit: string;
  tag?: string;
  message: string;
}

export const deployStrategy = async (
  strategyId: number,
  commitMessage?: string,
  createTag: boolean = false,
  tagVersion?: string
): Promise<DeploymentResponse> => {
  try {
    const response = await fetch(
      `${PRODUCTION_API}/strategies/${strategyId}/deploy/`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          commit_message: commitMessage || `Deploy strategy ${strategyId}`,
          create_tag: createTag,
          tag_version: tagVersion,
        }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Deployment error:", error);
    throw error;
  }
};

// ============================================================================
// ROLLBACK
// ============================================================================

export interface RollbackResponse {
  status: "rolled_back" | "failed";
  strategy_id: number;
  reverted_to: string;
  branch: string;
  reason: string;
  message: string;
}

export const rollbackStrategy = async (
  strategyId: number,
  commitHash?: string,
  reason?: string
): Promise<RollbackResponse> => {
  try {
    const response = await fetch(
      `${PRODUCTION_API}/strategies/${strategyId}/rollback/`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          commit_hash: commitHash,
          reason: reason || "Rollback requested via UI",
        }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Rollback error:", error);
    throw error;
  }
};

// ============================================================================
// BACKTEST
// ============================================================================

export interface BacktestConfigValidation {
  status: "valid" | "invalid";
  message: string;
  validated_config?: any;
  warnings?: string[];
  errors?: any[];
}

export const validateBacktestConfig = async (
  config: any
): Promise<BacktestConfigValidation> => {
  try {
    const response = await fetch(`${PRODUCTION_API}/backtests/validate-config/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(config),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Backtest config validation error:", error);
    throw error;
  }
};

export interface BacktestResults {
  status: "completed" | "failed";
  backtest_id: number;
  results?: {
    total_return: number;
    sharpe_ratio: number;
    max_drawdown: number;
    win_rate: number;
    total_trades: number;
  };
  execution_time: number;
  resource_usage?: {
    max_memory_mb: number;
    cpu_percent: number;
  };
  error?: string;
}

export const runBacktestSandbox = async (
  strategyId: number,
  configId: number,
  startDate: string,
  endDate: string,
  symbols: string[],
  resourceLimits?: {
    cpu?: string;
    memory?: string;
    timeout?: number;
  }
): Promise<BacktestResults> => {
  try {
    const response = await fetch(`${PRODUCTION_API}/backtests/run-sandbox/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        strategy_id: strategyId,
        config_id: configId,
        start_date: startDate,
        end_date: endDate,
        symbols,
        resource_limits: resourceLimits || {
          cpu: "1.0",
          memory: "1g",
          timeout: 300,
        },
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Backtest execution error:", error);
    throw error;
  }
};

export interface BacktestStatus {
  backtest_id: number;
  status: string;
  started_at: string;
  completed_at: string | null;
  execution_time: number | null;
  error_message: string | null;
  state_tracking?: any;
  audit_log?: any[];
  results?: any;
}

export const getBacktestStatus = async (
  backtestId: number
): Promise<BacktestStatus> => {
  try {
    const response = await fetch(
      `${PRODUCTION_API}/backtests/${backtestId}/status/`,
      {
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Backtest status fetch error:", error);
    throw error;
  }
};

// ============================================================================
// HEALTH CHECKS
// ============================================================================

export interface HealthStatus {
  overall: "healthy" | "degraded" | "unhealthy";
  components: {
    state_manager?: {
      available: boolean;
      strategies_tracked?: number;
    };
    safe_tools?: {
      available: boolean;
      workspace?: string;
    };
    output_validator?: {
      available: boolean;
      strict_mode?: boolean;
    };
    sandbox_runner?: {
      available: boolean;
      docker_available?: boolean;
    };
    git_manager?: {
      available: boolean;
      repo_path?: string | null;
    };
  };
  error?: string;
}

export const checkStrategyHealth = async (): Promise<HealthStatus> => {
  try {
    const response = await fetch(`${PRODUCTION_API}/strategies/health/`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Strategy health check error:", error);
    throw error;
  }
};

export const checkBacktestHealth = async (): Promise<HealthStatus> => {
  try {
    const response = await fetch(`${PRODUCTION_API}/backtests/health/`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Backtest health check error:", error);
    throw error;
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const isProductionHealthy = (health: HealthStatus): boolean => {
  return health.overall === "healthy" || health.overall === "degraded";
};

export const getHealthStatusColor = (status: string): string => {
  switch (status) {
    case "healthy":
      return "text-green-600";
    case "degraded":
      return "text-yellow-600";
    case "unhealthy":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

export const getHealthStatusIcon = (status: string): string => {
  switch (status) {
    case "healthy":
      return "✅";
    case "degraded":
      return "⚠️";
    case "unhealthy":
      return "❌";
    default:
      return "❓";
  }
};
