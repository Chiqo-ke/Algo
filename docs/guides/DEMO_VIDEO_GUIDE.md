# Demo Video Creation Guide

**Last Updated:** January 10, 2026  
**Version:** 1.0

## Overview

The AlgoAgent platform now includes a comprehensive demo template system designed specifically for creating professional demonstration videos. This guide walks you through using the demo features to showcase the platform's capabilities.

---

## Quick Start

### Accessing Demo Mode

1. **Login to the platform**
2. **Navigate to "Demo Mode"** in the sidebar (Video icon)
3. **Select a demo scenario** from the control panel
4. **Follow the step-by-step guide** for your chosen scenario

---

## Available Demo Scenarios

### 1. Beginner-Friendly Demo (5 minutes)

**Purpose:** Introduction to basic platform features  
**Target Audience:** New users, potential customers  
**Steps:** 7 steps from AI strategy creation to backtest analysis

**Key Highlights:**
- Simple RSI strategy template
- One-click strategy generation
- Easy backtest configuration
- Visual performance metrics

**Script Overview:**
1. Open AI Assistant panel
2. Load "RSI Mean Reversion Strategy" template
3. Generate strategy with AI
4. Review generated code
5. Configure backtest with "Bull Market (2023)" template
6. Run backtest and show progress
7. Analyze results and metrics

---

### 2. Advanced Features Showcase (10 minutes)

**Purpose:** Demonstrate complex capabilities  
**Target Audience:** Technical users, experienced traders  
**Steps:** 5 steps showing multi-timeframe strategies

**Key Highlights:**
- Multi-timeframe momentum strategy
- Complex indicator combinations
- Multiple market condition testing
- Performance comparison analysis

**Script Overview:**
1. Create multi-timeframe strategy
2. Show advanced code generation
3. Run backtests in different market conditions
4. Compare bull vs bear vs sideways performance
5. Demonstrate error fixing capabilities

---

### 3. Quick 2-Minute Demo

**Purpose:** Fast overview for presentations  
**Target Audience:** Investors, stakeholders  
**Steps:** 3 steps for rapid demonstration

**Key Highlights:**
- MACD crossover strategy
- 1-month quick backtest
- Key metrics overview

**Script Overview:**
1. Generate MACD strategy
2. Run quick backtest
3. Show performance results

---

### 4. Strategy Comparison Demo (8 minutes)

**Purpose:** Show strategy development capabilities  
**Target Audience:** Strategy developers  
**Steps:** 4 steps comparing strategies

**Key Highlights:**
- Simple vs advanced strategies
- Side-by-side performance
- Trade analysis comparison

**Script Overview:**
1. Generate RSI strategy
2. Generate pattern recognition strategy
3. Run identical backtests
4. Compare results

---

## Strategy Prompt Templates

### Beginner Templates

#### 1. RSI Mean Reversion Strategy
**Category:** Beginner  
**Generation Time:** ~30 seconds

**Prompt:**
```
Create a simple RSI strategy that buys when RSI drops below 30 (oversold) 
and sells when RSI rises above 70 (overbought). Use a 14-period RSI and 
trade BTC/USDT on the 1-hour timeframe.
```

**Expected Features:**
- Single indicator usage
- Clear entry/exit rules
- Basic position sizing

---

#### 2. MACD Crossover with Trend Filter
**Category:** Beginner  
**Generation Time:** ~45 seconds

**Prompt:**
```
Build a MACD crossover strategy: Buy when MACD line crosses above signal 
line AND price is above 200-period SMA. Sell when MACD crosses below 
signal line. Include stop loss at 2% and take profit at 4%.
```

**Expected Features:**
- Multiple indicators
- Trend confirmation
- Risk management

---

### Intermediate Templates

#### 3. Bollinger Bands Breakout Strategy
**Category:** Intermediate  
**Generation Time:** ~1 minute

**Prompt:**
```
Create a Bollinger Bands breakout strategy: Enter long when price breaks 
above upper band with increased volume (volume > 20-period average). Exit 
when price returns to middle band. Use 20-period bands with 2 standard 
deviations. Add trailing stop at 1.5%.
```

**Expected Features:**
- Volatility-based entries
- Volume confirmation
- Dynamic trailing stop

---

#### 4. Multi-Timeframe Momentum Strategy
**Category:** Intermediate  
**Generation Time:** ~90 seconds

**Prompt:**
```
Develop a multi-timeframe strategy: Check daily timeframe for uptrend 
(50 EMA > 200 EMA), then on 4H timeframe buy when RSI crosses above 50 
with MACD bullish. Sell when 4H RSI falls below 40. Position size based 
on ATR volatility.
```

**Expected Features:**
- Multi-timeframe analysis
- Multiple confirmation signals
- Dynamic position sizing

---

### Advanced Templates

#### 5. Pattern Recognition Strategy
**Category:** Advanced  
**Generation Time:** ~2 minutes

**Prompt:**
```
Create an advanced pattern recognition strategy: Identify bullish engulfing 
patterns with RSI divergence. Entry when pattern completes AND RSI shows 
bullish divergence AND volume confirms (1.5x average). Use ATR-based stops 
(2x ATR) and targets (3x ATR). Include max 3 concurrent positions.
```

**Expected Features:**
- Pattern recognition
- Multiple confirmation layers
- Advanced risk management
- Position limits

---

#### 6. High-Frequency Scalping Strategy
**Category:** Advanced  
**Generation Time:** ~90 seconds

**Prompt:**
```
Build a 5-minute scalping strategy for BTC: Enter on EMA crossover (9 crosses 21) 
with stochastic oversold/overbought confirmation. Quick exits: take profit at 
0.5%, stop loss at 0.3%. Maximum hold time 30 minutes. Trade only during high 
liquidity hours (08:00-20:00 UTC).
```

**Expected Features:**
- Short timeframe trading
- Tight risk controls
- Time-based filters

---

## Backtest Configuration Templates

### 1. Bull Market (2023)
**Symbol:** BTCUSDT  
**Timeframe:** 1h  
**Period:** 2023-01-01 to 2023-12-31  
**Capital:** $10,000

**Use Case:** Test strategy performance in strong uptrend

**Expected Metrics:**
- Sharpe Ratio: 1.5 - 2.5
- Max Drawdown: 15% - 25%
- Win Rate: 45% - 55%

---

### 2. Bear Market (2022)
**Symbol:** BTCUSDT  
**Timeframe:** 1h  
**Period:** 2022-01-01 to 2022-12-31  
**Capital:** $10,000

**Use Case:** Test strategy resilience in downtrend

**Expected Metrics:**
- Sharpe Ratio: 0.5 - 1.2
- Max Drawdown: 30% - 45%
- Win Rate: 35% - 45%

---

### 3. Sideways Market (H1 2024)
**Symbol:** BTCUSDT  
**Timeframe:** 4h  
**Period:** 2024-01-01 to 2024-06-30  
**Capital:** $10,000

**Use Case:** Test in ranging market conditions

**Expected Metrics:**
- Sharpe Ratio: 0.8 - 1.5
- Max Drawdown: 10% - 20%
- Win Rate: 50% - 60%

---

### 4. High Volatility (Q1 2023)
**Symbol:** BTCUSDT  
**Timeframe:** 15m  
**Period:** 2023-01-01 to 2023-03-31  
**Capital:** $10,000

**Use Case:** Test during high volatility periods

**Expected Metrics:**
- Sharpe Ratio: 1.0 - 2.0
- Max Drawdown: 20% - 35%
- Win Rate: 40% - 50%

---

### 5. Quick Demo (1 Month)
**Symbol:** BTCUSDT  
**Timeframe:** 15m  
**Period:** 2025-11-01 to 2025-11-30  
**Capital:** $5,000

**Use Case:** Fast backtest for quick demonstrations

**Expected Metrics:**
- Sharpe Ratio: 0.8 - 1.5
- Max Drawdown: 10% - 20%
- Win Rate: 45% - 55%

---

## Recording Best Practices

### Pre-Recording Checklist

- [ ] Clear browser cache and cookies
- [ ] Close unnecessary browser tabs
- [ ] Disable browser notifications
- [ ] Set display resolution to 1920x1080
- [ ] Ensure stable internet connection
- [ ] Test audio levels
- [ ] Have script/talking points ready

### Recording Tips

1. **Screen Setup**
   - Use full-screen mode
   - Hide personal bookmarks
   - Clear notification center
   - Use incognito/private mode

2. **Navigation**
   - Use smooth cursor movements
   - Pause briefly before clicking
   - Allow animations to complete
   - Show loading states naturally

3. **Pacing**
   - Speak clearly and at moderate speed
   - Pause after key actions
   - Allow time for viewers to read
   - Don't rush through steps

4. **Highlighting**
   - Use cursor to emphasize important elements
   - Circle or point to key metrics
   - Zoom in on complex areas if needed

### Post-Production Tips

- Add captions for key features
- Highlight important metrics with graphics
- Speed up long loading times (with indicator)
- Add background music at low volume
- Include intro/outro screens with branding

---

## Demo Workflow Examples

### Example 1: Beginner Walkthrough

**Total Time:** 5 minutes

**Segment 1 (0:00 - 0:30):** Introduction
- Show dashboard overview
- Highlight main features
- Preview what will be demonstrated

**Segment 2 (0:30 - 2:00):** AI Strategy Creation
- Open AI Assistant panel
- Click "Load Demo Template"
- Select "RSI Mean Reversion Strategy"
- Review pre-filled prompt
- Click "Send" to generate
- Show generation progress
- Review generated code (highlight key sections)

**Segment 3 (2:00 - 3:30):** Backtest Configuration
- Click "Run Backtest" button
- Click "Use Demo Template"
- Select "Bull Market (2023)"
- Show pre-filled configuration
- Review parameters
- Click "Run Backtest"

**Segment 4 (3:30 - 4:30):** Results Analysis
- Watch real-time backtest progress
- Show equity curve building
- Highlight performance metrics:
  - Total return
  - Sharpe ratio
  - Max drawdown
  - Win rate
- Show trade history

**Segment 5 (4:30 - 5:00):** Conclusion
- Summarize results
- Highlight ease of use
- Call to action

---

### Example 2: Advanced Feature Showcase

**Total Time:** 10 minutes

**Focus Areas:**
1. Complex strategy generation (3 min)
2. Multi-condition backtesting (4 min)
3. Performance comparison (2 min)
4. Error handling demo (1 min)

---

## Troubleshooting

### Template Not Loading

**Issue:** Template selection doesn't populate fields  
**Solution:** 
- Refresh the page
- Clear browser cache
- Ensure you're in demo mode

### Backtest Fails to Run

**Issue:** Backtest configuration errors  
**Solution:**
- Verify symbol exists in database
- Check date ranges are valid
- Ensure capital amount is reasonable
- Use demo templates for guaranteed success

### AI Generation Timeout

**Issue:** Strategy generation takes too long  
**Solution:**
- Use beginner templates for faster generation
- Check backend server status
- Retry with simpler prompt

---

## Demo Script Templates

### 30-Second Elevator Pitch

```
"Let me show you how easy it is to create a trading strategy with AI. 
[Open AI panel] I'll use a pre-configured template... [Load RSI template]
...and with one click, our AI generates a complete trading strategy. 
[Generate] In seconds, we have working code that we can backtest 
immediately. [Show results] That's the power of AlgoAgent."
```

### 2-Minute Quick Demo

```
"Welcome to AlgoAgent, the AI-powered trading platform. Today I'll show 
you how to go from idea to tested strategy in under 2 minutes.

[Dashboard] Starting from our dashboard, I'll open the AI Assistant. 
[AI panel] Here I can describe any strategy in plain English, or use 
one of our templates for speed.

[Load template] I'm loading our MACD crossover template - a proven 
trend-following approach. [Generate] Our AI is now writing the complete 
strategy code, including entry logic, exits, and risk management.

[Review code] Here's the generated code - production-ready and fully 
commented. [Configure backtest] Now let's test it. I'll use our quick 
demo template - one month on Bitcoin.

[Run backtest] The backtest runs in real-time... [Results] and here 
are our results: [highlight metrics] 15% return, 1.2 Sharpe ratio, 
52% win rate. All in under 2 minutes.

That's AlgoAgent - from idea to validated strategy in minutes, not weeks."
```

---

## Key Metrics to Highlight

### Must-Show Metrics
- **Total Return %** - Overall profitability
- **Sharpe Ratio** - Risk-adjusted returns
- **Max Drawdown %** - Largest peak-to-trough decline
- **Win Rate %** - Percentage of profitable trades

### Nice-to-Show Metrics
- Number of trades
- Average profit per trade
- Profit factor
- Sortino ratio

### Visual Elements
- Equity curve chart
- Drawdown chart
- Trade distribution
- Entry/exit points on price chart

---

## Support Resources

### Demo Files Location
- Templates: `src/lib/demoTemplates.ts`
- Control Panel: `src/components/DemoControlPanel.tsx`
- AI Assistant: `src/components/AIAssistantPanel.tsx`
- Backtest Dialog: `src/components/BacktestConfigDialog.tsx`

### Quick Commands
- Access Demo Mode: Navigate to `/demo`
- Toggle Demo Templates: Click "Load Demo Template" buttons
- Reset Demo: Click "Reset Demo" in control panel

---

## Feedback & Improvements

Have suggestions for new templates or demo scenarios? Contact the development team or submit an issue in the repository.

---

**Happy Demo Recording! 🎬**
