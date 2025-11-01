import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Play, BarChart3, PieChart, Edit, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { symbolService, strategyService, backtestService, type Symbol, type Strategy } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";

interface BacktestParams {
  symbol: string;
  period: string;
  timeframe: string;
  useRealMoney: boolean;
  lotSize: string;
  initialBalance: string;
  commission: string;
  slippage: string;
  customDateFrom?: Date;
  customDateTo?: Date;
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
  const { toast } = useToast();
  const strategyId = location.state?.strategyId;
  const strategyName = location.state?.strategyName || "Strategy";
  const backtestConfig = location.state?.backtestConfig; // NEW: Get config from Strategy page

  // State for fetched data
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loadingSymbols, setLoadingSymbols] = useState(true);
  const [loadingStrategy, setLoadingStrategy] = useState(true);

  const [params, setParams] = useState<BacktestParams>({
    symbol: backtestConfig?.symbol || "",
    period: backtestConfig?.period || "",
    timeframe: backtestConfig?.interval || "",
    useRealMoney: false,
    lotSize: "1.0",
    initialBalance: backtestConfig?.initialCapital?.toString() || "10000",
    commission: "0.001",
    slippage: "0.0005"
  });

  const [isRunning, setIsRunning] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [results, setResults] = useState<BacktestResults | null>(null);
  const [showCustomDateDialog, setShowCustomDateDialog] = useState(false);
  const [customDateStep, setCustomDateStep] = useState<"from" | "to">("from");
  const [tempFromDate, setTempFromDate] = useState<Date | undefined>(undefined);
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [tempYear, setTempYear] = useState<number>(new Date().getFullYear());
  const [tempMonth, setTempMonth] = useState<number>(new Date().getMonth());
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());

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
        setLoadingStrategy(false);
        return;
      }

      setLoadingStrategy(true);
      const { data, error } = await strategyService.getById(strategyId);
      
      if (error) {
        toast({
          title: "Error loading strategy",
          description: error,
          variant: "destructive",
        });
      } else if (data) {
        setStrategy(data);
      }
      setLoadingStrategy(false);
    };

    fetchStrategy();
  }, [strategyId, toast]);

  // Auto-run backtest if config is provided from Strategy page
  useEffect(() => {
    if (backtestConfig && !loadingSymbols && !loadingStrategy && params.symbol) {
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
      setParams({ ...params, period: value, customDateFrom: undefined, customDateTo: undefined });
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

  const handleCustomDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (customDateStep === "from") {
      setTempFromDate(date);
      setCustomDateStep("to");
    } else {
      // Step is "to"
      setParams({ 
        ...params, 
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
    if (!params.symbol || !params.period || !params.timeframe) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (params.useRealMoney && (!params.lotSize || !params.initialBalance)) {
      toast({
        title: "Missing fields",
        description: "Please enter lot size and initial balance for real money simulation",
        variant: "destructive",
      });
      return;
    }

  if (!strategy?.strategy_code && !strategyId) {
      toast({
        title: "Strategy not found",
        description: "Strategy code is required to run backtest",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setHasResults(false);

    try {
      // Calculate date range based on period
      const endDate = params.customDateTo || new Date();
      let startDate = params.customDateFrom;
      
      if (!startDate && params.period !== "custom") {
        const daysMap: { [key: string]: number } = {
          "1week": 7,
          "1month": 30,
          "3months": 90,
          "6months": 180,
          "1year": 365,
          "2years": 730,
        };
        const days = daysMap[params.period] || 30;
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
        symbol: params.symbol,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        timeframe: params.timeframe,
        initial_balance: parseFloat(params.initialBalance) || 10000,
        lot_size: parseFloat(params.lotSize) || 1.0,
        commission: parseFloat(params.commission) || 0.001,
        slippage: parseFloat(params.slippage) || 0.0005,
      };

      // Run backtest using the API
      const { data, error } = await backtestService.quickRun(backtestConfig);

      if (error) {
        throw new Error(error);
      }

      if (data) {
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
        
        toast({
          title: "Backtest completed",
          description: `Successfully ran backtest with ${transformedResults.summary.totalTrades} trades`,
        });
      }
    } catch (error) {
      console.error('Backtest failed:', error);
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
                      value={params.symbol}
                      onChange={(e) => setParams({ ...params, symbol: e.target.value.toUpperCase() })}
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
                <Select value={params.period} onValueChange={handlePeriodChange}>
                  <SelectTrigger id="period">
                    <SelectValue placeholder="Select period">
                      {params.period === "custom" && params.customDateFrom && params.customDateTo
                        ? `${format(params.customDateFrom, "MMM dd, yyyy")} - ${format(params.customDateTo, "MMM dd, yyyy")}`
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
                <Select value={params.timeframe} onValueChange={(value) => setParams({ ...params, timeframe: value })}>
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

            {/* Simulation Mode */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="realMoney" 
                  checked={params.useRealMoney}
                  onCheckedChange={(checked) => setParams({ ...params, useRealMoney: checked as boolean })}
                />
                <Label 
                  htmlFor="realMoney" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Simulate using real money (otherwise results in pips)
                </Label>
              </div>

              {/* Real Money Parameters */}
              {params.useRealMoney && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6 border-l-2 border-primary/20">
                  <div className="space-y-2">
                    <Label htmlFor="lotSize">Lot Size *</Label>
                    <Input
                      id="lotSize"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 0.1, 1.0"
                      value={params.lotSize}
                      onChange={(e) => setParams({ ...params, lotSize: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="initialBalance">Initial Balance *</Label>
                    <Input
                      id="initialBalance"
                      type="number"
                      placeholder="e.g., 10000"
                      value={params.initialBalance}
                      onChange={(e) => setParams({ ...params, initialBalance: e.target.value })}
                    />
                  </div>
                </div>
              )}
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
                    value={params.commission}
                    onChange={(e) => setParams({ ...params, commission: e.target.value })}
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
                    value={params.slippage}
                    onChange={(e) => setParams({ ...params, slippage: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Expected slippage per trade (e.g., 0.0005 = 0.05%)</p>
                </div>
              </div>
            </div>

            {/* Run Button */}
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleRunBacktest}
                disabled={isRunning || loadingStrategy}
                className="bg-gradient-primary min-w-[200px]"
              >
                {isRunning ? (
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

        {/* Backtest Results - Lower Half */}
        {hasResults && results && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-card border-border shadow-card">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Trades</p>
                    <p className="text-3xl font-bold text-foreground">{results.summary.totalTrades}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-card">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
                    <p className="text-3xl font-bold text-green-500">{results.summary.winRate}%</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-card">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Profit</p>
                    <p className={cn(
                      "text-3xl font-bold",
                      results.summary.totalProfit >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {params.useRealMoney ? `$${results.summary.totalProfit}` : `${results.summary.totalProfit} pips`}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-card">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Avg Trade</p>
                    <p className="text-3xl font-bold text-foreground">
                      {params.useRealMoney ? `$${results.summary.averageTrade}` : `${results.summary.averageTrade} pips`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Statistics Bar Chart */}
              <Card className="bg-card border-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Daily Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.dailyStats.map((day, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium text-foreground">{day.day}</span>
                          <span className={cn(
                            "font-semibold",
                            day.profit >= 0 ? "text-green-500" : "text-red-500"
                          )}>
                            {params.useRealMoney ? `$${day.profit}` : `${day.profit} pips`} ({day.trades} trades)
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              day.profit >= 0 ? "bg-green-500" : "bg-red-500"
                            )}
                            style={{ 
                              width: `${Math.min(Math.abs(day.profit) / 3, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Symbol Statistics Pie Chart */}
              <Card className="bg-card border-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Symbol Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Pie Chart Representation */}
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative w-48 h-48">
                        {/* Simple pie chart visualization using gradients */}
                        <svg viewBox="0 0 100 100" className="transform -rotate-90">
                          {results.symbolStats.reduce((acc, symbol, index) => {
                            const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
                            const startAngle = acc.angle;
                            const angle = (symbol.percentage / 100) * 360;
                            const endAngle = startAngle + angle;
                            
                            const x1 = 50 + 45 * Math.cos((startAngle * Math.PI) / 180);
                            const y1 = 50 + 45 * Math.sin((startAngle * Math.PI) / 180);
                            const x2 = 50 + 45 * Math.cos((endAngle * Math.PI) / 180);
                            const y2 = 50 + 45 * Math.sin((endAngle * Math.PI) / 180);
                            
                            const largeArc = angle > 180 ? 1 : 0;
                            
                            acc.paths.push(
                              <path
                                key={index}
                                d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                fill={colors[index % colors.length]}
                                opacity="0.8"
                              />
                            );
                            
                            acc.angle = endAngle;
                            return acc;
                          }, { angle: 0, paths: [] as JSX.Element[] }).paths}
                        </svg>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-3">
                      {results.symbolStats.map((symbol, index) => {
                        const colors = ["bg-blue-500", "bg-green-500", "bg-orange-500", "bg-red-500"];
                        return (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-3 h-3 rounded-full", colors[index % colors.length])} />
                              <span className="text-sm font-medium text-foreground">{symbol.symbol}</span>
                            </div>
                            <div className="text-right">
                              <p className={cn(
                                "text-sm font-semibold",
                                symbol.profit >= 0 ? "text-green-500" : "text-red-500"
                              )}>
                                {params.useRealMoney ? `$${symbol.profit}` : `${symbol.profit} pips`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {symbol.trades} trades ({symbol.percentage}%)
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
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
              selected={customDateStep === "from" ? tempFromDate : params.customDateTo}
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
