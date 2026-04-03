import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Play, Edit, Loader2, CheckCircle2, XCircle, ChevronsUpDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { symbolService, strategyService, backtestService, type Symbol, type Strategy, type LatestBacktestResult } from "@/lib/services";
import { API_ENDPOINTS, apiPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

interface BacktestParams {
  symbol: string;
  interval: string;
  amount: string;
  exit_mode: 'bot' | 'percentage' | 'fixed_pips';
  risk_pct?: number;
  sl_pips?: number;
  tp_pips?: number;
}

interface BacktestResults {
  dailyStats: {
    day: string;
    profit: number;
    trades: number;
  }[];
  symbolStats: {
    symbol: string;
    trades: number;
    profit: number;
    percentage: number;
  }[];
  summary: {
    totalTrades: number;
    winRate: number;
    totalProfit: number;
    averageTrade: number;
  };
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
  const [results, setResults] = useState<BacktestResults | null>(null);

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

  // Helper function to display backtest results (moved to component level for accessibility)
  const displayResults = (savedResults: LatestBacktestResult) => {
    // Convert string values to numbers (Django returns DecimalField as strings)
    const totalTrades = Number(savedResults.total_trades) || 0;
    const winRate = Number(savedResults.win_rate) || 0;
    const netProfit = Number(savedResults.net_profit) || 0;

    // Build per-symbol stats from saved symbol_stats if available
    const perSymbolStats = Array.isArray(savedResults.symbol_stats) && savedResults.symbol_stats.length > 0
      ? savedResults.symbol_stats.map((s) => ({
          symbol: s.symbol,
          trades: Number(s.trades) || 0,
          profit: Number(s.net_profit) || 0,
          percentage: netProfit !== 0 ? Math.round((Number(s.net_profit) / netProfit) * 100) : 0,
        }))
      : [{
          symbol: savedResults.symbol || backtestParams.symbol || "N/A",
          trades: totalTrades,
          profit: netProfit,
          percentage: 100,
        }];

    const transformedResults: BacktestResults = {
      dailyStats: [],
      symbolStats: perSymbolStats,
      summary: {
        totalTrades: totalTrades,
        winRate: winRate,
        totalProfit: netProfit,
        averageTrade: totalTrades > 0
          ? netProfit / totalTrades
          : 0,
      },
    };

    setResults(transformedResults);
    setHasResults(true);
  };

  // Handler for when streaming backtest completes
  const handleStreamingComplete = (streamResults?: {
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
    
    // Mark that we've completed the first backtest run
    setHasRunFirstBacktest(true);
    
    // If we got results from the stream, update the results state
    if (streamResults && streamResults.totalTrades > 0) {
      const transformedResults: BacktestResults = {
        dailyStats: [], // Daily stats would need to be computed from trades
        symbolStats: [{
          symbol: backtestParams.symbol,
          trades: streamResults.totalTrades,
          profit: streamResults.pnl,
          percentage: 100,
        }],
        summary: {
          totalTrades: streamResults.totalTrades,
          winRate: streamResults.winRate,
          totalProfit: streamResults.pnl,
          averageTrade: streamResults.totalTrades > 0 
            ? streamResults.pnl / streamResults.totalTrades 
            : 0,
        },
      };
      setResults(transformedResults);
      setHasResults(true);
      
      logger.backtest.info("Stream backtest results received", {
        totalTrades: streamResults.totalTrades,
        winRate: streamResults.winRate,
        pnl: streamResults.pnl,
      });
    }
    
    toast({
      title: "Backtest completed",
      description: `Real-time backtest finished with ${streamResults?.totalTrades || 0} trades`,
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
    setResults(null);

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
                  <option value="1h">1 Hour (1h)</option>
                  <option value="2h">2 Hours (2h)</option>
                  <option value="4h">4 Hours (4h)</option>
                  <option value="1d">1 Day (1d)</option>
                </select>
                <p className="text-xs text-muted-foreground">Data bar interval for the backtest</p>
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

        {/* Backtest Results Display */}
        {hasResults && results && (
          <Card>
            <CardHeader>
              <CardTitle>Backtest Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="p-3 md:p-4 bg-muted/20 rounded-lg min-w-0 overflow-hidden">
                  <p className="text-xs md:text-sm text-muted-foreground truncate">Total Trades</p>
                  <p className="text-lg md:text-2xl font-bold break-all">{results.summary.totalTrades}</p>
                </div>
                <div className="p-3 md:p-4 bg-muted/20 rounded-lg min-w-0 overflow-hidden">
                  <p className="text-xs md:text-sm text-muted-foreground truncate">Win Rate</p>
                  <p className="text-lg md:text-2xl font-bold break-all">{results.summary.winRate.toFixed(2)}%</p>
                </div>
                <div className="p-3 md:p-4 bg-muted/20 rounded-lg min-w-0 overflow-hidden">
                  <p className="text-xs md:text-sm text-muted-foreground truncate">Total Profit</p>
                  <p className={`text-lg md:text-2xl font-bold break-all ${results.summary.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${results.summary.totalProfit.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 md:p-4 bg-muted/20 rounded-lg min-w-0 overflow-hidden">
                  <p className="text-xs md:text-sm text-muted-foreground truncate">Avg Trade</p>
                  <p className={`text-lg md:text-2xl font-bold break-all ${results.summary.averageTrade >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${results.summary.averageTrade.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Symbol Stats */}
              {results.symbolStats && results.symbolStats.length > 0 && (
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-3">Performance by Symbol</h3>
                  <div className="space-y-2">
                    {results.symbolStats.map((stat, index) => (
                      <div key={index} className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/10 rounded-lg">
                        <span className="font-medium truncate max-w-[40%] sm:max-w-none">{stat.symbol}</span>
                        <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                          <span className="text-sm text-muted-foreground whitespace-nowrap">{stat.trades} trades</span>
                          <span className={`font-semibold whitespace-nowrap ${stat.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${stat.profit.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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
