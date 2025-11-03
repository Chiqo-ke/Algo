import { useEffect, useRef, useState } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

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

interface RealtimeChartProps {
  symbol: string;
  isStreaming: boolean;
  config: BacktestConfig;
  onComplete?: () => void;
}

export function RealtimeBacktestChart({ symbol, isStreaming, config, onComplete }: RealtimeChartProps) {
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [currentBar, setCurrentBar] = useState(0);
  const [totalBars, setTotalBars] = useState(0);
  const [stats, setStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    pnl: 0,
  });
  const chartRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to keep the latest candle visible
  useEffect(() => {
    if (chartRef.current && candleData.length > 0) {
      chartRef.current.scrollLeft = chartRef.current.scrollWidth;
    }
  }, [candleData.length]);

  // Connect to WebSocket for streaming data
  useEffect(() => {
    if (!isStreaming) return;

    const ws = new WebSocket(
      `${import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000"}/ws/backtest/stream/`
    );

    ws.onopen = () => {
      console.log("📡 WebSocket connected for real-time backtest");
      
      // Send backtest configuration to start streaming
      ws.send(JSON.stringify({
        action: "start_backtest",
        config: config
      }));
      
      console.log("📤 Sent backtest config:", config);
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
      } else if (data.type === "complete") {
        // Backtest completed
        console.log("✅ Backtest completed");
        onComplete?.();
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
  }, [isStreaming, onComplete]);

  // Transform candle data for Recharts
  const chartData = candleData.map((candle) => {
    const isGreen = candle.close >= candle.open;
    return {
      timestamp: new Date(candle.timestamp).toLocaleTimeString(),
      date: candle.timestamp,
      // Candlestick body
      bodyLow: Math.min(candle.open, candle.close),
      bodyHigh: Math.max(candle.open, candle.close),
      // Wick
      wickLow: candle.low,
      wickHigh: candle.high,
      // Color
      fill: isGreen ? "#10b981" : "#ef4444",
      // Original values for tooltip
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume,
    };
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isGreen = data.close >= data.open;
      
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-xs text-muted-foreground mb-2">{data.date}</p>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div ref={chartRef} className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={400} minWidth={800}>
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                <XAxis
                  dataKey="timestamp"
                  stroke="#888"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#888"
                  fontSize={12}
                  tickLine={false}
                  domain={["auto", "auto"]}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Candlesticks using Bar chart */}
                <Bar dataKey="bodyHigh" fill="#10b981" isAnimationActive={false}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>

                {/* Trade signals */}
                {signals.map((signal, index) => {
                  const matchingCandle = chartData.find((c) => c.date === signal.timestamp);
                  if (!matchingCandle) return null;

                  let fill = "#3b82f6"; // blue for exits
                  if (signal.type === "entry") {
                    fill = signal.side === "buy" ? "#10b981" : "#ef4444";
                  }

                  return (
                    <ReferenceDot
                      key={`signal-${index}`}
                      x={matchingCandle.timestamp}
                      y={signal.price}
                      r={6}
                      fill={fill}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  );
                })}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

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
