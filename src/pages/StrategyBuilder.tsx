import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, TrendingUp, BarChart, Zap, Loader2 } from "lucide-react";
import { strategyService } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { pollJob, type JobProgress } from "@/lib/jobPoller";

const GENERATE_URL =
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api') +
  '/strategies/strategies/generate_with_ai/';

export default function StrategyBuilder() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState("");
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const handleGenerateStrategy = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing prompt",
        description: "Please describe your strategy first",
        variant: "destructive",
      });
      return;
    }

    // Cancel any previous in-flight poll
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsGenerating(true);
    setGeneratingStep("Queuing strategy generation…");

    try {
      // 1. Enqueue the task — returns within milliseconds
      const res = await fetch(GENERATE_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: prompt }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `Request failed (${res.status})`);
      }

      const { job_id } = await res.json();

      // 2. Poll until done, updating the step label in real time
      await pollJob(
        job_id,
        (progress: JobProgress) => {
          setGeneratingStep(progress.step ?? 'Processing…');
        },
        abortRef.current.signal,
      );

      toast({
        title: "Strategy generated!",
        description: "Your strategy has been created and saved.",
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Polling cancelled') return;
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGeneratingStep("");
    }
  };

  const handleLoadTemplate = async () => {
    setLoadingTemplates(true);
    
    try {
      const { data, error } = await strategyService.getTemplates();
      
      if (error) {
        throw new Error(error);
      }
      
      if (data && data.length > 0) {
        toast({
          title: "Templates loaded",
          description: `Found ${data.length} strategy templates`,
        });
        // TODO: Show template selection dialog
      } else {
        toast({
          title: "No templates found",
          description: "Create your first strategy template",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to load templates",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">AI Strategy Builder</h1>
          <p className="text-muted-foreground">
            Describe your trading strategy in plain English and let AI build it for you.
          </p>
        </div>

        {/* Prompt Input */}
        <Card className="bg-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Describe Your Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Create a momentum strategy that buys when RSI crosses above 30 and sells when it crosses below 70, with a 2% stop loss..."
              className="min-h-32 resize-none bg-background border-border"
            />
            <div className="flex gap-3">
              <Button 
                className="bg-gradient-primary shadow-glow"
                onClick={handleGenerateStrategy}
                disabled={isGenerating || !prompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {generatingStep || 'Generating...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Strategy
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={handleLoadTemplate}
                disabled={loadingTemplates}
              >
                {loadingTemplates ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load Template"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-card-foreground text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                Expected Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Win Rate</span>
                  <span className="font-semibold text-success">68.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Avg Return</span>
                  <span className="font-semibold text-foreground">+3.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Max Drawdown</span>
                  <span className="font-semibold text-destructive">-12.1%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-card-foreground text-base flex items-center gap-2">
                <BarChart className="w-4 h-4 text-primary" />
                Key Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["RSI", "MACD", "SMA", "Volume"].map((indicator) => (
                  <span
                    key={indicator}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                  >
                    {indicator}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-card-foreground text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning" />
                Risk Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Stop Loss</span>
                  <span className="font-semibold text-foreground">2.0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Take Profit</span>
                  <span className="font-semibold text-foreground">5.0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Position Size</span>
                  <span className="font-semibold text-foreground">5% equity</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Code Preview */}
        <Card className="bg-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Strategy Code Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="p-4 rounded-lg bg-background text-foreground text-sm font-mono overflow-x-auto border border-border">
{`// AI-Generated Trading Strategy
function momentumStrategy(data) {
  const rsi = calculateRSI(data, 14);
  
  if (rsi > 30 && !position) {
    // Buy signal
    enterPosition('long', data.close);
  }
  
  if (rsi < 70 && position) {
    // Sell signal
    exitPosition(data.close);
  }
}`}
            </pre>
            <div className="mt-4 flex gap-3">
              <Button variant="outline">Edit Code</Button>
              <Button>Run Backtest</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
