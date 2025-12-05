# API Quick Reference
**Last Updated:** December 4, 2025

Quick reference for all integrated API services.

---

## 📦 Import

```typescript
import {
  // Services
  authService,
  symbolService,
  strategyService,
  backtestService,
  marketDataService,
  indicatorService,
  productionStrategyService,
  productionBacktestService,
  healthService,
  
  // Types
  User,
  UserProfile,
  Strategy,
  BacktestConfig,
  BacktestResult,
  HealthStatus
} from '@/lib';
```

---

## 🔐 Auth & User Management

```typescript
// Profiles
authService.getProfiles()
authService.getProfile(id)
authService.getMyProfile()
authService.updateProfile(id, data)
authService.deleteProfile(id)

// AI Contexts
authService.getAIContexts()
authService.createAIContext(data)
authService.updateAIContext(id, data)
authService.deleteAIContext(id)

// Chat Sessions
authService.getChatSessions()
authService.createChatSession(data)
authService.updateChatSession(id, data)
authService.deleteChatSession(id)
authService.chat(message, context)

// Health
authService.health()
```

---

## 📊 Data Management

```typescript
// Symbols
symbolService.getAll()
symbolService.getById(id)
symbolService.create(data)
symbolService.update(id, data)
symbolService.patch(id, data)
symbolService.delete(id)

// Market Data
marketDataService.fetch(params)
marketDataService.getAll(params)
marketDataService.getById(id)
marketDataService.update(id, data)
marketDataService.delete(id)
marketDataService.getIndicators()
marketDataService.health()

// Indicators
indicatorService.getAll()
indicatorService.getById(id)
indicatorService.create(data)
indicatorService.update(id, data)
indicatorService.delete(id)

// Indicator Data
indicatorDataService.getAll()
indicatorDataService.getById(id)
indicatorDataService.create(data)
indicatorDataService.update(id, data)
indicatorDataService.delete(id)

// Data Requests
dataRequestService.getAll()
dataRequestService.getById(id)
dataRequestService.create(data)
dataRequestService.update(id, data)
dataRequestService.delete(id)
```

---

## 🎯 Strategy Management

```typescript
// Basic CRUD
strategyService.getAll()
strategyService.getById(id)
strategyService.create(data)
strategyService.update(id, data)
strategyService.patch(id, data)
strategyService.delete(id)

// Validation
strategyService.validate(data)
strategyService.validateFile(file)
strategyService.validateById(id)

// Actions
strategyService.clone(id)
strategyService.quickBacktest(id, config)

// Templates
strategyService.getTemplates()
strategyService.getTemplateById(id)
strategyService.updateTemplate(id, data)
strategyService.deleteTemplate(id)

// Categories
strategyService.getCategories()

// AI Features
strategyService.validateWithAI(request)
strategyService.createWithAI(request)
strategyService.updateWithAI(id, request)

// Health
strategyService.health()
```

### Strategy Sub-Services

```typescript
// Validations
strategyValidationService.getAll()
strategyValidationService.getById(id)

// Performance
strategyPerformanceService.getAll()
strategyPerformanceService.getById(id)
strategyPerformanceService.create(data)
strategyPerformanceService.update(id, data)
strategyPerformanceService.delete(id)

// Comments
strategyCommentService.getAll(strategyId?)
strategyCommentService.getById(id)
strategyCommentService.create(data)
strategyCommentService.update(id, data)
strategyCommentService.delete(id)

// Tags
strategyTagService.getAll()
strategyTagService.getById(id)
strategyTagService.create(data)
strategyTagService.update(id, data)
strategyTagService.delete(id)

// Chat
strategyChatService.getAll(strategyId?)
strategyChatService.getById(id)
strategyChatService.create(data)
strategyChatService.update(id, data)
strategyChatService.delete(id)
```

---

## 🔬 Backtest Management

```typescript
// Basic Operations
backtestService.run(config)
backtestService.quickRun(config)
backtestService.getResults(backtestId?)
backtestService.getResultById(id)

// Trades
backtestService.getTrades(backtestId?)
backtestService.getTradeById(id)

// Metrics & Monitoring
backtestService.getPerformanceMetrics(backtestId)
backtestService.monitor(backtestId)
backtestService.getStatus(backtestId)

// Health
backtestService.health()
```

### Backtest Sub-Services

```typescript
// Configurations
backtestConfigService.getAll()
backtestConfigService.getById(id)
backtestConfigService.create(data)
backtestConfigService.update(id, data)
backtestConfigService.patch(id, data)
backtestConfigService.delete(id)

// Runs
backtestRunService.getAll()
backtestRunService.getById(id)
backtestRunService.create(data)
backtestRunService.update(id, data)
backtestRunService.delete(id)

// Alerts
backtestAlertService.getAll(backtestRunId?)
backtestAlertService.getById(id)
```

---

## 🚀 Production Services

```typescript
// Strategy Production
productionStrategyService.validateSchema(data)
productionStrategyService.validateCode(code, strictMode)
productionStrategyService.sandboxTest(strategyId, timeout, limits)
productionStrategyService.getLifecycle(strategyId)
productionStrategyService.deploy(strategyId, message, createTag, version)
productionStrategyService.rollback(strategyId, commitHash, reason)
productionStrategyService.health()

// Backtest Production
productionBacktestService.validateConfig(config)
productionBacktestService.runSandbox(strategyId, configId, start, end, symbols, limits)
productionBacktestService.getStatus(backtestId)
productionBacktestService.health()
```

---

## 🏥 Health Monitoring

```typescript
// Individual Checks
healthService.checkAuth()
healthService.checkData()
healthService.checkStrategies()
healthService.checkBacktests()
healthService.checkProductionStrategies()
healthService.checkProductionBacktests()

// Comprehensive
healthService.checkAll()
healthService.getSystemHealth()

// Utilities
isProductionHealthy(health)
getHealthStatusColor(status)
getHealthStatusIcon(status)
getHealthStatusBadge(status)
```

---

## 🎨 Common Patterns

### Error Handling

```typescript
const { data, error } = await service.method();
if (error) {
  toast.error(error);
  return;
}
// Use data
```

### Loading State

```typescript
const [loading, setLoading] = useState(false);

const loadData = async () => {
  setLoading(true);
  const { data, error } = await service.getAll();
  setLoading(false);
  
  if (error) {
    toast.error(error);
    return;
  }
  
  setState(data);
};
```

### Pagination

```typescript
const [page, setPage] = useState(1);

const loadPage = async (pageNum: number) => {
  const url = `${endpoint}?page=${pageNum}`;
  const { data } = await apiGet(url);
  return data;
};
```

### Filtering

```typescript
const getFiltered = async (filters: any) => {
  const params = new URLSearchParams(filters);
  const url = `${endpoint}?${params.toString()}`;
  return apiGet(url);
};
```

---

## 📝 Type Reference

### Common Types

```typescript
// User
User { id, username, email, first_name, last_name, is_active, date_joined }
UserProfile { id, user, bio, avatar, phone, location, website, preferences }

// Data
Symbol { id, symbol, name, exchange, sector, industry, is_active }
MarketData { id, symbol, timestamp, open, high, low, close, volume, timeframe }
Indicator { id, name, display_name, description, category, parameters, is_active }

// Strategy
Strategy { id, name, description, strategy_code, status, version, tags, ... }
StrategyComment { id, strategy, user, content, parent_comment, created_at }
StrategyTag { id, name, description, color, created_at }

// Backtest
BacktestConfig { id, name, strategy_id, symbol, start_date, end_date, ... }
BacktestRun { id, config, strategy, status, started_at, completed_at }
BacktestResult { id, run, total_return, sharpe_ratio, max_drawdown, ... }
Trade { id, date, symbol, action, quantity, price, profit }

// Health
HealthStatus { overall, components, error }
```

---

## 🔥 Quick Tips

1. **Always destructure responses:** `const { data, error } = await service.method()`
2. **Check errors first:** `if (error) return;`
3. **Use TypeScript types:** Import from `@/lib/types`
4. **Handle loading states:** Show spinners during async calls
5. **Monitor health:** Check API health before critical operations
6. **Use production services:** For validation and deployment
7. **Leverage AI features:** Use AI-powered strategy operations

---

## 📚 More Info

- Full Guide: `API_INTEGRATION_DEVELOPER_GUIDE.md`
- Types: `src/lib/types.ts`
- Implementation: `src/lib/services.ts`
- Production: `src/lib/productionServices.ts`

---

**Quick Reference v1.0**  
Last Updated: December 4, 2025
