/* 
 * FRONTEND LOGGING QUICK REFERENCE
 * ================================
 * 
 * Import: import { logger } from '@/lib/logger';
 * Browser Console: __logger
 */

// ============================================================================
// BASIC USAGE
// ============================================================================

// Authentication
logger.auth.info('User logged in', { username, userId });
logger.auth.error('Login failed', error, { username });

// API Calls
logger.api.request('POST', url, body);
logger.api.response(status, url, duration);
logger.api.error('Request failed', error, { url, method });

// Strategy Operations
logger.strategy.info('Strategy created', { strategyId, name });
logger.strategy.warn('Validation issues', undefined, { issues });
logger.strategy.error('Creation failed', error, { strategyName });

// Backtesting
logger.backtest.info('Backtest started', { configId, strategyId });
logger.backtest.error('Backtest failed', error, { configId });

// UI Interactions
logger.ui.info('Button clicked', { buttonId });
logger.ui.error('Form error', error, { formName });

// Data Operations
logger.data.info('Data fetched', { symbol, count });
logger.data.error('Fetch failed', error, { symbol });

// Production API
logger.production.info('Validation started', { codeLength });
logger.production.warn('Validation failed', undefined, { issues });

// ============================================================================
// PERFORMANCE TRACKING
// ============================================================================

// Option 1: Built-in timer
const timer = logger.startTimer('Operation name');
await doSomething();
timer(); // Logs with duration

// Option 2: Manual timing
const startTime = performance.now();
await doSomething();
const duration = Math.round(performance.now() - startTime);
logger.strategy.info('Complete', { strategyId, duration });

// ============================================================================
// BROWSER CONSOLE DEBUGGING
// ============================================================================

__logger.getAllLogs()                    // Get all logs
__logger.getLogsByCategory('api')        // Filter by category
__logger.getLogsByLevel('error')         // Filter by level
__logger.getErrorSummary()               // Error counts by category
__logger.exportLogs()                    // Export as JSON string
__logger.clearLogs()                     // Clear all logs
__logger.setDebugEnabled(true)           // Enable debug mode

// ============================================================================
// LOG CATEGORIES & ICONS
// ============================================================================

/*
 * 🔐 auth       - Authentication operations
 * 🌐 api        - HTTP requests/responses
 * 📊 strategy   - Strategy CRUD operations
 * 🧪 backtest   - Backtesting operations
 * 🎨 ui         - UI interactions
 * 📈 data       - Data fetching/processing
 * 🚀 production - Production API calls
 * 💡 general    - Miscellaneous
 */

// ============================================================================
// LOG LEVELS
// ============================================================================

/*
 * 🔍 debug - Detailed debugging info (dev only)
 * ℹ️  info  - General information
 * ⚠️  warn  - Warning conditions
 * ❌ error - Error with stack trace
 */

// ============================================================================
// BEST PRACTICES
// ============================================================================

// ✅ DO: Include context
logger.strategy.info('Strategy created', { 
  strategyId: 1, 
  name: 'My Strategy',
  duration: 250 
});

// ✅ DO: Track durations
const startTime = performance.now();
await operation();
logger.api.info('Complete', { duration: Math.round(performance.now() - startTime) });

// ✅ DO: Log errors with full context
try {
  await riskyOperation();
} catch (error) {
  logger.strategy.error('Operation failed', error as Error, {
    strategyId,
    attemptNumber: 3
  });
}

// ❌ DON'T: Log sensitive data
logger.auth.error('Login failed', error, { 
  username, 
  password  // ❌ NEVER DO THIS
});

// ❌ DON'T: Use wrong log level
logger.error('User clicked button');  // Should be info or debug

// ============================================================================
// EXAMPLE: Complete Operation Flow
// ============================================================================

async function createStrategy(data: StrategyData) {
  logger.strategy.info('Starting strategy creation', { name: data.name });
  const startTime = performance.now();
  
  try {
    // Log API request
    logger.api.debug('Sending create request', { endpoint: '/api/strategies/' });
    
    const result = await strategyService.create(data);
    
    if (result.error) {
      // Log error with context
      logger.strategy.error('Creation failed', new Error(result.error), {
        strategyName: data.name,
        duration: Math.round(performance.now() - startTime)
      });
      throw new Error(result.error);
    }
    
    // Log success with duration
    logger.strategy.info('Strategy created successfully', {
      strategyId: result.data.id,
      strategyName: result.data.name,
      duration: Math.round(performance.now() - startTime)
    });
    
    return result.data;
  } catch (error) {
    logger.strategy.error('Unexpected error during creation', error as Error, {
      strategyName: data.name,
      duration: Math.round(performance.now() - startTime)
    });
    throw error;
  }
}

// ============================================================================
// DEBUGGING WORKFLOW
// ============================================================================

/*
 * 1. Open browser console (F12)
 * 2. Reproduce the issue
 * 3. Check logs for errors:
 *    __logger.getLogsByLevel('error')
 * 
 * 4. Check specific category:
 *    __logger.getLogsByCategory('api')
 * 
 * 5. Get error summary:
 *    __logger.getErrorSummary()
 * 
 * 6. Export for analysis:
 *    copy(__logger.exportLogs())
 * 
 * 7. Enable debug logging if needed:
 *    __logger.setDebugEnabled(true)
 */
