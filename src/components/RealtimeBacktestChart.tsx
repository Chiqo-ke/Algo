import { useEffect, useRef, useState, useCallback } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Customized,
  Brush,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Activity, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface CandleData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradeSignal {
  timestamp: string;
  type: "entry" | "exit";
  side: "buy" | "sell";
  price: number;
  size: number;
}

// Completed trade with entry and exit information
interface CompletedTrade {
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnl: number;
  side: "buy" | "sell";
}

interface BacktestConfig {
  symbol: string;
  period: string;
  interval: string;
  initial_balance: number;
  commission: number;
  slippage: number;
  indicators?: Record<string, any>;
  strategy_code?: string;
}

interface BacktestResults {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  pnl: number;
  maxDrawdown?: number;
  sharpeRatio?: number;
  finalEquity?: number;
  trades?: TradeSignal[];
}

interface RealtimeChartProps {
  symbol: string;
  isStreaming: boolean;
  config: BacktestConfig;
  onComplete?: (results: BacktestResults) => void;
}

export function RealtimeBacktestChart({ symbol, isStreaming, config, onComplete }: RealtimeChartProps) {
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [completedTrades, setCompletedTrades] = useState<CompletedTrade[]>([]);
  const [currentBar, setCurrentBar] = useState(0);
  const [totalBars, setTotalBars] = useState(0);
  const [stats, setStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    pnl: 0,
  });
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Use refs to avoid unnecessary WebSocket reconnections
  const onCompleteRef = useRef(onComplete);
  const configRef = useRef(config);
  
  // Update refs when props change
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  
  useEffect(() => {
    configRef.current = config;
  }, [config]);
  
  // Zoom and scroll state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [brushStartIndex, setBrushStartIndex] = useState<number | undefined>(undefined);
  const [brushEndIndex, setBrushEndIndex] = useState<number | undefined>(undefined);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev * 1.5, 5)); // Max 5x zoom
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.5)); // Min 0.5x zoom
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
    setBrushStartIndex(undefined);
    setBrushEndIndex(undefined);
  }, []);

  // Handle brush change for scrolling
  const handleBrushChange = useCallback((data: { startIndex?: number; endIndex?: number }) => {
    if (data.startIndex !== undefined && data.endIndex !== undefined) {
      setBrushStartIndex(data.startIndex);
      setBrushEndIndex(data.endIndex);
    }
  }, []);

  // Auto-scroll to keep the latest candle visible
  useEffect(() => {
    if (chartRef.current && candleData.length > 0) {
      chartRef.current.scrollLeft = chartRef.current.scrollWidth;
    }
  }, [candleData.length]);

  // Connect to WebSocket for streaming data
  useEffect(() => {
    if (!isStreaming) {
      console.log("⏸️ Not streaming, skipping WebSocket connection");
      return;
    }
    
    // Clear previous state when starting a new stream
    setCandleData([]);
    setSignals([]);
    setCompletedTrades([]);
    setCurrentBar(0);
    setTotalBars(0);
    setStats({
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      pnl: 0,
    });

    const ws = new WebSocket(
      `${import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000"}/ws/backtest/stream/`
    );

    ws.onopen = () => {
      console.log("📡 WebSocket connected for real-time backtest");
      
      // Send backtest configuration to start streaming
      ws.send(JSON.stringify({
        action: "start_backtest",
        config: configRef.current
      }));
      
      console.log("📤 Sent backtest config:", configRef.current);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "metadata") {
        // Initial metadata
        setTotalBars(data.total_bars);
        console.log(`📊 Backtest starting: ${data.total_bars} bars to process`);
      } else if (data.type === "candle") {
        // New candle data
        const newCandle: CandleData = {
          timestamp: data.timestamp,
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          volume: data.volume,
        };
        setCandleData((prev) => [...prev, newCandle]);
        setCurrentBar(data.bar_number);
      } else if (data.type === "signal") {
        // Trade signal
        const newSignal: TradeSignal = {
          timestamp: data.timestamp,
          type: data.action.toLowerCase() as "entry" | "exit",
          side: data.side.toLowerCase() as "buy" | "sell",
          price: data.price,
          size: data.size,
        };
        setSignals((prev) => [...prev, newSignal]);
        console.log(`${newSignal.type === "entry" ? "🟢" : "🔴"} ${newSignal.side.toUpperCase()} @ $${newSignal.price}`);
      } else if (data.type === "stats") {
        // Update statistics
        setStats({
          totalTrades: data.total_trades,
          winningTrades: data.winning_trades,
          losingTrades: data.losing_trades,
          pnl: data.pnl,
        });
        console.log(`📊 Stats update: ${data.total_trades} trades, PnL: $${data.pnl?.toFixed(2)}`);
      } else if (data.type === "complete") {
        // Backtest completed - also update stats from metrics if available
        console.log("✅ Backtest completed", data.metrics);
        const finalStats = {
          totalTrades: data.metrics?.total_trades || stats.totalTrades,
          winningTrades: data.metrics?.winning_trades || stats.winningTrades,
          losingTrades: data.metrics?.losing_trades || stats.losingTrades,
          pnl: data.metrics?.net_profit || stats.pnl,
        };
        if (data.metrics) {
          setStats(finalStats);
        }
        
        // Process completed trades for visualization
        if (data.trades && Array.isArray(data.trades)) {
          const trades: CompletedTrade[] = data.trades.map((t: any) => ({
            entryTime: t.entry_time,
            exitTime: t.exit_time,
            entryPrice: t.entry_price,
            exitPrice: t.exit_price,
            size: t.size,
            pnl: t.pnl,
            side: t.size > 0 ? "buy" : "sell",
          }));
          setCompletedTrades(trades);
          console.log(`📊 Loaded ${trades.length} completed trades for visualization`);
        }
        
        // Pass final results to parent
        const winRate = finalStats.totalTrades > 0 
          ? (finalStats.winningTrades / finalStats.totalTrades) * 100 
          : 0;
        onCompleteRef.current?.({
          totalTrades: finalStats.totalTrades,
          winningTrades: finalStats.winningTrades,
          losingTrades: finalStats.losingTrades,
          winRate: winRate,
          pnl: finalStats.pnl,
          maxDrawdown: data.metrics?.max_drawdown,
          sharpeRatio: data.metrics?.sharpe_ratio,
          finalEquity: data.metrics?.final_equity,
          trades: signals,
        });
      } else if (data.type === "error") {
        console.error("❌ Backtest error:", data.message);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("📡 WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, [isStreaming]); // Only reconnect when isStreaming changes

  // Transform candle data for Recharts - using OHLC bar representation
  const chartData = candleData.map((candle, index) => {
    const isGreen = candle.close >= candle.open;
    const date = new Date(candle.timestamp);
    // Format based on data density - for daily data show date, for intraday show time
    const formattedTimestamp = candleData.length > 100 
      ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    return {
      index: index,
      timestamp: formattedTimestamp,
      date: candle.timestamp,
      // For candlestick body (from open to close)
      open: candle.open,
      close: candle.close,
      high: candle.high,
      low: candle.low,
      // Body positioning - always draw from lower to higher
      bodyBase: Math.min(candle.open, candle.close),
      bodyHeight: Math.abs(candle.close - candle.open),
      // Wick positioning
      wickLow: candle.low,
      wickHigh: candle.high,
      volume: candle.volume,
      // Color indicator
      isGreen: isGreen,
      fill: isGreen ? "#10b981" : "#ef4444",
    };
  });

  // Calculate Y-axis domain with padding
  const priceValues = chartData.flatMap(d => [d.high, d.low]);
  const minPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0;
  const maxPrice = priceValues.length > 0 ? Math.max(...priceValues) : 100;
  const pricePadding = (maxPrice - minPrice) * 0.1 || 1;
  const yDomain: [number, number] = [minPrice - pricePadding, maxPrice + pricePadding];

  // Custom Candlestick renderer component for Recharts Customized
  const CandlestickSeries = (props: any) => {
    const { xAxisMap, yAxisMap, offset, width: chartWidth } = props;
    
    if (!xAxisMap || !yAxisMap || chartData.length === 0) {
      return null;
    }
    
    // Get the scales from Recharts
    const xAxis = Object.values(xAxisMap)[0] as any;
    const yAxis = yAxisMap?.price;
    
    if (!xAxis?.scale || !yAxis?.scale) {
      return null;
    }
    
    const xScale = xAxis.scale;
    const yScale = yAxis.scale;
    
    // Calculate bandwidth - for band scales use bandwidth(), otherwise calculate from chart width
    let bandwidth: number;
    if (typeof xScale.bandwidth === 'function') {
      bandwidth = xScale.bandwidth();
    } else {
      // For point/ordinal scales, calculate based on chart area
      const chartArea = chartWidth - 50; // Approximate margin
      bandwidth = Math.max(chartArea / chartData.length, 4);
    }
    
    return (
      <g className="candlestick-series">
        {chartData.map((candle, index) => {
          const color = candle.isGreen ? "#10b981" : "#ef4444";
          let x = xScale(candle.timestamp);
          
          if (x === undefined || x === null || isNaN(x)) {
            // Fallback: calculate x position manually
            const chartArea = chartWidth - 50;
            x = 20 + (index / chartData.length) * chartArea;
          }
          
          const highY = yScale(candle.high);
          const lowY = yScale(candle.low);
          const openY = yScale(candle.open);
          const closeY = yScale(candle.close);
          
          // Validate Y values
          if (isNaN(highY) || isNaN(lowY) || isNaN(openY) || isNaN(closeY)) {
            return null;
          }
          
          const bodyTop = Math.min(openY, closeY);
          const bodyBottom = Math.max(openY, closeY);
          const bodyHeight = Math.max(bodyBottom - bodyTop, 1);
          
          const candleWidth = Math.max(bandwidth * 0.7, 4);
          const centerX = x + bandwidth / 2;
          
          return (
            <g key={`candle-${index}`}>
              {/* Wick (high to low) */}
              <line
                x1={centerX}
                y1={highY}
                x2={centerX}
                y2={lowY}
                stroke={color}
                strokeWidth={1}
              />
              {/* Body */}
              <rect
                x={centerX - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={color}
                stroke={color}
                strokeWidth={1}
              />
            </g>
          );
        })}
      </g>
    );
  };

  // Custom Trade Zones renderer - shows entry→exit rectangles with TP (green) and SL (red) zones
  const TradeZonesRenderer = (props: any) => {
    const { xAxisMap, yAxisMap, width: chartWidth } = props;
    
    if (!xAxisMap || !yAxisMap || chartData.length === 0 || completedTrades.length === 0) {
      return null;
    }
    
    const xAxis = Object.values(xAxisMap)[0] as any;
    const yAxis = yAxisMap?.price;
    
    if (!xAxis?.scale || !yAxis?.scale) {
      return null;
    }
    
    const xScale = xAxis.scale;
    const yScale = yAxis.scale;
    
    // Create a map of timestamps to chart indices for faster lookup
    const timestampToIndex = new Map<string, number>();
    chartData.forEach((candle, index) => {
      // Store both the display timestamp and the original date
      timestampToIndex.set(candle.timestamp, index);
      timestampToIndex.set(candle.date, index);
    });
    
    // Calculate bandwidth
    let bandwidth: number;
    if (typeof xScale.bandwidth === 'function') {
      bandwidth = xScale.bandwidth();
    } else {
      const chartArea = chartWidth - 50;
      bandwidth = Math.max(chartArea / chartData.length, 4);
    }
    
    return (
      <g className="trade-zones">
        {completedTrades.map((trade, index) => {
          // Find entry and exit candle indices
          const entryTimestamp = new Date(trade.entryTime).toLocaleTimeString();
          const exitTimestamp = new Date(trade.exitTime).toLocaleTimeString();
          
          let entryIndex = timestampToIndex.get(entryTimestamp);
          let exitIndex = timestampToIndex.get(exitTimestamp);
          
          // Fallback: try original timestamps
          if (entryIndex === undefined) {
            entryIndex = timestampToIndex.get(trade.entryTime);
          }
          if (exitIndex === undefined) {
            exitIndex = timestampToIndex.get(trade.exitTime);
          }
          
          // If still not found, try to find closest match
          if (entryIndex === undefined || exitIndex === undefined) {
            const entryDate = new Date(trade.entryTime).getTime();
            const exitDate = new Date(trade.exitTime).getTime();
            
            chartData.forEach((candle, idx) => {
              const candleDate = new Date(candle.date).getTime();
              if (entryIndex === undefined && Math.abs(candleDate - entryDate) < 60000) {
                entryIndex = idx;
              }
              if (exitIndex === undefined && Math.abs(candleDate - exitDate) < 60000) {
                exitIndex = idx;
              }
            });
          }
          
          if (entryIndex === undefined || exitIndex === undefined) {
            return null;
          }
          
          const entryCandle = chartData[entryIndex];
          const exitCandle = chartData[exitIndex];
          
          if (!entryCandle || !exitCandle) return null;
          
          // Calculate X positions
          let entryX = xScale(entryCandle.timestamp);
          let exitX = xScale(exitCandle.timestamp);
          
          if (isNaN(entryX) || entryX === undefined) {
            const chartArea = chartWidth - 50;
            entryX = 20 + (entryIndex / chartData.length) * chartArea;
          }
          if (isNaN(exitX) || exitX === undefined) {
            const chartArea = chartWidth - 50;
            exitX = 20 + (exitIndex / chartData.length) * chartArea;
          }
          
          // Rectangle spans from entry to exit on X-axis
          const rectX = entryX;
          const rectWidth = Math.max(exitX - entryX + bandwidth, bandwidth);
          
          // Y positions based on entry and exit prices
          const entryY = yScale(trade.entryPrice);
          const exitY = yScale(trade.exitPrice);
          
          if (isNaN(entryY) || isNaN(exitY)) return null;
          
          const isWinningTrade = trade.pnl > 0;
          const isLong = trade.size > 0;
          
          // For a long trade:
          //   - If winning: price went up, so green zone from entry to exit (above entry)
          //   - If losing: price went down, so red zone from entry to exit (below entry)
          // For a short trade:
          //   - If winning: price went down, so green zone from entry to exit (below entry)
          //   - If losing: price went up, so red zone from entry to exit (above entry)
          
          const topY = Math.min(entryY, exitY);
          const height = Math.abs(exitY - entryY);
          
          // Determine colors based on trade outcome
          const fillColor = isWinningTrade ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)";
          const strokeColor = isWinningTrade ? "#10b981" : "#ef4444";
          
          return (
            <g key={`trade-zone-${index}`}>
              {/* Trade zone rectangle */}
              <rect
                x={rectX}
                y={topY}
                width={rectWidth}
                height={Math.max(height, 2)}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={1}
                strokeDasharray="4 2"
                opacity={0.7}
              />
              {/* Entry line */}
              <line
                x1={rectX}
                y1={entryY}
                x2={rectX + rectWidth}
                y2={entryY}
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="4 2"
              />
              {/* Exit line */}
              <line
                x1={rectX}
                y1={exitY}
                x2={rectX + rectWidth}
                y2={exitY}
                stroke={strokeColor}
                strokeWidth={2}
              />
              {/* Entry marker */}
              <circle
                cx={entryX + bandwidth / 2}
                cy={entryY}
                r={4}
                fill="#3b82f6"
                stroke="#fff"
                strokeWidth={1}
              />
              {/* Exit marker */}
              <circle
                cx={exitX + bandwidth / 2}
                cy={exitY}
                r={4}
                fill={strokeColor}
                stroke="#fff"
                strokeWidth={1}
              />
            </g>
          );
        })}
      </g>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isGreen = data.close >= data.open;
      const formattedDate = new Date(data.date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-xs text-muted-foreground mb-2">{formattedDate}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Open:</span>
              <span className="font-mono">${data.open.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">High:</span>
              <span className="font-mono text-green-500">${data.high.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Low:</span>
              <span className="font-mono text-red-500">${data.low.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Close:</span>
              <span className={`font-mono ${isGreen ? "text-green-500" : "text-red-500"}`}>
                ${data.close.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-border">
              <span className="text-muted-foreground">Volume:</span>
              <span className="font-mono">{data.volume.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const progress = totalBars > 0 ? (currentBar / totalBars) * 100 : 0;
  const winRate = stats.totalTrades > 0 ? (stats.winningTrades / stats.totalTrades) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentBar} / {totalBars} bars
            </p>
            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Total Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrades}</div>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                {stats.winningTrades} wins
              </Badge>
              <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500 border-red-500/20">
                {stats.losingTrades} losses
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${winRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {stats.pnl >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.pnl >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              ${stats.pnl.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pnl >= 0 ? "Profit" : "Loss"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {symbol} - Real-time Backtest
              {isStreaming && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  Streaming
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-4">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 border border-border rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                  className="h-7 w-7 p-0"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground px-2 min-w-[3rem] text-center">
                  {(zoomLevel * 100).toFixed(0)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 5}
                  className="h-7 w-7 p-0"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetZoom}
                  className="h-7 w-7 p-0"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              {/* Legend */}
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span>Long Entry</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span>Short Entry</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span>Exit</span>
                </div>
                {completedTrades.length > 0 && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-green-500 bg-green-500/20 rounded" />
                      <span>Win Zone</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-red-500 bg-red-500/20 rounded" />
                      <span>Loss Zone</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="w-full h-[400px] flex items-center justify-center bg-muted/20 rounded-lg border border-dashed border-muted-foreground/30">
              <div className="text-center space-y-2">
                <Activity className="w-12 h-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {isStreaming ? "Waiting for candle data..." : "No chart data available"}
                </p>
                {isStreaming && (
                  <p className="text-sm text-muted-foreground/70">
                    Candles will appear as the backtest streams data
                  </p>
                )}
              </div>
            </div>
          ) : (
          <div ref={chartRef} className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={450} minWidth={Math.max(800, chartData.length * 10 * zoomLevel)}>
              <ComposedChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 30 }}>
                <defs>
                  {/* Arrow markers for buy/sell signals */}
                  <marker
                    id="arrowBuy"
                    markerWidth="10"
                    markerHeight="10"
                    refX="5"
                    refY="5"
                    orient="auto"
                  >
                    <path d="M 0 5 L 5 0 L 10 5 L 5 3 Z" fill="#10b981" />
                  </marker>
                  <marker
                    id="arrowSell"
                    markerWidth="10"
                    markerHeight="10"
                    refX="5"
                    refY="5"
                    orient="auto"
                  >
                    <path d="M 0 5 L 5 10 L 10 5 L 5 7 Z" fill="#ef4444" />
                  </marker>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                <XAxis
                  dataKey="timestamp"
                  stroke="#888"
                  fontSize={12}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#888"
                  fontSize={12}
                  tickLine={false}
                  domain={yDomain}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                  yAxisId="price"
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Trade zones - entry to exit rectangles */}
                <Customized component={TradeZonesRenderer} />
                
                {/* Candlesticks using Customized component */}
                <Customized component={CandlestickSeries} />
                
                {/* Fallback close price line (visible if candlesticks don't render) */}
                <Line
                  type="monotone"
                  dataKey="close"
                  yAxisId="price"
                  stroke="#6366f1"
                  strokeWidth={1}
                  dot={false}
                  isAnimationActive={false}
                  opacity={0.3}
                />

                {/* Trade signal arrows */}
                {signals.map((signal, index) => {
                  const matchingCandle = chartData.find((c) => c.date === signal.timestamp);
                  if (!matchingCandle) return null;

                  // Position arrows above (buy) or below (sell) the candle
                  const isEntry = signal.type === "entry";
                  const isBuy = signal.side === "buy";
                  const offset = matchingCandle.high * 0.005; // 0.5% offset
                  const arrowY = isBuy 
                    ? matchingCandle.low - offset 
                    : matchingCandle.high + offset;
                  
                  let color = "#3b82f6"; // blue for exits
                  let label = "✕";
                  
                  if (isEntry) {
                    if (isBuy) {
                      color = "#10b981";
                      label = "↑";
                    } else {
                      color = "#ef4444";
                      label = "↓";
                    }
                  }

                  return (
                    <ReferenceDot
                      key={`signal-${index}`}
                      x={matchingCandle.timestamp}
                      y={arrowY}
                      yAxisId="price"
                      r={8}
                      fill={color}
                      stroke="#fff"
                      strokeWidth={2}
                      label={{
                        value: label,
                        fill: "#fff",
                        fontSize: 14,
                        fontWeight: "bold",
                        position: "center",
                      }}
                    />
                  );
                })}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          )}

          {/* Signal Log */}
          {signals.length > 0 && (
            <div className="mt-4 max-h-40 overflow-y-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left p-2 font-medium">Time</th>
                    <th className="text-left p-2 font-medium">Type</th>
                    <th className="text-left p-2 font-medium">Side</th>
                    <th className="text-right p-2 font-medium">Price</th>
                    <th className="text-right p-2 font-medium">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {signals.slice(-10).reverse().map((signal, index) => (
                    <tr key={index} className="border-t border-border hover:bg-muted/30">
                      <td className="p-2 font-mono text-xs">
                        {new Date(signal.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-2">
                        <Badge
                          variant="outline"
                          className={
                            signal.type === "entry"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          }
                        >
                          {signal.type}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge
                          variant="outline"
                          className={
                            signal.side === "buy"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                          }
                        >
                          {signal.side}
                        </Badge>
                      </td>
                      <td className="p-2 text-right font-mono">${signal.price.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono">{signal.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
