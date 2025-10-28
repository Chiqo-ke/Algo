import { API_ENDPOINTS, apiGet, apiPost } from './api';

// Types
export interface Symbol {
  id: number;
  symbol: string;
  name: string;
  exchange?: string;
  sector?: string;
  industry?: string;
  is_active?: boolean;
}

export interface Strategy {
  id: number;
  name: string;
  description?: string;
  code: string;
  category?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BacktestConfig {
  strategy_id?: number;
  strategy_code?: string;
  symbol: string;
  start_date: string;
  end_date: string;
  timeframe?: string;
  initial_capital?: number;
  initial_balance?: number;
  lot_size?: number;
  config?: {
    commission?: number;
    slippage?: number;
    [key: string]: unknown;
  };
}

export interface BacktestResult {
  id?: number;
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
  total_trades?: number;
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
}

export interface Trade {
  id?: number;
  date?: string;
  symbol?: string;
  action?: string;
  quantity?: number;
  price?: number;
  profit?: number;
  [key: string]: unknown;
}

export interface PerformanceMetrics {
  total_return?: number;
  sharpe_ratio?: number;
  max_drawdown?: number;
  win_rate?: number;
  profit_factor?: number;
  [key: string]: unknown;
}

export interface DailyStat {
  day: string;
  profit: number;
  trades: number;
}

export interface SymbolStat {
  symbol: string;
  trades: number;
  profit: number;
  percentage: number;
}

// Symbol Services
export const symbolService = {
  // Get all symbols
  async getAll(): Promise<{ data?: Symbol[]; error?: string }> {
    return apiGet<Symbol[]>(API_ENDPOINTS.data.symbols);
  },

  // Get symbol by ID
  async getById(id: number): Promise<{ data?: Symbol; error?: string }> {
    return apiGet<Symbol>(API_ENDPOINTS.data.symbolDetail(id));
  },

  // Create new symbol
  async create(symbol: Partial<Symbol>): Promise<{ data?: Symbol; error?: string }> {
    return apiPost<Symbol>(API_ENDPOINTS.data.symbols, symbol);
  },
};

// Strategy Services
export const strategyService = {
  // Get all strategies
  async getAll(): Promise<{ data?: Strategy[]; error?: string }> {
    return apiGet<Strategy[]>(API_ENDPOINTS.strategies.list);
  },

  // Get strategy by ID
  async getById(id: number): Promise<{ data?: Strategy; error?: string }> {
    return apiGet<Strategy>(API_ENDPOINTS.strategies.detail(id));
  },

  // Create new strategy
  async create(strategy: Partial<Strategy>): Promise<{ data?: Strategy; error?: string }> {
    return apiPost<Strategy>(API_ENDPOINTS.strategies.list, strategy);
  },

  // Get strategy templates
  async getTemplates(): Promise<{ data?: unknown[]; error?: string }> {
    return apiGet(API_ENDPOINTS.strategies.templates);
  },

  // Get strategy categories
  async getCategories(): Promise<{ data?: string[]; error?: string }> {
    return apiGet<string[]>(API_ENDPOINTS.strategies.categories);
  },
};

// Backtest Services
export const backtestService = {
  // Run a backtest
  async run(config: BacktestConfig): Promise<{ data?: BacktestResult; error?: string }> {
    return apiPost<BacktestResult>(API_ENDPOINTS.backtest.run, config);
  },

  // Run a quick backtest
  async quickRun(config: BacktestConfig): Promise<{ data?: BacktestResult; error?: string }> {
    return apiPost<BacktestResult>(API_ENDPOINTS.backtest.quickRun, config);
  },

  // Get backtest results
  async getResults(backtestId?: number): Promise<{ data?: BacktestResult[] | BacktestResult; error?: string }> {
    const url = backtestId 
      ? `${API_ENDPOINTS.backtest.results}?backtest_id=${backtestId}`
      : API_ENDPOINTS.backtest.results;
    return apiGet(url);
  },

  // Get trades for a backtest
  async getTrades(backtestId: number): Promise<{ data?: Trade[]; error?: string }> {
    return apiGet<Trade[]>(`${API_ENDPOINTS.backtest.trades}?backtest_id=${backtestId}`);
  },

  // Get performance metrics
  async getPerformanceMetrics(backtestId: number): Promise<{ data?: PerformanceMetrics; error?: string }> {
    return apiGet<PerformanceMetrics>(`${API_ENDPOINTS.backtest.performance}?backtest_id=${backtestId}`);
  },

  // Monitor backtest status
  async monitor(backtestId: number): Promise<{ data?: { status: string; progress: number }; error?: string }> {
    return apiGet(`${API_ENDPOINTS.backtest.monitor}?backtest_id=${backtestId}`);
  },
};

// Market Data Services
export const marketDataService = {
  // Fetch market data
  async fetch(params: {
    symbol: string;
    start_date: string;
    end_date: string;
    timeframe?: string;
  }): Promise<{ data?: unknown; error?: string }> {
    return apiPost(API_ENDPOINTS.data.fetchData, params);
  },

  // Get market data
  async get(params?: {
    symbol?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<{ data?: unknown[]; error?: string }> {
    const queryParams = new URLSearchParams();
    if (params?.symbol) queryParams.append('symbol', params.symbol);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    const url = `${API_ENDPOINTS.data.marketData}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiGet(url);
  },

  // Get available indicators
  async getIndicators(): Promise<{ data?: string[]; error?: string }> {
    return apiGet<string[]>(API_ENDPOINTS.data.indicators);
  },
};
