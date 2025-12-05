import { API_ENDPOINTS, apiGet, apiPost, apiPut, apiPatch, apiDelete } from './api';
import type * as Types from './types';

// Re-export types for backward compatibility
export type {
  Symbol,
  Strategy,
  BacktestConfig,
  BacktestResult,
  Trade,
  PerformanceMetrics,
  DailyStat,
  SymbolStat,
  UserProfile,
  AIContext,
  ChatSession,
  StrategyComment,
  StrategyTag,
  StrategyPerformance,
  BacktestRun,
  BacktestAlert,
  MarketData,
  Indicator,
} from './types';

// ============================================================================
// AUTHENTICATION & USER SERVICES
// ============================================================================

export const authService = {
  // Get all user profiles
  async getProfiles(): Promise<{ data?: Types.UserProfile[]; error?: string }> {
    return apiGet<Types.UserProfile[]>(API_ENDPOINTS.auth.profiles);
  },

  // Get specific profile
  async getProfile(id: number): Promise<{ data?: Types.UserProfile; error?: string }> {
    return apiGet<Types.UserProfile>(API_ENDPOINTS.auth.profileDetail(id));
  },

  // Get current user's profile
  async getMyProfile(): Promise<{ data?: Types.UserProfile; error?: string }> {
    return apiGet<Types.UserProfile>(API_ENDPOINTS.auth.profile);
  },

  // Update profile
  async updateProfile(id: number, profile: Partial<Types.UserProfile>): Promise<{ data?: Types.UserProfile; error?: string }> {
    return apiPut<Types.UserProfile>(API_ENDPOINTS.auth.profileDetail(id), profile);
  },

  // Partial update profile
  async patchProfile(id: number, profile: Partial<Types.UserProfile>): Promise<{ data?: Types.UserProfile; error?: string }> {
    return apiPatch<Types.UserProfile>(API_ENDPOINTS.auth.profileDetail(id), profile);
  },

  // Delete profile
  async deleteProfile(id: number): Promise<{ data?: void; error?: string }> {
    return apiDelete(API_ENDPOINTS.auth.profileDetail(id));
  },

  // AI Contexts
  async getAIContexts(): Promise<{ data?: Types.AIContext[]; error?: string }> {
    return apiGet<Types.AIContext[]>(API_ENDPOINTS.auth.aiContexts);
  },

  async getAIContext(id: number): Promise<{ data?: Types.AIContext; error?: string }> {
    return apiGet<Types.AIContext>(API_ENDPOINTS.auth.aiContextDetail(id));
  },

  async createAIContext(context: Partial<Types.AIContext>): Promise<{ data?: Types.AIContext; error?: string }> {
    return apiPost<Types.AIContext>(API_ENDPOINTS.auth.aiContexts, context);
  },

  async updateAIContext(id: number, context: Partial<Types.AIContext>): Promise<{ data?: Types.AIContext; error?: string }> {
    return apiPut<Types.AIContext>(API_ENDPOINTS.auth.aiContextDetail(id), context);
  },

  async deleteAIContext(id: number): Promise<{ data?: void; error?: string }> {
    return apiDelete(API_ENDPOINTS.auth.aiContextDetail(id));
  },

  // Chat Sessions
  async getChatSessions(): Promise<{ data?: Types.ChatSession[]; error?: string }> {
    return apiGet<Types.ChatSession[]>(API_ENDPOINTS.auth.chatSessions);
  },

  async getChatSession(id: number): Promise<{ data?: Types.ChatSession; error?: string }> {
    return apiGet<Types.ChatSession>(API_ENDPOINTS.auth.chatSessionDetail(id));
  },

  async createChatSession(session: Partial<Types.ChatSession>): Promise<{ data?: Types.ChatSession; error?: string }> {
    return apiPost<Types.ChatSession>(API_ENDPOINTS.auth.chatSessions, session);
  },

  async updateChatSession(id: number, session: Partial<Types.ChatSession>): Promise<{ data?: Types.ChatSession; error?: string }> {
    return apiPut<Types.ChatSession>(API_ENDPOINTS.auth.chatSessionDetail(id), session);
  },

  async deleteChatSession(id: number): Promise<{ data?: void; error?: string }> {
    return apiDelete(API_ENDPOINTS.auth.chatSessionDetail(id));
  },

  // General AI Chat
  async chat(message: string, context?: Record<string, any>): Promise<{ data?: any; error?: string }> {
    return apiPost(API_ENDPOINTS.auth.chat, { message, context });
  },

  // Health check
  async health(): Promise<{ data?: Types.HealthStatus; error?: string }> {
    return apiGet<Types.HealthStatus>(API_ENDPOINTS.auth.health);
  },
};

// ============================================================================
// SYMBOL & DATA SERVICES
// ============================================================================

export const symbolService = {
  // Get all symbols
  async getAll(): Promise<{ data?: Types.Symbol[]; error?: string }> {
    return apiGet<Types.Symbol[]>(API_ENDPOINTS.data.symbols);
  },

  // Get symbol by ID
  async getById(id: number): Promise<{ data?: Types.Symbol; error?: string }> {
    return apiGet<Types.Symbol>(API_ENDPOINTS.data.symbolDetail(id));
  },

  // Create new symbol
  async create(symbol: Partial<Types.Symbol>): Promise<{ data?: Types.Symbol; error?: string }> {
    return apiPost<Types.Symbol>(API_ENDPOINTS.data.symbols, symbol);
  },

  // Update symbol
  async update(id: number, symbol: Partial<Types.Symbol>): Promise<{ data?: Types.Symbol; error?: string }> {
    return apiPut<Types.Symbol>(API_ENDPOINTS.data.symbolDetail(id), symbol);
  },

  // Partial update symbol
  async patch(id: number, symbol: Partial<Types.Symbol>): Promise<{ data?: Types.Symbol; error?: string }> {
    return apiPatch<Types.Symbol>(API_ENDPOINTS.data.symbolDetail(id), symbol);
  },

  // Delete symbol
  async delete(id: number): Promise<{ data?: void; error?: string }> {
    return apiDelete(API_ENDPOINTS.data.symbolDetail(id));
  },
};

export const dataRequestService = {
  async getAll(): Promise<{ data?: Types.DataRequest[]; error?: string }> {
    return apiGet<Types.DataRequest[]>(API_ENDPOINTS.data.dataRequests);
  },

  async getById(id: number): Promise<{ data?: Types.DataRequest; error?: string }> {
    return apiGet<Types.DataRequest>(API_ENDPOINTS.data.dataRequestDetail(id));
  },

  async create(request: Partial<Types.DataRequest>): Promise<{ data?: Types.DataRequest; error?: string }> {
    return apiPost<Types.DataRequest>(API_ENDPOINTS.data.dataRequests, request);
  },

  async update(id: number, request: Partial<Types.DataRequest>): Promise<{ data?: Types.DataRequest; error?: string }> {
    return apiPut<Types.DataRequest>(API_ENDPOINTS.data.dataRequestDetail(id), request);
  },

  async delete(id: number): Promise<{ data?: void; error?: string }> {
    return apiDelete(API_ENDPOINTS.data.dataRequestDetail(id));
  },
};

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
  async getAll(params?: {
    symbol?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<{ data?: Types.MarketData[]; error?: string }> {
    const queryParams = new URLSearchParams();
    if (params?.symbol) queryParams.append('symbol', params.symbol);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    const url = `${API_ENDPOINTS.data.marketData}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiGet<Types.MarketData[]>(url);
  },

  async getById(id: number): Promise<{ data?: Types.MarketData; error?: string }> {
    return apiGet<Types.MarketData>(API_ENDPOINTS.data.marketDataDetail(id));
  },

  async update(id: number, data: Partial<Types.MarketData>): Promise<{ data?: Types.MarketData; error?: string }> {
    return apiPut<Types.MarketData>(API_ENDPOINTS.data.marketDataDetail(id), data);
  },

  async delete(id: number): Promise<{ data?: void; error?: string }> {
    return apiDelete(API_ENDPOINTS.data.marketDataDetail(id));
  },

  // Get available indicators
  async getIndicators(): Promise<{ data?: string[]; error?: string }> {
    return apiGet<string[]>(API_ENDPOINTS.data.indicators);
  },

  // Health check
  async health(): Promise<{ data?: Types.HealthStatus; error?: string }> {
    return apiGet<Types.HealthStatus>(API_ENDPOINTS.data.health);
  },
};

export const indicatorService = {
  async getAll(): Promise<{ data?: Types.Indicator[]; error?: string }> {
    return apiGet<Types.Indicator[]>(API_ENDPOINTS.data.indicatorsList);
  },

  async getById(id: number): Promise<{ data?: Types.Indicator; error?: string }> {
    return apiGet<Types.Indicator>(API_ENDPOINTS.data.indicatorDetail(id));
  },

  async create(indicator: Partial<Types.Indicator>): Promise<{ data?: Types.Indicator; error?: string }> {
    return apiPost<Types.Indicator>(API_ENDPOINTS.data.indicatorsList, indicator);
  },

  async update(id: number, indicator: Partial<Types.Indicator>): Promise<{ data?: Types.Indicator; error?: string }> {
    return apiPut<Types.Indicator>(API_ENDPOINTS.data.indicatorDetail(id), indicator);
  },

  async delete(id: number): Promise<{ data?: void; error?: string }> {
    return apiDelete(API_ENDPOINTS.data.indicatorDetail(id));
  },
};

export const indicatorDataService = {
  async getAll(): Promise<{ data?: Types.IndicatorData[]; error?: string }> {
    return apiGet<Types.IndicatorData[]>(API_ENDPOINTS.data.indicatorData);
  },

  async getById(id: number): Promise<{ data?: Types.IndicatorData; error?: string }> {
    return apiGet<Types.IndicatorData>(API_ENDPOINTS.data.indicatorDataDetail(id));
  },

  async create(data: Partial<Types.IndicatorData>): Promise<{ data?: Types.IndicatorData; error?: string }> {
    return apiPost<Types.IndicatorData>(API_ENDPOINTS.data.indicatorData, data);
  },

  async update(id: number, data: Partial<Types.IndicatorData>): Promise<{ data?: Types.IndicatorData; error?: string }> {
    return apiPut<Types.IndicatorData>(API_ENDPOINTS.data.indicatorDataDetail(id), data);
  },

  async delete(id: number): Promise<{ data?: void; error?: string }> {
    return apiDelete(API_ENDPOINTS.data.indicatorDataDetail(id));
  },
};

// ============================================================================
// STRATEGY SERVICES
// ============================================================================

export const strategyService = {
  // Get all strategies
  async getAll(): Promise<{ data?: Types.Strategy[]; error?: string }> {
    return apiGet<Types.Strategy[]>(API_ENDPOINTS.strategies.list);
  },

  // Get strategy by ID
  async getById(id: number): Promise<{ data?: Types.Strategy; error?: string }> {
    return apiGet<Types.Strategy>(API_ENDPOINTS.strategies.detail(id));
  },

  // Create new strategy
  async create(strategy: Partial<Types.Strategy>): Promise<{ data?: Types.Strategy; error?: string }> {
    return apiPost<Types.Strategy>(API_ENDPOINTS.strategies.list, strategy);
  },

  // Update strategy
  async update(id: number, strategy: Partial<Types.Strategy>): Promise<{ data?: Types.Strategy; error?: string }> {
    return apiPut<Types.Strategy>(API_ENDPOINTS.strategies.detail(id), strategy);
  },

  // Partial update strategy
  async patch(id: number, strategy: Partial<Types.Strategy>): Promise<{ data?: Types.Strategy; error?: string }> {
    return apiPatch<Types.Strategy>(API_ENDPOINTS.strategies.detail(id), strategy);
  },

  // Delete strategy
  async delete(id: number): Promise<{ data?: void; error?: string }> {
    return apiDelete(API_ENDPOINTS.strategies.detail(id));
  },

  // Validate strategy
  async validate(strategy: Partial<Types.Strategy>): Promise<{ data?: Types.StrategyValidation; error?: string }> {
    return apiPost<Types.StrategyValidation>(API_ENDPOINTS.strategies.validate, strategy);
  },

  // Validate strategy file
  async validateFile(file: File): Promise<{ data?: Types.StrategyValidation; error?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    // Note: This needs special handling for file upload
    return apiPost<Types.StrategyValidation>(API_ENDPOINTS.strategies.validateFile, formData);
  },

  // Validate strategy by ID
  async validateById(id: number): Promise<{ data?: Types.StrategyValidation; error?: string }> {
    return apiPost<Types.StrategyValidation>(API_ENDPOINTS.strategies.strategyValidate(id), {});
  },

  // Clone strategy
  async clone(id: number): Promise<{ data?: Types.Strategy; error?: string }> {
    return apiPost<Types.Strategy>(API_ENDPOINTS.strategies.strategyClone(id), {});
  },

  // Quick backtest from strategy
  async quickBacktest(id: number, config: Partial<Types.BacktestConfig>): Promise<{ data?: Types.BacktestResult; error?: string }> {
    return apiPost<Types.BacktestResult>(API_ENDPOINTS.strategies.strategyBacktest(id), config);
  },

  // Get strategy templates
  async getTemplates(): Promise<{ data?: Types.StrategyTemplate[]; error?: string }> {
    return apiGet<Types.StrategyTemplate[]>(API_ENDPOINTS.strategies.templates);
  },

  // Get template by ID
  async getTemplateById(id: number): Promise<{ data?: Types.StrategyTemplate; error?: string }> {
    return apiGet<Types.StrategyTemplate>(API_ENDPOINTS.strategies.templateDetail(id));
  },

  // Update template
  async updateTemplate(id: number, template: Partial<Types.StrategyTemplate>): Promise<{ data?: Types.StrategyTemplate; error?: string }> {
    return apiPut<Types.StrategyTemplate>(API_ENDPOINTS.strategies.templateDetail(id), template);
  },

  // Delete template
  async deleteTemplate(id: number): Promise<{ data?: void; error?: string }> {
    return apiDelete(API_ENDPOINTS.strategies.templateDetail(id));
  },

  // Get strategy categories
  async getCategories(): Promise<{ data?: string[]; error?: string }> {
    return apiGet<string[]>(API_ENDPOINTS.strategies.categories);
  },

  // AI-powered validation
  async validateWithAI(request: Types.AIStrategyValidationRequest): Promise<{ data?: Types.AIStrategyValidationResponse; error?: string }> {
    return apiPost<Types.AIStrategyValidationResponse>(API_ENDPOINTS.strategies.validateWithAI, request);
  },

  // AI-powered creation
  async createWithAI(request: Types.AIStrategyCreateRequest): Promise<{ data?: Types.Strategy; error?: string }> {
    return apiPost<Types.Strategy>(API_ENDPOINTS.strategies.createWithAI, request);
  },

  // AI-powered update
  async updateWithAI(id: number, request: Types.AIStrategyUpdateRequest): Promise<{ data?: Types.Strategy; error?: string }> {
    return apiPut<Types.Strategy>(API_ENDPOINTS.strategies.updateWithAI(id), request);
  },

  // Health check
  async health(): Promise<{ data?: Types.HealthStatus; error?: string }> {
    return apiGet<Types.HealthStatus>(API_ENDPOINTS.strategies.health);
  },
};

export const strategyValidationService = {
  async getAll(): Promise<{ data?: Types.StrategyValidation[]; error?: string }> {
    return apiGet<Types.StrategyValidation[]>(API_ENDPOINTS.strategies.validations);
  },

  async getById(id: number): Promise<{ data?: Types.StrategyValidation; error?: string }> {
    return apiGet<Types.StrategyValidation>(API_ENDPOINTS.strategies.validationDetail(id));
  },
};

export const strategyPerformanceService = {
  async getAll(): Promise<{ data?: Types.StrategyPerformance[]; error?: string }> {
    return apiGet<Types.StrategyPerformance[]>(API_ENDPOINTS.strategies.performance);
  },

  async getById(id: number): Promise<{ data?: Types.StrategyPerformance; error?: string }> {
    return apiGet<Types.StrategyPerformance>(API_ENDPOINTS.strategies.performanceDetail(id));
  },

  async create(performance: Partial<Types.StrategyPerformance>): Promise<{ data?: Types.StrategyPerformance; error?: string }> {
    return apiPost<Types.StrategyPerformance>(API_ENDPOINTS.strategies.performance, performance);
  },

  async update(id: number, performance: Partial<Types.StrategyPerformance>): Promise<{ data?: Types.StrategyPerformance; error?: string }> {
    return apiPut<Types.StrategyPerformance>(API_ENDPOINTS.strategies.performanceDetail(id), performance);
  },

  async delete(id: number): Promise<{ data?: void; error?: string }> {
    return apiDelete(API_ENDPOINTS.strategies.performanceDetail(id));
  },
};

export const strategyCommentService = {
  async getAll(strategyId?: number): Promise<{ data?: Types.StrategyComment[]; error?: string }> {
    const url = strategyId 
      ? `${API_ENDPOINTS.strategies.comments}?strategy=${strategyId}`
      : API_ENDPOINTS.strategies.comments;
    return apiGet<Types.StrategyComment[]>(url);
  },

  async getById(id: number): Promise<{ data?: Types.StrategyComment; error?: string }> {
    return apiGet<Types.StrategyComment>(API_ENDPOINTS.strategies.commentDetail(id));
  },

  async create(comment: Partial<Types.StrategyComment>): Promise<{ data?: Types.StrategyComment; error?: string }> {
    return apiPost<Types.StrategyComment>(API_ENDPOINTS.strategies.comments, comment);
  },

  async update(id: number, comment: Partial<Types.StrategyComment>): Promise<{ data?: Types.StrategyComment; error?: string }> {
    return apiPut<Types.StrategyComment>(API_ENDPOINTS.strategies.commentDetail(id), comment);
  },

  async delete(id: number): Promise<{ data?: void; error?: string }> {
    return apiDelete(API_ENDPOINTS.strategies.commentDetail(id));
  },
};

export const strategyTagService = {
  async getAll(): Promise<{ data?: Types.StrategyTag[]; error?: string }> {
    return apiGet<Types.StrategyTag[]>(API_ENDPOINTS.strategies.tags);
  },

  async getById(id: number): Promise<{ data?: Types.StrategyTag; error?: string }> {
    return apiGet<Types.StrategyTag>(API_ENDPOINTS.strategies.tagDetail(id));
  },

  async create(tag: Partial<Types.StrategyTag>): Promise<{ data?: Types.StrategyTag; error?: string }> {
    return apiPost<Types.StrategyTag>(API_ENDPOINTS.strategies.tags, tag);
  },

  async update(id: number, tag: Partial<Types.StrategyTag>): Promise<{ data?: Types.StrategyTag; error?: string }> {
    return apiPut<Types.StrategyTag>(API_ENDPOINTS.strategies.tagDetail(id), tag);
  },

  async delete(id: number): Promise<{ data?: void; error?: string }> {
    return apiDelete(API_ENDPOINTS.strategies.tagDetail(id));
  },
};

export const strategyChatService = {
  async getAll(strategyId?: number): Promise<{ data?: Types.StrategyChat[]; error?: string }> {
    const url = strategyId 
      ? `${API_ENDPOINTS.strategies.chat}?strategy=${strategyId}`
      : API_ENDPOINTS.strategies.chat;
    return apiGet<Types.StrategyChat[]>(url);
  },

  async getById(id: number): Promise<{ data?: Types.StrategyChat; error?: string }> {
    return apiGet<Types.StrategyChat>(API_ENDPOINTS.strategies.chatDetail(id));
  },

  async create(chat: Partial<Types.StrategyChat>): Promise<{ data?: Types.StrategyChat; error?: string }> {
    return apiPost<Types.StrategyChat>(API_ENDPOINTS.strategies.chat, chat);
  },

  async update(id: number, chat: Partial<Types.StrategyChat>): Promise<{ data?: Types.StrategyChat; error?: string }> {
    return apiPut<Types.StrategyChat>(API_ENDPOINTS.strategies.chatDetail(id), chat);
  },

  async delete(id: number): Promise<{ data?: void; error?: string }> {
    return apiDelete(API_ENDPOINTS.strategies.chatDetail(id));
  },
};

// ============================================================================
// BACKTEST SERVICES
// ============================================================================

export const backtestService = {
  // Run a backtest
  async run(config: Types.BacktestConfig): Promise<{ data?: Types.BacktestResult; error?: string }> {
    return apiPost<Types.BacktestResult>(API_ENDPOINTS.backtest.run, config);
  },

  // Run a quick backtest
  async quickRun(config: Types.BacktestConfig): Promise<{ data?: Types.BacktestResult; error?: string }> {
    return apiPost<Types.BacktestResult>(API_ENDPOINTS.backtest.quickRun, config);
  },

  // Get backtest results
  async getResults(backtestId?: number): Promise<{ data?: Types.BacktestResult[] | Types.BacktestResult; error?: string }> {
    const url = backtestId 
      ? `${API_ENDPOINTS.backtest.results}?backtest_id=${backtestId}`
      : API_ENDPOINTS.backtest.results;
    return apiGet(url);
  },

  // Get specific result
  async getResultById(id: number): Promise<{ data?: Types.BacktestResult; error?: string }> {
    return apiGet<Types.BacktestResult>(API_ENDPOINTS.backtest.resultDetail(id));
  },

  // Get trades for a backtest
  async getTrades(backtestId?: number): Promise<{ data?: Types.Trade[]; error?: string }> {
    const url = backtestId 
      ? `${API_ENDPOINTS.backtest.trades}?backtest_id=${backtestId}`
      : API_ENDPOINTS.backtest.trades;
    return apiGet<Types.Trade[]>(url);
  },

  // Get specific trade
  async getTradeById(id: number): Promise<{ data?: Types.Trade; error?: string }> {
    return apiGet<Types.Trade>(API_ENDPOINTS.backtest.tradeDetail(id));
  },

  // Get performance metrics
  async getPerformanceMetrics(backtestId: number): Promise<{ data?: Types.PerformanceMetrics; error?: string }> {
    return apiGet<Types.PerformanceMetrics>(`${API_ENDPOINTS.backtest.performance}?backtest_id=${backtestId}`);
  },

  // Monitor backtest status
  async monitor(backtestId: number): Promise<{ data?: { status: string; progress: number }; error?: string }> {
    return apiGet(`${API_ENDPOINTS.backtest.monitor}?backtest_id=${backtestId}`);
  },

  // Get backtest status
  async getStatus(backtestId: number): Promise<{ data?: any; error?: string }> {
    return apiGet(`${API_ENDPOINTS.backtest.status}?backtest_id=${backtestId}`);
  },

  // Health check
  async health(): Promise<{ data?: Types.HealthStatus; error?: string }> {
    return apiGet<Types.HealthStatus>(API_ENDPOINTS.backtest.health);
  },
};

export const backtestConfigService = {
  async getAll(): Promise<{ data?: Types.BacktestConfig[]; error?: string }> {
    return apiGet<Types.BacktestConfig[]>(API_ENDPOINTS.backtest.configs);
  },

  async getById(id: number): Promise<{ data?: Types.BacktestConfig; error?: string }> {
    return apiGet<Types.BacktestConfig>(API_ENDPOINTS.backtest.configDetail(id));
  },

  async create(config: Partial<Types.BacktestConfig>): Promise<{ data?: Types.BacktestConfig; error?: string }> {
    return apiPost<Types.BacktestConfig>(API_ENDPOINTS.backtest.configs, config);
  },

  async update(id: number, config: Partial<Types.BacktestConfig>): Promise<{ data?: Types.BacktestConfig; error?: string }> {
    return apiPut<Types.BacktestConfig>(API_ENDPOINTS.backtest.configDetail(id), config);
  },

  async patch(id: number, config: Partial<Types.BacktestConfig>): Promise<{ data?: Types.BacktestConfig; error?: string }> {
    return apiPatch<Types.BacktestConfig>(API_ENDPOINTS.backtest.configDetail(id), config);
  },

  async delete(id: number): Promise<{ data?: void; error?: string }> {
    return apiDelete(API_ENDPOINTS.backtest.configDetail(id));
  },
};

export const backtestRunService = {
  async getAll(): Promise<{ data?: Types.BacktestRun[]; error?: string }> {
    return apiGet<Types.BacktestRun[]>(API_ENDPOINTS.backtest.runs);
  },

  async getById(id: number): Promise<{ data?: Types.BacktestRun; error?: string }> {
    return apiGet<Types.BacktestRun>(API_ENDPOINTS.backtest.runDetail(id));
  },

  async create(run: Partial<Types.BacktestRun>): Promise<{ data?: Types.BacktestRun; error?: string }> {
    return apiPost<Types.BacktestRun>(API_ENDPOINTS.backtest.runs, run);
  },

  async update(id: number, run: Partial<Types.BacktestRun>): Promise<{ data?: Types.BacktestRun; error?: string }> {
    return apiPut<Types.BacktestRun>(API_ENDPOINTS.backtest.runDetail(id), run);
  },

  async delete(id: number): Promise<{ data?: void; error?: string }> {
    return apiDelete(API_ENDPOINTS.backtest.runDetail(id));
  },
};

export const backtestAlertService = {
  async getAll(backtestRunId?: number): Promise<{ data?: Types.BacktestAlert[]; error?: string }> {
    const url = backtestRunId 
      ? `${API_ENDPOINTS.backtest.alerts}?backtest_run=${backtestRunId}`
      : API_ENDPOINTS.backtest.alerts;
    return apiGet<Types.BacktestAlert[]>(url);
  },

  async getById(id: number): Promise<{ data?: Types.BacktestAlert; error?: string }> {
    return apiGet<Types.BacktestAlert>(API_ENDPOINTS.backtest.alertDetail(id));
  },
};
