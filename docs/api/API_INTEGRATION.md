# API Integration Documentation

## Overview
This document outlines the API integration between the Algo frontend (React/TypeScript) and the AlgoAgent backend (Django).

## Base Configuration

### API Base URL
- **Development**: `http://127.0.0.1:8000/api`
- **Location**: `src/lib/api.ts`

## API Modules

### 1. Symbol API (`/api/data/symbols/`)
**Service**: `symbolService` in `src/lib/services.ts`

#### Endpoints Integrated:
- `GET /api/data/symbols/` - List all symbols
- `GET /api/data/symbols/{id}/` - Get symbol details
- `POST /api/data/symbols/` - Create new symbol

#### Usage in Frontend:
- **Backtesting Page**: Symbol dropdown populated with real symbols from API
- **Location**: `src/pages/Backtesting.tsx`

```typescript
// Example usage
const { data, error } = await symbolService.getAll();
```

### 2. Strategy API (`/api/strategies/`)
**Service**: `strategyService` in `src/lib/services.ts`

#### Endpoints Integrated:
- `GET /api/strategies/strategies/` - List all strategies
- `GET /api/strategies/strategies/{id}/` - Get strategy details
- `POST /api/strategies/strategies/` - Create new strategy
- `GET /api/strategies/templates/` - Get strategy templates
- `GET /api/strategies/api/categories/` - Get strategy categories

#### Usage in Frontend:
- **Strategy Page**: Lists all strategies dynamically
- **Backtesting Page**: Fetches strategy code for backtesting
- **Strategy Builder**: Loads templates
- **Locations**: 
  - `src/pages/Strategy.tsx`
  - `src/pages/Backtesting.tsx`
  - `src/pages/StrategyBuilder.tsx`

```typescript
// Example usage
const { data, error } = await strategyService.getAll();
const { data, error } = await strategyService.getById(strategyId);
```

### 3. Backtest API (`/api/backtests/`)
**Service**: `backtestService` in `src/lib/services.ts`

#### Endpoints Integrated:
- `POST /api/backtests/api/quick_run/` - Run quick backtest
- `POST /api/backtests/api/run_backtest/` - Run full backtest
- `GET /api/backtests/results/` - Get backtest results
- `GET /api/backtests/trades/` - Get trade history
- `GET /api/backtests/api/performance_metrics/` - Get performance metrics
- `GET /api/backtests/api/monitor/` - Monitor backtest progress

#### Usage in Frontend:
- **Backtesting Page**: Executes backtests and displays results
- **Location**: `src/pages/Backtesting.tsx`

```typescript
// Example usage
const backtestConfig = {
  strategy_id: 1,
  symbol: "EURUSD",
  start_date: "2024-01-01",
  end_date: "2024-12-31",
  timeframe: "1H",
  initial_balance: 10000,
  lot_size: 1.0,
  config: {
    commission: 0.001,
    slippage: 0.001,
  }
};

const { data, error } = await backtestService.quickRun(backtestConfig);
```

### 4. Market Data API (`/api/data/market-data/`)
**Service**: `marketDataService` in `src/lib/services.ts`

#### Endpoints Integrated:
- `POST /api/data/api/fetch_data/` - Fetch historical market data
- `GET /api/data/market-data/` - Get market data
- `GET /api/data/api/available_indicators/` - List available indicators

#### Usage in Frontend:
- **Available for future features**: Chart displays, data visualization
- **Location**: `src/lib/services.ts`

## File Structure

```
src/
├── lib/
│   ├── api.ts              # API configuration and helper functions
│   ├── services.ts         # Service functions for each API domain
│   └── utils.ts            # Utility functions
├── pages/
│   ├── Backtesting.tsx     # Backtest execution with API integration
│   ├── Strategy.tsx        # Strategy list with API integration
│   ├── StrategyBuilder.tsx # Strategy builder with template loading
│   └── Dashboard.tsx       # Main dashboard (AI chat - mock)
└── hooks/
    └── use-toast.ts        # Toast notifications for API feedback
```

## API Helper Functions

### Core Functions in `src/lib/api.ts`:

1. **`apiCall<T>(url, options)`** - Generic API call wrapper
2. **`apiGet<T>(url)`** - GET request helper
3. **`apiPost<T>(url, body)`** - POST request helper
4. **`apiPut<T>(url, body)`** - PUT request helper
5. **`apiDelete<T>(url)`** - DELETE request helper

All functions return `{ data?, error? }` for consistent error handling.

## Error Handling

All API calls use a consistent error handling pattern:

```typescript
const { data, error } = await symbolService.getAll();

if (error) {
  toast({
    title: "Error loading symbols",
    description: error,
    variant: "destructive",
  });
  return;
}

// Use data safely
if (data) {
  setSymbols(data);
}
```

## Loading States

All pages implement loading indicators:
- Symbols: `loadingSymbols` state
- Strategies: `loadingStrategy` state
- Backtest execution: `isRunning` state

## Type Definitions

TypeScript interfaces are defined in `src/lib/services.ts`:
- `Symbol` - Symbol data structure
- `Strategy` - Strategy data structure
- `BacktestConfig` - Backtest configuration
- `BacktestResult` - Backtest results
- `Trade` - Trade data
- `PerformanceMetrics` - Performance metrics

## Integration Status

### ✅ Fully Integrated
1. **Symbol Management** - Dynamic symbol dropdown in Backtesting
2. **Strategy Management** - Dynamic strategy list in Strategy page
3. **Backtest Execution** - Real API calls for running backtests
4. **Error Handling** - Toast notifications for all API errors
5. **Loading States** - Loading indicators for all async operations

### 🚧 Partially Integrated
1. **Strategy Templates** - API connected, UI dialog pending
2. **Market Data** - Service ready, not yet used in UI

### ❌ Not Yet Integrated
1. **AI Strategy Generation** - Backend endpoint pending
2. **Real-time Monitoring** - WebSocket integration pending
3. **Live Trading Controls** - Backend endpoints pending
4. **Dashboard Statistics** - Aggregation endpoints pending

## Running the Application

### Prerequisites
1. Backend server running at `http://127.0.0.1:8000`
2. Database populated with test data

### Start Backend
```bash
cd AlgoAgent
python manage.py runserver
```

### Start Frontend
```bash
cd Algo
npm run dev
# or
bun dev
```

### Test API Integration
1. Navigate to Strategy page - Should load strategies from API
2. Click on any strategy's "Test" button
3. Select a symbol from the dropdown (loaded from API)
4. Configure backtest parameters
5. Click "Run Backtest" - Should execute via API and show results

## Environment Variables

Consider adding `.env` file for configuration:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_WS_URL=ws://127.0.0.1:8000/ws
```

Update `src/lib/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
```

## Next Steps

1. **Add Environment Configuration** - Use .env for API URLs
2. **Implement WebSocket** - For real-time backtest monitoring
3. **Add Pagination** - For large strategy/symbol lists
4. **Cache Management** - Implement data caching strategy
5. **API Retry Logic** - Handle temporary network failures
6. **Authentication** - Add JWT token management when backend implements it
7. **Rate Limiting** - Handle API rate limits gracefully

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure Django backend has CORS headers configured:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite default
    "http://127.0.0.1:5173",
]
```

### API Not Responding
1. Check backend is running: `http://127.0.0.1:8000/api/`
2. Verify database migrations: `python manage.py migrate`
3. Check Django logs for errors

### Data Not Loading
1. Open browser DevTools → Network tab
2. Check for failed API requests
3. Verify response data structure matches TypeScript interfaces
4. Check toast notifications for error messages

## Support

For issues or questions:
1. Check browser console for errors
2. Review Django server logs
3. Verify API endpoints in Postman collections
4. Check `API_INTEGRATION.md` (this file)
