/**
 * Comprehensive TypeScript Types for AlgoAgent API
 * =================================================
 * All data types for API endpoints
 */

// ============================================================================
// Authentication & User Management
// ============================================================================

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  date_joined?: string;
}

export interface UserProfile {
  id: number;
  user: number | User;
  bio?: string;
  avatar?: string;
  phone?: string;
  location?: string;
  website?: string;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AIContext {
  id: number;
  user: number;
  context_type: string;
  context_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: number;
  user: number;
  title?: string;
  context?: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ChatMessage {
  id: number;
  session: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// ============================================================================
// Symbol & Market Data
// ============================================================================

export interface Symbol {
  id: number;
  symbol: string;
  name: string;
  exchange?: string;
  sector?: string;
  industry?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DataRequest {
  id: number;
  symbol: string;
  start_date: string;
  end_date: string;
  timeframe: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface MarketData {
  id: number;
  symbol: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timeframe: string;
}

export interface Indicator {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  category: string;
  parameters?: Record<string, any>;
  is_active: boolean;
}

export interface IndicatorData {
  id: number;
  indicator: number;
  symbol: string;
  timestamp: string;
  value: number | Record<string, number>;
  timeframe: string;
}

// ============================================================================
// Strategy Management
// ============================================================================

export interface Strategy {
  id: number;
  name: string;
  description?: string;
  strategy_code: string;
  status?: 'draft' | 'validating' | 'valid' | 'invalid' | 'active' | 'inactive';
  version?: string;
  tags?: string[];
  timeframe?: string;
  risk_level?: string;
  expected_return?: number;
  max_drawdown?: number;
  template?: number;
  parameters?: Record<string, any>;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  last_validated?: string;
}

export interface StrategyTemplate {
  id: number;
  name: string;
  description?: string;
  category: string;
  code_template: string;
  parameters_schema?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StrategyValidation {
  id: number;
  strategy: number;
  validation_date: string;
  is_valid: boolean;
  errors?: string[];
  warnings?: string[];
  suggestions?: string[];
  validator_version?: string;
}

export interface StrategyPerformance {
  id: number;
  strategy: number;
  backtest_id?: number;
  total_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  win_rate: number;
  profit_factor: number;
  total_trades: number;
  recorded_at: string;
}

export interface StrategyComment {
  id: number;
  strategy: number;
  user: number;
  content: string;
  parent_comment?: number;
  created_at: string;
  updated_at: string;
}

export interface StrategyTag {
  id: number;
  name: string;
  description?: string;
  color?: string;
  created_at: string;
}

export interface StrategyChat {
  id: number;
  strategy: number;
  user: number;
  message: string;
  response?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// ============================================================================
// Backtest Management
// ============================================================================

export interface BacktestConfig {
  id?: number;
  name?: string;
  strategy_id?: number;
  strategy_code?: string;
  symbol: string;
  start_date: string;
  end_date: string;
  timeframe?: string;
  initial_capital?: number;
  initial_balance?: number;
  lot_size?: number;
  commission?: number;
  slippage?: number;
  config?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface BacktestRun {
  id: number;
  config: number;
  strategy: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  execution_time?: number;
  error_message?: string;
}

export interface BacktestResult {
  id?: number;
  run?: number;
  strategy?: string;
  symbol?: string;
  start_date?: string;
  end_date?: string;
  initial_capital?: number;
  final_value?: number;
  total_return?: number;
  sharpe_ratio?: number;
  max_drawdown?: number;
  win_rate?: number;
  profit_factor?: number;
  total_trades?: number;
  winning_trades?: number;
  losing_trades?: number;
  trades?: Trade[];
  performance_metrics?: PerformanceMetrics;
  daily_stats?: DailyStat[];
  symbol_stats?: SymbolStat[];
  summary?: {
    totalTrades: number;
    winRate: number;
    totalProfit: number;
    averageTrade: number;
  };
  created_at?: string;
}

export interface Trade {
  id?: number;
  backtest_run?: number;
  date?: string;
  timestamp?: string;
  symbol?: string;
  action?: 'buy' | 'sell' | 'short' | 'cover';
  quantity?: number;
  price?: number;
  profit?: number;
  commission?: number;
  balance?: number;
  [key: string]: unknown;
}

export interface PerformanceMetrics {
  total_return?: number;
  annualized_return?: number;
  sharpe_ratio?: number;
  sortino_ratio?: number;
  max_drawdown?: number;
  win_rate?: number;
  profit_factor?: number;
  avg_win?: number;
  avg_loss?: number;
  best_trade?: number;
  worst_trade?: number;
  [key: string]: unknown;
}

export interface DailyStat {
  day: string;
  profit: number;
  trades: number;
  balance?: number;
  drawdown?: number;
}

export interface SymbolStat {
  symbol: string;
  trades: number;
  profit: number;
  percentage: number;
  win_rate?: number;
}

export interface BacktestAlert {
  id: number;
  backtest_run: number;
  alert_type: 'warning' | 'error' | 'info';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

// Latest backtest result per strategy (replaces previous on new backtest)
export interface LatestBacktestResult {
  strategy_id: number;
  strategy_name: string;
  symbol: string;
  timeframe: string;
  period: string;
  initial_balance: number;
  commission: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  net_profit: number;
  total_return_pct: number;
  final_equity: number | null;
  max_drawdown: number;
  sharpe_ratio: number | null;
  trades: Array<{
    entry_time: string;
    exit_time: string;
    entry_price: number;
    exit_price: number;
    size: number;
    pnl: number;
    return_pct: number;
  }>;
  equity_curve: Array<{
    timestamp: string;
    equity: number;
  }>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Production API Types
// ============================================================================

export interface SchemaValidationResponse {
  status: 'valid' | 'invalid';
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

export interface CodeSafetyResponse {
  status: 'validated' | 'rejected';
  safe: boolean;
  message: string;
  formatted_code?: string;
  issues?: string[];
  severity?: 'high' | 'medium' | 'low';
  checks_passed?: string[];
}

export interface SandboxTestResponse {
  status: 'completed' | 'failed';
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

export interface DeploymentResponse {
  status: 'deployed' | 'failed';
  strategy_id: number;
  branch: string;
  commit: string;
  tag?: string;
  message: string;
}

export interface RollbackResponse {
  status: 'rolled_back' | 'failed';
  strategy_id: number;
  reverted_to: string;
  branch: string;
  reason: string;
  message: string;
}

export interface BacktestConfigValidation {
  status: 'valid' | 'invalid';
  message: string;
  validated_config?: any;
  warnings?: string[];
  errors?: any[];
}

export interface BacktestResults {
  status: 'completed' | 'failed';
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

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  components: {
    [key: string]: {
      available: boolean;
      [key: string]: any;
    };
  };
  error?: string;
}

// ============================================================================
// AI Strategy Validation Types
// ============================================================================

export interface AIStrategyValidationRequest {
  strategy_text: string;
  input_type: 'freetext' | 'structured';
  use_gemini?: boolean;
  strict_mode?: boolean;
}

export interface AIStrategyValidationResponse {
  status: 'success' | 'error';
  classification?: {
    strategy_type: string;
    risk_tier: string;
  };
  confidence?: string;
  canonicalized_steps?: string[];
  warnings?: string[];
  recommendations?: Array<{
    priority: string;
    suggestion: string;
  }>;
  next_actions?: string[];
  generated_code?: string;
  message?: string;
}

export interface AIStrategyCreateRequest extends AIStrategyValidationRequest {
  name: string;
  description?: string;
  tags?: string[];
  save_to_backtest?: boolean;
}

export interface AIStrategyUpdateRequest extends AIStrategyValidationRequest {
  update_description?: string;
}

// ============================================================================
// Common Response Types
// ============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
}

export interface ErrorResponse {
  message?: string;
  detail?: string;
  error?: string;
  [key: string]: any;
}

// ============================================================================
// Error Fixing & Code Generation Progress Types
// ============================================================================

export interface ErrorFixAttempt {
  attempt_number: number;
  original_error: string;
  error_type: string;
  fix_description: string;
  success: boolean;
  fixed_code?: string;
  execution_result?: any;
  timestamp: string;
}

export interface CodeGenerationProgress {
  status: 'generating' | 'validating' | 'fixing_errors' | 'completed' | 'failed';
  current_step: string;
  progress_percentage: number;
  attempts?: ErrorFixAttempt[];
  current_attempt?: number;
  max_attempts?: number;
  final_code?: string;
  file_path?: string;
  file_name?: string;
  error_message?: string;
}

export interface CodeGenerationResponse {
  success: boolean;
  strategy_code?: string;
  file_path?: string;
  file_name?: string;
  json_file_path?: string;
  strategy_id?: number;
  message?: string;
  error?: string;
  details?: string;
  // Error fixing fields
  fix_attempts?: number;
  fix_history?: Array<{
    attempt: number;
    error_type: string;
    success: boolean;
    error_message?: string;
    timestamp?: string;
  }>;
  validation_passed?: boolean;
}

// ============================================================================
// Bot Performance & Verification
// ============================================================================

export interface BotPerformance {
  id: number;
  strategy_id: number;
  strategy_name: string;
  verification_status: 'pending' | 'testing' | 'verified' | 'failed';
  is_verified: boolean;
  total_trades: number;
  entry_trades: number;
  exit_trades: number;
  win_rate: number | null;
  total_return: number | null;
  sharpe_ratio: number | null;
  max_drawdown: number | null;
  symbol_tested: string;
  timeframe_tested: string;
  test_period_start: string | null;
  test_period_end: string | null;
  trades_threshold: number;
  verification_notes: string;
  created_at: string;
  updated_at: string;
  last_test_at: string;
  verified_at: string | null;
  verification_badge: {
    status: string;
    label: string;
    icon: string;
    color: string;
    description: string;
  };
}

export interface BotTestRun {
  id: number;
  performance_id: number;
  backtest_run_id: number | null;
  passed: boolean;
  trades_made: number;
  profit: number | null;
  return_percentage: number | null;
  tested_at: string;
  test_duration: number | null;
  status: 'completed' | 'failed' | 'timeout';
  error_message: string;
}

export interface BotVerificationRequest {
  strategy_id: number;
  symbol?: string;
  start_date?: string;
  end_date?: string;
  timeframe?: string;
  initial_balance?: number;
  commission?: number;
}

export interface BotVerificationResponse {
  status: string;
  performance: BotPerformance;
  message: string;
}

export interface VerifiedBotsResponse {
  count: number;
  verified_bots: BotPerformance[];
}

export interface BotTestHistoryResponse {
  strategy_name: string;
  is_verified: boolean;
  test_runs: BotTestRun[];
}

