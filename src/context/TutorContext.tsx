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
    description: "An interactive guided tour that operates the system for you step by step.",
    icon: "tour",
    estimatedTime: "5-10 min",
    steps: [
      {
        id: "welcome",
        title: "Welcome to AlgoAI",
        description:
          "I am your interactive guide. I will operate the system for you - typing strategies, clicking buttons, and filling forms - so you can see exactly how AlgoAI works.\n\nYou only ever need to press **Next**. I do the rest.\n\nPress **Next** to begin.",
        route: "/dashboard",
        position: "center",
      },
      {
        id: "sidebar",
        title: "Navigation",
        description:
          "On desktop, navigation is the sidebar on the left. On mobile (phone or tablet), it is the bar at the bottom of your screen.\n\nYou can go to the Dashboard, Strategy page, and Settings from there.\n\nPress **Next** to explore the Dashboard.",
        route: "/dashboard",
        position: "center",
      },
      {
        id: "dashboard-intro",
        title: "The AI Dashboard",
        description:
          "This is where you describe trading strategies in plain English and the AI turns them into executable code. No programming knowledge required.\n\nPress **Next** and I will type a sample strategy for you.",
        route: "/dashboard",
        targetSelector: "main",
        position: "center",
        tips: [
          "Be specific about entry and exit conditions",
          "Include risk parameters like a stop-loss",
        ],
      },
      {
        id: "type-strategy",
        title: "Typing a Strategy",
        description:
          "Watch - I am typing a real RSI momentum strategy into the chat box below.\n\nWhen typing finishes, press **Next** to send it to the AI.",
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
        title: "AI Generating Your Strategy",
        description:
          "The message was sent. The AI is parsing your description, structuring entry and exit rules, and generating Python code.\n\nWhen the blue **Review and Proceed** button appears at the bottom of the chat, press **Next**.",
        position: "center",
        tips: [
          "This typically takes 15-40 seconds",
        ],
      },
      {
        id: "ai-response",
        title: "AI Strategy Response",
        description:
          "The AI has responded with your fully structured strategy - entry conditions, exit rules, and risk parameters are all defined.\n\nPress **Next** and I will click the **Review and Proceed** button for you.",
        position: "center",
        nextAction: { kind: "click-last", selector: "[data-tutor-id='review-proceed']" },
        tips: [
          "If the button is not visible yet, the AI may still be processing - wait a moment then press Next",
        ],
      },
      {
        id: "dialog-form",
        title: "Confirmation Dialog",
        description:
          "A confirmation dialog has opened. I am filling in the strategy name and backtest symbol automatically.\n\nOnce the fields are filled, press **Next** to confirm and generate the code.",
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
          "Any descriptive name works - you can rename strategies later",
          "The backtest symbol can be any stock or crypto ticker",
        ],
      },
      {
        id: "generating",
        title: "Generating Strategy",
        description:
          "The system is saving your strategy, generating the Python trading code, and running an initial backtest on AAPL historical data.\n\nWait for the results to appear on screen, then press **Next**.",
        position: "center",
        tips: [
          "Do not navigate away while generation is in progress",
        ],
      },
      {
        id: "strategy-page",
        title: "Strategy Page",
        description:
          "Here you can manage all your saved strategies. Each entry shows real-time performance metrics, a status badge, and quick actions.\n\nPress **Next** to look at strategy cards.",
        route: "/strategy",
        targetSelector: "main",
        position: "center",
      },
      {
        id: "strategy-cards",
        title: "Strategy Cards",
        description:
          "Each card represents one strategy. Click the card body to open the backtesting lab, or use the menu button to rename, edit, or delete.\n\nPress **Next** to explore the Backtesting Engine.",
        route: "/strategy",
        targetSelector: "[class*='Card']",
        position: "bottom",
        tips: ["You can run multiple strategies simultaneously"],
      },
      {
        id: "backtesting",
        title: "Backtesting Engine",
        description:
          "Validate your strategy against real historical price data before risking any capital. Configure the symbol, time period, and candle interval.\n\nPress **Next** to learn how to read the results.",
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
        title: "Reading Backtest Results",
        description:
          "Key metrics: **Total Return** (overall gain or loss), **Win Rate** (aim above 50%), **Sharpe Ratio** (aim above 1.0), **Max Drawdown** (aim below 20%).\n\nPress **Next** to see Settings.",
        route: "/backtesting",
        position: "center",
      },
      {
        id: "settings",
        title: "Settings",
        description:
          "Configure your profile, connect API keys to live brokers, set up notification alerts, and manage your subscription.\n\nKeep API keys private - never share them.\n\nPress **Next** to finish the tour.",
        route: "/settings",
        targetSelector: "main",
        position: "center",
      },
      {
        id: "complete",
        title: "Tour Complete",
        description:
          "You have seen the full AlgoAI workflow: describe a strategy in plain English, the AI generates the code, confirm and backtest, then deploy when confident.\n\nYou now have a real strategy saved. Go build your next one!",
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