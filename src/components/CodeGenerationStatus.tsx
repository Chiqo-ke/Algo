import { Loader2, CheckCircle, AlertCircle, Code, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";
import type { CodeGenerationProgress } from "@/lib/types";

interface CodeGenerationStatusProps {
  progress: CodeGenerationProgress;
  className?: string;
}

export function CodeGenerationStatus({ progress, className }: CodeGenerationStatusProps) {
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'generating':
        return <Code className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'validating':
        return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'fixing_errors':
        return <Wrench className="w-5 h-5 text-orange-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'generating':
        return 'text-blue-500';
      case 'validating':
        return 'text-yellow-500';
      case 'fixing_errors':
        return 'text-orange-500';
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'generating':
        return 'Generating Code';
      case 'validating':
        return 'Validating Code';
      case 'fixing_errors':
        return 'Fixing Errors';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
    }
  };

  return (
    <Card className={cn("bg-card border-border shadow-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={getStatusColor()}>{getStatusText()}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress.progress_percentage}%</span>
          </div>
          <Progress value={progress.progress_percentage} className="h-2" />
        </div>

        {/* Current step */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Current Step:</p>
          <p className="text-sm text-muted-foreground">{progress.current_step}</p>
        </div>

        {/* Fix attempts counter */}
        {progress.status === 'fixing_errors' && progress.current_attempt !== undefined && progress.max_attempts !== undefined && (
          <div className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <span className="text-sm font-medium text-orange-500">
              Fixing Errors
            </span>
            <span className="text-sm font-mono text-orange-500">
              Attempt {progress.current_attempt} / {progress.max_attempts}
            </span>
          </div>
        )}

        {/* Error message */}
        {progress.error_message && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm font-medium text-destructive mb-1">Error:</p>
            <p className="text-sm text-destructive/80">{progress.error_message}</p>
          </div>
        )}

        {/* Success message */}
        {progress.status === 'completed' && progress.file_name && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm font-medium text-green-500 mb-1">✓ Code Generated Successfully</p>
            <p className="text-xs font-mono text-muted-foreground">{progress.file_name}</p>
          </div>
        )}

        {/* Fix history (if any attempts were made) */}
        {progress.attempts && progress.attempts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Fix History:</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {progress.attempts.map((attempt, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "flex items-center gap-2 text-xs p-2 rounded border",
                    attempt.success 
                      ? "bg-green-500/5 border-green-500/20 text-green-500" 
                      : "bg-red-500/5 border-red-500/20 text-red-500"
                  )}
                >
                  {attempt.success ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  <span>
                    Attempt {attempt.attempt_number}: {attempt.error_type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
