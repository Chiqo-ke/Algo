export type TourPlacement = "top" | "bottom" | "left" | "right" | "center";

export interface TourStep {
  id: string;
  /** The route this step belongs to */
  page: string;
  /** CSS/data-tour selector for the highlighted element */
  target: string | null;
  title: string;
  content: string;
  placement: TourPlacement;
  /** If true, tooltip centers — no spotlight needed */
  pageIntro?: boolean;
  /** Demo action key to fire when this step becomes active */
  onActivate?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tour simulates the real user journey:
// Describe strategy → Send → Review AI response → Configure dialog →
// Strategy Hub → Backtesting → Builder → Settings
// ─────────────────────────────────────────────────────────────────────────────
export const TOUR_STEPS: TourStep[] = [
  // ─── WELCOME ─────────────────────────────────────────────────────────────
  {
    id: "welcome",
    page: "/dashboard",
    target: null,
    title: "Welcome to AlgoAI 👋",
    content:
      "Let me walk you through building and backtesting your first AI-powered trading strategy. I'll simulate the exact steps a user takes so you can see the system in action.",
    placement: "center",
    pageIntro: true,
  },

  // ─── 1 · TYPE YOUR STRATEGY ──────────────────────────────────────────────
  {
    id: "type-strategy",
    page: "/dashboard",
    target: '[data-tour="chat-input"]',
    title: "1 · Describe Your Strategy",
    content:
      "Type your trading idea in plain English right here. I've filled in an example — 'Buy when RSI drops below 30 (oversold), sell when above 70 (overbought), 2% stop-loss.'",
    placement: "top",
    onActivate: "fill-input",
  },

  // ─── 2 · SEND ────────────────────────────────────────────────────────────
  {
    id: "send-strategy",
    page: "/dashboard",
    target: '[data-tour="send-button"]',
    title: "2 · Send to the AI",
    content:
      "Click the Send button (or press Enter). The AI analyses your description and generates a structured trading strategy with full entry/exit rules and risk parameters.",
    placement: "top",
    onActivate: "show-mock-response",
  },

  // ─── 3 · REVIEW AI RESPONSE ──────────────────────────────────────────────
  {
    id: "review-proceed",
    page: "/dashboard",
    target: '[data-tour="review-proceed-btn"]',
    title: "3 · Review & Proceed",
    content:
      "The AI returns a complete strategy breakdown. Click 'Review & Proceed to Next Step' to open the configuration panel where you'll name and configure your strategy.",
    placement: "bottom",
  },

  // ─── 4 · NAME YOUR STRATEGY (dialog opens on this step) ──────────────────
  {
    id: "strategy-name",
    page: "/dashboard",
    target: '[data-tour="confirm-name"]',
    title: "4 · Name Your Strategy",
    content:
      "Give your strategy a unique, memorable name. This is how it will appear in your Strategy Hub and on all backtest reports.",
    placement: "bottom",
    onActivate: "open-confirm-dialog",
  },

  // ─── 5 · SELECT SECURITY ─────────────────────────────────────────────────
  {
    id: "strategy-symbol",
    page: "/dashboard",
    target: '[data-tour="confirm-symbol"]',
    title: "5 · Choose the Security",
    content:
      "Enter the ticker symbol to trade — e.g. AAPL (Apple), TSLA (Tesla), or BTC-USD (Bitcoin). This determines which historical data is used for the backtest.",
    placement: "bottom",
  },

  // ─── 6 · SELECT PERIOD ───────────────────────────────────────────────────
  {
    id: "strategy-period",
    page: "/dashboard",
    target: '[data-tour="confirm-period"]',
    title: "6 · Set the Backtest Period",
    content:
      "Choose how much historical data to test against. '1 Year' gives you a solid sample size — enough for statistically meaningful results without overfitting.",
    placement: "bottom",
  },

  // ─── 7 · CONFIRM AND GENERATE ────────────────────────────────────────────
  {
    id: "strategy-confirm",
    page: "/dashboard",
    target: '[data-tour="confirm-btn"]',
    title: "7 · Generate the Strategy",
    content:
      "Click 'Confirm & Proceed' to save your strategy. The AI will generate executable Python code, validate it, and automatically run your first backtest.",
    placement: "top",
  },

  // ─── 8 · STRATEGY HUB ────────────────────────────────────────────────────
  {
    id: "strategy-hub",
    page: "/strategy",
    target: null,
    title: "Strategy Hub",
    content:
      "All your AI-generated strategies live here. You can track performance, run new backtests, edit strategies with the AI, or manage them from this central hub.",
    placement: "center",
    pageIntro: true,
  },

  // ─── 9 · STRATEGY CARD ───────────────────────────────────────────────────
  {
    id: "strategy-card",
    page: "/strategy",
    target: '[data-tour="strategy-card"]',
    title: "Strategy Cards",
    content:
      "Each card shows your strategy name, status, and quick actions. Click the options menu (⋯) to rename, edit with AI, duplicate, or delete the strategy.",
    placement: "right",
  },

  // ─── 10 · RUN BACKTEST ───────────────────────────────────────────────────
  {
    id: "run-backtest",
    page: "/strategy",
    target: '[data-tour="strategy-run-backtest"]',
    title: "Run a Backtest",
    content:
      "Click 'Run Backtest' to take this strategy to the Backtesting Engine where you can configure parameters and analyse historical performance in detail.",
    placement: "bottom",
  },

  // ─── 11 · BACKTESTING PAGE ───────────────────────────────────────────────
  {
    id: "backtesting-intro",
    page: "/backtesting/demo",
    target: null,
    title: "Backtesting Engine",
    content:
      "This is the Backtesting Engine — configure your test parameters, execute the backtest, and review detailed performance metrics all in one place.",
    placement: "center",
    pageIntro: true,
  },

  // ─── 12 · PARAMETERS ─────────────────────────────────────────────────────
  {
    id: "backtest-params",
    page: "/backtesting/demo",
    target: '[data-tour="backtest-symbol"]',
    title: "Configure Parameters",
    content:
      "Set the ticker symbol, date range, and candle interval. These control exactly which historical data the strategy is tested against.",
    placement: "right",
  },

  // ─── 13 · RUN BUTTON ─────────────────────────────────────────────────────
  {
    id: "backtest-run",
    page: "/backtesting/demo",
    target: '[data-tour="backtest-run-btn"]',
    title: "Execute the Backtest",
    content:
      "Click Run Backtest to start. Results typically appear within seconds — the system runs your strategy logic against every historical candle in the selected range.",
    placement: "top",
  },

  // ─── 14 · RESULTS ────────────────────────────────────────────────────────
  {
    id: "backtest-results",
    page: "/backtesting/demo",
    target: '[data-tour="backtest-results"]',
    title: "Review Results",
    content:
      "Results appear here showing total return, Sharpe ratio, max drawdown, win rate, and an equity curve. Use these metrics to compare strategies and identify improvements.",
    placement: "top",
  },

  // ─── 15 · STRATEGY BUILDER ───────────────────────────────────────────────
  {
    id: "builder-intro",
    page: "/strategy-builder",
    target: null,
    title: "Strategy Builder",
    content:
      "The Strategy Builder gives you a more structured interface for generating complex multi-indicator strategies — great when you want finer control over the AI's output.",
    placement: "center",
    pageIntro: true,
  },

  // ─── 16 · SETTINGS ───────────────────────────────────────────────────────
  {
    id: "settings-intro",
    page: "/settings",
    target: null,
    title: "Settings",
    content:
      "Configure your broker API connections, risk limits, notification preferences, and account details here. Set up your API keys before going live.",
    placement: "center",
    pageIntro: true,
  },

  // ─── DONE ─────────────────────────────────────────────────────────────────
  {
    id: "done",
    page: "/settings",
    target: null,
    title: "You're All Set! 🎉",
    content:
      "You now know the full flow — describe a strategy, configure it, run a backtest, and refine based on results. Head to the Dashboard to build your first real strategy!",
    placement: "center",
    pageIntro: true,
  },
];

// Page group labels for the progress indicator
export const TOUR_PAGE_GROUPS = [
  { label: "Dashboard", range: [0, 7] as [number, number] },
  { label: "Strategies", range: [8, 10] as [number, number] },
  { label: "Backtesting", range: [11, 14] as [number, number] },
  { label: "More", range: [15, 17] as [number, number] },
];
