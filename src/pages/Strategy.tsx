import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, TrendingDown, Activity, Loader2, Play, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { strategyService, botPerformanceService } from "@/lib/services";
import type { BotPerformance } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

interface Strategy {
  id: number;
  name: string;
  status: "live" | "testing" | "paused";
  performance: number;
  profitLoss: string;
  winRate: string;
  trades: number;
  category?: string;
  description?: string;
}

export default function Strategy() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [highlightedStrategyId, setHighlightedStrategyId] = useState<number | null>(null);
  const [botPerformances, setBotPerformances] = useState<Map<number, BotPerformance>>(new Map());
  const [_loadingPerformance, setLoadingPerformance] = useState(false);

  // Show success message if redirected from Dashboard after strategy creation
  useEffect(() => {
    const state = location.state as { newStrategyId?: number; newStrategyName?: string; showSuccessMessage?: boolean } | null;
    if (state?.showSuccessMessage && state?.newStrategyName) {
      toast({
        title: "Strategy Created Successfully! 🎉",
        description: `${state.newStrategyName} is ready for backtesting`,
      });
      
      // Highlight the new strategy
      if (state.newStrategyId) {
        setHighlightedStrategyId(state.newStrategyId);
        // Clear highlight after 3 seconds
        setTimeout(() => setHighlightedStrategyId(null), 3000);
      }
      
      // Clear the location state to prevent toast on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, toast, navigate]);

  // Fetch strategies from API
  useEffect(() => {
    const fetchStrategies = async () => {
      setLoading(true);
      logger.strategy.info("Fetching strategies from API");
      const startTime = performance.now();
      
      const { data, error } = await strategyService.getAll();
      
      if (error) {
        const duration = Math.round(performance.now() - startTime);
        logger.strategy.error("Failed to fetch strategies", new Error(error), { duration });
        toast({
          title: "Error loading strategies",
          description: error,
          variant: "destructive",
        });
        // Don't load example/mock strategies here — show empty state instead
        setStrategies([]);
      } else if (data) {
        // Handle paginated response - Django REST framework returns {count, next, previous, results}
        const strategiesList = (data as any).results || data;
        
        if (!Array.isArray(strategiesList)) {
          logger.strategy.error("Invalid strategies response format", undefined, { 
            receivedType: typeof strategiesList,
            data: strategiesList 
          });
          setStrategies([]);
          setLoading(false);
          return;
        }
        
        // Transform API data to match UI expectations
        const transformedStrategies: Strategy[] = strategiesList.map((strategy: any) => {
          // Map Django status to UI status
          let uiStatus: "live" | "testing" | "paused" = "paused";
          if (strategy.status === "active") {
            uiStatus = "live";
          } else if (strategy.status === "validating" || strategy.status === "valid") {
            uiStatus = "testing";
          }
          
          // Extract category from tags if available
          const category = Array.isArray(strategy.tags) && strategy.tags.length > 0 
            ? strategy.tags[0] 
            : undefined;
          
          return {
            id: strategy.id,
            name: strategy.name,
            status: uiStatus,
            performance: 0, // Will be populated from backtest results
            profitLoss: "$0",
            winRate: "0%",
            trades: 0,
            category: category,
            description: strategy.description || "",
          };
        });
        
        const duration = Math.round(performance.now() - startTime);
        logger.strategy.info("Successfully loaded strategies", { 
          count: transformedStrategies.length,
          duration
        });
        setStrategies(transformedStrategies);
      }
      setLoading(false);
    };

    fetchStrategies();
  }, [toast]);

  // Fetch bot performance data for all strategies
  useEffect(() => {
    const fetchBotPerformances = async () => {
      if (strategies.length === 0) return;
      
      setLoadingPerformance(true);
      logger.strategy.info("Fetching bot performance data", { strategyCount: strategies.length });
      const startTime = performance.now();
      
      const { data, error } = await botPerformanceService.getAll();
      
      if (data && !error) {
        const performanceMap = new Map<number, BotPerformance>();
        // Handle both paginated and non-paginated responses
        const performances = Array.isArray(data) ? data : (data as any).results || [];
        performances.forEach((perf: BotPerformance) => {
          performanceMap.set(perf.strategy_id, perf);
        });
        setBotPerformances(performanceMap);
        
        const duration = Math.round(performance.now() - startTime);
        logger.strategy.info("Successfully loaded bot performance data", { 
          performanceCount: performanceMap.size,
          duration
        });
      } else if (error) {
        const duration = Math.round(performance.now() - startTime);
        logger.strategy.warn(`Failed to fetch bot performance data: ${error}`, { duration });
      }
      setLoadingPerformance(false);
    };

    fetchBotPerformances();
  }, [strategies]);

  const handleAddStrategy = () => {
    logger.ui.info("User clicked Add Strategy button");
    // This will later open a dialog or navigate to strategy creation
  };

  const handleRunBacktest = (strategyId: number, strategyName: string) => {
    // Get bot performance if available
    const botPerf = botPerformances.get(strategyId);
    
    logger.strategy.info("Navigating to backtest page", { 
      strategyId, 
      strategyName,
      isVerified: botPerf?.is_verified || false
    });
    
    // Navigate to backtesting page with strategy ID in URL AND state
    navigate(`/backtesting/${strategyId}`, {
      state: {
        strategyId: strategyId,  // FIX: Add strategyId to state
        strategyName: strategyName,
        botVerified: botPerf?.is_verified || false,
        botPerformance: botPerf,
      },
    });
  };

  const handleGoLive = (strategyId: number) => {
    logger.strategy.info("User attempted to go live with strategy", { strategyId });
    toast({
      title: "Feature coming soon",
      description: "Live trading will be available in the next version",
    });
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            My Strategies
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor your trading strategies
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          /* Strategy Grid - Centered and wrapping */
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl">
            {/* Strategy Cards */}
            {strategies.map((strategy) => (
              <Card 
                key={strategy.id}
                className={cn(
                  "bg-card border-border shadow-card hover:shadow-lg transition-all",
                  "w-full max-w-sm",
                  highlightedStrategyId === strategy.id && "ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse"
                )}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-card-foreground mb-2">
                        {strategy.name}
                      </CardTitle>
                      {/* Bot Verification Badge */}
                      {(() => {
                        const botPerf = botPerformances.get(strategy.id);
                        if (botPerf) {
                          const badge = botPerf.verification_badge;
                          return (
                            <div className="flex items-center gap-2 mt-1">
                              {botPerf.is_verified ? (
                                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Verified Bot
                                </Badge>
                              ) : botPerf.verification_status === 'testing' ? (
                                <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Testing
                                </Badge>
                              ) : botPerf.verification_status === 'failed' ? (
                                <Badge variant="destructive">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  {badge.label}
                                </Badge>
                              ) : null}
                              {botPerf.is_verified && (
                                <span className="text-xs text-muted-foreground">
                                  {botPerf.win_rate}% WR • {botPerf.total_trades} trades
                                </span>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <Badge 
                      variant={
                        strategy.status === "live" 
                          ? "default" 
                          : strategy.status === "testing"
                          ? "secondary"
                          : "outline"
                      }
                      className={cn(
                        strategy.status === "live" && "bg-green-500 hover:bg-green-600",
                        strategy.status === "testing" && "bg-blue-500 hover:bg-blue-600",
                        strategy.status === "paused" && "bg-gray-500 hover:bg-gray-600"
                      )}
                    >
                      {strategy.status === "live" ? "Live" : strategy.status === "testing" ? "Testing" : "Paused"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Performance</span>
                      <div className="flex items-center gap-1">
                        {strategy.performance >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span 
                          className={cn(
                            "font-semibold text-sm",
                            strategy.performance >= 0 ? "text-green-500" : "text-red-500"
                          )}
                        >
                          {strategy.performance >= 0 ? "+" : ""}{strategy.performance}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">P&L</span>
                      <span 
                        className={cn(
                          "font-semibold text-sm",
                          strategy.profitLoss.startsWith("+") ? "text-green-500" : "text-red-500"
                        )}
                      >
                        {strategy.profitLoss}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Win Rate</span>
                      <span className="font-semibold text-sm">{strategy.winRate}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Trades</span>
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-sm">{strategy.trades}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleRunBacktest(strategy.id, strategy.name)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Run Backtest
                    </Button>
                    <Button 
                      className={cn(
                        "flex-1",
                        strategy.status === "live" 
                          ? "bg-red-500 hover:bg-red-600" 
                          : "bg-green-500 hover:bg-green-600"
                      )}
                      onClick={() => handleGoLive(strategy.id)}
                    >
                      {strategy.status === "live" ? "Pause" : "Go Live"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add Strategy Card */}
            <Card 
              className={cn(
                "bg-card border-border border-dashed shadow-card hover:shadow-lg transition-all cursor-pointer",
                "hover:border-primary/50 w-full max-w-sm",
                "flex items-center justify-center min-h-[320px]"
              )}
              onClick={handleAddStrategy}
            >
              <CardContent className="flex flex-col items-center justify-center p-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Add New Strategy
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  Create a new trading strategy
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        )}

      </div>
    </DashboardLayout>
  );
}
