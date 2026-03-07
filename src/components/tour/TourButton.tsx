import { BookOpen } from "lucide-react";
import { useTour } from "./TourProvider";
import { cn } from "@/lib/utils";

interface TourButtonProps {
  className?: string;
}

export function TourButton({ className }: TourButtonProps) {
  const { startTour, isActive } = useTour();

  return (
    <button
      onClick={startTour}
      disabled={isActive}
      aria-label="Start platform tour"
      title="Take the platform tour"
      className={cn(
        // Base layout
        "flex items-center gap-1.5 rounded-lg font-semibold transition-all",
        // Mobile: icon-only compact pill
        "px-2 py-1.5 text-xs",
        // Colours — teal accent matching app theme
        "border border-[hsl(174_60%_51%/0.4)] text-[hsl(174_60%_51%)]",
        "bg-[hsl(174_60%_51%/0.08)] hover:bg-[hsl(174_60%_51%/0.18)]",
        "hover:border-[hsl(174_60%_51%/0.7)]",
        "hover:shadow-[0_0_14px_hsl(174_60%_51%/0.3)]",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        className
      )}
    >
      <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
      {/* Label hidden on very small screens */}
      <span className="hidden xs:inline sm:inline">Tour</span>
    </button>
  );
}
