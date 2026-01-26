/**
 * Demo Mode Usage Examples
 * 
 * This file shows how to use the demo templates programmatically
 * and provides code examples for developers.
 */

import {
  STRATEGY_PROMPT_TEMPLATES,
  BACKTEST_TEMPLATES,
  DEMO_SCENARIOS,
  demoMode,
  type StrategyPromptTemplate,
  type BacktestTemplate,
  type DemoScenario,
} from './demoTemplates';

// ============================================================================
// Example 1: Using Strategy Templates
// ============================================================================

export function exampleStrategyTemplate() {
  // Get all beginner templates
  const beginnerTemplates = STRATEGY_PROMPT_TEMPLATES.filter(
    t => t.category === 'beginner'
  );
  
  console.log('Beginner Templates:', beginnerTemplates);
  // Output: RSI Mean Reversion, MACD Crossover
  
  // Get a specific template by ID
  const rsiTemplate = STRATEGY_PROMPT_TEMPLATES.find(
    t => t.id === 'rsi-basic'
  );
  
  if (rsiTemplate) {
    console.log('Template Name:', rsiTemplate.name);
    console.log('Prompt:', rsiTemplate.prompt);
    console.log('Expected Duration:', rsiTemplate.expectedDuration);
    console.log('Highlights:', rsiTemplate.highlights);
  }
  
  // Find fastest generating template
  const fastestTemplate = STRATEGY_PROMPT_TEMPLATES
    .filter(t => t.category === 'beginner')
    .sort((a, b) => {
      const timeA = parseInt(a.expectedDuration);
      const timeB = parseInt(b.expectedDuration);
      return timeA - timeB;
    })[0];
  
  console.log('Fastest Template:', fastestTemplate?.name);
}

// ============================================================================
// Example 2: Using Backtest Templates
// ============================================================================

export function exampleBacktestTemplate() {
  // Get quick demo templates
  const quickTemplates = BACKTEST_TEMPLATES.filter(
    t => t.id.includes('quick') || t.id.includes('recent')
  );
  
  console.log('Quick Templates:', quickTemplates);
  
  // Get template for specific market condition
  const bullMarket = BACKTEST_TEMPLATES.find(
    t => t.id === 'bull-market'
  );
  
  if (bullMarket) {
    console.log('Bull Market Config:');
    console.log('  Symbol:', bullMarket.symbol);
    console.log('  Timeframe:', bullMarket.timeframe);
    console.log('  Period:', `${bullMarket.start_date} to ${bullMarket.end_date}`);
    console.log('  Capital:', bullMarket.initial_cash);
    console.log('  Expected Sharpe:', bullMarket.expectedMetrics.sharpe);
  }
  
  // Find templates by symbol
  const btcTemplates = BACKTEST_TEMPLATES.filter(
    t => t.symbol === 'BTCUSDT'
  );
  
  console.log(`BTC Templates: ${btcTemplates.length}`);
}

// ============================================================================
// Example 3: Using Demo Scenarios
// ============================================================================

export function exampleDemoScenario() {
  // Get scenario by duration
  const shortScenarios = DEMO_SCENARIOS.filter(
    s => s.description.includes('2') || s.description.includes('5')
  );
  
  console.log('Short Scenarios:', shortScenarios.map(s => s.name));
  
  // Get specific scenario
  const beginnerWalkthrough = DEMO_SCENARIOS.find(
    s => s.id === 'beginner-walkthrough'
  );
  
  if (beginnerWalkthrough) {
    console.log('Scenario:', beginnerWalkthrough.name);
    console.log('Steps:', beginnerWalkthrough.steps.length);
    
    // Print all steps
    beginnerWalkthrough.steps.forEach((step) => {
      console.log(`  ${step.step}. ${step.title}`);
      console.log(`     Action: ${step.action}`);
      if (step.templateId) {
        console.log(`     Template: ${step.templateId}`);
      }
    });
  }
}

// ============================================================================
// Example 4: Demo Mode State Management
// ============================================================================

export function exampleDemoModeState() {
  // Enable demo mode
  demoMode.enable();
  console.log('Demo Mode Enabled:', demoMode.isEnabled());
  
  // Set a scenario
  demoMode.setScenario('beginner-walkthrough');
  
  const scenario = demoMode.getCurrentScenario();
  console.log('Current Scenario:', scenario?.name);
  
  // Navigate steps
  console.log('Current Step:', demoMode.getCurrentStep());
  
  demoMode.nextStep();
  console.log('After Next:', demoMode.getCurrentStep());
  
  demoMode.previousStep();
  console.log('After Previous:', demoMode.getCurrentStep());
  
  // Get progress
  const progress = demoMode.getProgress();
  console.log('Progress:', {
    current: progress.current,
    total: progress.total,
    percentage: `${progress.percentage.toFixed(1)}%`
  });
  
  // Disable when done
  demoMode.disable();
  console.log('Demo Mode Enabled:', demoMode.isEnabled());
}

// ============================================================================
// Example 5: Filtering and Searching Templates
// ============================================================================

export function exampleTemplateFiltering() {
  // Find templates by keyword
  const findByKeyword = (keyword: string): StrategyPromptTemplate[] => {
    return STRATEGY_PROMPT_TEMPLATES.filter(t =>
      t.name.toLowerCase().includes(keyword.toLowerCase()) ||
      t.description.toLowerCase().includes(keyword.toLowerCase()) ||
      t.prompt.toLowerCase().includes(keyword.toLowerCase())
    );
  };
  
  const rsiTemplates = findByKeyword('rsi');
  console.log('RSI Templates:', rsiTemplates.map(t => t.name));
  
  const macdTemplates = findByKeyword('macd');
  console.log('MACD Templates:', macdTemplates.map(t => t.name));
  
  // Filter by generation time
  const fastTemplates = STRATEGY_PROMPT_TEMPLATES.filter(t => {
    const duration = t.expectedDuration;
    return duration.includes('30s') || duration.includes('45s');
  });
  
  console.log('Fast Templates (<1min):', fastTemplates.map(t => t.name));
  
  // Get templates by difficulty
  const advanced = STRATEGY_PROMPT_TEMPLATES.filter(
    t => t.category === 'advanced'
  );
  
  console.log('Advanced Templates:', advanced.map(t => t.name));
}

// ============================================================================
// Example 6: Building Custom Demo Flow
// ============================================================================

export interface CustomDemoFlow {
  strategyTemplate: StrategyPromptTemplate;
  backtestTemplate: BacktestTemplate;
  estimatedTime: number;
}

export function createCustomDemo(
  strategyId: string,
  backtestId: string
): CustomDemoFlow | null {
  const strategy = STRATEGY_PROMPT_TEMPLATES.find(s => s.id === strategyId);
  const backtest = BACKTEST_TEMPLATES.find(b => b.id === backtestId);
  
  if (!strategy || !backtest) {
    console.error('Template not found');
    return null;
  }
  
  // Calculate estimated time
  const strategyTime = parseInt(strategy.expectedDuration) || 60;
  const backtestTime = 60; // Estimate 1 minute for backtest
  const estimatedTime = strategyTime + backtestTime + 30; // +30s for transitions
  
  return {
    strategyTemplate: strategy,
    backtestTemplate: backtest,
    estimatedTime
  };
}

// Usage:
export function exampleCustomDemo() {
  // Create a custom 2-minute demo
  const demo = createCustomDemo('rsi-basic', 'quick-demo');
  
  if (demo) {
    console.log('Custom Demo Created:');
    console.log('  Strategy:', demo.strategyTemplate.name);
    console.log('  Backtest:', demo.backtestTemplate.name);
    console.log('  Estimated Time:', `${Math.floor(demo.estimatedTime / 60)}:${(demo.estimatedTime % 60).toString().padStart(2, '0')}`);
  }
}

// ============================================================================
// Example 7: Template Recommendations
// ============================================================================

export function recommendTemplates(
  targetDuration: number, // in seconds
  audience: 'beginner' | 'intermediate' | 'advanced'
): {
  strategy: StrategyPromptTemplate;
  backtest: BacktestTemplate;
} | null {
  // Filter strategies by audience
  const strategies = STRATEGY_PROMPT_TEMPLATES.filter(
    t => t.category === audience || (audience === 'beginner' && t.category === 'intermediate')
  );
  
  if (strategies.length === 0) return null;
  
  // Select appropriate backtest based on duration
  let backtest: BacktestTemplate | undefined;
  
  if (targetDuration < 120) {
    // < 2 minutes: use quick demo
    backtest = BACKTEST_TEMPLATES.find(b => b.id === 'quick-demo');
  } else if (targetDuration < 300) {
    // < 5 minutes: use recent performance
    backtest = BACKTEST_TEMPLATES.find(b => b.id === 'recent-performance');
  } else {
    // 5+ minutes: use bull market
    backtest = BACKTEST_TEMPLATES.find(b => b.id === 'bull-market');
  }
  
  if (!backtest) return null;
  
  // Select strategy based on expected duration
  const strategy = strategies.sort((a, b) => {
    const timeA = parseInt(a.expectedDuration) || 60;
    const timeB = parseInt(b.expectedDuration) || 60;
    return Math.abs(timeA - (targetDuration / 2)) - Math.abs(timeB - (targetDuration / 2));
  })[0];
  
  return { strategy, backtest };
}

// Usage:
export function exampleRecommendations() {
  // Get recommendation for 2-minute beginner demo
  const quickDemo = recommendTemplates(120, 'beginner');
  console.log('2-Minute Demo:', quickDemo);
  
  // Get recommendation for 5-minute intermediate demo
  const mediumDemo = recommendTemplates(300, 'intermediate');
  console.log('5-Minute Demo:', mediumDemo);
  
  // Get recommendation for 10-minute advanced demo
  const longDemo = recommendTemplates(600, 'advanced');
  console.log('10-Minute Demo:', longDemo);
}

// ============================================================================
// Example 8: Export for Testing
// ============================================================================

export function getAllTemplateStats() {
  return {
    strategies: {
      total: STRATEGY_PROMPT_TEMPLATES.length,
      beginner: STRATEGY_PROMPT_TEMPLATES.filter(t => t.category === 'beginner').length,
      intermediate: STRATEGY_PROMPT_TEMPLATES.filter(t => t.category === 'intermediate').length,
      advanced: STRATEGY_PROMPT_TEMPLATES.filter(t => t.category === 'advanced').length,
    },
    backtests: {
      total: BACKTEST_TEMPLATES.length,
      btc: BACKTEST_TEMPLATES.filter(t => t.symbol === 'BTCUSDT').length,
      eth: BACKTEST_TEMPLATES.filter(t => t.symbol === 'ETHUSDT').length,
    },
    scenarios: {
      total: DEMO_SCENARIOS.length,
      short: DEMO_SCENARIOS.filter(s => s.steps.length <= 3).length,
      medium: DEMO_SCENARIOS.filter(s => s.steps.length > 3 && s.steps.length <= 5).length,
      long: DEMO_SCENARIOS.filter(s => s.steps.length > 5).length,
    }
  };
}

// ============================================================================
// Run Examples (for testing)
// ============================================================================

if (import.meta.env.DEV) {
  console.log('=== Demo Template Examples ===');
  console.log('\n--- Template Stats ---');
  console.log(getAllTemplateStats());
  
  console.log('\n--- Example 1: Strategy Templates ---');
  exampleStrategyTemplate();
  
  console.log('\n--- Example 2: Backtest Templates ---');
  exampleBacktestTemplate();
  
  console.log('\n--- Example 3: Demo Scenarios ---');
  exampleDemoScenario();
  
  console.log('\n--- Example 6: Custom Demo ---');
  exampleCustomDemo();
  
  console.log('\n--- Example 7: Recommendations ---');
  exampleRecommendations();
}
