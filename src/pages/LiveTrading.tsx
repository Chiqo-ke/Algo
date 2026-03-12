import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  RefreshCw,
  Settings2,
  Square,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet, apiPost, API_ENDPOINTS } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// ─── Static Data ────────────────────────────────────────────────────────────

const COMMON_SYMBOLS: { label: string; group: string }[] = [
  { label: "EURUSD", group: "Forex" },
  { label: "GBPUSD", group: "Forex" },
  { label: "USDJPY", group: "Forex" },
  { label: "USDCHF", group: "Forex" },
  { label: "AUDUSD", group: "Forex" },
  { label: "USDCAD", group: "Forex" },
  { label: "NZDUSD", group: "Forex" },
  { label: "GBPJPY", group: "Forex" },
  { label: "EURJPY", group: "Forex" },
  { label: "EURGBP", group: "Forex" },
  { label: "XAUUSD", group: "Commodities" },
  { label: "XAGUSD", group: "Commodities" },
  { label: "BTCUSD", group: "Crypto" },
  { label: "ETHUSD", group: "Crypto" },
  { label: "US30", group: "Indices" },
  { label: "US500", group: "Indices" },
  { label: "NAS100", group: "Indices" },
];

const SYMBOL_GROUPS = COMMON_SYMBOLS.reduce(
  (acc, sym) => {
    if (!acc[sym.group]) acc[sym.group] = [];
    acc[sym.group].push(sym.label);
    return acc;
  },
  {} as Record<string, string[]>
);

const TIMEFRAMES = [
  { value: "1m", label: "1 Minute" },
  { value: "5m", label: "5 Minutes" },
  { value: "15m", label: "15 Minutes" },
  { value: "30m", label: "30 Minutes" },
  { value: "1h", label: "1 Hour" },
  { value: "4h", label: "4 Hours" },
  { value: "1d", label: "1 Day" },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface BrokerCredential {
  id: number;
  label: string;
  mt5_login: number;
  mt5_server: string;
  is_default: boolean;
  created_at: string;
}

interface LiveSession {
  id: number;
  strategy: number;
  strategy_name: string;
  status: "PENDING" | "RUNNING" | "STOPPED" | "ERROR";
  symbols: string[];
  timeframe: string;
  dry_run: boolean;
  risk_pct: string;
  pid: number | null;
  created_at: string;
  started_at: string | null;
  stopped_at: string | null;
  error_message: string;
}

interface Position {
  ticket: number;
  symbol: string;
  type: "buy" | "sell";
  volume: number;
  open_price: number;
  current_price: number;
  profit: number;
  swap: number;
  open_time: string;
  comment: string;
  magic?: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LiveTrading() {
  const { strategyId } = useParams<{ strategyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const stratId = strategyId ? parseInt(strategyId) : null;

  // Data state
  const [credentials, setCredentials] = useState<BrokerCredential[]>([]);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  // Loading flags
  const [loadingCredentials, setLoadingCredentials] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [startingSession, setStartingSession] = useState(false);
  const [closingTrade, setClosingTrade] = useState<number | null>(null);
  const [stoppingSession, setStoppingSession] = useState<number | null>(null);
  const [refreshingPositions, setRefreshingPositions] = useState(false);

  // Session activity log
  const [sessionLogs, setSessionLogs] = useState<string[]>([]);
  const [lastActivityAt, setLastActivityAt] = useState<string | null>(null);
  const [sessionAlive, setSessionAlive] = useState(false);

  // Session config form
  const [selectedCredential, setSelectedCredential] = useState<string>("");
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(["EURUSD"]);
  const [customSymbol, setCustomSymbol] = useState("");
  const [timeframe, setTimeframe] = useState("1h");
  const [riskPct, setRiskPct] = useState("1.0");
  const [dryRun, setDryRun] = useState(true);

  // Inline credential entry (used when no saved credentials exist or user chooses manual)
  const [useInlineCreds, setUseInlineCreds] = useState(false);
  const [inlineLogin, setInlineLogin] = useState("");
  const [inlinePassword, setInlinePassword] = useState("");
  const [inlineServer, setInlineServer] = useState("");
  const [inlineTerminalPath, setInlineTerminalPath] = useState("");
  const [showInlinePassword, setShowInlinePassword] = useState(false);
  const [savingInlineCreds, setSavingInlineCreds] = useState(false);

  // Dialogs
  const [confirmLiveDialog, setConfirmLiveDialog] = useState(false);
  const [closeConfirmDialog, setCloseConfirmDialog] = useState<Position | null>(null);

  // Derived
  const activeSession = sessions.find((s) => s.status === "RUNNING");
  const activeSessionId = activeSession?.id ?? null;
  const hasRunningSession = !!activeSession;

  // ─── Data fetchers ─────────────────────────────────────────────────────────

  const fetchCredentials = useCallback(async () => {
    setLoadingCredentials(true);
    const { data, error } = await apiGet<BrokerCredential[] | { results: BrokerCredential[] }>(API_ENDPOINTS.trading.credentials);
    if (!error && data) {
      const list: BrokerCredential[] = Array.isArray(data) ? data : (data as { results: BrokerCredential[] }).results ?? [];
      setCredentials(list);
      const def = list.find((c) => c.is_default);
      if (def) setSelectedCredential(String(def.id));
      else if (list.length > 0) setSelectedCredential(String(list[0].id));
    }
    setLoadingCredentials(false);
  }, []);

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    const { data, error } = await apiGet<LiveSession[] | { results: LiveSession[] }>(API_ENDPOINTS.trading.sessions);
    if (!error && data) {
      const list: LiveSession[] = Array.isArray(data) ? data : (data as { results: LiveSession[] }).results ?? [];
      const filtered = stratId ? list.filter((s) => s.strategy === stratId) : list;
      setSessions(filtered);
    }
    setLoadingSessions(false);
  }, [stratId]);

  const fetchPositions = useCallback(async (sessionId: number) => {
    setLoadingPositions(true);
    const { data } = await apiGet<{ positions: Position[]; warning?: string }>(API_ENDPOINTS.trading.sessionPositions(sessionId));
    setPositions(data?.positions ?? []);
    setLoadingPositions(false);
  }, []);

  const fetchLogs = useCallback(async (sessionId: number) => {
    const { data } = await apiGet<{ lines: string[]; last_modified_at: string | null; is_process_alive: boolean }>(
      API_ENDPOINTS.trading.sessionLogs(sessionId)
    );
    if (data) {
      setSessionLogs(data.lines ?? []);
      setLastActivityAt(data.last_modified_at ?? null);
      setSessionAlive(data.is_process_alive ?? false);
    }
  }, []);

  // ─── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchCredentials();
    fetchSessions();
  }, [fetchCredentials, fetchSessions]);

  // Poll positions every 10 seconds while a session is running
  useEffect(() => {
    if (!activeSessionId) return;
    fetchPositions(activeSessionId);
    const id = setInterval(() => fetchPositions(activeSessionId), 10000);
    return () => clearInterval(id);
  }, [activeSessionId, fetchPositions]);

  // Poll subprocess activity log every 5 seconds while a session is running
  useEffect(() => {
    if (!activeSessionId) {
      setSessionLogs([]);
      setLastActivityAt(null);
      setSessionAlive(false);
      return;
    }
    fetchLogs(activeSessionId);
    const id = setInterval(() => fetchLogs(activeSessionId), 5000);
    return () => clearInterval(id);
  }, [activeSessionId, fetchLogs]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const toggleSymbol = (symbol: string) => {
    if (hasRunningSession) return;
    setSelectedSymbols((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const addCustomSymbol = () => {
    const sym = customSymbol.trim().toUpperCase();
    if (sym && !selectedSymbols.includes(sym)) {
      setSelectedSymbols((prev) => [...prev, sym]);
    }
    setCustomSymbol("");
  };

  const handleStartSession = () => {
    if (stratId === null) {
      toast({
        title: "No strategy selected",
        description: "Navigate to a strategy and click the Live button to start a session.",
        variant: "destructive",
      });
      return;
    }
    const hasCredential = useInlineCreds
      ? inlineLogin.trim() && inlinePassword && inlineServer.trim()
      : !!selectedCredential;
    if (!hasCredential || selectedSymbols.length === 0) {
      toast({
        title: "Missing details",
        description: "Please select at least one symbol and enter your broker credentials",
        variant: "destructive",
      });
      return;
    }
    if (!dryRun) {
      setConfirmLiveDialog(true);
    } else {
      doStartSession();
    }
  };

  const doStartSession = async () => {
    setConfirmLiveDialog(false);
    setStartingSession(true);

    const payload: Record<string, unknown> = {
      strategy_id: stratId,
      symbols: selectedSymbols,
      timeframe,
      dry_run: dryRun,
      risk_pct: parseFloat(riskPct),
    };

    if (useInlineCreds || credentials.length === 0) {
      // Pass inline MT5 credentials directly
      payload.mt5_login = parseInt(inlineLogin);
      payload.mt5_password = inlinePassword;
      payload.mt5_server = inlineServer.trim();
      if (inlineTerminalPath.trim()) payload.mt5_terminal_path = inlineTerminalPath.trim();
    } else {
      payload.credential_id = parseInt(selectedCredential);
    }

    const { data, error } = await apiPost<LiveSession>(API_ENDPOINTS.trading.sessions, payload);

    if (error) {
      toast({ title: "Failed to start session", description: error, variant: "destructive" });
    } else if (data) {
      toast({
        title: "Session started!",
        description: dryRun
          ? "Trading session is running in dry-run mode"
          : "Live trading session is now active",
      });
      await fetchSessions();
    }
    setStartingSession(false);
  };

  const handleStopSession = async (sessionId: number) => {
    setStoppingSession(sessionId);
    const { error } = await apiPost(API_ENDPOINTS.trading.sessionStop(sessionId), {});
    if (error) {
      toast({ title: "Failed to stop session", description: error, variant: "destructive" });
    } else {
      toast({ title: "Session stopped", description: "Trading session has been stopped" });
      setPositions([]);
      await fetchSessions();
    }
    setStoppingSession(null);
  };

  const handleClosePosition = async () => {
    if (!closeConfirmDialog || !activeSessionId) return;
    const { ticket } = closeConfirmDialog;
    setClosingTrade(ticket);
    setCloseConfirmDialog(null);

    const { error } = await apiPost(API_ENDPOINTS.trading.sessionClosePosition(activeSessionId), {
      ticket,
    });
    if (error) {
      toast({ title: "Failed to close trade", description: error, variant: "destructive" });
    } else {
      toast({ title: "Trade closed", description: `Position #${ticket} closed` });
      await fetchPositions(activeSessionId);
    }
    setClosingTrade(null);
  };

  const handleRefreshPositions = async () => {
    if (!activeSessionId) return;
    setRefreshingPositions(true);
    await fetchPositions(activeSessionId);
    setRefreshingPositions(false);
  };

  const handleSaveInlineCreds = async () => {
    setSavingInlineCreds(true);
    const { error } = await apiPost(API_ENDPOINTS.trading.credentials, {
      label: `${inlineServer.trim()} – ${inlineLogin}`,
      mt5_login: parseInt(inlineLogin),
      mt5_password: inlinePassword,
      mt5_server: inlineServer.trim(),
      mt5_terminal_path: inlineTerminalPath.trim(),
      is_default: false,
    });
    if (error) {
      toast({ title: "Failed to save credentials", description: String(error), variant: "destructive" });
    } else {
      toast({ title: "Credentials saved", description: "Account saved — you can now select it from the dropdown." });
      await fetchCredentials();
      setUseInlineCreds(false);
    }
    setSavingInlineCreds(false);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center gap-4 flex-wrap">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/strategy")}
            className="rounded-full flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Live Trading</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Activate and monitor live trading sessions
            </p>
          </div>
          {hasRunningSession && (
            <Badge className="bg-green-500 hover:bg-green-600">
              <Activity className="w-3 h-3 mr-1 animate-pulse" />
              Session Active
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column: configuration ── */}
          <div className="lg:col-span-1 space-y-5">

            {/* Securities selector */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Securities to Trade</CardTitle>
                <CardDescription>Select symbols your bot will trade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected chips */}
                {selectedSymbols.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSymbols.map((sym) => (
                      <Badge key={sym} variant="secondary" className="gap-1 pr-1">
                        {sym}
                        <button
                          onClick={() => toggleSymbol(sym)}
                          disabled={hasRunningSession}
                          title={`Remove ${sym}`}
                          className="ml-0.5 rounded-full hover:bg-muted p-0.5 disabled:opacity-50"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Quick-pick grid */}
                {Object.entries(SYMBOL_GROUPS).map(([group, syms]) => (
                  <div key={group} className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                      {group}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {syms.map((sym) => (
                        <button
                          key={sym}
                          onClick={() => toggleSymbol(sym)}
                          disabled={hasRunningSession}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-medium border transition-all",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            selectedSymbols.includes(sym)
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-background text-foreground border-border hover:border-primary/60 hover:bg-primary/5"
                          )}
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Custom symbol */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Custom (e.g. USDZAR)"
                    value={customSymbol}
                    onChange={(e) => setCustomSymbol(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomSymbol()}
                    disabled={hasRunningSession}
                    className="bg-background text-sm h-8"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={addCustomSymbol}
                    disabled={hasRunningSession}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Session configuration */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Session Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Broker account */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Broker Account (MT5)</Label>
                    {credentials.length > 0 && !hasRunningSession && (
                      <button
                        onClick={() => setUseInlineCreds((v) => !v)}
                        className="text-xs text-primary underline underline-offset-2 hover:no-underline"
                      >
                        {useInlineCreds ? "Use saved account" : "Enter manually"}
                      </button>
                    )}
                  </div>

                  {loadingCredentials ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground h-9">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading accounts…
                    </div>
                  ) : !useInlineCreds && credentials.length > 0 ? (
                    <Select
                      value={selectedCredential}
                      onValueChange={setSelectedCredential}
                      disabled={hasRunningSession}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select broker account" />
                      </SelectTrigger>
                      <SelectContent>
                        {credentials.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            <span className="font-medium">{c.label}</span>{" "}
                            <span className="text-muted-foreground text-xs">
                              ({c.mt5_server}: {c.mt5_login})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    /* Inline credential entry — shown when no saved accounts or user clicks "Enter manually" */
                    <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">MT5 Login *</Label>
                          <Input
                            type="number"
                            placeholder="e.g. 123456789"
                            value={inlineLogin}
                            onChange={(e) => setInlineLogin(e.target.value)}
                            disabled={hasRunningSession}
                            className="bg-background h-8 text-sm"
                            autoComplete="off"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">MT5 Server *</Label>
                          <Input
                            placeholder="e.g. ICMarkets-Demo"
                            value={inlineServer}
                            onChange={(e) => setInlineServer(e.target.value)}
                            disabled={hasRunningSession}
                            className="bg-background h-8 text-sm"
                            autoComplete="off"
                          />
                          <p className="text-[10px] text-muted-foreground leading-tight">
                            Broker server name — not your account username
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">MT5 Password *</Label>
                        <div className="relative">
                          <Input
                            type={showInlinePassword ? "text" : "password"}
                            placeholder="MT5 account password"
                            value={inlinePassword}
                            onChange={(e) => setInlinePassword(e.target.value)}
                            disabled={hasRunningSession}
                            className="bg-background h-8 text-sm pr-8"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            title={showInlinePassword ? "Hide password" : "Show password"}
                            onClick={() => setShowInlinePassword((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showInlinePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Terminal Path <span className="opacity-60">(optional)</span></Label>
                        <Input
                          placeholder="C:\Program Files\MetaTrader 5\terminal64.exe"
                          value={inlineTerminalPath}
                          onChange={(e) => setInlineTerminalPath(e.target.value)}
                          disabled={hasRunningSession}
                          className="bg-background h-8 text-sm"
                          autoComplete="off"
                        />
                      </div>
                      {inlineLogin && inlinePassword && inlineServer && !hasRunningSession && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-7 text-xs"
                          onClick={handleSaveInlineCreds}
                          disabled={savingInlineCreds}
                        >
                          {savingInlineCreds ? (
                            <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Saving…</>
                          ) : (
                            <><CheckCircle2 className="w-3 h-3 mr-1.5" />Save this account for later</>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Timeframe */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Timeframe</Label>
                  <Select value={timeframe} onValueChange={setTimeframe} disabled={hasRunningSession}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEFRAMES.map((tf) => (
                        <SelectItem key={tf.value} value={tf.value}>
                          {tf.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Risk % */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Risk per Trade (%)</Label>
                  <Input
                    type="number"
                    value={riskPct}
                    onChange={(e) => setRiskPct(e.target.value)}
                    min="0.1"
                    max="10"
                    step="0.1"
                    disabled={hasRunningSession}
                    className="bg-background"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    % of account balance risked per trade
                  </p>
                </div>

                {/* Dry-run toggle */}
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">Dry Run Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Connect to MT5 but skip real orders
                    </p>
                  </div>
                  <Switch checked={dryRun} onCheckedChange={setDryRun} disabled={hasRunningSession} />
                </div>

                {!dryRun && (
                  <div className="flex items-start gap-2 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      <strong>LIVE mode</strong> — real orders will be placed. Ensure
                      sufficient margin and thorough backtesting.
                    </p>
                  </div>
                )}

                {/* Start / Stop */}
                {!hasRunningSession ? (
                  <Button
                    className={cn(
                      "w-full",
                      dryRun
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    )}
                    onClick={handleStartSession}
                    disabled={
                      startingSession ||
                      selectedSymbols.length === 0 ||
                      (useInlineCreds || credentials.length === 0
                        ? !inlineLogin.trim() || !inlinePassword || !inlineServer.trim()
                        : !selectedCredential)
                    }
                  >
                    {startingSession ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Starting…
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        {dryRun ? "Start Dry Run" : "Go Live"}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => activeSession && handleStopSession(activeSession.id)}
                    disabled={stoppingSession !== null}
                  >
                    {stoppingSession !== null ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Stopping…
                      </>
                    ) : (
                      <>
                        <Square className="w-4 h-4 mr-2" />
                        Stop Session
                      </>
                    )}
                  </Button>
                )}

                {/* Link to broker settings */}
                <button
                  onClick={() => navigate("/settings?tab=broker")}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Settings2 className="w-3 h-3" />
                  Manage broker accounts
                </button>
              </CardContent>
            </Card>
          </div>

          {/* ── Right column: session info + positions ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Active session banner */}
            {hasRunningSession && activeSession && (
              <Card className="bg-card border-green-500/40 border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                      </span>
                      <CardTitle className="text-sm text-green-500 font-semibold">
                        Session Running
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      PID {activeSession.pid ?? "—"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-0.5">Mode</p>
                      <p className="font-semibold">
                        {activeSession.dry_run ? "Dry Run" : (
                          <span className="text-green-500">LIVE</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-0.5">Symbols</p>
                      <p className="font-semibold truncate">{activeSession.symbols.join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-0.5">Timeframe</p>
                      <p className="font-semibold">{activeSession.timeframe}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-0.5">Risk</p>
                      <p className="font-semibold">{activeSession.risk_pct}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subprocess activity log */}
            {hasRunningSession && (
              <Card className="bg-card border-border">
                <CardHeader className="pb-2 pt-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {sessionLogs.length === 0 ? (
                        <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                      ) : sessionAlive ? (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full h-2 w-2 bg-gray-400" />
                      )}
                      <span className="text-xs font-medium">
                        {sessionLogs.length === 0
                          ? "Connecting to subprocess…"
                          : sessionAlive
                          ? "Live — processing data"
                          : "Subprocess stopped"}
                      </span>
                    </div>
                    {lastActivityAt && (
                      <span className="text-[10px] text-muted-foreground">
                        {(() => {
                          const secs = Math.round((Date.now() - new Date(lastActivityAt).getTime()) / 1000);
                          if (secs < 5) return 'just now';
                          if (secs < 60) return `${secs}s ago`;
                          return `${Math.round(secs / 60)}m ago`;
                        })()}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  {sessionLogs.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground italic">
                      Waiting for first activity line…
                    </p>
                  ) : (
                    <div className="font-mono text-[11px] bg-muted/50 rounded-md px-3 py-2 space-y-0.5 max-h-32 overflow-y-auto">
                      {sessionLogs.map((line, i) => (
                        <div
                          key={i}
                          className={cn(
                            'leading-relaxed whitespace-pre-wrap break-all',
                            /error/i.test(line)
                              ? 'text-red-400'
                              : /kill switch|SHUTDOWN/i.test(line)
                              ? 'text-yellow-400'
                              : 'text-muted-foreground'
                          )}
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Open positions */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Open Positions</CardTitle>
                    <CardDescription>Live MT5 positions — auto-refreshes every 10s</CardDescription>
                  </div>
                  {activeSessionId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshPositions}
                      disabled={refreshingPositions || loadingPositions}
                    >
                      <RefreshCw
                        className={cn(
                          "w-3.5 h-3.5 mr-1.5",
                          (refreshingPositions || loadingPositions) && "animate-spin"
                        )}
                      />
                      Refresh
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!activeSessionId ? (
                  <div className="py-14 text-center text-muted-foreground">
                    <Activity className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Start a session to see open positions</p>
                  </div>
                ) : loadingPositions && positions.length === 0 ? (
                  <div className="flex items-center justify-center py-14">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : positions.length === 0 ? (
                  <div className="py-14 text-center text-muted-foreground">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No open positions</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-2 px-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Symbol</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Volume</TableHead>
                          <TableHead>Open</TableHead>
                          <TableHead>Current</TableHead>
                          <TableHead>P&amp;L</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {positions.map((pos) => (
                          <TableRow key={pos.ticket}>
                            <TableCell className="font-medium">{pos.symbol}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs gap-0.5",
                                  pos.type === "buy"
                                    ? "border-green-500/40 text-green-600 bg-green-500/5"
                                    : "border-red-500/40 text-red-500 bg-red-500/5"
                                )}
                              >
                                {pos.type === "buy" ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                {pos.type.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>{pos.volume}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {pos.open_price.toFixed(5)}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {pos.current_price.toFixed(5)}
                            </TableCell>
                            <TableCell>
                              <span
                                className={cn(
                                  "font-semibold text-sm",
                                  pos.profit >= 0 ? "text-green-500" : "text-red-500"
                                )}
                              >
                                {pos.profit >= 0 ? "+" : ""}${pos.profit.toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setCloseConfirmDialog(pos)}
                                disabled={closingTrade === pos.ticket}
                              >
                                {closingTrade === pos.ticket ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  "Close"
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session history */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Session History</CardTitle>
                <CardDescription>Previous sessions for this strategy</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No sessions yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2.5 gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full flex-shrink-0",
                              session.status === "RUNNING" && "bg-green-500 animate-pulse",
                              session.status === "STOPPED" && "bg-gray-400",
                              session.status === "ERROR" && "bg-red-500",
                              session.status === "PENDING" && "bg-yellow-400"
                            )}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {session.symbols.join(", ")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {session.timeframe} ·{" "}
                              {session.dry_run ? "Dry Run" : "Live"} ·{" "}
                              {new Date(session.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              session.status === "RUNNING" && "border-green-500/50 text-green-500",
                              session.status === "STOPPED" && "border-gray-500/50 text-gray-500",
                              session.status === "ERROR" && "border-red-500/50 text-red-500"
                            )}
                          >
                            {session.status}
                          </Badge>
                          {session.status === "RUNNING" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleStopSession(session.id)}
                              disabled={stoppingSession === session.id}
                            >
                              {stoppingSession === session.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Stop"
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Confirm Go Live dialog ── */}
      <Dialog open={confirmLiveDialog} onOpenChange={setConfirmLiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="w-5 h-5" />
              Activate Live Trading?
            </DialogTitle>
            <DialogDescription>
              You are about to place <strong>real orders</strong> on your MT5 account using real
              money. This action cannot be undone. Ensure your strategy has been thoroughly
              backtested.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <p>
              Symbols: <strong>{selectedSymbols.join(", ")}</strong>
            </p>
            <p>
              Risk per trade: <strong>{riskPct}%</strong>
            </p>
            <p>
              Timeframe: <strong>{timeframe}</strong>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmLiveDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={doStartSession}>
              <Zap className="w-4 h-4 mr-2" />
              Confirm — Go Live
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Confirm close position dialog ── */}
      <Dialog
        open={!!closeConfirmDialog}
        onOpenChange={(open) => !open && setCloseConfirmDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Position #{closeConfirmDialog?.ticket}</DialogTitle>
            <DialogDescription>
              Close{" "}
              <strong>
                {closeConfirmDialog?.type?.toUpperCase()} {closeConfirmDialog?.volume}{" "}
                {closeConfirmDialog?.symbol}
              </strong>{" "}
              at market?
              <br />
              Current P&amp;L:{" "}
              <span
                className={
                  closeConfirmDialog && closeConfirmDialog.profit >= 0
                    ? "text-green-500 font-semibold"
                    : "text-red-500 font-semibold"
                }
              >
                {closeConfirmDialog
                  ? `${closeConfirmDialog.profit >= 0 ? "+" : ""}$${closeConfirmDialog.profit.toFixed(2)}`
                  : ""}
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseConfirmDialog(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClosePosition}>
              Close Position
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
