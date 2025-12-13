import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Play, Edit, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { symbolService, strategyService, backtestService, type Symbol, type Strategy, type LatestBacktestResult } from "@/lib/services";
import { API_ENDPOINTS, apiPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { RealtimeBacktestChart } from "@/components/RealtimeBacktestChart";
import { logger } from "@/lib/logger";

interface BacktestParams {
  symbol: string;
  period: string;
  timeframe: string;
  lotSize: string;
  initialBalance: string;
  commission: string;
  slippage: string;
  customDateFrom?: Date;
  customDateTo?: Date;
  indicators?: Record<string, any>; // For strategy indicators
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
    period: backtestConfig?.period || "",
    timeframe: backtestConfig?.interval || "",
    lotSize: "1.0",
    initialBalance: backtestConfig?.initialCapital?.toString() || "10000",
    commission: "0.001",
    slippage: "0.0005"
  });

  const [isRunning, setIsRunning] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [results, setResults] = useState<BacktestResults | null>(null);
  const [showCustomDateDialog, setShowCustomDateDialog] = useState(false);
  const [customDateStep, setCustomDateStep] = useState<"from" | "to">("from");
  const [tempFromDate, setTempFromDate] = useState<Date | undefined>(undefined);
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [tempYear, setTempYear] = useState<number>(new Date().getFullYear());
  const [tempMonth, setTempMonth] = useState<number>(new Date().getMonth());
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());

  // Validation state
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    tradesExecuted: number;
    errors: string[];
    warnings: string[];
  } | null>(null);

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
    setIsStreaming(false);
    setIsRunning(false);
    
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
      logger.backtest.info("Fetching saved backtest results", { strategyId: stratId });
      const { data: savedResults, error: savedError } = await backtestService.getLatestResult(stratId);
      
      if (savedError) {
        // No saved results is not an error - just means no previous backtest
        logger.backtest.debug("No saved backtest results found", { strategyId: stratId, error: savedError });
      } else if (savedResults) {
        logger.backtest.info("Loaded saved backtest results", { 
          strategyId: stratId,
          totalTrades: savedResults.total_trades,
          winRate: savedResults.win_rate,
          netProfit: savedResults.net_profit
        });
        
        // Transform saved results to match BacktestResults interface
        const transformedResults: BacktestResults = {
          dailyStats: [],
          symbolStats: [{
            symbol: savedResults.symbol || backtestParams.symbol || "N/A",
            trades: savedResults.total_trades,
            profit: savedResults.net_profit,
            percentage: 100,
          }],
          summary: {
            totalTrades: savedResults.total_trades,
            winRate: savedResults.win_rate,
            totalProfit: savedResults.net_profit,
            averageTrade: savedResults.total_trades > 0 
              ? savedResults.net_profit / savedResults.total_trades 
              : 0,
          },
        };
        
        setResults(transformedResults);
        setHasResults(true);
        
        // Also set the backtest params from saved data if available
        if (savedResults.symbol && !backtestParams.symbol) {
          setBacktestParams(prev => ({
            ...prev,
            symbol: savedResults.symbol || prev.symbol,
            initialBalance: savedResults.initial_balance?.toString() || prev.initialBalance,
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

  const handlePeriodChange = (value: string) => {
    if (value === "custom") {
      setShowCustomDateDialog(true);
      setCustomDateStep("from");
      setTempFromDate(undefined);
      setCurrentCalendarDate(new Date());
    } else {
      setBacktestParams({ ...backtestParams, period: value, customDateFrom: undefined, customDateTo: undefined });
    }
  };

  const handleOpenMonthYearPicker = () => {
    setTempYear(currentCalendarDate.getFullYear());
    setTempMonth(currentCalendarDate.getMonth());
    setShowMonthYearPicker(true);
  };

  const handleMonthYearConfirm = () => {
    const newDate = new Date(tempYear, tempMonth, 1);
    setCurrentCalendarDate(newDate);
    setShowMonthYearPicker(false);
  };

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

  const handleCustomDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (customDateStep === "from") {
      setTempFromDate(date);
      setCustomDateStep("to");
    } else {
      // Step is "to"
      setBacktestParams({ 
        ...backtestParams, 
        period: "custom",
        customDateFrom: tempFromDate,
        customDateTo: date
      });
      setShowCustomDateDialog(false);
      setCustomDateStep("from");
      setTempFromDate(undefined);
    }
  };

  const handleRunBacktest = async () => {
    logger.backtest.info("Starting backtest execution", { 
      strategyId,
      strategyName,
      symbol: backtestParams.symbol,
      period: backtestParams.period,
      timeframe: backtestParams.timeframe,
      hasStrategyCode: !!strategy?.strategy_code
    });
    
    if (!backtestParams.symbol || !backtestParams.period || !backtestParams.timeframe) {
      logger.backtest.warn("Missing required fields", { backtestParams });
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!backtestParams.lotSize || !backtestParams.initialBalance) {
      toast({
        title: "Missing fields",
        description: "Please enter lot size and initial balance for simulation",
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

    // Only validate if we have strategy_code
    // If we only have strategy_id, backend will fetch the code
    if (strategy?.strategy_code) {
      logger.backtest.info("Validating strategy before backtest");
      const isValid = await validateStrategy();
      if (!isValid) {
        logger.backtest.warn("Strategy validation failed, aborting backtest");
        return;
      }
    } else {
      logger.backtest.info("Skipping frontend validation - backend will fetch strategy code by ID", { strategyId });
    }

    setIsRunning(true);
    setIsStreaming(true);
    setHasResults(false);

    try {
      // Calculate date range based on period
      const endDate = backtestParams.customDateTo || new Date();
      let startDate = backtestParams.customDateFrom;

      if (!startDate && backtestParams.period !== "custom") {
        const daysMap: { [key: string]: number } = {
          "1week": 7,
          "1month": 30,
          "3months": 90,
          "6months": 180,
          "1year": 365,
          "2years": 730,
        };
        const days = daysMap[backtestParams.period] || 30;
        startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
      }

      if (!startDate) {
        throw new Error("Start date is required");
      }

      // Prepare backtest configuration
      const backtestConfig = {
        strategy_code: strategy?.strategy_code,
        strategy_id: strategyId,
        symbol: backtestParams.symbol,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        timeframe: backtestParams.timeframe,
        initial_balance: parseFloat(backtestParams.initialBalance) || 10000,
        lot_size: parseFloat(backtestParams.lotSize) || 1.0,
        commission: parseFloat(backtestParams.commission) || 0.001,
        slippage: parseFloat(backtestParams.slippage) || 0.0005,
      };

      logger.backtest.info("Sending backtest request to API", { 
        strategyId,
        symbol: backtestConfig.symbol,
        startDate: backtestConfig.start_date,
        endDate: backtestConfig.end_date,
        hasStrategyCode: !!backtestConfig.strategy_code
      });

      // Run backtest using the API
      const { data, error } = await backtestService.quickRun(backtestConfig);

      if (error) {
        throw new Error(error);
      }

      if (data) {
        logger.backtest.info("Backtest API response received", { 
          hasDailyStats: !!data.daily_stats,
          totalTrades: data.total_trades,
          totalReturn: data.total_return
        });
        
        // Transform API response to match UI expectations
        const transformedResults: BacktestResults = {
          dailyStats: data.daily_stats || [],
          symbolStats: data.symbol_stats || [],
          summary: {
            totalTrades: data.summary?.totalTrades || data.total_trades || 0,
            winRate: data.summary?.winRate || data.win_rate || 0,
            totalProfit: data.summary?.totalProfit || data.total_return || 0,
            averageTrade: data.summary?.averageTrade || 
              (data.total_trades ? (data.total_return || 0) / data.total_trades : 0),
          }
        };

        setResults(transformedResults);
        setHasResults(true);
        
        logger.backtest.info("Backtest completed successfully", {
          totalTrades: transformedResults.summary.totalTrades,
          winRate: transformedResults.summary.winRate,
          totalProfit: transformedResults.summary.totalProfit
        });
        
        toast({
          title: "Backtest completed",
          description: `Successfully ran backtest with ${transformedResults.summary.totalTrades} trades`,
        });
      }
    } catch (error) {
      logger.backtest.error("Backtest execution failed", error as Error, { 
        strategyId,
        symbol: backtestParams.symbol,
        timeframe: backtestParams.timeframe
      });
      toast({
        title: "Backtest failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/strategy")}
            className="hover:bg-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Backtest: {strategyName}
            </h1>
            <p className="text-muted-foreground">
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

        {strategy && strategy.status === 'valid' && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Strategy Validated</h3>
                  <p className="text-sm text-green-700">
                    Strategy passed validation and is ready for backtesting.
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Symbol/Security */}
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol / Security *</Label>
                {loadingSymbols ? (
                  <div className="flex items-center justify-center h-10 border rounded-md">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="symbol"
                      list="symbols-list"
                      placeholder="Enter symbol (e.g., AAPL, EURUSD)"
                      value={backtestParams.symbol}
                      onChange={(e) => setBacktestParams({ ...backtestParams, symbol: e.target.value.toUpperCase() })}
                      className="uppercase"
                    />
                    <datalist id="symbols-list">
                      {symbols.length > 0 ? (
                        symbols.map((symbol) => (
                          <option key={symbol.id} value={symbol.symbol}>
                            {symbol.name ? `${symbol.symbol} - ${symbol.name}` : symbol.symbol}
                          </option>
                        ))
                      ) : (
                        <option value="AAPL">AAPL - Apple Inc.</option>
                      )}
                    </datalist>
                  </div>
                )}
              </div>

              {/* Period */}
              <div className="space-y-2">
                <Label htmlFor="period">Period *</Label>
                <Select value={backtestParams.period} onValueChange={handlePeriodChange}>
                  <SelectTrigger id="period">
                    <SelectValue placeholder="Select period">
                      {backtestParams.period === "custom" && backtestParams.customDateFrom && backtestParams.customDateTo
                        ? `${format(backtestParams.customDateFrom, "MMM dd, yyyy")} - ${format(backtestParams.customDateTo, "MMM dd, yyyy")}`
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1week">1 Week</SelectItem>
                    <SelectItem value="1month">1 Month</SelectItem>
                    <SelectItem value="3months">3 Months</SelectItem>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="2years">2 Years</SelectItem>
                    <SelectItem value="5years">5 Years</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Timeframe */}
              <div className="space-y-2">
                <Label htmlFor="timeframe">Timeframe *</Label>
                <Select value={backtestParams.timeframe} onValueChange={(value) => setBacktestParams({ ...backtestParams, timeframe: value })}>
                  <SelectTrigger id="timeframe">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 Minute</SelectItem>
                    <SelectItem value="5m">5 Minutes</SelectItem>
                    <SelectItem value="15m">15 Minutes</SelectItem>
                    <SelectItem value="30m">30 Minutes</SelectItem>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="4h">4 Hours</SelectItem>
                    <SelectItem value="1d">1 Day</SelectItem>
                    <SelectItem value="1w">1 Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Simulation Parameters */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Simulation Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="initialBalance">Initial Balance ($) *</Label>
                  <Input
                    id="initialBalance"
                    type="number"
                    placeholder="e.g., 10000"
                    value={backtestParams.initialBalance}
                    onChange={(e) => setBacktestParams({ ...backtestParams, initialBalance: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Starting capital for the simulation</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lotSize">Lot Size *</Label>
                  <Input
                    id="lotSize"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 0.1, 1.0"
                    value={backtestParams.lotSize}
                    onChange={(e) => setBacktestParams({ ...backtestParams, lotSize: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Position size per trade (standard lot = 1.0)</p>
                </div>
              </div>
            </div>

            {/* Advanced Parameters */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground">Advanced Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="commission">Commission *</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.0001"
                    placeholder="e.g., 0.001"
                    value={backtestParams.commission}
                    onChange={(e) => setBacktestParams({ ...backtestParams, commission: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Commission rate per trade (e.g., 0.001 = 0.1%)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slippage">Slippage *</Label>
                  <Input
                    id="slippage"
                    type="number"
                    step="0.0001"
                    placeholder="e.g., 0.0005"
                    value={backtestParams.slippage}
                    onChange={(e) => setBacktestParams({ ...backtestParams, slippage: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Expected slippage per trade (e.g., 0.0005 = 0.05%)</p>
                </div>
              </div>
            </div>

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

        {/* Real-time Chart - Shows during and after backtest */}
        {(isStreaming || hasResults) && backtestParams.symbol && (
          <RealtimeBacktestChart
            symbol={backtestParams.symbol}
            isStreaming={isStreaming}
            config={{
              symbol: backtestParams.symbol,
              period: backtestParams.period,
              interval: backtestParams.timeframe, // Use timeframe as interval
              initial_balance: parseFloat(backtestParams.initialBalance),
              commission: parseFloat(backtestParams.commission),
              slippage: parseFloat(backtestParams.slippage),
              indicators: backtestParams.indicators || {},
              strategy_code: strategy?.strategy_code, // Pass strategy code for execution
            }}
            onComplete={handleStreamingComplete}
          />
        )}
      </div>

      {/* Floating Edit Button */}
      <Button
        onClick={handleEditStrategy}
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg bg-transparent border-2 border-primary hover:bg-primary hover:scale-125 transition-all duration-300 group"
        size="icon"
      >
        <Edit className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
      </Button>

      {/* Custom Date Range Dialog */}
      <Dialog open={showCustomDateDialog} onOpenChange={setShowCustomDateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {customDateStep === "from" ? "Select Start Date" : "Select End Date"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <Calendar
              mode="single"
              selected={customDateStep === "from" ? tempFromDate : backtestParams.customDateTo}
              onSelect={handleCustomDateSelect}
              month={currentCalendarDate}
              onMonthChange={setCurrentCalendarDate}
              disabled={(date) => {
                if (customDateStep === "to" && tempFromDate) {
                  return date < tempFromDate;
                }
                return date > new Date();
              }}
              initialFocus
              className="rounded-md border"
              components={{
                Caption: ({ displayMonth }) => (
                  <div className="flex justify-center pt-1 relative items-center mb-2">
                    <div 
                      className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
                      onClick={handleOpenMonthYearPicker}
                    >
                      {format(displayMonth, "MMMM yyyy")}
                    </div>
                  </div>
                )
              }}
            />
            {customDateStep === "to" && tempFromDate && (
              <div className="text-sm text-muted-foreground">
                From: {format(tempFromDate, "MMM dd, yyyy")}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Month/Year Picker Dialog */}
      <Dialog open={showMonthYearPicker} onOpenChange={setShowMonthYearPicker}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle>Select Month and Year</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Year Selector */}
            <div className="space-y-2">
              <Label>Year</Label>
              <Select 
                value={tempYear.toString()} 
                onValueChange={(value) => setTempYear(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: new Date().getFullYear() - 2015 + 1 }, (_, i) => 2015 + i).reverse().map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month Selector */}
            <div className="space-y-2">
              <Label>Month</Label>
              <Select 
                value={tempMonth.toString()} 
                onValueChange={(value) => setTempMonth(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                  ].map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Confirm Button */}
            <Button 
              onClick={handleMonthYearConfirm}
              className="w-full"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
