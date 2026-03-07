import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X, BookOpen } from "lucide-react";
import { useTour } from "./TourProvider";
import { TOUR_PAGE_GROUPS } from "./tourSteps";
import { cn } from "@/lib/utils";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const TOOLTIP_WIDTH = 340;
const TOOLTIP_GAP = 18;
const BEACON_PAD = 6; // extra space around target for the beacon ring

function getTargetRect(selector: string): Rect | null {
  try {
    const el = document.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return null;
    return { top: r.top, left: r.left, width: r.width, height: r.height };
  } catch {
    return null;
  }
}

function calcTooltipPosition(
  rect: Rect | null,
  placement: string,
  win: { w: number; h: number },
  wide = false
): React.CSSProperties {
  const w = Math.min(TOOLTIP_WIDTH, win.w - 32);

  if (!rect || placement === "center") {
    return {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: w,
    };
  }

  const PAD = BEACON_PAD;
  const TOOLTIP_H_ESTIMATE = 300; // conservative — prevents bottom-clip on longer tooltips

  // Full-width elements (e.g. parameter cards on Backtesting page):
  // pin tooltip below the element, flush to the right edge of the viewport
  // so the beacon ring can still highlight the full card.
  if (wide) {
    const belowTarget = rect.top + rect.height + PAD + TOOLTIP_GAP;
    const safeTop = Math.min(belowTarget, win.h - TOOLTIP_H_ESTIMATE - 80);
    return { position: "fixed", top: Math.max(16, safeTop), right: 16, width: w };
  }

  let top: number;
  let left: number;

  switch (placement) {
    case "bottom":
      top = rect.top + rect.height + PAD + TOOLTIP_GAP;
      left = rect.left + rect.width / 2 - w / 2;
      break;
    case "top":
      top = rect.top - PAD - TOOLTIP_GAP - TOOLTIP_H_ESTIMATE;
      left = rect.left + rect.width / 2 - w / 2;
      break;
    case "right":
      top = rect.top + rect.height / 2 - TOOLTIP_H_ESTIMATE / 2;
      left = rect.left + rect.width + PAD + TOOLTIP_GAP;
      break;
    case "left":
      top = rect.top + rect.height / 2 - TOOLTIP_H_ESTIMATE / 2;
      left = rect.left - w - PAD - TOOLTIP_GAP;
      break;
    default:
      top = rect.top + rect.height + PAD + TOOLTIP_GAP;
      left = rect.left + rect.width / 2 - w / 2;
  }

  left = Math.max(16, Math.min(left, win.w - w - 16));
  top = Math.max(16, Math.min(top, win.h - TOOLTIP_H_ESTIMATE - 16));

  return { position: "fixed", top, left, width: w };
}

// CSS animations injected once into the portal
const TOUR_STYLES = `
  @keyframes tour-ping {
    0%   { transform: scale(1);    opacity: 0.8; }
    80%  { transform: scale(1.35); opacity: 0;   }
    100% { transform: scale(1.35); opacity: 0;   }
  }
  @keyframes tour-pulse-border {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }
  @keyframes tour-bounce-up {
    0%, 100% { transform: translateY(0);  }
    50%       { transform: translateY(-5px); }
  }
  @keyframes tour-bounce-down {
    0%, 100% { transform: translateY(0);  }
    50%       { transform: translateY(5px);  }
  }
  @keyframes tour-bounce-left {
    0%, 100% { transform: translateX(0);  }
    50%       { transform: translateX(-5px); }
  }
  @keyframes tour-bounce-right {
    0%, 100% { transform: translateX(0);  }
    50%       { transform: translateX(5px);  }
  }
  .tour-beacon-ping  { animation: tour-ping          1.6s ease-out    infinite; }
  .tour-beacon-border{ animation: tour-pulse-border  2s   ease-in-out  infinite; }
  .tour-arrow-up     { animation: tour-bounce-up     1s   ease-in-out  infinite; }
  .tour-arrow-down   { animation: tour-bounce-down   1s   ease-in-out  infinite; }
  .tour-arrow-left   { animation: tour-bounce-left   1s   ease-in-out  infinite; }
  .tour-arrow-right  { animation: tour-bounce-right  1s   ease-in-out  infinite; }
`;

export function TourOverlay() {
  const {
    isActive,
    currentStep,
    currentIndex,
    totalSteps,
    next,
    prev,
    endTour,
  } = useTour();

  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [win, setWin] = useState({ w: window.innerWidth, h: window.innerHeight });
  const rafRef = useRef<number>(0);

  const measure = useCallback(() => {
    if (currentStep?.target) {
      setTargetRect(getTargetRect(currentStep.target));
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  // Measure with a slight delay for DOM to settle after step change
  useEffect(() => {
    if (!isActive) return;
    const t = setTimeout(measure, 150);
    return () => clearTimeout(t);
  }, [isActive, measure, currentStep]);

  // Continuously poll element position (handles scrolls / layout shifts)
  useEffect(() => {
    if (!isActive || !currentStep?.target) return;
    const poll = () => {
      measure();
      rafRef.current = requestAnimationFrame(poll);
    };
    rafRef.current = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, currentStep, measure]);

  useEffect(() => {
    const onResize = () => setWin({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!isActive || !currentStep) return null;

  const isPageIntro = currentStep.pageIntro || !currentStep.target || !targetRect;

  // Beacon rect (slightly expanded around target)
  const beaconRect = targetRect
    ? {
        top: targetRect.top - BEACON_PAD,
        left: targetRect.left - BEACON_PAD,
        width: targetRect.width + BEACON_PAD * 2,
        height: targetRect.height + BEACON_PAD * 2,
      }
    : null;

  const wide = !isPageIntro && targetRect ? targetRect.width > win.w * 0.55 : false;

  const tooltipStyle = calcTooltipPosition(
    targetRect,
    isPageIntro ? "center" : currentStep.placement,
    win,
    wide
  );

  // Determine which page group is active
  const activeGroup = TOUR_PAGE_GROUPS.findIndex(
    (g) => currentIndex >= g.range[0] && currentIndex <= g.range[1]
  );

  // Arrow direction — hidden for page-intro steps and wide/corner-positioned tooltips
  const arrowDirection = (() => {
    if (isPageIntro || !targetRect || wide) return null;
    if (currentStep.placement === "bottom") return "up";
    if (currentStep.placement === "top") return "down";
    if (currentStep.placement === "right") return "left";
    if (currentStep.placement === "left") return "right";
    return null;
  })();

  const overlay = (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none" }}
      aria-live="polite"
      aria-label="Platform tour"
    >
      {/* Inject keyframe animations once */}
      <style>{TOUR_STYLES}</style>

      {/*
        Light backdrop — dims background slightly without hiding buttons.
        pointer-events: none so elements underneath remain clickable.
      */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.38)",
          pointerEvents: "none",
        }}
      />

      {/*
        Beacon ring — glowing pulsing border around the pointed-to element.
        Positioned over the target (pointer-events: none so it never blocks clicks).
      */}
      {beaconRect && !isPageIntro && (
        <div
          style={{
            position: "fixed",
            top: beaconRect.top,
            left: beaconRect.left,
            width: beaconRect.width,
            height: beaconRect.height,
            pointerEvents: "none",
            borderRadius: 10,
          }}
        >
          {/* Expanding ping ring */}
          <div
            className="tour-beacon-ping"
            style={{
              position: "absolute",
              inset: -4,
              borderRadius: 14,
              border: "2px solid hsl(174 60% 51% / 0.7)",
            }}
          />
          {/* Solid pulsing border */}
          <div
            className="tour-beacon-border"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 10,
              border: "2px solid hsl(174 60% 51%)",
              boxShadow:
                "0 0 0 3px hsl(174 60% 51% / 0.18), 0 0 16px hsl(174 60% 51% / 0.35)",
            }}
          />
        </div>
      )}

      {/* Tooltip card — pointer-events: auto (this is what user interacts with) */}
      <div
        style={{ ...tooltipStyle, pointerEvents: "auto" }}
        className={cn(
          "tour-tooltip",
          "rounded-2xl border shadow-2xl",
          "bg-[hsl(220_45%_11%)] border-[hsl(174_60%_51%/0.35)]",
          "animate-in fade-in zoom-in-95 duration-200"
        )}
      >
        {/* Arrow indicator on tooltip edge — bounces toward the highlighted element */}
        {arrowDirection && (
          <div
            className={`tour-arrow-${arrowDirection}`}
            style={{
              position: "absolute",
              // Use calc centering so the animation transform doesn't conflict
              ...(arrowDirection === "up"    && { top: -10,    left:  "calc(50% - 8px)" }),
              ...(arrowDirection === "down"  && { bottom: -10, left:  "calc(50% - 8px)" }),
              ...(arrowDirection === "left"  && { left: -10,   top:   "calc(50% - 8px)" }),
              ...(arrowDirection === "right" && { right: -10,  top:   "calc(50% - 8px)" }),
              width: 0,
              height: 0,
              borderStyle: "solid",
              ...(arrowDirection === "up"    && { borderWidth: "0 8px 10px 8px", borderColor: "transparent transparent hsl(174 60% 51% / 0.65) transparent" }),
              ...(arrowDirection === "down"  && { borderWidth: "10px 8px 0 8px", borderColor: "hsl(174 60% 51% / 0.65) transparent transparent transparent" }),
              ...(arrowDirection === "left"  && { borderWidth: "8px 10px 8px 0", borderColor: "transparent hsl(174 60% 51% / 0.65) transparent transparent" }),
              ...(arrowDirection === "right" && { borderWidth: "8px 0 8px 10px", borderColor: "transparent transparent transparent hsl(174 60% 51% / 0.65)" }),
            }}
          />
        )}

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-[hsl(220_40%_18%)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[hsl(174_60%_51%)] to-[hsl(168_76%_42%)] flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-[hsl(220_50%_8%)]" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(174_60%_51%)]">
              Platform Tour
            </span>
          </div>
          <button
            onClick={endTour}
            className="text-[hsl(215_20%_55%)] hover:text-[hsl(210_40%_98%)] transition-colors p-1 rounded-md hover:bg-[hsl(220_40%_18%)]"
            aria-label="Close tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          <h3 className="text-sm font-bold text-[hsl(210_40%_98%)] mb-2 leading-snug">
            {currentStep.title}
          </h3>
          <p className="text-xs text-[hsl(215_20%_72%)] leading-relaxed">
            {currentStep.content}
          </p>
        </div>

        {/* Page group progress */}
        <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
          {TOUR_PAGE_GROUPS.map((g, i) => (
            <span
              key={g.label}
              className={cn(
                "text-[9px] font-semibold px-2 py-0.5 rounded-full transition-all",
                i === activeGroup
                  ? "bg-[hsl(174_60%_51%/0.18)] text-[hsl(174_60%_51%)] ring-1 ring-[hsl(174_60%_51%/0.4)]"
                  : "bg-[hsl(220_40%_18%)] text-[hsl(215_20%_45%)]"
              )}
            >
              {g.label}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[hsl(220_40%_18%)]">
          <span className="text-xs text-[hsl(215_20%_48%)]">
            <span className="text-[hsl(174_60%_51%)] font-semibold">{currentIndex + 1}</span>
            <span className="mx-0.5 text-[hsl(215_20%_38%)]"> / </span>
            {totalSteps}
          </span>

          <div className="flex gap-2">
            <button
              onClick={prev}
              disabled={currentIndex === 0}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                "border border-[hsl(220_40%_22%)] text-[hsl(215_20%_60%)]",
                "hover:bg-[hsl(220_40%_18%)] hover:text-[hsl(210_40%_98%)]",
                "disabled:opacity-25 disabled:cursor-not-allowed"
              )}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <button
              onClick={next}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                "bg-gradient-to-r from-[hsl(174_60%_51%)] to-[hsl(168_76%_42%)]",
                "text-[hsl(220_50%_8%)]",
                "hover:opacity-90 shadow-[0_0_12px_hsl(174_60%_51%/0.35)]"
              )}
            >
              {currentIndex === totalSteps - 1 ? "Finish" : "Next"}
              {currentIndex < totalSteps - 1 && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
