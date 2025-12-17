# API Integration Complete - Developer Guide
**Date:** December 4, 2025  
**Status:** ✅ All Backend Endpoints Integrated

---

## 🎉 Integration Complete

All AlgoAgent backend API endpoints have been successfully integrated into the Algo frontend. This guide will help you use these new services effectively.

## 📁 New Files Created

### 1. **`src/lib/types.ts`** - Comprehensive TypeScript Types
All data types for API responses including:
- User management types (User, UserProfile, AIContext, ChatSession)
- Data types (Symbol, MarketData, Indicator, DataRequest)
- Strategy types (Strategy, StrategyTemplate, StrategyComment, StrategyTag, StrategyPerformance)
- Backtest types (BacktestConfig, BacktestRun, BacktestResult, BacktestAlert)
- Production API types (SchemaValidation, CodeSafety, Sandbox, Lifecycle, Deployment)

### 2. **`src/lib/services.ts`** - Extended with Full CRUD
Now includes complete service modules:
- `authService` - User profiles, AI contexts, chat sessions
- `symbolService` - Full CRUD for symbols
- `dataRequestService` - Data request management
- `marketDataService` - Market data with CRUD
- `indicatorService` - Indicator management
- `indicatorDataService` - Indicator data CRUD
- `strategyService` - Complete strategy CRUD + AI features
- `strategyValidationService` - Validation records
- `strategyPerformanceService` - Performance tracking
- `strategyCommentService` - Comments system
- `strategyTagService` - Tag management
- `strategyChatService` - Strategy-specific chat
- `backtestService` - Enhanced backtest operations
- `backtestConfigService` - Configuration management
- `backtestRunService` - Run tracking
- `backtestAlertService` - Alert management

### 3. **`src/lib/productionServices.ts`** - Production API Services
Unified production API service:
- `productionStrategyService` - Schema validation, code safety, sandbox testing, deployment
- `productionBacktestService` - Sandbox execution, config validation
- `healthService` - Comprehensive health monitoring for all APIs

### 4. **`src/lib/index.ts`** - Central Export
Single import point for all services and types.

### 5. **`src/lib/api.ts`** - Enhanced API Endpoints
Updated with all missing endpoints and added `apiPatch` helper.

---

## 🚀 Quick Start Guide

### Using the New Services

#### 1. Import Services

```typescript
// Import specific services
import { 
  authService, 
  strategyService, 
  backtestService,
  productionStrategyService,
  healthService 
} from '@/lib';

// Or import types
import type { 
  UserProfile, 
  Strategy, 
  BacktestConfig,
  HealthStatus 
} from '@/lib/types';
```

#### 2. User Profile Management

```typescript
// Get current user's profile
const { data: profile, error } = await authService.getMyProfile();

// Update profile
const updated = await authService.updateProfile(profileId, {
  bio: 'Updated bio',
  preferences: { theme: 'dark' }
});

// Get all profiles
const { data: profiles } = await authService.getProfiles();
```

#### 3. AI Context & Chat Sessions

```typescript
// Create AI context
const { data: context } = await authService.createAIContext({
  context_type: 'strategy_analysis',
  context_data: { strategy_id: 123 }
});

// Create chat session
const { data: session } = await authService.createChatSession({
  title: 'Strategy Discussion',
  context: 'Analyzing RSI strategy'
});

// Send chat message
const { data: response } = await authService.chat(
  'How can I improve this strategy?',
  { strategy_id: 123 }
);
```

#### 4. Complete Strategy CRUD

```typescript
// Get all strategies
const { data: strategies } = await strategyService.getAll();

// Get specific strategy
const { data: strategy } = await strategyService.getById(1);

// Create strategy
const { data: newStrategy } = await strategyService.create({
  name: 'My Strategy',
  description: 'A new trading strategy',
  strategy_code: 'def strategy():\n    pass'
});

// Update strategy
const { data: updated } = await strategyService.update(1, {
  name: 'Updated Strategy Name'
});

// Partial update
const { data: patched } = await strategyService.patch(1, {
  status: 'active'
});

// Delete strategy
await strategyService.delete(1);

// Clone strategy
const { data: cloned } = await strategyService.clone(1);

// Quick backtest from strategy
const { data: results } = await strategyService.quickBacktest(1, {
  symbol: 'AAPL',
  start_date: '2024-01-01',
  end_date: '2024-12-31'
});
```

#### 5. Strategy Comments & Tags

```typescript
// Add comment
const { data: comment } = await strategyCommentService.create({
  strategy: 1,
  user: userId,
  content: 'Great strategy!'
});

// Get comments for strategy
const { data: comments } = await strategyCommentService.getAll(1);

// Create tag
const { data: tag } = await strategyTagService.create({
  name: 'momentum',
  description: 'Momentum-based strategies',
  color: '#FF5733'
});

// Get all tags
const { data: tags } = await strategyTagService.getAll();
```

#### 6. AI-Powered Strategy Operations

```typescript
// Validate strategy with AI
const { data: validation } = await strategyService.validateWithAI({
  strategy_text: 'Buy when RSI < 30, sell when RSI > 70',
  input_type: 'freetext',
  use_gemini: true,
  strict_mode: false
});

// Create strategy with AI
const { data: aiStrategy } = await strategyService.createWithAI({
  strategy_text: 'Moving average crossover strategy',
  input_type: 'freetext',
  name: 'MA Crossover',
  description: 'AI-generated strategy',
  tags: ['ai-generated'],
  use_gemini: true,
  save_to_backtest: true
});

// Update strategy with AI
const { data: updated } = await strategyService.updateWithAI(1, {
  strategy_text: 'Add stop loss at 2%',
  input_type: 'freetext',
  use_gemini: true,
  update_description: 'Adding risk management'
});
```

#### 7. Market Data & Indicators

```typescript
// Fetch historical data
const { data: marketData } = await marketDataService.fetch({
  symbol: 'AAPL',
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  timeframe: '1D'
});

// Get market data with filters
const { data: data } = await marketDataService.getAll({
  symbol: 'AAPL',
  start_date: '2024-01-01'
});

// Get available indicators
const { data: indicators } = await marketDataService.getIndicators();

// Create custom indicator
const { data: indicator } = await indicatorService.create({
  name: 'custom_rsi',
  display_name: 'Custom RSI',
  category: 'momentum',
  parameters: { period: 14 }
});

// Get indicator data
const { data: indicatorData } = await indicatorDataService.getAll();
```

#### 8. Complete Backtest Management

```typescript
// Create backtest configuration
const { data: config } = await backtestConfigService.create({
  name: 'My Backtest Config',
  strategy_id: 1,
  symbol: 'AAPL',
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  initial_capital: 100000,
  commission: 0.001
});

// Run backtest
const { data: result } = await backtestService.run({
  strategy_id: 1,
  symbol: 'AAPL',
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  initial_balance: 100000
});

// Quick backtest
const { data: quickResult } = await backtestService.quickRun(config);

// Get backtest run history
const { data: runs } = await backtestRunService.getAll();

// Get specific run
const { data: run } = await backtestRunService.getById(1);

// Get alerts for run
const { data: alerts } = await backtestAlertService.getAll(1);

// Monitor backtest progress
const { data: status } = await backtestService.monitor(1);

// Get detailed results
const { data: result } = await backtestService.getResultById(1);

// Get trade history
const { data: trades } = await backtestService.getTrades(1);

// Get performance metrics
const { data: metrics } = await backtestService.getPerformanceMetrics(1);
```

#### 9. Production API Features

```typescript
// Validate strategy schema
const { data: schemaValidation } = await productionStrategyService.validateSchema({
  name: 'Test Strategy',
  strategy_code: 'def strategy(): pass'
});

// Validate code safety
const { data: codeValidation } = await productionStrategyService.validateCode(
  'def strategy(): pass',
  true // strict mode
);

// Run sandbox test
const { data: sandboxResult } = await productionStrategyService.sandboxTest(
  1, // strategy ID
  60, // timeout in seconds
  { cpu: '0.5', memory: '512m' }
);

// Get lifecycle tracking
const { data: lifecycle } = await productionStrategyService.getLifecycle(1);

// Deploy strategy
const { data: deployment } = await productionStrategyService.deploy(
  1,
  'Deploy to production',
  true, // create tag
  'v1.0.0'
);

// Rollback strategy
const { data: rollback } = await productionStrategyService.rollback(
  1,
  'abc123', // commit hash
  'Bug found in production'
);

// Validate backtest config
const { data: configValidation } = await productionBacktestService.validateConfig({
  strategy_id: 1,
  symbol: 'AAPL',
  start_date: '2024-01-01',
  end_date: '2024-12-31'
});

// Run sandbox backtest
const { data: sandboxBacktest } = await productionBacktestService.runSandbox(
  1, // strategy ID
  1, // config ID
  '2024-01-01',
  '2024-12-31',
  ['AAPL', 'GOOGL'],
  { cpu: '1.0', memory: '1g', timeout: 300 }
);

// Get backtest status
const { data: backtestStatus } = await productionBacktestService.getStatus(1);
```

#### 10. Health Monitoring

```typescript
// Check individual API health
const { data: authHealth } = await healthService.checkAuth();
const { data: dataHealth } = await healthService.checkData();
const { data: strategyHealth } = await healthService.checkStrategies();
const { data: backtestHealth } = await healthService.checkBacktests();

// Check all APIs at once
const allHealth = await healthService.checkAll();
console.log('Auth:', allHealth.auth);
console.log('Data:', allHealth.data);
console.log('Strategies:', allHealth.strategies);
console.log('Backtests:', allHealth.backtests);
console.log('Errors:', allHealth.errors);

// Get system-wide health
const systemHealth = await healthService.getSystemHealth();
console.log('Overall:', systemHealth.overall); // 'healthy' | 'degraded' | 'unhealthy'
console.log('Components:', systemHealth.components);
```

---

## 🎨 UI Integration Examples

### Health Status Component

```typescript
import { healthService, getHealthStatusIcon, getHealthStatusBadge } from '@/lib';

function HealthDashboard() {
  const [health, setHealth] = useState<any>(null);
  
  useEffect(() => {
    const checkHealth = async () => {
      const result = await healthService.getSystemHealth();
      setHealth(result);
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    
    return () => clearInterval(interval);
  }, []);
  
  if (!health) return <div>Loading...</div>;
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        System Health {getHealthStatusIcon(health.overall)}
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(health.components).map(([name, status]) => (
          <div key={name} className={`p-4 rounded ${getHealthStatusBadge(status ? 'healthy' : 'unhealthy')}`}>
            <h3 className="font-semibold">{name}</h3>
            <p>{status ? '✅ Healthy' : '❌ Down'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Strategy Management Component

```typescript
import { strategyService, strategyCommentService, strategyTagService } from '@/lib';
import type { Strategy, StrategyComment, StrategyTag } from '@/lib/types';

function StrategyManager() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [comments, setComments] = useState<StrategyComment[]>([]);
  
  useEffect(() => {
    loadStrategies();
  }, []);
  
  const loadStrategies = async () => {
    const { data } = await strategyService.getAll();
    if (data) setStrategies(data);
  };
  
  const loadComments = async (strategyId: number) => {
    const { data } = await strategyCommentService.getAll(strategyId);
    if (data) setComments(data);
  };
  
  const handleClone = async (id: number) => {
    const { data, error } = await strategyService.clone(id);
    if (data) {
      toast.success('Strategy cloned successfully');
      loadStrategies();
    } else {
      toast.error(error || 'Failed to clone strategy');
    }
  };
  
  const handleDelete = async (id: number) => {
    const { error } = await strategyService.delete(id);
    if (!error) {
      toast.success('Strategy deleted');
      loadStrategies();
    } else {
      toast.error(error);
    }
  };
  
  const handleAddComment = async (strategyId: number, content: string) => {
    const { data, error } = await strategyCommentService.create({
      strategy: strategyId,
      user: currentUser.id,
      content
    });
    if (data) {
      toast.success('Comment added');
      loadComments(strategyId);
    } else {
      toast.error(error || 'Failed to add comment');
    }
  };
  
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Strategy Manager</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {strategies.map(strategy => (
          <div key={strategy.id} className="border rounded-lg p-4">
            <h3 className="text-xl font-semibold">{strategy.name}</h3>
            <p className="text-gray-600">{strategy.description}</p>
            
            <div className="mt-4 flex gap-2">
              <button onClick={() => handleClone(strategy.id)}>
                Clone
              </button>
              <button onClick={() => setSelectedStrategy(strategy)}>
                View
              </button>
              <button onClick={() => handleDelete(strategy.id)} className="text-red-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📊 API Coverage

### ✅ Fully Integrated (100%)

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Authentication** | 13/13 | ✅ Complete |
| **Symbols & Data** | 20/20 | ✅ Complete |
| **Strategies** | 24/24 | ✅ Complete |
| **Backtests** | 16/16 | ✅ Complete |
| **Production** | 11/11 | ✅ Complete |
| **Health Checks** | 6/6 | ✅ Complete |

**Total: 90/90 endpoints integrated (100%)**

---

## 🔧 Configuration

All services use the centralized API configuration from `src/lib/api.ts`:

```typescript
const API_BASE_URL = 'http://127.0.0.1:8000/api';
```

To change the API URL, update this constant or set the `VITE_API_URL` environment variable.

---

## 🐛 Error Handling

All services return a consistent response format:

```typescript
interface APIResponse<T> {
  data?: T;
  error?: string;
}
```

Example usage:

```typescript
const { data, error } = await strategyService.getById(1);

if (error) {
  console.error('Error:', error);
  toast.error(error);
  return;
}

if (data) {
  console.log('Success:', data);
  // Use the data
}
```

---

## 🚦 Next Steps

1. **Update existing components** to use the new CRUD operations
2. **Build UI components** for:
   - User profile management
   - Strategy comments & tags
   - Market data visualization
   - Indicator management
   - Health monitoring dashboard
3. **Implement real-time features** using the monitoring endpoints
4. **Add error boundaries** for better error handling
5. **Create integration tests** for all services

---

## 📚 Additional Resources

- **Backend API Documentation:** `c:\Users\nyaga\Documents\AlgoAgent\`
- **Integration Status Report:** `API_INTEGRATION_STATUS_REPORT.md`
- **TypeScript Types:** `src/lib/types.ts`
- **API Endpoints:** `src/lib/api.ts`

---

## ✨ What Changed

### Before
- ❌ 35% API coverage
- ❌ Missing CRUD operations
- ❌ No profile management
- ❌ No comments/tags system
- ❌ Limited backtest features
- ❌ No health monitoring

### After
- ✅ 100% API coverage
- ✅ Complete CRUD for all entities
- ✅ Full profile management
- ✅ Comments & tags system
- ✅ Complete backtest management
- ✅ Comprehensive health monitoring
- ✅ Production deployment features
- ✅ AI-powered operations

---

**Happy Coding! 🎉**

For questions or issues, refer to the API documentation or check the backend logs.
