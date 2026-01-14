/**
 * Demo Templates Configuration
 * 
 * Pre-configured templates for creating demo videos and presentations
 * of the AlgoAgent platform capabilities.
 */

export interface StrategyPromptTemplate {
  id: string;
  name: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  prompt: string;
  description: string;
  expectedDuration: string;
  highlights: string[];
}

export interface BacktestTemplate {
  id: string;
  name: string;
  symbol: string;
  timeframe: string;
  start_date: string;
  end_date: string;
  initial_cash: number;
  description: string;
  expectedMetrics: {
    sharpe?: string;
    maxDrawdown?: string;
    winRate?: string;
  };
}

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  steps: {
    step: number;
    title: string;
    action: string;
    templateId?: string;
  }[];
}

/**
 * Strategy Prompt Templates
 * Pre-written prompts that showcase different complexity levels
 */
export const STRATEGY_PROMPT_TEMPLATES: StrategyPromptTemplate[] = [
  {
    id: 'rsi-basic',
    name: 'RSI Mean Reversion Strategy',
    category: 'beginner',
    prompt: 'Create a simple RSI strategy that buys when RSI drops below 30 (oversold) and sells when RSI rises above 70 (overbought). Use a 14-period RSI and trade BTC/USDT on the 1-hour timeframe.',
    description: 'Simple mean reversion strategy perfect for demonstrating basic indicator usage',
    expectedDuration: '~30 seconds generation',
    highlights: [
      'Single indicator (RSI)',
      'Clear entry/exit conditions',
      'Beginner-friendly logic'
    ]
  },
  {
    id: 'macd-crossover',
    name: 'MACD Crossover with Trend Filter',
    category: 'beginner',
    prompt: 'Build a MACD crossover strategy: Buy when MACD line crosses above signal line AND price is above 200-period SMA. Sell when MACD crosses below signal line. Include stop loss at 2% and take profit at 4%.',
    description: 'Trend-following strategy with risk management',
    expectedDuration: '~45 seconds generation',
    highlights: [
      'Multiple indicators (MACD + SMA)',
      'Trend confirmation',
      'Risk management included'
    ]
  },
  {
    id: 'bollinger-breakout',
    name: 'Bollinger Bands Breakout Strategy',
    category: 'intermediate',
    prompt: 'Create a Bollinger Bands breakout strategy: Enter long when price breaks above upper band with increased volume (volume > 20-period average). Exit when price returns to middle band. Use 20-period bands with 2 standard deviations. Add trailing stop at 1.5%.',
    description: 'Volatility breakout strategy with volume confirmation',
    expectedDuration: '~1 minute generation',
    highlights: [
      'Volatility-based entries',
      'Volume confirmation',
      'Dynamic trailing stop'
    ]
  },
  {
    id: 'multi-timeframe',
    name: 'Multi-Timeframe Momentum Strategy',
    category: 'intermediate',
    prompt: 'Develop a multi-timeframe strategy: Check daily timeframe for uptrend (50 EMA > 200 EMA), then on 4H timeframe buy when RSI crosses above 50 with MACD bullish. Sell when 4H RSI falls below 40. Position size based on ATR volatility.',
    description: 'Advanced strategy using multiple timeframes and position sizing',
    expectedDuration: '~90 seconds generation',
    highlights: [
      'Multi-timeframe analysis',
      'Multiple confirmation signals',
      'Dynamic position sizing'
    ]
  },
  {
    id: 'ml-pattern',
    name: 'Pattern Recognition Strategy',
    category: 'advanced',
    prompt: 'Create an advanced pattern recognition strategy: Identify bullish engulfing patterns with RSI divergence. Entry when pattern completes AND RSI shows bullish divergence AND volume confirms (1.5x average). Use ATR-based stops (2x ATR) and targets (3x ATR). Include max 3 concurrent positions.',
    description: 'Complex pattern-based strategy with multiple filters',
    expectedDuration: '~2 minutes generation',
    highlights: [
      'Pattern recognition',
      'Multiple confirmation layers',
      'Advanced risk management',
      'Position limits'
    ]
  },
  {
    id: 'scalping',
    name: 'High-Frequency Scalping Strategy',
    category: 'advanced',
    prompt: 'Build a 5-minute scalping strategy for BTC: Enter on EMA crossover (9 crosses 21) with stochastic oversold/overbought confirmation. Quick exits: take profit at 0.5%, stop loss at 0.3%. Maximum hold time 30 minutes. Trade only during high liquidity hours (08:00-20:00 UTC).',
    description: 'Fast-paced scalping strategy with strict time and profit limits',
    expectedDuration: '~90 seconds generation',
    highlights: [
      'Short timeframe trading',
      'Tight risk controls',
      'Time-based filters',
      'Quick profit targets'
    ]
  },
  {
    id: 'grid-trading',
    name: 'Automated Grid Trading System',
    category: 'advanced',
    prompt: 'Create a grid trading bot: Set up 10 buy orders from -5% to -50% below current price, and 10 sell orders from +5% to +50% above. Each grid level is 5% apart. When buy order fills, place corresponding sell order 5% higher. Continuously rebalance grid as price moves. Max total position size: 50% of capital.',
    description: 'Range-bound grid trading system',
    expectedDuration: '~2 minutes generation',
    highlights: [
      'Grid order management',
      'Automated rebalancing',
      'Position size limits',
      'Market-neutral approach'
    ]
  }
];

/**
 * Backtest Configuration Templates
 * Pre-configured backtest scenarios for consistent demos
 */
export const BACKTEST_TEMPLATES: BacktestTemplate[] = [
  {
    id: 'bull-market',
    name: 'Bull Market (2023)',
    symbol: 'BTCUSDT',
    timeframe: '1h',
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    initial_cash: 10000,
    description: 'Test strategy performance during strong uptrend',
    expectedMetrics: {
      sharpe: '1.5 - 2.5',
      maxDrawdown: '15% - 25%',
      winRate: '45% - 55%'
    }
  },
  {
    id: 'bear-market',
    name: 'Bear Market (2022)',
    symbol: 'BTCUSDT',
    timeframe: '1h',
    start_date: '2022-01-01',
    end_date: '2022-12-31',
    initial_cash: 10000,
    description: 'Test strategy resilience during downtrend',
    expectedMetrics: {
      sharpe: '0.5 - 1.2',
      maxDrawdown: '30% - 45%',
      winRate: '35% - 45%'
    }
  },
  {
    id: 'sideways-market',
    name: 'Sideways Market (H1 2024)',
    symbol: 'BTCUSDT',
    timeframe: '4h',
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    initial_cash: 10000,
    description: 'Test strategy in ranging market conditions',
    expectedMetrics: {
      sharpe: '0.8 - 1.5',
      maxDrawdown: '10% - 20%',
      winRate: '50% - 60%'
    }
  },
  {
    id: 'volatile-period',
    name: 'High Volatility (Q1 2023)',
    symbol: 'BTCUSDT',
    timeframe: '15m',
    start_date: '2023-01-01',
    end_date: '2023-03-31',
    initial_cash: 10000,
    description: 'Test strategy during high volatility periods',
    expectedMetrics: {
      sharpe: '1.0 - 2.0',
      maxDrawdown: '20% - 35%',
      winRate: '40% - 50%'
    }
  },
  {
    id: 'recent-performance',
    name: 'Recent Performance (Last 3 Months)',
    symbol: 'BTCUSDT',
    timeframe: '1h',
    start_date: '2025-10-01',
    end_date: '2025-12-31',
    initial_cash: 10000,
    description: 'Test strategy on recent market data',
    expectedMetrics: {
      sharpe: '1.2 - 2.0',
      maxDrawdown: '15% - 25%',
      winRate: '45% - 55%'
    }
  },
  {
    id: 'altcoin-test',
    name: 'Altcoin Test (ETH)',
    symbol: 'ETHUSDT',
    timeframe: '1h',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    initial_cash: 10000,
    description: 'Test strategy on Ethereum',
    expectedMetrics: {
      sharpe: '1.0 - 1.8',
      maxDrawdown: '20% - 30%',
      winRate: '42% - 52%'
    }
  },
  {
    id: 'quick-demo',
    name: 'Quick Demo (1 Month)',
    symbol: 'BTCUSDT',
    timeframe: '15m',
    start_date: '2025-11-01',
    end_date: '2025-11-30',
    initial_cash: 5000,
    description: 'Fast backtest for quick demonstrations',
    expectedMetrics: {
      sharpe: '0.8 - 1.5',
      maxDrawdown: '10% - 20%',
      winRate: '45% - 55%'
    }
  }
];

/**
 * Demo Scenarios
 * Complete walkthrough scripts for different demo types
 */
export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'beginner-walkthrough',
    name: 'Beginner-Friendly Demo',
    description: 'Complete walkthrough from strategy creation to backtesting (5 minutes)',
    steps: [
      {
        step: 1,
        title: 'Open AI Assistant',
        action: 'Navigate to Dashboard and open AI Assistant panel',
      },
      {
        step: 2,
        title: 'Select RSI Strategy Template',
        action: 'Choose "RSI Mean Reversion Strategy" from templates',
        templateId: 'rsi-basic'
      },
      {
        step: 3,
        title: 'Generate Strategy',
        action: 'Click generate and watch AI create the strategy code',
      },
      {
        step: 4,
        title: 'Review Generated Code',
        action: 'Show the generated strategy code and explain key parts',
      },
      {
        step: 5,
        title: 'Configure Backtest',
        action: 'Open backtest dialog and select "Bull Market (2023)" template',
        templateId: 'bull-market'
      },
      {
        step: 6,
        title: 'Run Backtest',
        action: 'Execute backtest and show real-time progress',
      },
      {
        step: 7,
        title: 'Analyze Results',
        action: 'Review performance metrics and equity curve',
      }
    ]
  },
  {
    id: 'advanced-features',
    name: 'Advanced Features Showcase',
    description: 'Demonstrate complex strategies and multi-timeframe analysis (10 minutes)',
    steps: [
      {
        step: 1,
        title: 'Create Multi-Timeframe Strategy',
        action: 'Use "Multi-Timeframe Momentum Strategy" template',
        templateId: 'multi-timeframe'
      },
      {
        step: 2,
        title: 'Show Code Generation',
        action: 'Highlight multi-timeframe logic in generated code',
      },
      {
        step: 3,
        title: 'Compare Market Conditions',
        action: 'Run backtests across bull, bear, and sideways markets',
      },
      {
        step: 4,
        title: 'Analyze Performance Differences',
        action: 'Compare results across different market conditions',
      },
      {
        step: 5,
        title: 'Show Error Fixing',
        action: 'Demonstrate automatic error correction (if any)',
      }
    ]
  },
  {
    id: 'quick-demo',
    name: 'Quick 2-Minute Demo',
    description: 'Fast demonstration of core capabilities',
    steps: [
      {
        step: 1,
        title: 'AI Strategy Generation',
        action: 'Use "MACD Crossover" template',
        templateId: 'macd-crossover'
      },
      {
        step: 2,
        title: 'Instant Backtest',
        action: 'Run "Quick Demo (1 Month)" backtest',
        templateId: 'quick-demo'
      },
      {
        step: 3,
        title: 'Results Overview',
        action: 'Show key metrics and visualizations',
      }
    ]
  },
  {
    id: 'comparison-demo',
    name: 'Strategy Comparison Demo',
    description: 'Compare multiple strategies side-by-side (8 minutes)',
    steps: [
      {
        step: 1,
        title: 'Generate Simple Strategy',
        action: 'Create RSI strategy',
        templateId: 'rsi-basic'
      },
      {
        step: 2,
        title: 'Generate Advanced Strategy',
        action: 'Create pattern recognition strategy',
        templateId: 'ml-pattern'
      },
      {
        step: 3,
        title: 'Run Identical Backtests',
        action: 'Test both on same market period',
        templateId: 'recent-performance'
      },
      {
        step: 4,
        title: 'Compare Results',
        action: 'Show performance differences and trade analysis',
      }
    ]
  }
];

/**
 * Demo Mode State Management
 */
export class DemoMode {
  private static instance: DemoMode;
  private enabled: boolean = false;
  private currentScenario: DemoScenario | null = null;
  private currentStep: number = 0;

  private constructor() {}

  static getInstance(): DemoMode {
    if (!DemoMode.instance) {
      DemoMode.instance = new DemoMode();
    }
    return DemoMode.instance;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
    this.currentScenario = null;
    this.currentStep = 0;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setScenario(scenarioId: string) {
    const scenario = DEMO_SCENARIOS.find(s => s.id === scenarioId);
    if (scenario) {
      this.currentScenario = scenario;
      this.currentStep = 0;
    }
  }

  getCurrentScenario(): DemoScenario | null {
    return this.currentScenario;
  }

  nextStep() {
    if (this.currentScenario && this.currentStep < this.currentScenario.steps.length - 1) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  getCurrentStep(): number {
    return this.currentStep;
  }

  getProgress(): { current: number; total: number; percentage: number } {
    if (!this.currentScenario) {
      return { current: 0, total: 0, percentage: 0 };
    }
    return {
      current: this.currentStep + 1,
      total: this.currentScenario.steps.length,
      percentage: ((this.currentStep + 1) / this.currentScenario.steps.length) * 100
    };
  }
}

export const demoMode = DemoMode.getInstance();
