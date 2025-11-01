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
import { Loader2, TrendingUp } from "lucide-react";
import { symbolService, type Symbol } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Configure Backtest
          </DialogTitle>
          <DialogDescription>
            Set parameters to test <span className="font-semibold text-foreground">{strategyName}</span>
          </DialogDescription>
        </DialogHeader>

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
            )}
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
        </div>

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
