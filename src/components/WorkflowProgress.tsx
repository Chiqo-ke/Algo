import { cn } from "@/lib/utils";
import { CheckCircle, Circle, AlertCircle, Loader2, SkipForward } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "skipped";
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  substeps: string[];
  current_substep: string | null;
  progress_percentage: number;
}

interface WorkflowState {
  workflow_name: string;
  started_at: string;
  completed_at: string | null;
  steps: WorkflowStep[];
  current_step_index: number;
  progress_summary: {
    workflow_name: string;
    total_steps: number;
    completed_steps: number;
    failed_steps: number;
    in_progress_steps: number;
    overall_percentage: number;
    current_step_index: number;
    is_complete: boolean;
    duration_seconds: number;
  };
}

interface WorkflowProgressProps {
  workflow: WorkflowState | null;
  isLoading?: boolean;
}

export function WorkflowProgress({ workflow, isLoading = false }: WorkflowProgressProps) {
  if (!workflow && !isLoading) return null;

  // Show skeleton loader while waiting for workflow data
  if (isLoading && !workflow) {
    return (
      <Card className="bg-card border-border animate-pulse">
        <CardContent className="pt-6">
          <div className="h-4 bg-secondary rounded w-3/4 mb-4"></div>
          <div className="h-2 bg-secondary rounded w-full mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-secondary rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!workflow) return null;

  const summary = workflow.progress_summary;
  const currentStep = workflow.steps[workflow.current_step_index];

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "in_progress":
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case "skipped":
        return <SkipForward className="w-5 h-5 text-muted-foreground" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-success bg-success/10";
      case "in_progress":
        return "border-primary bg-primary/10 shadow-glow";
      case "failed":
        return "border-destructive bg-destructive/10";
      case "skipped":
        return "border-muted bg-muted/50";
      default:
        return "border-border bg-card";
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  return (
    <Card className="bg-gradient-to-br from-card to-secondary/20 border-border">
      <CardContent className="pt-6 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              {summary.is_complete ? (
                <CheckCircle className="w-5 h-5 text-success" />
              ) : (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              )}
              {workflow.workflow_name}
            </h3>
            <span className="text-sm text-muted-foreground">
              {formatDuration(summary.duration_seconds)}
            </span>
          </div>
          
          {/* Overall Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {summary.completed_steps} of {summary.total_steps} steps completed
              </span>
              <span className="font-semibold">{summary.overall_percentage}%</span>
            </div>
            <Progress 
              value={summary.overall_percentage} 
              className="h-2"
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-2">
          {workflow.steps.map((step, index) => {
            const isActive = index === workflow.current_step_index;
            
            return (
              <div
                key={step.id}
                className={cn(
                  "relative rounded-lg border-2 transition-all",
                  getStepColor(step.status),
                  isActive && "ring-2 ring-primary/50"
                )}
              >
                <div className="p-3">
                  {/* Step Header */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStepIcon(step.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {step.title}
                        </h4>
                        
                        {step.status === "in_progress" && (
                          <span className="text-xs font-semibold text-primary whitespace-nowrap">
                            {step.progress_percentage}%
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {step.description}
                      </p>
                      
                      {/* Current Substep */}
                      {step.status === "in_progress" && step.current_substep && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                          <p className="text-xs text-primary font-medium">
                            {step.current_substep}
                          </p>
                        </div>
                      )}
                      
                      {/* Progress Bar for Active Step */}
                      {step.status === "in_progress" && (
                        <Progress 
                          value={step.progress_percentage} 
                          className="h-1.5 mt-2"
                        />
                      )}
                      
                      {/* Error Message */}
                      {step.status === "failed" && step.error_message && (
                        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive">
                          <p className="font-medium">Error:</p>
                          <p className="mt-0.5 opacity-90">{step.error_message}</p>
                        </div>
                      )}
                      
                      {/* Skip Reason */}
                      {step.status === "skipped" && step.error_message && (
                        <p className="mt-1 text-xs text-muted-foreground italic">
                          Skipped: {step.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connector Line to Next Step */}
                {index < workflow.steps.length - 1 && (
                  <div className="absolute left-5 -bottom-2 w-0.5 h-2 bg-border"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        {summary.is_complete && (
          <div className="pt-4 border-t border-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-success">{summary.completed_steps}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              {summary.failed_steps > 0 && (
                <div>
                  <p className="text-2xl font-bold text-destructive">{summary.failed_steps}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              )}
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {formatDuration(summary.duration_seconds)}
                </p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
