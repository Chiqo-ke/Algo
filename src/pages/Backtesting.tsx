import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Play, Edit, Loader2, CheckCircle2, XCircle, ChevronsUpDown, Check, TrendingUp, TrendingDown, Activity, BarChart2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { symbolService, strategyService, backtestService, type Symbol, type Strategy, type LatestBacktestResult } from "@/lib/services";
import { API_ENDPOINTS, apiPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import {
  AreaChart, Area, ComposedChart, Line, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";

interface BacktestParams {
  symbol: string;
  interval: string;
  amount: string;
  exit_mode: 'bot' | 'percentage' | 'fixed_pips';
  risk_pct?: number;
  sl_pips?: number;
  tp_pips?: number;
}

export default function Backtesting() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { toast } = useToast();
  
  // Extract strategyId from URL params as fallback
  const urlStrategyId = params.strategyId ? parseInt(params.strategyId) : undefined;
  const strategyId = location.state?.strategyId || urlStrategyId;
  const strategyName = location.state?.strategyName || "Strategy";
  const backtestConfig = location.state?.backtestConfig; // NEW: Get config from Strategy page

  // Log the strategyId source for debugging
  useEffect(() => {
    logger.backtest.debug("Backtest page loaded", {
      strategyIdFromState: location.state?.strategyId,
      strategyIdFromURL: urlStrategyId,
      finalStrategyId: strategyId,
      hasStrategyName: !!strategyName
    });
  }, []);

  // State for fetched data
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loadingSymbols, setLoadingSymbols] = useState(true);
  const [loadingStrategy, setLoadingStrategy] = useState(true);

  const [backtestParams, setBacktestParams] = useState<BacktestParams>({
    symbol: backtestConfig?.symbol || "",
    interval: "1d",
    amount: "1000",
    exit_mode: backtestConfig?.exit_mode || 'bot',
    risk_pct: backtestConfig?.risk_pct,
    sl_pips: backtestConfig?.sl_pips,
    tp_pips: backtestConfig?.tp_pips,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [rawResults, setRawResults] = useState<LatestBacktestResult | null>(null);

  // Validation state
  const [isValidating, setIsValidating] = useState(false);
  const [symbolOpen, setSymbolOpen] = useState(false);
  const [symbolSearch, setSymbolSearch] = useState("");
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    tradesExecuted: number;
    errors: string[];
    warnings: string[];
  } | null>(null);
  
  // Track if this is the first backtest run after bot generation
  const [hasRunFirstBacktest, setHasRunFirstBacktest] = useState(false);

  // Helper function to display backtest results
  const displayResults = (savedResults: LatestBacktestResult) => {
    setRawResults(savedResults);
    setHasResults(true);
  };

  // Handler for when streaming backtest completes
  const handleStreamingComplete = (_streamResults?: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    pnl: number;
    maxDrawdown?: number;
    sharpeRatio?: number;
    finalEquity?: number;
  }) => {
    setIsRunning(false);
    setHasRunFirstBacktest(true);

    // Fetch updated results from DB after streaming completes
    if (strategyId) {
      backtestService.getLatestResult(strategyId).then(({ data }) => {
        if (data) displayResults(data);
      });
    }

    toast({
      title: "Backtest completed",
      description: `Real-time backtest finished`,
    });
  };

  // Fetch symbols on component mount
  useEffect(() => {
    const fetchSymbols = async () => {
      setLoadingSymbols(true);
      const { data, error } = await symbolService.getAll();
      
      if (error) {
        toast({
          title: "Error loading symbols",
          description: error,
          variant: "destructive",
        });
      } else if (data) {
        setSymbols(data);
      }
      setLoadingSymbols(false);
    };

    fetchSymbols();
  }, [toast]);

  // Fetch strategy details if strategyId is provided
  useEffect(() => {
    const fetchStrategy = async () => {
      if (!strategyId) {
        logger.backtest.debug("No strategy ID provided, skipping strategy fetch");
        setLoadingStrategy(false);
        return;
      }

      logger.backtest.info("Fetching strategy details", { strategyId });
      setLoadingStrategy(true);
      const { data, error } = await strategyService.getById(strategyId);
      
      if (error) {
        logger.backtest.error("Failed to fetch strategy", new Error(error), { strategyId });
        toast({
          title: "Error loading strategy",
          description: error,
          variant: "destructive",
        });
      } else if (data) {
        logger.backtest.info("Strategy loaded successfully", { 
          strategyId: data.id,
          strategyName: data.name,
          hasStrategyCode: !!data.strategy_code,
          codeLength: data.strategy_code?.length || 0
        });
        setStrategy(data);
        
        // Also fetch saved backtest results for this strategy
        fetchSavedResults(data.id);
      }
      setLoadingStrategy(false);
    };

    // Function to fetch saved backtest results from database
    const fetchSavedResults = async (stratId: number) => {
      const { data: savedResults } = await backtestService.getLatestResult(stratId);
      
      if (savedResults) {
        logger.backtest.info("Loaded saved backtest results", { 
          strategyId: stratId,
          totalTrades: savedResults.total_trades,
          winRate: savedResults.win_rate,
          netProfit: savedResults.net_profit
        });
        
        // Use the helper function to display results
        displayResults(savedResults);
        
        // Pre-fill symbol from saved results if not already set (don't overwrite amount —
        // it's user-defined and a failed 0-trade run may have saved a bad value)
        if (savedResults.symbol && !backtestParams.symbol) {
          setBacktestParams(prev => ({
            ...prev,
            symbol: savedResults.symbol || prev.symbol,
          }));
        }
      }
    };

    fetchStrategy();
  }, [strategyId, toast]);

  // Poll strategy status if validating
  useEffect(() => {
    if (!strategy || strategy.status !== 'validating') return;

    const pollInterval = setInterval(async () => {
      const { data, error } = await strategyService.getById(strategyId);
      if (error) {
        console.error("Error polling strategy:", error);
        return;
      }
      if (data && data.status !== 'validating') {
        setStrategy(data);
        clearInterval(pollInterval);
        
        // Show validation result
        if (data.status === 'valid') {
          toast({
            title: "Strategy validated",
            description: "Strategy passed validation and is ready for backtesting",
          });
        } else if (data.status === 'invalid') {
          toast({
            title: "Validation failed",
            description: "Strategy did not pass validation. Check details below.",
            variant: "destructive",
          });
        }
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [strategy, strategyId, toast]);

  // Auto-run backtest if config is provided from Strategy page
  useEffect(() => {
    if (backtestConfig && !loadingSymbols && !loadingStrategy && backtestParams.symbol) {
      console.log("Auto-running backtest with config:", backtestConfig);
      toast({
        title: "Starting Backtest",
        description: `Testing ${strategyName} on ${backtestConfig.symbol}`,
      });
      // Note: You can manually trigger backtest or add a "Run Backtest" button
      // Auto-running is commented out to give user control
      // setTimeout(() => {
      //   document.getElementById('run-backtest-button')?.click();
      // }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backtestConfig, loadingSymbols, loadingStrategy]);

  const handleEditStrategy = () => {
    navigate("/", { state: { editMode: true, strategyName } });
  };

  const validateStrategy = async (): Promise<boolean> => {
    if (!strategy?.strategy_code) {
      toast({
        title: "No strategy code",
        description: "Strategy code is required for validation",
        variant: "destructive",
      });
      return false;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const { data, error } = await apiPost(API_ENDPOINTS.strategies.validate, {
        strategy_code: strategy.strategy_code,
        test_period_days: 365,
      });

      if (error) {
        throw new Error(error);
      }

      if (!data) {
        throw new Error("No validation response received");
      }
      
      // Type assertion for validation response
      const validationData = data as { 
        valid: boolean; 
        trades_executed?: number; 
        errors?: string[]; 
        warnings?: string[] 
      };
      
      setValidationResult({
        isValid: validationData.valid,
        tradesExecuted: validationData.trades_executed || 0,
        errors: validationData.errors || [],
        warnings: validationData.warnings || [],
      });

      if (validationData.valid) {
        toast({
          title: "Validation passed",
          description: `Strategy validated successfully with ${validationData.trades_executed} trades`,
        });
        return true;
      } else {
        toast({
          title: "Validation failed",
          description: validationData.errors?.[0] || "Strategy validation failed",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast({
        title: "Validation error",
        description: error instanceof Error ? error.message : "Failed to validate strategy",
        variant: "destructive",
      });
      setValidationResult({
        isValid: false,
        tradesExecuted: 0,
        errors: ["Failed to connect to validation service"],
        warnings: [],
      });
      return false;
    } finally {
      setIsValidating(false);
    }
  };


  const handleRunBacktest = async () => {
    logger.backtest.info("Starting backtest execution", { 
      strategyId,
      strategyName,
      symbol: backtestParams.symbol,
      interval: backtestParams.interval,
      amount: backtestParams.amount,
      hasStrategyCode: !!strategy?.strategy_code
    });
    
    if (!backtestParams.symbol || !backtestParams.interval) {
      logger.backtest.warn("Missing required fields", { backtestParams });
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields (Symbol and Interval)",
        variant: "destructive",
      });
      return;
    }

    const initialCapital = parseFloat(backtestParams.amount) || 1000;
    if (initialCapital <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be a positive number",
        variant: "destructive",
      });
      return;
    }

    // Check if we have strategy_code or strategy_id
    if (!strategy?.strategy_code && !strategyId) {
      logger.backtest.error("Cannot run backtest: no strategy code or ID", undefined, { 
        hasStrategy: !!strategy,
        strategyId 
      });
      toast({
        title: "Strategy not found",
        description: "Strategy ID or strategy code is required to run backtest",
        variant: "destructive",
      });
      return;
    }

    // Skip validation if strategy is already marked as valid
    if (strategy?.status === 'valid') {
      logger.backtest.info("Strategy already validated, skipping re-validation", { 
        status: strategy.status,
        strategyId 
      });
    } else if (strategy?.strategy_code && strategy?.status !== 'valid') {
      logger.backtest.info("Validating strategy before backtest", { status: strategy.status });
      const isValid = await validateStrategy();
      if (!isValid) {
        logger.backtest.warn("Strategy validation failed, aborting backtest");
        return;
      }
    } else {
      logger.backtest.info("Skipping frontend validation - backend will fetch strategy code by ID", { strategyId });
    }

    setIsRunning(true);
    setHasResults(false);
    setRawResults(null);

    try {
      logger.backtest.info("Starting direct backtest execution", { 
        strategyId,
        symbol: backtestParams.symbol,
        interval: backtestParams.interval,
        initialCapital,
      });

      // Execute backtest with user's selected parameters
      const executePayload: Record<string, unknown> = {
        test_symbol: backtestParams.symbol,
        interval: backtestParams.interval,
        initial_capital: initialCapital,
        exit_mode: backtestParams.exit_mode || 'bot',
        ...(backtestParams.risk_pct !== undefined && { risk_pct: backtestParams.risk_pct }),
        ...(backtestParams.sl_pips !== undefined && { sl_pips: backtestParams.sl_pips }),
        ...(backtestParams.tp_pips !== undefined && { tp_pips: backtestParams.tp_pips }),
      };

      logger.backtest.info("Executing backtest with params", executePayload);

      const { data: executeResponse, error: executeError } = await apiPost<any>(
        `${API_ENDPOINTS.strategies.detail(strategyId)}execute/`,
        executePayload
      );

      if (executeError) {
        throw new Error(executeError);
      }

      if (!executeResponse) {
        throw new Error("No response from backtest execution");
      }

      logger.backtest.info("Backtest execution completed", {
        success: executeResponse.success,
        trades: executeResponse.trades
      });

      // Now fetch the updated results
      const { data: savedResults } = await backtestService.getLatestResult(strategyId);
      
      if (savedResults) {
        displayResults(savedResults);
        
        toast({
          title: "Backtest Completed",
          description: `${savedResults.total_trades} trades executed on ${backtestParams.symbol}`,
        });
        
        logger.backtest.info("Backtest results loaded", {
          totalTrades: savedResults.total_trades,
          winRate: savedResults.win_rate,
          netProfit: savedResults.net_profit
        });
      } else {
        throw new Error("No backtest results found after execution");
      }
    } catch (error) {
      logger.backtest.error("Failed to execute backtest", error as Error, { 
        strategyId
      });
      
      toast({
        title: "Failed to execute backtest",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // ── Derived chart data ───────────────────────────────────────────────────

  // Equity curve enriched with a synthetic Buy-and-Hold line
  const equityChartData = useMemo(() => {
    if (!rawResults?.equity_curve?.length) return [];
    const curve = rawResults.equity_curve;
    const initial = Number(rawResults.initial_balance) || 1000;
    const bhReturn = Number(rawResults.buy_hold_return_pct) || 0;
    const n = curve.length;
    return curve.map((pt, i) => ({
      timestamp: pt.timestamp.split('T')[0],
      equity: Number(pt.equity),
      drawdown: pt.drawdown_pct !== undefined ? -(Number(pt.drawdown_pct) * 100) : undefined,
      buyHold: initial * (1 + (bhReturn / 100) * (i / Math.max(n - 1, 1))),
    }));
  }, [rawResults]);

  // Weekly P&L bar chart from trade list
  const weeklyPnL = useMemo(() => {
    if (!rawResults?.trades?.length) return [];
    const buckets: Record<string, number> = {};
    for (const t of rawResults.trades) {
      const d = new Date(t.exit_time || t.entry_time);
      if (isNaN(d.getTime())) continue;
      const jan1 = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
      const key = `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
      buckets[key] = (buckets[key] || 0) + Number(t.pnl);
    }
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, pnl]) => ({ week, pnl: Number(pnl.toFixed(2)) }));
  }, [rawResults]);

  const dailyPnL = useMemo(() => {
    if (!rawResults?.trades?.length) return [];
    const buckets: Record<string, number> = {};
    for (const t of rawResults.trades) {
      const d = new Date(t.exit_time || t.entry_time);
      if (isNaN(d.getTime())) continue;
      const key = d.toISOString().split('T')[0];
      buckets[key] = (buckets[key] || 0) + Number(t.pnl);
    }
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, pnl]) => ({ day, pnl: Number(pnl.toFixed(2)) }));
  }, [rawResults]);

  // Win/loss pie
  const winLossPie = useMemo(() => {
    if (!rawResults) return [];
    return [
      { name: 'Wins', value: Number(rawResults.winning_trades) || 0 },
      { name: 'Losses', value: Number(rawResults.losing_trades) || 0 },
    ];
  }, [rawResults]);

  const fmt = (v: number | null | undefined, decimals = 2, suffix = '') =>
    v != null ? `${Number(v).toFixed(decimals)}${suffix}` : '—';
  const fmtMoney = (v: number | null | undefined) =>
    v != null ? `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
  const PIE_COLORS = ['#22c55e', '#ef4444'];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 md:gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/strategy")}
            className="hover:bg-secondary shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-4xl font-bold text-foreground mb-1 md:mb-2 truncate">
              Backtest: {strategyName}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Configure parameters and run historical testing
            </p>
          </div>
        </div>

        {/* Strategy Validation Status */}
        {strategy && strategy.status === 'validating' && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Validating Strategy...</h3>
                  <p className="text-sm text-yellow-700">
                    Strategy is being validated with 1 year of test data. This usually takes 20-30 seconds.
                    You'll be notified when validation completes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {strategy && strategy.status === 'invalid' && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">Validation Failed</h3>
                  <p className="text-sm text-red-700">
                    This strategy did not pass validation (no trades executed in 1-year test).
                    The generated code may have issues. Please review or regenerate the strategy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Backtest Parameters - Upper Half */}
        <Card className="bg-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Backtest Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Symbol/Security */}
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol / Security *</Label>
                {loadingSymbols ? (
                  <div className="flex items-center justify-center h-10 border rounded-md">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <Popover open={symbolOpen} onOpenChange={(open) => {
                    setSymbolOpen(open);
                    if (!open && symbolSearch.trim() && symbolSearch.trim() !== backtestParams.symbol) {
                      setBacktestParams(prev => ({ ...prev, symbol: symbolSearch.trim().toUpperCase() }));
                    }
                    if (!open) setSymbolSearch("");
                  }}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={symbolOpen}
                        id="symbol"
                        className="w-full justify-between font-normal h-10"
                      >
                        <span className={backtestParams.symbol ? "uppercase font-medium" : "text-muted-foreground font-normal"}>
                          {backtestParams.symbol || "Select or type symbol..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search symbol (e.g. AAPL, EURUSD)..."
                          value={symbolSearch}
                          onValueChange={(val) => setSymbolSearch(val.toUpperCase())}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {symbolSearch.trim() ? (
                              <button
                                className="w-full py-2 px-3 text-sm text-left hover:bg-accent rounded-sm"
                                onClick={() => {
                                  setBacktestParams(prev => ({ ...prev, symbol: symbolSearch.trim().toUpperCase() }));
                                  setSymbolSearch("");
                                  setSymbolOpen(false);
                                }}
                              >
                                Use &ldquo;{symbolSearch.trim().toUpperCase()}&rdquo;
                              </button>
                            ) : (
                              "No symbols found."
                            )}
                          </CommandEmpty>
                          {symbols.length > 0 && (
                            <CommandGroup heading="Available Securities">
                              {symbols.map((sym) => (
                                <CommandItem
                                  key={sym.id}
                                  value={`${sym.symbol} ${sym.name || ""}`}
                                  onSelect={() => {
                                    setBacktestParams(prev => ({ ...prev, symbol: sym.symbol }));
                                    setSymbolSearch("");
                                    setSymbolOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn("mr-2 h-4 w-4 shrink-0", backtestParams.symbol === sym.symbol ? "opacity-100" : "opacity-0")}
                                  />
                                  <span className="font-mono font-medium">{sym.symbol}</span>
                                  {sym.name && (
                                    <span className="ml-2 text-xs text-muted-foreground truncate">{sym.name}</span>
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {/* Interval */}
              <div className="space-y-2">
                <Label htmlFor="interval">Interval *</Label>
                <select
                  id="interval"
                  title="Backtest interval"
                  aria-label="Backtest interval"
                  value={backtestParams.interval}
                  onChange={(e) => setBacktestParams({ ...backtestParams, interval: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="1m">1 Minute (1m)</option>
                  <option value="3m">3 Minutes (3m)</option>
                  <option value="5m">5 Minutes (5m)</option>
                  <option value="15m">15 Minutes (15m)</option>
                  <option value="30m">30 Minutes (30m)</option>
                  <option value="45m">45 Minutes (45m)</option>
                  <option value="1h">1 Hour (1h)</option>
                  <option value="2h">2 Hours (2h)</option>
                  <option value="4h">4 Hours (4h)</option>
                  <option value="1d">1 Day (1d)</option>
                </select>
                <p className="text-xs text-muted-foreground">Data bar interval for the backtest. Shorter intervals (minutes) fetch ~5000 bars of recent data.</p>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Simulation Amount (USD) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="100"
                  placeholder="1000"
                  value={backtestParams.amount}
                  onChange={(e) => setBacktestParams({ ...backtestParams, amount: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Starting capital for the simulation (default: $1,000)</p>
              </div>
            </div>

            {/* Exit Mode */}
            <div className="space-y-2">
              <Label>Exit Mode</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['bot', 'percentage', 'fixed_pips'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setBacktestParams({ ...backtestParams, exit_mode: mode })}
                    className={`p-2 text-xs rounded-md border transition-colors ${
                      backtestParams.exit_mode === mode
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {mode === 'bot' ? 'Bot Default' : mode === 'percentage' ? 'Risk %' : 'Fixed Pips'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {backtestParams.exit_mode === 'bot' && "Use the strategy's built-in SL/TP logic."}
                {backtestParams.exit_mode === 'percentage' && "Size each trade as a percentage of equity."}
                {backtestParams.exit_mode === 'fixed_pips' && "Apply fixed pip distances for SL and TP."}
              </p>
            </div>

            {/* Risk % input (percentage mode) */}
            {backtestParams.exit_mode === 'percentage' && (
              <div className="space-y-2">
                <Label htmlFor="riskPct">Risk Per Trade (%)</Label>
                <Input
                  id="riskPct"
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.1"
                  placeholder="e.g. 2"
                  value={backtestParams.risk_pct ?? ''}
                  onChange={(e) => setBacktestParams({ ...backtestParams, risk_pct: parseFloat(e.target.value) || undefined })}
                />
                <p className="text-xs text-muted-foreground">Fraction of equity risked per trade (e.g. 2 = 2%)</p>
              </div>
            )}

            {/* SL / TP pips inputs (fixed_pips mode) */}
            {backtestParams.exit_mode === 'fixed_pips' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slPipsBacktest">Stop Loss (pips)</Label>
                  <Input
                    id="slPipsBacktest"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 20"
                    value={backtestParams.sl_pips ?? ''}
                    onChange={(e) => setBacktestParams({ ...backtestParams, sl_pips: parseFloat(e.target.value) || undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tpPipsBacktest">Take Profit (pips)</Label>
                  <Input
                    id="tpPipsBacktest"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 40"
                    value={backtestParams.tp_pips ?? ''}
                    onChange={(e) => setBacktestParams({ ...backtestParams, tp_pips: parseFloat(e.target.value) || undefined })}
                  />
                </div>
              </div>
            )}

            {/* Run Button */}
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleRunBacktest}
                disabled={isRunning || loadingStrategy || isValidating || strategy?.status === 'validating' || strategy?.status === 'invalid'}
                className="bg-gradient-primary min-w-[200px]"
              >
                {strategy?.status === 'validating' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Strategy Validating...
                  </>
                ) : strategy?.status === 'invalid' ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Strategy Invalid
                  </>
                ) : isValidating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating Parameters...
                  </>
                ) : isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Backtest...
                  </>
                ) : loadingStrategy ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading Strategy...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Backtest
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── BACKTEST REPORT ──────────────────────────────────────────── */}
        {hasResults && rawResults && (
          <div className="space-y-6">

            {/* 1 ─ KPI Summary Row */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Performance Summary — {rawResults.symbol} · {rawResults.timeframe}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
                  {[
                    { label: 'Net P/L', value: fmtMoney(Number(rawResults.net_profit)), color: Number(rawResults.net_profit) >= 0 ? 'text-green-500' : 'text-red-500' },
                    { label: 'Total Return', value: fmt(Number(rawResults.total_return_pct), 2, '%'), color: Number(rawResults.total_return_pct) >= 0 ? 'text-green-500' : 'text-red-500' },
                    { label: 'Win Rate', value: fmt(Number(rawResults.win_rate), 2, '%'), color: Number(rawResults.win_rate) >= 50 ? 'text-green-500' : 'text-yellow-500' },
                    { label: 'Profit Factor', value: rawResults.profit_factor != null ? fmt(Number(rawResults.profit_factor)) : '—', color: rawResults.profit_factor != null && Number(rawResults.profit_factor) >= 1 ? 'text-green-500' : 'text-red-500' },
                    { label: 'Max Drawdown', value: fmt(Number(rawResults.max_drawdown), 2, '%'), color: 'text-red-500' },
                    { label: 'Sharpe Ratio', value: rawResults.sharpe_ratio != null ? fmt(Number(rawResults.sharpe_ratio)) : '—', color: rawResults.sharpe_ratio != null && Number(rawResults.sharpe_ratio) >= 1 ? 'text-green-500' : 'text-yellow-500' },
                    { label: 'Total Trades', value: String(rawResults.total_trades), color: 'text-foreground' },
                    { label: 'Buy & Hold', value: rawResults.buy_hold_return_pct != null ? fmt(Number(rawResults.buy_hold_return_pct), 2, '%') : '—', color: rawResults.buy_hold_return_pct != null && Number(rawResults.buy_hold_return_pct) >= 0 ? 'text-blue-500' : 'text-red-500' },
                  ].map((kpi) => (
                    <div key={kpi.label} className="p-3 bg-muted/20 rounded-lg flex flex-col gap-1">
                      <p className="text-xs text-muted-foreground leading-tight">{kpi.label}</p>
                      <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 2 ─ Equity Curve + Buy & Hold */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Equity Curve
                </CardTitle>
              </CardHeader>
              <CardContent>
                {equityChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={equityChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="timestamp" tick={{ fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v) => `$${Number(v).toLocaleString()}`} width={70} />
                      <Tooltip
                        formatter={(value: number, name: string) => [`$${Number(value).toFixed(2)}`, name === 'equity' ? 'Strategy' : 'Buy & Hold']}
                        labelFormatter={(l) => `Date: ${l}`}
                        contentStyle={{ fontSize: 12 }}
                      />
                      <Legend iconType="line" />
                      <Area type="monotone" dataKey="equity" stroke="#6366f1" fill="#6366f120" strokeWidth={2} name="equity" dot={false} />
                      <Line type="monotone" dataKey="buyHold" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5" name="buyHold" dot={false} />
                      <ReferenceLine y={Number(rawResults.initial_balance)} stroke="#f59e0b" strokeDasharray="3 3" />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Equity curve data is populated for canonical JSON strategies. Run a backtest to generate the chart.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 3 ─ Drawdown Chart */}
            {equityChartData.length > 0 && equityChartData.some(d => d.drawdown !== undefined) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-500" />
                    Drawdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={equityChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="timestamp" tick={{ fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v) => `${Number(v).toFixed(1)}%`} width={55} />
                      <Tooltip formatter={(v: number) => [`${Number(v).toFixed(2)}%`, 'Drawdown']} contentStyle={{ fontSize: 12 }} />
                      <ReferenceLine y={0} stroke="#6b7280" />
                      <Area type="monotone" dataKey="drawdown" stroke="#ef4444" fill="#ef444430" strokeWidth={1.5} name="Drawdown %" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* 4 ─ Win/Loss breakdown + Trade Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Win / Loss Distribution</CardTitle></CardHeader>
                <CardContent className="flex items-center gap-6">
                  <PieChart width={160} height={160}>
                    <Pie data={winLossPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {winLossPie.map((_e, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [v, '']} />
                  </PieChart>
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
                      <span className="text-sm">Wins: <strong>{rawResults.winning_trades}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
                      <span className="text-sm">Losses: <strong>{rawResults.losing_trades}</strong></span>
                    </div>
                    <div className="text-sm text-muted-foreground pt-2 border-t border-border">
                      Win rate: <strong>{fmt(Number(rawResults.win_rate), 1, '%')}</strong>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    Daily P&amp;L
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dailyPnL.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={dailyPnL} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                        <XAxis dataKey="day" tick={{ fontSize: 9 }} tickLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v) => `$${v}`} width={55} />
                        <Tooltip formatter={(v: number) => [`$${Number(v).toFixed(2)}`, 'P&L']} contentStyle={{ fontSize: 12 }} />
                        <ReferenceLine y={0} stroke="#6b7280" />
                        <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                          {dailyPnL.map((entry, i) => (
                            <Cell key={i} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Daily P&amp;L data available after running a backtest.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 5 ─ Weekly P&L Bar Chart */}
            {weeklyPnL.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-primary" />
                    Weekly P&amp;L
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={weeklyPnL} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} tickLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v) => `$${v}`} width={60} />
                      <Tooltip formatter={(v: number) => [`$${Number(v).toFixed(2)}`, 'P&L']} contentStyle={{ fontSize: 12 }} />
                      <ReferenceLine y={0} stroke="#6b7280" />
                      <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                        {weeklyPnL.map((entry, i) => (
                          <Cell key={i} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* 6 ─ Per-Symbol Breakdown */}
            {Array.isArray(rawResults.symbol_stats) && rawResults.symbol_stats.length > 1 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Performance by Symbol</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {rawResults.symbol_stats.map((s, i) => (
                      <div key={i} className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/10 rounded-lg">
                        <span className="font-mono font-medium">{s.symbol}</span>
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                          <span className="text-muted-foreground">{s.trades} trades</span>
                          <span className="text-muted-foreground">{fmt(Number(s.win_rate), 1, '% WR')}</span>
                          <span className={Number(s.net_profit) >= 0 ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
                            {fmtMoney(Number(s.net_profit))}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Floating Edit Button */}
      <Button
        onClick={handleEditStrategy}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 h-11 w-11 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full shadow-lg bg-transparent border-2 border-primary hover:bg-primary hover:scale-125 transition-all duration-300 group"
        size="icon"
      >
        <Edit className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
      </Button>
    </DashboardLayout>
  );
}
