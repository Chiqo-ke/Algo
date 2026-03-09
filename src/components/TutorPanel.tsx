import { useEffect, useRef, useCallback, useState, CSSProperties } from "react";
import { useTutor } from "@/context/TutorContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Lightbulb,
  GraduationCap,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* â”€â”€â”€ CSS keyframes (injected once) â”€â”€â”€ */
const KEYFRAMES = `
  @keyframes tutor-ripple {
    0%   { transform: translate(-50%,-50%) scale(0.3); opacity: 1; }
    100% { transform: translate(-50%,-50%) scale(2.6); opacity: 0; }
  }
  @keyframes tutor-bob {
    0%, 100% { transform: translateY(0px) rotate(-10deg); }
    50%       { transform: translateY(-8px) rotate(-10deg); }
  }
`;

/* â”€â”€â”€ Spotlight overlay â”€â”€â”€ */
function SpotlightOverlay() {
  const { isActive, currentStepData, setHighlightRect, highlightRect } = useTutor();
  const stepTitle = currentStepData?.title ?? "";
  const rafRef = useRef<number | null>(null);

  const findAndTrack = useCallback(() => {
    if (!isActive || !currentStepData?.targetSelector) {
      setHighlightRect(null);
      return;
    }
    const el = document.querySelector(currentStepData.targetSelector) as HTMLElement | null;
    if (el) {
      setHighlightRect(el.getBoundingClientRect());
    } else {
      setHighlightRect(null);
    }
    rafRef.current = requestAnimationFrame(findAndTrack);
  }, [isActive, currentStepData, setHighlightRect]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(findAndTrack);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [findAndTrack]);

  if (!isActive || !highlightRect) return null;

  const PAD = 10;
  const t = highlightRect.top - PAD;
  const l = highlightRect.left - PAD;
  const w = highlightRect.width + PAD * 2;
  const h = highlightRect.height + PAD * 2;

  return (
    <>
      {/* Dimming overlay with cut-out */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 9000,
          background: "rgba(0,0,0,0.52)",
          clipPath: `polygon(
            0% 0%, 100% 0%, 100% 100%, 0% 100%,
            0% ${t}px, ${l}px ${t}px,
            ${l}px ${t + h}px, ${l + w}px ${t + h}px,
            ${l + w}px ${t}px, 0% ${t}px
          )`,
          transition: "clip-path 0.3s ease",
        }}
      />
      {/* Glowing border */}
      <div
        className="fixed pointer-events-none"
        style={{
          zIndex: 9001,
          top: t, left: l, width: w, height: h,
          borderRadius: 10,
          boxShadow: "0 0 0 2px hsl(var(--primary)), 0 0 28px 8px hsl(var(--primary) / 0.3)",
          transition: "all 0.3s ease",
        }}
      />

      {/* Floating label: "Now showing: <title>" */}
      {stepTitle && (
        <div
          className="fixed pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-full shadow-lg"
          style={{
            zIndex: 9002,
            left: Math.max(8, l + w / 2 - 120),
            top: t > 38 ? t - 34 : t + h + 8,
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
            maxWidth: "calc(100vw - 16px)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            transition: "top 0.3s ease, left 0.3s ease",
          }}
        >
          <span style={{ opacity: 0.75, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Now explaining</span>
          <span style={{ opacity: 0.5 }}>&#x2022;</span>
          <span>{stepTitle}</span>
        </div>
      )}
    </>
  );
}

/* â”€â”€â”€ Ripple + bobbing cursor pointer â”€â”€â”€ */
function TutorPointer() {
  const { isActive, highlightRect, currentStepData } = useTutor();

  if (!isActive || !highlightRect || !currentStepData?.targetSelector) return null;

  const cx = highlightRect.left + highlightRect.width / 2;
  const cy = highlightRect.top + highlightRect.height / 2;

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* Three staggered ripple rings */}
      {[0, 0.6, 1.2].map((delay, i) => (
        <div
          key={i}
          className="fixed pointer-events-none rounded-full border-2 border-primary"
          style={{
            zIndex: 9303,
            width: 46,
            height: 46,
            left: cx,
            top: cy,
            animation: `tutor-ripple 1.9s ease-out ${delay}s infinite`,
          }}
        />
      ))}

      {/* Solid centre dot */}
      <div
        className="fixed pointer-events-none rounded-full bg-primary"
        style={{
          zIndex: 9304,
          width: 10,
          height: 10,
          left: cx - 5,
          top: cy - 5,
          boxShadow: "0 0 12px 4px hsl(var(--primary) / 0.55)",
        }}
      />

      {/* Bobbing hand-cursor SVG placed at top-right of element */}
      <div
        className="fixed pointer-events-none"
        style={{
          zIndex: 9305,
          left: cx + Math.min(highlightRect.width * 0.3, 40),
          top: cy - Math.min(highlightRect.height * 0.4, 30),
          animation: "tutor-bob 1.4s ease-in-out infinite",
        }}
      >
        {/* Hand cursor SVG */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 11V5a1 1 0 0 1 2 0v4m0-4V3a1 1 0 0 1 2 0v4m0-3a1 1 0 0 1 2 0v5m-8 5l-1-2a1 1 0 0 1 1-1.5l3 1V5"
            stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M7 16l-1-2a1 1 0 0 1 1-1.5l1.5.8V5a1 1 0 0 1 2 0v6m0 0V5a1 1 0 0 1 2 0v6m0 0V6a1 1 0 0 1 2 0v6l.5 2.5A4 4 0 0 1 11 21H9a4 4 0 0 1-4-4v-.5"
            fill="hsl(var(--primary))"
            stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
}

/* â”€â”€â”€ Smart position calculator â”€â”€â”€ */
const PANEL_W = 380;
const PANEL_H = 480;
const PANEL_GAP = 16;
const VP_PAD = 14;

type Placement = "right" | "left" | "top" | "bottom" | "center";

interface PositionResult {
  style: CSSProperties;
  placement: Placement;
}

function calcPosition(rect: DOMRect | null, preferred?: string): PositionResult {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // On small screens, keep the panel compact and move it to top or bottom
  // so the highlighted region remains visible.
  if (vw < 768) {
    const sidePad = 8;
    const topPad = 8;
    const navOffset = 64;
    const panelBottom = navOffset + 8;

    if (rect) {
      const spaceAbove = rect.top - topPad;
      const spaceBelow = vh - rect.bottom - panelBottom;
      if (spaceAbove >= spaceBelow && spaceAbove > 120) {
        return {
          style: {
            position: "fixed",
            top: topPad,
            left: sidePad,
            right: sidePad,
            width: "auto",
          },
          placement: "center",
        };
      }
    }

    return {
      style: { position: "fixed", bottom: panelBottom, left: sidePad, right: sidePad, width: "auto" },
      placement: "center",
    };
  }

  if (!rect || preferred === "center") {
    return {
      style: { position: "fixed", top: Math.max(VP_PAD, (vh - PANEL_H) / 2), left: Math.max(VP_PAD, (vw - PANEL_W) / 2), width: Math.min(PANEL_W, vw - VP_PAD * 2) },
      placement: "center",
    };
  }

  const { top, left, right, bottom, width, height } = rect;
  const clampT = (v: number) => Math.min(Math.max(VP_PAD, v), vh - PANEL_H - VP_PAD);
  const clampL = (v: number) => Math.min(Math.max(VP_PAD, v), vw - PANEL_W - VP_PAD);
  const vC = clampT(top + height / 2 - PANEL_H / 2);
  const hC = clampL(left + width / 2 - PANEL_W / 2);

  const spR = vw - right - PANEL_GAP;
  const spL = left - PANEL_GAP;
  const spD = vh - bottom - PANEL_GAP;
  const spU = top - PANEL_GAP;

  const fits = { right: spR >= PANEL_W, left: spL >= PANEL_W, bottom: spD >= 260, top: spU >= 260 };

  const R = (): PositionResult => ({ style: { position: "fixed", top: vC, left: right + PANEL_GAP, width: Math.min(PANEL_W, spR - 4) }, placement: "right" });
  const L = (): PositionResult => ({ style: { position: "fixed", top: vC, left: Math.max(VP_PAD, left - PANEL_W - PANEL_GAP), width: Math.min(PANEL_W, spL - 4) }, placement: "left" });
  const D = (): PositionResult => ({ style: { position: "fixed", top: bottom + PANEL_GAP, left: hC, width: Math.min(PANEL_W, vw - VP_PAD * 2) }, placement: "bottom" });
  const U = (): PositionResult => ({ style: { position: "fixed", top: Math.max(VP_PAD, top - PANEL_H - PANEL_GAP), left: hC, width: Math.min(PANEL_W, vw - VP_PAD * 2) }, placement: "top" });

  if (preferred === "right"  && fits.right)  return R();
  if (preferred === "left"   && fits.left)   return L();
  if (preferred === "bottom" && fits.bottom) return D();
  if (preferred === "top"    && fits.top)    return U();
  if (fits.right)  return R();
  if (fits.left)   return L();
  if (fits.bottom) return D();
  if (fits.top)    return U();

  return { style: { position: "fixed", bottom: VP_PAD, right: VP_PAD, width: Math.min(PANEL_W, vw - VP_PAD * 2) }, placement: "center" };
}

/* â”€â”€â”€ Callout tail pointing toward the highlighted element â”€â”€â”€ */
function CalloutTail({ placement }: { placement: Placement }) {
  if (placement === "center") return null;

  const base: CSSProperties = {
    position: "absolute",
    width: 12, height: 12,
    background: "hsl(var(--card))",
    transform: "rotate(45deg)",
    zIndex: 0,
  };

  const styles: Record<Exclude<Placement, "center">, CSSProperties> = {
    right:  { ...base, left: -6,  top: "50%",  marginTop: -6,   borderLeft: "1px solid hsl(var(--border))", borderBottom: "1px solid hsl(var(--border))" },
    left:   { ...base, right: -6, top: "50%",  marginTop: -6,   borderRight: "1px solid hsl(var(--border))", borderTop: "1px solid hsl(var(--border))" },
    bottom: { ...base, top: -6,   left: "50%", marginLeft: -6,  borderLeft: "1px solid hsl(var(--border))", borderTop: "1px solid hsl(var(--border))" },
    top:    { ...base, bottom: -6, left: "50%", marginLeft: -6, borderRight: "1px solid hsl(var(--border))", borderBottom: "1px solid hsl(var(--border))" },
  };

  return <div style={styles[placement]} />;
}

/* â”€â”€â”€ Active Tour Step Panel â”€â”€â”€ */
function TourStepPanel() {
  const { isActive, activeTour, currentStep, totalSteps, currentStepData, endTour, nextStep, prevStep, simulatingText, isActing, highlightRect } = useTutor();
  const [result, setResult] = useState<PositionResult>({ style: { position: "fixed", bottom: VP_PAD, right: VP_PAD }, placement: "center" });
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const upd = () => {
      setIsMobile(window.innerWidth < 768);
      setResult(calcPosition(highlightRect, currentStepData?.position));
    };
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, [highlightRect, currentStepData]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isActive) return;
      if (e.key === "ArrowRight" || e.key === "Enter") nextStep();
      if (e.key === "ArrowLeft") prevStep();
      if (e.key === "Escape") endTour();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isActive, nextStep, prevStep, endTour]);

  if (!isActive || !currentStepData || !activeTour) return null;

  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const { style, placement } = result;

  const fmt = (text: string) =>
    text.split("\n").map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
      return (
        <p key={i} className={cn(isMobile ? "text-xs" : "text-sm", "leading-relaxed mb-0.5")}>
          {parts.map((p, j) => {
            if (p.startsWith("**") && p.endsWith("**")) return <strong key={j} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>;
            if (p.startsWith("*") && p.endsWith("*")) return <em key={j} className="italic text-primary/90">{p.slice(1, -1)}</em>;
            return <span key={j}>{p}</span>;
          })}
        </p>
      );
    });

  return (
    <div
      style={{
        ...style,
        zIndex: 9200,
        maxWidth: isMobile ? "100%" : (style.width ?? PANEL_W),
        maxHeight: isMobile ? undefined : "calc(100vh - 80px)",
        display: "flex",
        flexDirection: "column",
        transition: "top 0.22s ease, left 0.22s ease, bottom 0.22s ease, right 0.22s ease",
      }}
    >
      {/* Callout tail – desktop only */}
      {!isMobile && <CalloutTail placement={placement} />}

      {/* Card – z-index:1 so it paints over the inner half of the tail */}
      <div
        className={cn(
          "relative bg-card border border-border shadow-2xl flex flex-col",
          isMobile ? "rounded-t-2xl border-b-0" : "rounded-2xl"
        )}
        style={{ zIndex: 1, overflow: "hidden", maxHeight: isMobile ? "30vh" : "calc(100vh - 80px)" }}
      >
        {/* Drag handle – mobile only */}
        {isMobile && (
          <div className="flex-shrink-0 flex justify-center pt-2.5">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
        )}

        {/* Header */}
        <div className={cn("flex-shrink-0 bg-gradient-to-r from-primary/15 to-transparent border-b border-border flex items-center gap-2", isMobile ? "px-4 py-2" : "px-4 py-3")}>
          <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-xs font-medium text-muted-foreground flex-1 truncate">{activeTour.name}</span>
          <span className="text-xs text-muted-foreground flex-shrink-0">{currentStep + 1} / {totalSteps}</span>
          <Button variant="ghost" size="icon" onClick={endTour} className="rounded-full h-7 w-7 flex-shrink-0">
            <X className="w-3 h-3" />
          </Button>
        </div>

        <Progress value={progress} className="flex-shrink-0 h-1 rounded-none" />

        <ScrollArea className="flex-1 min-h-0">
          <div className={cn(isMobile ? "p-3 space-y-2" : "p-4 space-y-3")}>
            <h3 className={cn("font-bold text-foreground leading-snug", isMobile ? "text-sm" : "text-base")}>{currentStepData.title}</h3>
            <div className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>{fmt(currentStepData.description)}</div>

            {(simulatingText !== null || isActing) && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs font-medium text-primary mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
                  Tutor is typing into the system:
                </p>
                <p className="text-xs font-mono text-foreground leading-relaxed break-all">
                  {simulatingText}
                  {isActing && <span className="inline-block w-0.5 h-3.5 bg-primary animate-pulse ml-0.5 align-middle" />}
                </p>
              </div>
            )}

            {!isMobile && currentStepData.tips && currentStepData.tips.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> Tips
                </p>
                <ul className="space-y-1">
                  {currentStepData.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                      <span className="flex-shrink-0 mt-0.5">&#x2022;</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Nav footer */}
        <div className={cn("flex-shrink-0 border-t border-border bg-muted/30 flex items-center justify-between gap-2", isMobile ? "px-3 py-3" : "px-4 py-3")}>
          <Button
            variant="outline"
            size="sm"
            onClick={prevStep}
            disabled={isFirst || isActing}
            className={cn("gap-1 text-xs", isMobile ? "h-10 flex-1" : "h-8")}
          >
            <ChevronLeft className="w-3 h-3" /> Back
          </Button>

          {isMobile ? (
            <span className="text-xs text-muted-foreground flex-shrink-0 px-2 tabular-nums">
              {currentStep + 1} / {totalSteps}
            </span>
          ) : (
            <div className="flex items-center gap-1 overflow-hidden">
              {Array.from({ length: Math.min(totalSteps, 12) }).map((_, i) => (
                <div key={i} className={cn("h-1.5 rounded-full transition-all duration-200 flex-shrink-0", i === currentStep ? "bg-primary w-4" : "bg-border w-1.5")} />
              ))}
              {totalSteps > 12 && <span className="text-xs text-muted-foreground ml-1">+{totalSteps - 12}</span>}
            </div>
          )}

          <Button
            size="sm"
            onClick={nextStep}
            disabled={isActing}
            className={cn("gap-1 text-xs bg-gradient-to-r from-primary to-primary/80", isMobile ? "h-10 flex-1" : "h-8")}
          >
            {isActing
              ? <><Loader2 className="w-3 h-3 animate-spin" /> Acting&hellip;</>
              : isLast
                ? <><CheckCircle2 className="w-3 h-3" /> Finish</>
                : <>Next <ChevronRight className="w-3 h-3" /></>}
          </Button>
        </div>

        {!isMobile && (
          <div className="flex-shrink-0 px-4 pb-2">
            <p className="text-xs text-muted-foreground/50 text-center">&#x2190; &#x2192; arrow keys &bull; Esc to exit</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* â”€â”€â”€ Main export â”€â”€â”€ */
export function TutorPanel() {
  return (
    <>
      <SpotlightOverlay />
      <TutorPointer />
      <TourStepPanel />
    </>
  );
}