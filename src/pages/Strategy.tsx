import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, TrendingDown, Activity, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { strategyService, type Strategy as StrategyType } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";

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
      console.log("📡 Fetching strategies from API...");
      const { data, error } = await strategyService.getAll();
      
      if (error) {
        console.error("❌ Error fetching strategies:", error);
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
          console.error("❌ Expected array of strategies, got:", strategiesList);
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
        
        console.log("✅ Loaded strategies from API:", transformedStrategies);
        setStrategies(transformedStrategies);
      }
      setLoading(false);
    };

    fetchStrategies();
  }, [toast]);

  const handleAddStrategy = () => {
    console.log("Add new strategy");
    // This will later open a dialog or navigate to strategy creation
  };

  const handleTest = (strategyId: number, strategyName: string) => {
    // Navigate directly to backtesting page where user can enter configuration
    navigate(`/backtesting/${strategyId}`, {
      state: {
        strategyId: strategyId,
        strategyName: strategyName,
      },
    });
  };

  const handleGoLive = (strategyId: number) => {
    console.log("Go live with strategy:", strategyId);
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
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-card-foreground">
                      {strategy.name}
                    </CardTitle>
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
                      onClick={() => handleTest(strategy.id, strategy.name)}
                      disabled={strategy.status === "testing"}
                    >
                      Test
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
