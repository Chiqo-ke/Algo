import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, TrendingUp, Zap, Sparkles } from "lucide-react";
import { symbolService, type Symbol } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { BACKTEST_TEMPLATES, type BacktestTemplate } from "@/lib/demoTemplates";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";

interface BacktestConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategyId: number;
  strategyName: string;
  onConfirm: (config: BacktestConfig) => void;
}

export interface BacktestConfig {
  symbol: string;
  period: string;
  interval: string;
  initialCapital?: number;
  commission?: number;
}

const PERIOD_OPTIONS = [
  { value: "1mo", label: "1 Month" },
  { value: "3mo", label: "3 Months" },
  { value: "6mo", label: "6 Months" },
  { value: "1y", label: "1 Year" },
  { value: "2y", label: "2 Years" },
  { value: "5y", label: "5 Years" },
  { value: "max", label: "Max Available" },
];

const INTERVAL_OPTIONS = [
  { value: "1m", label: "1 Minute" },
  { value: "5m", label: "5 Minutes" },
  { value: "15m", label: "15 Minutes" },
  { value: "30m", label: "30 Minutes" },
  { value: "1h", label: "1 Hour" },
  { value: "1d", label: "1 Day" },
  { value: "1wk", label: "1 Week" },
];

export function BacktestConfigDialog({
  open,
  onOpenChange,
  strategyId,
  strategyName,
  onConfirm,
}: BacktestConfigDialogProps) {
  const { toast } = useToast();
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [loadingSymbols, setLoadingSymbols] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [period, setPeriod] = useState<string>("1y");
  const [interval, setInterval] = useState<string>("1d");
  const [initialCapital, setInitialCapital] = useState<string>("10000");
  const [commission, setCommission] = useState<string>("0.001");
  const [customSymbol, setCustomSymbol] = useState<string>("");
  const [useCustomSymbol, setUseCustomSymbol] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BacktestTemplate | null>(null);

  // Apply template configuration
  const applyTemplate = (template: BacktestTemplate) => {
    setSelectedTemplate(template);
    setSelectedSymbol(template.symbol);
    setInterval(template.timeframe);
    setInitialCapital(template.initial_cash.toString());
    
    // Calculate period from dates
    const start = new Date(template.start_date);
    const end = new Date(template.end_date);
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    if (diffMonths <= 1) setPeriod("1mo");
    else if (diffMonths <= 3) setPeriod("3mo");
    else if (diffMonths <= 6) setPeriod("6mo");
    else if (diffMonths <= 12) setPeriod("1y");
    else if (diffMonths <= 24) setPeriod("2y");
    else setPeriod("5y");
    
    setShowTemplates(false);
    
    toast({
      title: "Template Applied",
      description: `Loaded "${template.name}" configuration`,
    });
  };

  // Fetch symbols when dialog opens
  useEffect(() => {
    if (open) {
      fetchSymbols();
    }
  }, [open]);

  const fetchSymbols = async () => {
    setLoadingSymbols(true);
    const { data, error } = await symbolService.getAll();

    if (error) {
      console.error("❌ Error loading symbols:", error);
      toast({
        title: "Error loading symbols",
        description: "Using default symbols",
        variant: "destructive",
      });
      // Set some default symbols
      setSymbols([
        { id: 1, symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ" },
        { id: 2, symbol: "MSFT", name: "Microsoft Corp.", exchange: "NASDAQ" },
        { id: 3, symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ" },
        { id: 4, symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ" },
        { id: 5, symbol: "SPY", name: "S&P 500 ETF", exchange: "NYSE" },
      ] as Symbol[]);
    } else if (data) {
      const symbolsList = (data as any).results || data;
      setSymbols(Array.isArray(symbolsList) ? symbolsList : []);
    }
    setLoadingSymbols(false);
  };

  const handleConfirm = () => {
    const finalSymbol = useCustomSymbol ? customSymbol.toUpperCase().trim() : selectedSymbol;

    if (!finalSymbol) {
      toast({
        title: "Symbol Required",
        description: "Please select or enter a symbol",
        variant: "destructive",
      });
      return;
    }

    if (!period) {
      toast({
        title: "Period Required",
        description: "Please select a time period",
        variant: "destructive",
      });
      return;
    }

    const config: BacktestConfig = {
      symbol: finalSymbol,
      period,
      interval,
      initialCapital: parseFloat(initialCapital) || 10000,
      commission: parseFloat(commission) || 0.001,
    };

    onConfirm(config);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Configure Backtest - {strategyName}
          </DialogTitle>
          <DialogDescription>
            Set up backtest parameters or use a demo template for quick testing
          </DialogDescription>
        </DialogHeader>

        {showTemplates ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Backtest Templates</h4>
              <Button variant="ghost" size="sm" onClick={() => setShowTemplates(false)}>
                Back to Manual Config
              </Button>
            </div>
            <ScrollArea className="h-96">
              <div className="space-y-2 pr-4">
                {BACKTEST_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => applyTemplate(template)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h5 className="text-sm font-semibold">{template.name}</h5>
                      <Badge variant="outline">{template.symbol}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Period:</span>{" "}
                        <span className="font-medium">{template.start_date} to {template.end_date}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Timeframe:</span>{" "}
                        <span className="font-medium">{template.timeframe}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Capital:</span>{" "}
                        <span className="font-medium">${template.initial_cash.toLocaleString()}</span>
                      </div>
                    </div>
                    {template.expectedMetrics && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Expected Metrics:</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {template.expectedMetrics.sharpe && (
                            <div>
                              <span className="text-muted-foreground">Sharpe:</span>{" "}
                              <span className="font-medium">{template.expectedMetrics.sharpe}</span>
                            </div>
                          )}
                          {template.expectedMetrics.maxDrawdown && (
                            <div>
                              <span className="text-muted-foreground">Max DD:</span>{" "}
                              <span className="font-medium">{template.expectedMetrics.maxDrawdown}</span>
                            </div>
                          )}
                          {template.expectedMetrics.winRate && (
                            <div>
                              <span className="text-muted-foreground">Win Rate:</span>{" "}
                              <span className="font-medium">{template.expectedMetrics.winRate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <>
            {/* Template Indicator */}
            {selectedTemplate && (
              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-xs font-medium">Template: {selectedTemplate.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(null)}>
                  Clear
                </Button>
              </div>
            )}

            {/* Quick Template Button */}
            <Button
              variant="outline"
              onClick={() => setShowTemplates(true)}
              className="w-full"
            >
              <Zap className="w-4 h-4 mr-2" />
              Use Demo Template
            </Button>

            <div className="space-y-4 py-4">
              {/* Symbol Selection */}
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol / Ticker</Label>
            {loadingSymbols ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading symbols...
              </div>
            ) : (
              <div className="space-y-2">
                <Select
                  value={useCustomSymbol ? "custom" : selectedSymbol}
                  onValueChange={(value) => {
                    if (value === "custom") {
                      setUseCustomSymbol(true);
                      setSelectedSymbol("");
                    } else {
                      setUseCustomSymbol(false);
                      setSelectedSymbol(value);
                    }
                  }}
                >
                  <SelectTrigger id="symbol">
                    <SelectValue placeholder="Select a symbol" />
                  </SelectTrigger>
                  <SelectContent>
                    {symbols.map((symbol) => (
                      <SelectItem key={symbol.id} value={symbol.symbol}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{symbol.symbol}</span>
                          <span className="text-muted-foreground text-xs">
                            {symbol.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">
                      <span className="text-primary font-semibold">
                        ✏️ Enter custom symbol...
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {useCustomSymbol && (
                  <Input
                    placeholder="Enter symbol (e.g., AAPL, BTC-USD)"
                    value={customSymbol}
                    onChange={(e) => setCustomSymbol(e.target.value)}
                    className="uppercase"
                  />
                )}
              </div>
            </div>

            {/* Period Selection */}
            <div className="space-y-2">
              <Label htmlFor="period">Time Period</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger id="period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

            {/* Interval Selection */}
            <div className="space-y-2">
              <Label htmlFor="interval">Data Interval</Label>
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger id="interval">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                {INTERVAL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

            {/* Advanced Parameters */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="capital">Initial Capital ($)</Label>
              <Input
                id="capital"
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(e.target.value)}
                placeholder="10000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission">Commission (%)</Label>
              <Input
                id="commission"
                type="number"
                step="0.001"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                placeholder="0.001"
              />
            </div>
          </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-gradient-primary">
            <TrendingUp className="w-4 h-4 mr-2" />
            Run Backtest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
