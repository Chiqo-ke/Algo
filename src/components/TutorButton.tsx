import { useTutor } from "@/context/TutorContext";
import { Button } from "@/components/ui/button";
import { GraduationCap, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Inline header button — place directly inside the dashboard header. */
export function TutorButton() {
  const { isActive, startTour, endTour } = useTutor();

  const handleClick = () => {
    if (isActive) { endTour(); return; }
    startTour('full-system');
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            variant="outline"
            size="sm"
            className={cn(
              "relative gap-1.5 h-8 px-3 text-xs transition-all",
              isActive
                ? "border-destructive/60 text-destructive hover:bg-destructive/10"
                : "border-primary/50 text-primary hover:bg-primary/10 hover:border-primary"
            )}
            aria-label="Open guided tour"
          >
            {isActive
              ? <X className="w-3.5 h-3.5" />
              : <GraduationCap className="w-3.5 h-3.5" />}
            <span>{isActive ? "Exit Tour" : "Take a Tour"}</span>

            {/* Notification dot */}
            {!isActive && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs max-w-48 text-center">
          {isActive
            ? "Exit the current guided tour"
            : "Learn AlgoAI with interactive step-by-step walkthroughs"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
