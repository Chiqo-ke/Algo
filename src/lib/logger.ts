/**
 * Frontend Logging Utility
 * ========================
 *
 * Centralized logging system for better error detection and debugging.
 *
 * Outputs:
 * 1. Browser DevTools console  (all envs, errors/warns always visible)
 * 2. Vercel Analytics          (track() custom events → Vercel dashboard)
 * 3. Django backend API        (POST /api/logs/frontend-errors/ in production)
 */
import { track } from '@vercel/analytics';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogCategory = 
  | 'auth' 
  | 'api' 
  | 'strategy' 
  | 'backtest' 
  | 'ui' 
  | 'data' 
  | 'production'
  | 'general';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  duration?: number; // For performance tracking
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory
  private isProduction = import.meta.env.PROD;
  private debugEnabled = import.meta.env.DEV || localStorage.getItem('debug_logging') === 'true';

  constructor() {
    // Catch ALL unhandled JS errors (e.g. crashes outside React tree)
    window.addEventListener('error', (event) => {
      this.log('error', 'general', `Unhandled error: ${event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }, event.error);
    });

    // Catch ALL unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error ? event.reason : undefined;
      this.log('error', 'general', `Unhandled promise rejection: ${event.reason}`, undefined, error);
    });
  }

  // Emoji icons for better visual distinction
  private icons = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
  };

  private categoryIcons = {
    auth: '🔐',
    api: '🌐',
    strategy: '📊',
    backtest: '🧪',
    ui: '🎨',
    data: '📈',
    production: '🚀',
    general: '💡',
  };

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context?: Record<string, any>,
    error?: Error,
    duration?: number
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      context,
      error,
      duration,
    };

    // Store in memory
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Always log errors & warnings; log everything else only in dev or when debug enabled
    if (!this.isProduction || this.debugEnabled || level === 'error' || level === 'warn') {
      this.consoleLog(entry);
    }

    // Send errors & warns to Vercel Analytics (visible in Vercel dashboard → Analytics → Custom Events)
    if (level === 'error' || level === 'warn') {
      try {
        track(`frontend_${level}`, {
          category: entry.category,
          message: entry.message.slice(0, 255), // Vercel has a 255 char limit on property values
          url: window.location.pathname,
          ...(entry.error ? { error_type: entry.error.name } : {}),
        });
      } catch {
        // never let tracking break the app
      }
    }

    // Send errors to Django backend in production
    if (level === 'error') {
      this.sendErrorToBackend(entry);
    }
  }

  /**
   * Format and output to console
   */
  private consoleLog(entry: LogEntry): void {
    const icon = this.icons[entry.level];
    const categoryIcon = this.categoryIcons[entry.category];
    const prefix = `${icon} ${categoryIcon} [${entry.category.toUpperCase()}]`;
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    
    const message = `${prefix} ${timestamp} - ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(message, entry.context || '');
        break;
      case 'info':
        console.info(message, entry.context || '');
        break;
      case 'warn':
        console.warn(message, entry.context || '');
        break;
      case 'error':
        console.error(message, entry.error || entry.context || '');
        if (entry.error?.stack) {
          console.error('Stack trace:', entry.error.stack);
        }
        break;
    }

    // Log duration if available
    if (entry.duration !== undefined) {
      console.log(`⏱️  Duration: ${entry.duration}ms`);
    }
  }

  /**
   * Send errors to the Django backend for server-side log storage.
   * Endpoint: POST /api/logs/frontend-errors/
   * Visible in VPS logs / Django admin.
   */
  private async sendErrorToBackend(entry: LogEntry): Promise<void> {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
      const token = localStorage.getItem('access_token');

      await fetch(`${apiUrl}/logs/frontend-errors/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          timestamp: entry.timestamp,
          level: entry.level,
          category: entry.category,
          message: entry.message,
          context: entry.context ?? null,
          error_message: entry.error?.message ?? null,
          error_stack: entry.error?.stack ?? null,
          user_agent: navigator.userAgent,
          url: window.location.href,
        }),
        // Use keepalive so the request survives page unload
        keepalive: true,
      });
    } catch {
      // Fail silently — never let logging break the app
    }
  }

  // ============================================================================
  // PUBLIC API - Category-specific logging methods
  // ============================================================================

  /**
   * Authentication logging
   */
  auth = {
    debug: (message: string, context?: Record<string, any>) => 
      this.log('debug', 'auth', message, context),
    info: (message: string, context?: Record<string, any>) => 
      this.log('info', 'auth', message, context),
    warn: (message: string, context?: Record<string, any>) => 
      this.log('warn', 'auth', message, context),
    error: (message: string, error?: Error, context?: Record<string, any>) => 
      this.log('error', 'auth', message, context, error),
  };

  /**
   * API logging
   */
  api = {
    debug: (message: string, context?: Record<string, any>) => 
      this.log('debug', 'api', message, context),
    info: (message: string, context?: Record<string, any>) => 
      this.log('info', 'api', message, context),
    warn: (message: string, context?: Record<string, any>) => 
      this.log('warn', 'api', message, context),
    error: (message: string, error?: Error, context?: Record<string, any>) => 
      this.log('error', 'api', message, context, error),
    request: (method: string, url: string, body?: any) => 
      this.log('debug', 'api', `${method} ${url}`, { body }),
    response: (status: number, url: string, duration?: number) => 
      this.log('debug', 'api', `Response ${status} from ${url}`, undefined, undefined, duration),
  };

  /**
   * Strategy logging
   */
  strategy = {
    debug: (message: string, context?: Record<string, any>) => 
      this.log('debug', 'strategy', message, context),
    info: (message: string, context?: Record<string, any>) => 
      this.log('info', 'strategy', message, context),
    warn: (message: string, context?: Record<string, any>) => 
      this.log('warn', 'strategy', message, context),
    error: (message: string, error?: Error, context?: Record<string, any>) => 
      this.log('error', 'strategy', message, context, error),
  };

  /**
   * Backtest logging
   */
  backtest = {
    debug: (message: string, context?: Record<string, any>) => 
      this.log('debug', 'backtest', message, context),
    info: (message: string, context?: Record<string, any>) => 
      this.log('info', 'backtest', message, context),
    warn: (message: string, context?: Record<string, any>) => 
      this.log('warn', 'backtest', message, context),
    error: (message: string, error?: Error, context?: Record<string, any>) => 
      this.log('error', 'backtest', message, context, error),
  };

  /**
   * UI/Component logging
   */
  ui = {
    debug: (message: string, context?: Record<string, any>) => 
      this.log('debug', 'ui', message, context),
    info: (message: string, context?: Record<string, any>) => 
      this.log('info', 'ui', message, context),
    warn: (message: string, context?: Record<string, any>) => 
      this.log('warn', 'ui', message, context),
    error: (message: string, error?: Error, context?: Record<string, any>) => 
      this.log('error', 'ui', message, context, error),
  };

  /**
   * Data operations logging
   */
  data = {
    debug: (message: string, context?: Record<string, any>) => 
      this.log('debug', 'data', message, context),
    info: (message: string, context?: Record<string, any>) => 
      this.log('info', 'data', message, context),
    warn: (message: string, context?: Record<string, any>) => 
      this.log('warn', 'data', message, context),
    error: (message: string, error?: Error, context?: Record<string, any>) => 
      this.log('error', 'data', message, context, error),
  };

  /**
   * Production API logging
   */
  production = {
    debug: (message: string, context?: Record<string, any>) => 
      this.log('debug', 'production', message, context),
    info: (message: string, context?: Record<string, any>) => 
      this.log('info', 'production', message, context),
    warn: (message: string, context?: Record<string, any>) => 
      this.log('warn', 'production', message, context),
    error: (message: string, error?: Error, context?: Record<string, any>) => 
      this.log('error', 'production', message, context, error),
  };

  /**
   * General logging
   */
  general = {
    debug: (message: string, context?: Record<string, any>) => 
      this.log('debug', 'general', message, context),
    info: (message: string, context?: Record<string, any>) => 
      this.log('info', 'general', message, context),
    warn: (message: string, context?: Record<string, any>) => 
      this.log('warn', 'general', message, context),
    error: (message: string, error?: Error, context?: Record<string, any>) => 
      this.log('error', 'general', message, context, error),
  };

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Performance tracking helper
   */
  startTimer(label: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = Math.round(performance.now() - startTime);
      this.log('debug', 'general', `⏱️  ${label}`, undefined, undefined, duration);
      return duration;
    };
  }

  /**
   * Get all logs (for debugging/export)
   */
  getAllLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category: LogCategory): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Get error summary
   */
  getErrorSummary(): { category: LogCategory; count: number }[] {
    const errors = this.logs.filter(log => log.level === 'error');
    const summary = new Map<LogCategory, number>();
    
    errors.forEach(error => {
      summary.set(error.category, (summary.get(error.category) || 0) + 1);
    });

    return Array.from(summary.entries()).map(([category, count]) => ({
      category,
      count,
    }));
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    console.clear();
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Enable/disable debug logging
   */
  setDebugEnabled(enabled: boolean): void {
    this.debugEnabled = enabled;
    localStorage.setItem('debug_logging', enabled.toString());
  }
}

// Create singleton instance
export const logger = new Logger();

// Make logger available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).__logger = logger;
}

export default logger;
