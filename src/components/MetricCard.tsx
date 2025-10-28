import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconBg?: string;
}

export const MetricCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconBg = "bg-gradient-primary",
}: MetricCardProps) => {
  return (
    <Card className="bg-card border-border shadow-card hover:shadow-glow transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-card-foreground">{value}</p>
            {change && (
              <div
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                  changeType === "positive" && "bg-success/10 text-success",
                  changeType === "negative" && "bg-destructive/10 text-destructive",
                  changeType === "neutral" && "bg-muted text-muted-foreground"
                )}
              >
                {change}
              </div>
            )}
          </div>
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconBg)}>
            <Icon className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
