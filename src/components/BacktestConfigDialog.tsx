import { useState, useEffect } from "react";
import { format } from "date-fns";
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
  start_date: string;
  end_date: string;
  exit_mode: 'bot' | 'percentage' | 'fixed_pips';
  risk_pct?: number;
  sl_pips?: number;
  tp_pips?: number;
}

// Removed period and interval options - now using date pickers

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
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().setFullYear(new Date().getFullYear() - 1)));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [customSymbol, setCustomSymbol] = useState<string>("");
  const [useCustomSymbol, setUseCustomSymbol] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BacktestTemplate | null>(null);
  const [exitMode, setExitMode] = useState<'bot' | 'percentage' | 'fixed_pips'>('bot');
  const [riskPct, setRiskPct] = useState<string>('2');
  const [slPips, setSlPips] = useState<string>('');
  const [tpPips, setTpPips] = useState<string>('');

  // Apply template configuration
  const applyTemplate = (template: BacktestTemplate) => {
    setSelectedTemplate(template);
    setSelectedSymbol(template.symbol);
    setStartDate(new Date(template.start_date));
    setEndDate(new Date(template.end_date));
    
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

    if (!startDate || !endDate) {
      toast({
        title: "Dates Required",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (startDate >= endDate) {
      toast({
        title: "Invalid Date Range",
        description: "Start date must be before end date",
        variant: "destructive",
      });
      return;
    }

    if (exitMode === 'fixed_pips' && !slPips && !tpPips) {
      toast({
        title: "Pips Required",
        description: "Enter at least SL pips or TP pips for Fixed Pips mode",
        variant: "destructive",
      });
      return;
    }

    const config: BacktestConfig = {
      symbol: finalSymbol,
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
      exit_mode: exitMode,
      ...(exitMode === 'percentage' && { risk_pct: parseFloat(riskPct) || 2.0 }),
      ...(exitMode === 'fixed_pips' && slPips ? { sl_pips: parseFloat(slPips) } : {}),
      ...(exitMode === 'fixed_pips' && tpPips ? { tp_pips: parseFloat(tpPips) } : {}),
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

            {/* Period - Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
                max={endDate ? format(endDate, "yyyy-MM-dd") : undefined}
              />
              <p className="text-xs text-muted-foreground">Beginning of backtest period</p>
            </div>

            {/* Period - End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                min={startDate ? format(startDate, "yyyy-MM-dd") : undefined}
                max={format(new Date(), "yyyy-MM-dd")}
              />
              <p className="text-xs text-muted-foreground">End of backtest period</p>
            </div>

            {/* Exit Mode */}
            <div className="space-y-2">
              <Label>Exit Mode</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['bot', 'percentage', 'fixed_pips'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setExitMode(mode)}
                    className={`p-2 text-xs rounded-md border transition-colors ${
                      exitMode === mode
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {mode === 'bot' ? 'Bot Default' : mode === 'percentage' ? 'Risk %' : 'Fixed Pips'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {exitMode === 'bot' && "Use the strategy's built-in SL/TP logic."}
                {exitMode === 'percentage' && "Size each trade as a percentage of equity."}
                {exitMode === 'fixed_pips' && "Apply fixed pip distances for SL and TP."}
              </p>
            </div>

            {/* Risk % input (percentage mode) */}
            {exitMode === 'percentage' && (
              <div className="space-y-2">
                <Label htmlFor="riskPct">Risk Per Trade (%)</Label>
                <Input
                  id="riskPct"
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.1"
                  placeholder="e.g. 2"
                  value={riskPct}
                  onChange={(e) => setRiskPct(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Fraction of equity risked per trade (e.g. 2 = 2%)</p>
              </div>
            )}

            {/* SL / TP pips inputs (fixed_pips mode) */}
            {exitMode === 'fixed_pips' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slPips">Stop Loss (pips)</Label>
                  <Input
                    id="slPips"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 20"
                    value={slPips}
                    onChange={(e) => setSlPips(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tpPips">Take Profit (pips)</Label>
                  <Input
                    id="tpPips"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 40"
                    value={tpPips}
                    onChange={(e) => setTpPips(e.target.value)}
                  />
                </div>
              </div>
            )}
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
