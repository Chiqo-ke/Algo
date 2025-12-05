/**
 * Production API Services
 * =======================
 * 
 * Comprehensive production endpoint integrations using API_ENDPOINTS
 */

import { API_ENDPOINTS, apiGet, apiPost } from './api';
import type * as Types from './types';

// ============================================================================
// PRODUCTION STRATEGY SERVICES
// ============================================================================

export const productionStrategyService = {
  // Schema Validation
  async validateSchema(strategyData: any): Promise<{ data?: Types.SchemaValidationResponse; error?: string }> {
    return apiPost<Types.SchemaValidationResponse>(
      API_ENDPOINTS.production.strategies.validateSchema,
      strategyData
    );
  },

  // Code Safety Validation
  async validateCode(code: string, strictMode: boolean = true): Promise<{ data?: Types.CodeSafetyResponse; error?: string }> {
    return apiPost<Types.CodeSafetyResponse>(
      API_ENDPOINTS.production.strategies.validateCode,
      { code, strict_mode: strictMode }
    );
  },

  // Sandbox Testing
  async sandboxTest(
    strategyId: number,
    timeout: number = 60,
    resourceLimits?: {
      cpu?: string;
      memory?: string;
    }
  ): Promise<{ data?: Types.SandboxTestResponse; error?: string }> {
    return apiPost<Types.SandboxTestResponse>(
      API_ENDPOINTS.production.strategies.sandboxTest,
      {
        strategy_id: strategyId,
        timeout,
        resource_limits: resourceLimits || {
          cpu: '0.5',
          memory: '512m',
        },
      }
    );
  },

  // Lifecycle Tracking
  async getLifecycle(strategyId: number): Promise<{ data?: Types.LifecycleData; error?: string }> {
    return apiGet<Types.LifecycleData>(
      API_ENDPOINTS.production.strategies.lifecycle(strategyId)
    );
  },

  // Deployment
  async deploy(
    strategyId: number,
    commitMessage?: string,
    createTag: boolean = false,
    tagVersion?: string
  ): Promise<{ data?: Types.DeploymentResponse; error?: string }> {
    return apiPost<Types.DeploymentResponse>(
      API_ENDPOINTS.production.strategies.deploy(strategyId),
      {
        commit_message: commitMessage || `Deploy strategy ${strategyId}`,
        create_tag: createTag,
        tag_version: tagVersion,
      }
    );
  },

  // Rollback
  async rollback(
    strategyId: number,
    commitHash?: string,
    reason?: string
  ): Promise<{ data?: Types.RollbackResponse; error?: string }> {
    return apiPost<Types.RollbackResponse>(
      API_ENDPOINTS.production.strategies.rollback(strategyId),
      {
        commit_hash: commitHash,
        reason: reason || 'Rollback requested via UI',
      }
    );
  },

  // Health Check
  async health(): Promise<{ data?: Types.HealthStatus; error?: string }> {
    return apiGet<Types.HealthStatus>(
      API_ENDPOINTS.production.strategies.health
    );
  },
};

// ============================================================================
// PRODUCTION BACKTEST SERVICES
// ============================================================================

export const productionBacktestService = {
  // Config Validation
  async validateConfig(config: any): Promise<{ data?: Types.BacktestConfigValidation; error?: string }> {
    return apiPost<Types.BacktestConfigValidation>(
      API_ENDPOINTS.production.backtests.validateConfig,
      config
    );
  },

  // Run Sandbox Backtest
  async runSandbox(
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
  ): Promise<{ data?: Types.BacktestResults; error?: string }> {
    return apiPost<Types.BacktestResults>(
      API_ENDPOINTS.production.backtests.runSandbox,
      {
        strategy_id: strategyId,
        config_id: configId,
        start_date: startDate,
        end_date: endDate,
        symbols,
        resource_limits: resourceLimits || {
          cpu: '1.0',
          memory: '1g',
          timeout: 300,
        },
      }
    );
  },

  // Get Backtest Status
  async getStatus(backtestId: number): Promise<{ data?: Types.BacktestStatus; error?: string }> {
    return apiGet<Types.BacktestStatus>(
      API_ENDPOINTS.production.backtests.status(backtestId)
    );
  },

  // Health Check
  async health(): Promise<{ data?: Types.HealthStatus; error?: string }> {
    return apiGet<Types.HealthStatus>(
      API_ENDPOINTS.production.backtests.health
    );
  },
};

// ============================================================================
// HEALTH CHECK SERVICE (All APIs)
// ============================================================================

export const healthService = {
  // Check Auth API Health
  async checkAuth(): Promise<{ data?: Types.HealthStatus; error?: string }> {
    return apiGet<Types.HealthStatus>(API_ENDPOINTS.auth.health);
  },

  // Check Data API Health
  async checkData(): Promise<{ data?: Types.HealthStatus; error?: string }> {
    return apiGet<Types.HealthStatus>(API_ENDPOINTS.data.health);
  },

  // Check Strategy API Health
  async checkStrategies(): Promise<{ data?: Types.HealthStatus; error?: string }> {
    return apiGet<Types.HealthStatus>(API_ENDPOINTS.strategies.health);
  },

  // Check Backtest API Health
  async checkBacktests(): Promise<{ data?: Types.HealthStatus; error?: string }> {
    return apiGet<Types.HealthStatus>(API_ENDPOINTS.backtest.health);
  },

  // Check Production Strategy API Health
  async checkProductionStrategies(): Promise<{ data?: Types.HealthStatus; error?: string }> {
    return apiGet<Types.HealthStatus>(API_ENDPOINTS.production.strategies.health);
  },

  // Check Production Backtest API Health
  async checkProductionBacktests(): Promise<{ data?: Types.HealthStatus; error?: string }> {
    return apiGet<Types.HealthStatus>(API_ENDPOINTS.production.backtests.health);
  },

  // Check All APIs
  async checkAll(): Promise<{
    auth?: Types.HealthStatus;
    data?: Types.HealthStatus;
    strategies?: Types.HealthStatus;
    backtests?: Types.HealthStatus;
    productionStrategies?: Types.HealthStatus;
    productionBacktests?: Types.HealthStatus;
    errors: string[];
  }> {
    const results: any = { errors: [] };

    try {
      const { data, error } = await this.checkAuth();
      if (data) results.auth = data;
      if (error) results.errors.push(`Auth: ${error}`);
    } catch (e) {
      results.errors.push(`Auth: ${e}`);
    }

    try {
      const { data, error } = await this.checkData();
      if (data) results.data = data;
      if (error) results.errors.push(`Data: ${error}`);
    } catch (e) {
      results.errors.push(`Data: ${e}`);
    }

    try {
      const { data, error } = await this.checkStrategies();
      if (data) results.strategies = data;
      if (error) results.errors.push(`Strategies: ${error}`);
    } catch (e) {
      results.errors.push(`Strategies: ${e}`);
    }

    try {
      const { data, error } = await this.checkBacktests();
      if (data) results.backtests = data;
      if (error) results.errors.push(`Backtests: ${error}`);
    } catch (e) {
      results.errors.push(`Backtests: ${e}`);
    }

    try {
      const { data, error } = await this.checkProductionStrategies();
      if (data) results.productionStrategies = data;
      if (error) results.errors.push(`Production Strategies: ${error}`);
    } catch (e) {
      results.errors.push(`Production Strategies: ${e}`);
    }

    try {
      const { data, error } = await this.checkProductionBacktests();
      if (data) results.productionBacktests = data;
      if (error) results.errors.push(`Production Backtests: ${error}`);
    } catch (e) {
      results.errors.push(`Production Backtests: ${e}`);
    }

    return results;
  },

  // Get overall system health
  async getSystemHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    components: {
      auth: boolean;
      data: boolean;
      strategies: boolean;
      backtests: boolean;
      production: boolean;
    };
    details: any;
  }> {
    const allHealth = await this.checkAll();
    
    const isHealthy = (status?: Types.HealthStatus) => 
      status?.overall === 'healthy' || status?.overall === 'degraded';

    const components = {
      auth: isHealthy(allHealth.auth),
      data: isHealthy(allHealth.data),
      strategies: isHealthy(allHealth.strategies),
      backtests: isHealthy(allHealth.backtests),
      production: isHealthy(allHealth.productionStrategies) && isHealthy(allHealth.productionBacktests),
    };

    const healthyCount = Object.values(components).filter(Boolean).length;
    const totalCount = Object.keys(components).length;

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyCount === totalCount) {
      overall = 'healthy';
    } else if (healthyCount >= totalCount / 2) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }

    return {
      overall,
      components,
      details: allHealth,
    };
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const isProductionHealthy = (health: Types.HealthStatus): boolean => {
  return health.overall === 'healthy' || health.overall === 'degraded';
};

export const getHealthStatusColor = (status: string): string => {
  switch (status) {
    case 'healthy':
      return 'text-green-600';
    case 'degraded':
      return 'text-yellow-600';
    case 'unhealthy':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const getHealthStatusIcon = (status: string): string => {
  switch (status) {
    case 'healthy':
      return '✅';
    case 'degraded':
      return '⚠️';
    case 'unhealthy':
      return '❌';
    default:
      return '❓';
  }
};

export const getHealthStatusBadge = (status: string): string => {
  switch (status) {
    case 'healthy':
      return 'bg-green-100 text-green-800';
    case 'degraded':
      return 'bg-yellow-100 text-yellow-800';
    case 'unhealthy':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
