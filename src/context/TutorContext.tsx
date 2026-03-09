import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export type AutoAction =
  | { kind: "type"; selector: string; text: string }
  | { kind: "click"; selector: string }
  | { kind: "click-last"; selector: string }
  | { kind: "wait"; ms: number }
  | { kind: "sequence"; actions: AutoAction[] };

export interface TourStep {
  id: string;
  title: string;
  description: string;
  route?: string;
  targetSelector?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  tips?: string[];
  /** Runs automatically when the step loads */
  autoAction?: AutoAction;
  /** Runs when the user presses Next, before advancing to the next step */
  nextAction?: AutoAction;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  icon: string;
  estimatedTime: string;
  steps: TourStep[];
}

export const TOURS: Tour[] = [
  {
    id: "full-system",
    name: "Full System Walkthrough",
    description:
      "An interactive guided tour â€” the tutor operates the system for you step by step, just like a real user would.",
    icon: "ðŸ—ºï¸",
    estimatedTime: "5â€“10 min",
    steps: [
      {
        id: "welcome",
        title: "Welcome to AlgoAI! ðŸ‘‹",
        description:
          "I'm your interactive guide. I'll operate the system for you â€” typing strategies, clicking buttons, and filling forms â€” so you can see exactly how AlgoAI works in practice.\n\nYou only ever need to press **Next**. I do the rest.\n\nPress **Next** to begin!",
        route: "/dashboard",
        position: "center",
      },
      {
        id: "sidebar",
        title: "Navigation Sidebar",
        description:
          "This is the sidebar â€” your primary navigation hub. From here you can access:\n\nâ€¢ **Dashboard** â€” your AI strategy builder\nâ€¢ **Strategy** â€” manage all your saved strategies\nâ€¢ **Learning Hub** â€” tutorials and documentation\nâ€¢ **Settings** â€” configure your account\n\nPress **Next** to explore the Dashboard.",
        route: "/dashboard",
        targetSelector: "aside",
        position: "right",
      },
      {
        id: "dashboard-intro",
        title: "The AI Dashboard ðŸ¤–",
        description:
          "This is the heart of AlgoAI â€” where you describe trading strategies in plain English and the AI turns them into executable code.\n\nNo programming knowledge required. Just describe your idea like you would to a human trading analyst.\n\nPress **Next** and I'll type a sample strategy for you.",
        route: "/dashboard",
        targetSelector: "main",
        position: "center",
        tips: [
          "Be specific about entry AND exit conditions",
          "Name the asset you want to trade",
          "Include risk parameters like a stop-loss",
        ],
      },
      {
        id: "type-strategy",
        title: "Typing a Strategy Into the Chat ðŸ“",
        description:
          "Watch â€” I'm typing a real RSI momentum strategy into the chat box below.\n\nOnce typing finishes (the cursor stops blinking), press **Next** and I'll send it to the AI for you.",
        route: "/dashboard",
        targetSelector: "textarea",
        position: "top",
        autoAction: {
          kind: "type",
          selector: "textarea",
          text: "Create an RSI momentum strategy for AAPL. Buy when RSI 14 drops below 30 (oversold). Sell when RSI rises above 70 (overbought). Use a 2% stop-loss.",
        },
        nextAction: { kind: "click-last", selector: "[data-tutor-id='send-message']" },
        tips: [
          "You can describe any strategy in plain English",
          "The AI understands indicators, conditions, and risk rules",
        ],
      },
      {
        id: "ai-thinking",
        title: "AI Is Generating Your Strategy âš™ï¸",
        description:
          "I just sent the message to the AI. You can see the live **workflow progress indicator** in the chat â€” it shows each internal stage:\n\n1. Parsing your description\n2. Structuring entry / exit rules\n3. Applying risk parameters\n4. Generating Python code\n\nWhen the AI response appears with a blue **Review & Proceed** button at the bottom, press **Next**.",
        position: "center",
        tips: [
          "This typically takes 15â€“40 seconds",
          "The AI retains context â€” you can send follow-up messages after the tour",
        ],
      },
      {
        id: "ai-response",
        title: "AI Strategy Response âœ…",
        description:
          "The AI has responded with your fully structured strategy â€” complete with entry conditions, exit rules, and risk parameters.\n\nPress **Next** and I'll click the **Review & Proceed** button in the chat for you, opening the confirmation dialog.",
        position: "center",
        nextAction: { kind: "click-last", selector: "[data-tutor-id='review-proceed']" },
        tips: [
          "Scroll down in the AI message to see the full strategy output",
          "If the button is not visible yet, the AI may still be processing â€” wait a moment then press Next",
        ],
      },
      {
        id: "dialog-form",
        title: "Strategy Confirmation Dialog ðŸ“‹",
        description:
          "A confirmation dialog has opened. I'm filling in the strategy **name** and **initial backtest symbol** for you automatically.\n\nOnce the fields are filled, press **Next** and I'll click Confirm â€” this will generate the trading code and kick off the first backtest.",
        targetSelector: "#strategy-name",
        position: "bottom",
        autoAction: {
          kind: "sequence",
          actions: [
            { kind: "wait", ms: 1000 },
            { kind: "type", selector: "#strategy-name", text: "RSI Momentum Demo" },
            { kind: "wait", ms: 500 },
            { kind: "type", selector: "#backtest-symbol", text: "AAPL" },
          ],
        },
        nextAction: { kind: "click", selector: "[data-tutor-id='confirm-proceed']" },
        tips: [
          "Any descriptive name works â€” you can rename strategies later",
          "The backtest symbol can be any stock or crypto ticker (e.g. TSLA, ETH-USD)",
          "Strategy code is auto-generated after confirmation",
        ],
      },
      {
        id: "generating",
        title: "Generating Strategy & Running Backtest ðŸš€",
        description:
          "I clicked Confirm. The system is now:\n\n1. Saving your strategy definition\n2. Auto-generating the Python trading code\n3. Running an initial backtest on AAPL historical data\n\nThis takes 20â€“60 seconds. Watch the backtesting page load with results. Once results appear, press **Next** to continue.",
        position: "center",
        tips: [
          "Do not navigate away while generation is in progress",
          "The page updates automatically when results are ready",
        ],
      },
      {
        id: "strategy-page",
        title: "Strategy Management Page ðŸ“Š",
        description:
          "Here on the Strategy page you can manage all your saved strategies. Each entry shows:\n\nâ€¢ Real-time performance metrics (win rate, return)\nâ€¢ Status badge: **Live**, **Testing**, or **Paused**\nâ€¢ Quick actions: open backtesting lab, edit, or delete\n\nPress **Next** to look at strategy cards.",
        route: "/strategy",
        targetSelector: "main",
        position: "center",
      },
      {
        id: "strategy-cards",
        title: "Strategy Cards ðŸƒ",
        description:
          "Each card represents one strategy. You can:\n\nâ€¢ **Click the card body** â€” opens the dedicated backtesting lab\nâ€¢ **Use the â‹® menu** â€” rename, edit, or delete\nâ€¢ **Read at-a-glance stats** â€” total return, win rate, trade count\n\nPress **Next** to explore the Backtesting Engine.",
        route: "/strategy",
        targetSelector: "[class*='Card']",
        position: "bottom",
        tips: ["You can run multiple strategies simultaneously"],
      },
      {
        id: "backtesting",
        title: "Backtesting Engine ðŸ“ˆ",
        description:
          "The Backtesting Engine validates your strategy against **real historical price data** before you risk any capital.\n\nYou can configure:\nâ€¢ **Symbol** â€” AAPL, BTC-USD, TSLA, etc.\nâ€¢ **Time period** â€” 1 month to 5 years of history\nâ€¢ **Interval** â€” daily, hourly, or 15-minute candles\n\nPress **Next** to learn how to read results.",
        route: "/backtesting",
        targetSelector: "main",
        position: "center",
        tips: [
          "Always backtest before going live",
          "Test across multiple time periods to validate robustness",
        ],
      },
      {
        id: "backtest-metrics",
        title: "Interpreting Backtest Results ðŸ“‰",
        description:
          "Focus on these key metrics when reading results:\n\nâ€¢ **Total Return** â€” overall % gain or loss\nâ€¢ **Win Rate > 50%** â€” more winners than losers\nâ€¢ **Sharpe Ratio > 1.0** â€” strong risk-adjusted returns\nâ€¢ **Max Drawdown < 20%** â€” acceptable worst-case risk\nâ€¢ **Trade History** â€” every entry, exit, and P&L\n\nPress **Next** to see Settings.",
        route: "/backtesting",
        position: "center",
      },
      {
        id: "settings",
        title: "Settings & Account âš™ï¸",
        description:
          "In Settings you can configure:\n\nâ€¢ **Profile** â€” update your personal information\nâ€¢ **API Keys** â€” connect to live brokers\nâ€¢ **Notifications** â€” configure alerts and thresholds\nâ€¢ **Subscription** â€” manage your plan\n\nAlways keep API keys private â€” never share them.\n\nPress **Next** to finish the tour.",
        route: "/settings",
        targetSelector: "main",
        position: "center",
      },
      {
        id: "complete",
        title: "Tour Complete â€” You're Ready! ðŸŽ‰",
        description:
          "You've seen the entire AlgoAI workflow operated live:\n\n1. **Describe** your strategy in natural language\n2. **AI generates** structured rules and Python code automatically\n3. **Confirm** with a name and backtest configuration\n4. **Backtest** against historical data to validate\n5. **Deploy** once you're confident in the results\n\nYou now have a real strategy saved in your account. Go build your next one! ðŸš€",
        route: "/dashboard",
        position: "center",
      },
    ],
  },
];

interface TutorContextType {
  isActive: boolean;
  activeTour: Tour | null;
  currentStep: number;
  totalSteps: number;
  currentStepData: TourStep | null;
  showMenu: boolean;
  startTour: (tourId: string) => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  simulatingText: string | null;
  isActing: boolean;
  highlightRect: DOMRect | null;
  setHighlightRect: (rect: DOMRect | null) => void;
}

const TutorContext = createContext<TutorContextType | null>(null);

export function TutorProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [simulatingText, setSimulatingText] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const navigateRef = useRef<ReturnType<typeof useNavigate> | null>(null);
  const cancelActionRef = useRef(false);
  const isNextPendingRef = useRef(false);
  const runActionRef = useRef<(action: AutoAction) => Promise<void>>(null!);

  const navigate = useNavigate();
  navigateRef.current = navigate;

  const runAction = useCallback(async (action: AutoAction): Promise<void> => {
    if (cancelActionRef.current) return;
    if (action.kind === "type") {
      const el = document.querySelector(action.selector) as HTMLTextAreaElement | HTMLInputElement | null;
      if (!el) return;
      el.focus();
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      nativeSetter?.call(el, "");
      el.dispatchEvent(new Event("input", { bubbles: true }));
      setSimulatingText("");
      let typed = "";
      for (const char of action.text) {
        if (cancelActionRef.current) break;
        typed += char;
        nativeSetter?.call(el, typed);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        setSimulatingText(typed);
        await new Promise<void>((r) => setTimeout(r, 38));
      }
      if (!cancelActionRef.current) el.dispatchEvent(new Event("change", { bubbles: true }));
    } else if (action.kind === "click") {
      await new Promise<void>((r) => setTimeout(r, 80));
      if (cancelActionRef.current) return;
      const el = document.querySelector(action.selector) as HTMLElement | null;
      if (el) el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    } else if (action.kind === "click-last") {
      await new Promise<void>((r) => setTimeout(r, 80));
      if (cancelActionRef.current) return;
      const els = document.querySelectorAll(action.selector);
      if (els.length > 0) (els[els.length - 1] as HTMLElement).dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    } else if (action.kind === "wait") {
      await new Promise<void>((r) => setTimeout(r, action.ms));
    } else if (action.kind === "sequence") {
      for (const sub of action.actions) {
        if (cancelActionRef.current) break;
        await runActionRef.current(sub);
      }
    }
  }, []);

  runActionRef.current = runAction;

  const goToStep = useCallback((tour: Tour, stepIndex: number) => {
    cancelActionRef.current = true;
    isNextPendingRef.current = false;
    const step = tour.steps[stepIndex];
    if (!step) return;
    if (step.route && navigateRef.current) navigateRef.current(step.route);
    setHighlightRect(null);
    setSimulatingText(null);
    setIsActing(false);
    if (step.autoAction) {
      cancelActionRef.current = false;
      const action = step.autoAction;
      (async () => {
        await new Promise<void>((r) => setTimeout(r, 650));
        if (cancelActionRef.current) { setIsActing(false); return; }
        setIsActing(true);
        await runActionRef.current(action);
        if (!cancelActionRef.current) setIsActing(false);
      })();
    }
  }, []);

  const startTour = useCallback((tourId: string) => {
    const tour = TOURS.find((t) => t.id === tourId);
    if (!tour) return;
    setActiveTour(tour);
    setCurrentStep(0);
    setIsActive(true);
    setShowMenu(false);
    goToStep(tour, 0);
  }, [goToStep]);

  const endTour = useCallback(() => {
    cancelActionRef.current = true;
    isNextPendingRef.current = false;
    setIsActive(false);
    setActiveTour(null);
    setCurrentStep(0);
    setSimulatingText(null);
    setIsActing(false);
    setHighlightRect(null);
  }, []);

  const nextStep = useCallback(() => {
    if (!activeTour || isActing || isNextPendingRef.current) return;
    isNextPendingRef.current = true;
    const currentStepObj = activeTour.steps[currentStep];
    const advance = (delay = 0) => {
      setTimeout(() => {
        isNextPendingRef.current = false;
        const next = currentStep + 1;
        if (next >= activeTour.steps.length) { endTour(); return; }
        setCurrentStep(next);
        goToStep(activeTour, next);
      }, delay);
    };
    if (currentStepObj?.nextAction) {
      const action = currentStepObj.nextAction;
      if (action.kind === "click") {
        const el = document.querySelector(action.selector) as HTMLElement | null;
        if (el) el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
        advance(300);
      } else if (action.kind === "click-last") {
        const els = document.querySelectorAll(action.selector);
        if (els.length > 0) (els[els.length - 1] as HTMLElement).dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
        advance(300);
      } else {
        cancelActionRef.current = false;
        runActionRef.current(action).then(() => { if (!cancelActionRef.current) advance(200); });
      }
    } else {
      advance();
    }
  }, [activeTour, currentStep, isActing, endTour, goToStep]);

  const prevStep = useCallback(() => {
    if (!activeTour || currentStep === 0) return;
    setCurrentStep(currentStep - 1);
    goToStep(activeTour, currentStep - 1);
  }, [activeTour, currentStep, goToStep]);

  const openMenu = useCallback(() => setShowMenu(true), []);
  const closeMenu = useCallback(() => setShowMenu(false), []);
  const currentStepData = activeTour?.steps[currentStep] ?? null;
  const totalSteps = activeTour?.steps.length ?? 0;

  return (
    <TutorContext.Provider
      value={{
        isActive,
        activeTour,
        currentStep,
        totalSteps,
        currentStepData,
        showMenu,
        startTour,
        endTour,
        nextStep,
        prevStep,
        openMenu,
        closeMenu,
        simulatingText,
        isActing,
        highlightRect,
        setHighlightRect,
      }}
    >
      {children}
    </TutorContext.Provider>
  );
}

export function useTutor() {
  const ctx = useContext(TutorContext);
  if (!ctx) throw new Error("useTutor must be used inside TutorProvider");
  return ctx;
}