# Frontend Logging System Guide

## Overview

A comprehensive, centralized logging system has been implemented across the frontend application for better error detection, debugging, and monitoring. The logging system follows the same structured approach as the backend API.

## 🎯 Features

- **Categorized Logging**: Logs are organized by category (Auth, API, Strategy, Backtest, UI, Data, Production)
- **Log Levels**: Support for debug, info, warn, and error levels
- **Performance Tracking**: Built-in timing for API calls and operations
- **Contextual Information**: Rich metadata with each log entry
- **Error Aggregation**: Track and summarize errors by category
- **Development/Production Modes**: Automatic behavior adjustment based on environment
- **Global Access**: Debug from browser console using `__logger`

## 📁 File Structure

```
src/
├── lib/
│   ├── logger.ts          # Main logging utility (NEW)
│   ├── api.ts             # Updated with logging
│   ├── productionApi.ts   # Updated with logging
│   ├── codeGenerationService.ts  # Updated with logging
│   └── services.ts
├── hooks/
│   └── useAuth.tsx        # Updated with logging
├── pages/
│   ├── Login.tsx          # Updated with logging
│   ├── Register.tsx       # Updated with logging
│   └── Strategy.tsx       # Updated with logging
```

## 🚀 Usage

### Basic Logging

```typescript
import { logger } from '@/lib/logger';

// Authentication logs
logger.auth.info('User logged in', { username: 'john_doe', userId: 123 });
logger.auth.error('Login failed', error, { username: 'john_doe' });

// API logs
logger.api.request('POST', '/api/strategies/', { name: 'New Strategy' });
logger.api.response(200, '/api/strategies/', 250); // 250ms duration
logger.api.error('API request failed', error, { url: '/api/strategies/' });

// Strategy logs
logger.strategy.info('Strategy created', { strategyId: 1, name: 'My Strategy' });
logger.strategy.warn('Strategy validation issues', undefined, { issues: ['issue1'] });

// Backtest logs
logger.backtest.info('Backtest started', { configId: 5, strategyId: 1 });
logger.backtest.error('Backtest failed', error, { configId: 5 });

// UI logs
logger.ui.info('User clicked button', { buttonId: 'submit' });
logger.ui.error('Form validation failed', error, { formName: 'login' });

// Data logs
logger.data.info('Market data fetched', { symbol: 'AAPL', dataPoints: 1000 });

// Production logs
logger.production.info('Code validation started', { codeLength: 5000 });
```

### Performance Tracking

```typescript
import { logger } from '@/lib/logger';

// Track operation duration
const timer = logger.startTimer('Fetch strategies');
await strategyService.getAll();
timer(); // Logs: "⏱️  Fetch strategies" with duration
```

### Manual Duration Logging

```typescript
const startTime = performance.now();
// ... perform operation ...
const duration = Math.round(performance.now() - startTime);

logger.strategy.info('Operation complete', { strategyId: 1, duration });
```

## 🎨 Log Format

Each log entry includes:

```typescript
{
  timestamp: "2025-12-08T10:30:45.123Z",
  level: "info",
  category: "strategy",
  message: "Strategy created successfully",
  context: {
    strategyId: 1,
    name: "My Strategy",
    duration: 250
  },
  error?: Error,
  duration?: number
}
```

## 🔍 Console Output

Logs appear in the console with visual indicators:

```
🔍 🎨 [UI] 10:30:45 - User clicked submit button { buttonId: "submit" }
ℹ️ 📊 [STRATEGY] 10:30:46 - Fetching strategies from API
🌐 🌐 [API] 10:30:46 - API Request: GET http://127.0.0.1:8000/api/strategies/
🌐 🌐 [API] 10:30:46 - Response 200 from http://127.0.0.1:8000/api/strategies/
⏱️  Duration: 245ms
✅ ℹ️ [STRATEGY] 10:30:46 - Successfully loaded strategies { count: 5, duration: 250 }
```

## 🛠️ Debugging Features

### Browser Console Access

```javascript
// Access logger globally in browser console
__logger.getAllLogs()           // Get all logs
__logger.getLogsByCategory('api')  // Get API logs
__logger.getLogsByLevel('error')   // Get all errors
__logger.getErrorSummary()         // Error count by category
__logger.exportLogs()              // Export as JSON
__logger.clearLogs()               // Clear all logs
```

### Enable/Disable Debug Logging

```javascript
// In browser console
__logger.setDebugEnabled(true)   // Enable debug logs
__logger.setDebugEnabled(false)  // Disable debug logs
```

Or set in localStorage:
```javascript
localStorage.setItem('debug_logging', 'true')
```

## 📊 Where Logging is Implemented

### Authentication (`useAuth.tsx`)
- ✅ Login attempts and results
- ✅ Registration attempts and results
- ✅ Logout events
- ✅ Auth token validation
- ✅ Duration tracking for auth operations

### API Layer (`api.ts`)
- ✅ All HTTP requests (method + URL)
- ✅ All HTTP responses (status + duration)
- ✅ Network errors
- ✅ Validation errors
- ✅ Server connection issues

### Production API (`productionApi.ts`)
- ✅ Schema validation requests
- ✅ Code safety validation
- ✅ Validation results (pass/fail)
- ✅ Duration tracking

### Code Generation (`codeGenerationService.ts`)
- ✅ Code generation initiation
- ✅ Code generation completion
- ✅ Validation steps
- ✅ Fix attempts
- ✅ Duration tracking

### Strategy Page (`Strategy.tsx`)
- ✅ Strategy list fetching
- ✅ Bot performance fetching
- ✅ User actions (Run Backtest, Go Live, Add Strategy)
- ✅ Data transformation issues

### Login/Register Pages
- ✅ Form submissions
- ✅ Validation errors
- ✅ Success/failure outcomes
- ✅ Navigation events

## 🎯 Log Categories and Icons

| Category | Icon | Purpose |
|----------|------|---------|
| `auth` | 🔐 | Authentication operations |
| `api` | 🌐 | HTTP requests and responses |
| `strategy` | 📊 | Strategy CRUD operations |
| `backtest` | 🧪 | Backtesting operations |
| `ui` | 🎨 | User interface interactions |
| `data` | 📈 | Data fetching and processing |
| `production` | 🚀 | Production API operations |
| `general` | 💡 | Miscellaneous logs |

## 🎚️ Log Levels

| Level | Icon | When to Use |
|-------|------|-------------|
| `debug` | 🔍 | Detailed info for debugging (only in dev mode) |
| `info` | ℹ️ | General information about application flow |
| `warn` | ⚠️ | Warning conditions that should be addressed |
| `error` | ❌ | Error conditions with stack traces |

## 🔒 Production Behavior

In production mode (`import.meta.env.PROD === true`):
- Console output is suppressed by default
- Critical errors are still logged
- Errors can be sent to backend (endpoint pending)
- Debug logging can be enabled with `localStorage.setItem('debug_logging', 'true')`

## 🧪 Testing Logs

To test the logging system:

1. **Open browser console** (F12)
2. **Navigate through the app**
3. **Observe categorized logs** with icons and timing
4. **Check error aggregation**:
   ```javascript
   __logger.getErrorSummary()
   ```

## 📈 Performance Monitoring

Track operation performance:

```typescript
// Authentication timing
logger.auth.info('Login successful', { username, duration: 245 });

// API call timing  
logger.api.response(200, '/api/strategies/', 156);

// Strategy operations
logger.strategy.info('Strategies loaded', { count: 5, duration: 280 });
```

## 🐛 Debugging Tips

1. **Filter logs by category**: `__logger.getLogsByCategory('api')`
2. **Find all errors**: `__logger.getLogsByLevel('error')`
3. **Export for analysis**: Copy output from `__logger.exportLogs()`
4. **Track API issues**: Look for 🌐 icons in console
5. **Monitor performance**: Check duration values in logs

## 🔄 Future Enhancements

- [ ] Backend error reporting endpoint
- [ ] Log aggregation dashboard
- [ ] Error replay functionality
- [ ] Performance analytics
- [ ] Real-time error notifications
- [ ] Log filtering UI component

## 📝 Best Practices

1. **Always log errors**: Include error object and context
2. **Track durations**: Use `performance.now()` for timing
3. **Provide context**: Add relevant metadata to each log
4. **Use appropriate levels**: Don't overuse `error` for warnings
5. **Keep messages concise**: Clear, actionable messages
6. **Avoid sensitive data**: Don't log passwords, tokens, etc.

## 🎓 Examples

### Example 1: Tracking a complete operation
```typescript
logger.strategy.info('Starting strategy creation');
const startTime = performance.now();

try {
  const { data, error } = await strategyService.create(strategyData);
  
  if (error) {
    logger.strategy.error('Strategy creation failed', new Error(error), {
      strategyName: strategyData.name,
      duration: Math.round(performance.now() - startTime)
    });
    throw new Error(error);
  }
  
  logger.strategy.info('Strategy created successfully', {
    strategyId: data.id,
    strategyName: data.name,
    duration: Math.round(performance.now() - startTime)
  });
} catch (error) {
  logger.strategy.error('Unexpected error', error as Error);
}
```

### Example 2: UI interaction logging
```typescript
const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  logger.ui.info('Form submitted', { formName: 'login', username });
  
  // ... validation ...
  
  if (validationError) {
    logger.ui.warn('Form validation failed', undefined, {
      formName: 'login',
      errors: validationError
    });
    return;
  }
  
  // ... submit logic ...
};
```

## 🆘 Support

For issues or questions about the logging system:
1. Check console for error messages
2. Use `__logger.getErrorSummary()` to identify problem areas
3. Export logs with `__logger.exportLogs()` for analysis
4. Review this guide for proper usage patterns

---

**Last Updated**: December 8, 2025
**Version**: 1.0.0
