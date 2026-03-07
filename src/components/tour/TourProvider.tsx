import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TOUR_STEPS, type TourStep } from "./tourSteps";

interface TourContextValue {
  isActive: boolean;
  currentStep: TourStep | null;
  currentIndex: number;
  totalSteps: number;
  startTour: () => void;
  endTour: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  /** Currently pending demo action — consumed by page components */
  demoAction: string | null;
  /** Call from a page component after handling the demoAction */
  clearDemoAction: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

const STORAGE_KEY = "algoai_tour_seen";

/** Normalise backtesting paths so /backtesting/demo and /backtesting/123
 *  both compare equal to the step’s page value "/backtesting/demo". */
function normPath(p: string): string {
  if (p.startsWith("/backtesting")) return "/backtesting";
  return p;
}

export function TourProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [demoAction, setDemoAction] = useState<string | null>(null);

  // After a route change, advance to the pending step index
  const pendingIndexRef = useRef<number | null>(null);

  /** Apply a new step index and fire its onActivate action if set */
  const applyIndex = useCallback((targetIndex: number) => {
    const step = TOUR_STEPS[targetIndex];
    setCurrentIndex(targetIndex);
    if (step?.onActivate) {
      setDemoAction(step.onActivate);
    }
  }, []);

  // After every pathname change, apply any pending step
  useEffect(() => {
    if (pendingIndexRef.current !== null) {
      const idx = pendingIndexRef.current;
      pendingIndexRef.current = null;
      // Small delay to let the page render before firing the action
      const t = setTimeout(() => applyIndex(idx), 80);
      return () => clearTimeout(t);
    }
  }, [location.pathname, applyIndex]);

  const currentStep = isActive ? (TOUR_STEPS[currentIndex] ?? null) : null;

  const navigateIfNeeded = useCallback(
    (targetIndex: number) => {
      const step = TOUR_STEPS[targetIndex];
      if (!step) return;

      const current = normPath(location.pathname);
      const desired = normPath(step.page);

      if (current !== desired) {
        pendingIndexRef.current = targetIndex;
        navigate(step.page);
      } else {
        applyIndex(targetIndex);
      }
    },
    [location.pathname, navigate, applyIndex]
  );

  const startTour = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsActive(true);
    navigateIfNeeded(0);
  }, [navigateIfNeeded]);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentIndex(0);
    setDemoAction(null);
    pendingIndexRef.current = null;
  }, []);

  const clearDemoAction = useCallback(() => setDemoAction(null), []);

  const next = useCallback(() => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= TOUR_STEPS.length) {
      endTour();
      return;
    }
    navigateIfNeeded(nextIdx);
  }, [currentIndex, endTour, navigateIfNeeded]);

  const prev = useCallback(() => {
    const prevIdx = currentIndex - 1;
    if (prevIdx < 0) return;
    navigateIfNeeded(prevIdx);
  }, [currentIndex, navigateIfNeeded]);

  const goTo = useCallback(
    (index: number) => navigateIfNeeded(index),
    [navigateIfNeeded]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") endTour();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isActive, next, prev, endTour]);

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentStep,
        currentIndex,
        totalSteps: TOUR_STEPS.length,
        startTour,
        endTour,
        next,
        prev,
        goTo,
        demoAction,
        clearDemoAction,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used inside TourProvider");
  return ctx;
}
