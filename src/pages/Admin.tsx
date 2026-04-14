import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ExternalLink, Shield, Server, Database, Activity, Bot, BarChart3 } from "lucide-react";
import { API_ENDPOINTS, apiGet } from "@/lib/api";
import {
  authService,
  marketDataService,
  strategyService,
  backtestService,
  symbolService,
  backtestRunService,
  botPerformanceService,
} from "@/lib/services";

interface DashboardUser {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface CurrentUserPayload {
  user?: DashboardUser;
}

interface HealthItem {
  key: string;
  label: string;
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  details?: string;
}

interface CountItem {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  value: number | null;
}

function toBackendBaseUrl(apiBaseUrl: string): string {
  return apiBaseUrl.replace(/\/api\/?$/, "");
}

function normalizeHealthStatus(data: unknown): HealthItem["status"] {
  if (!data || typeof data !== "object") return "unknown";
  const record = data as Record<string, unknown>;

  const overall = typeof record.overall === "string" ? record.overall.toLowerCase() : undefined;
  const status = typeof record.status === "string" ? record.status.toLowerCase() : undefined;
  const state = overall ?? status;

  if (!state) return "unknown";
  if (state.includes("healthy")) return "healthy";
  if (state.includes("degraded") || state.includes("warning")) return "degraded";
  if (state.includes("unhealthy") || state.includes("error") || state.includes("failed")) return "unhealthy";
  return "unknown";
}

function statusVariant(status: HealthItem["status"]): "default" | "secondary" | "destructive" | "outline" {
  if (status === "healthy") return "default";
  if (status === "degraded") return "secondary";
  if (status === "unhealthy") return "destructive";
  return "outline";
}

export default function Admin() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
  const backendBaseUrl = useMemo(() => toBackendBaseUrl(apiBaseUrl), [apiBaseUrl]);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [counts, setCounts] = useState<CountItem[]>([]);
  const [health, setHealth] = useState<HealthItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    const [
      currentUserResp,
      authHealthResp,
      dataHealthResp,
      strategyHealthResp,
      backtestHealthResp,
      symbolsResp,
      strategiesResp,
      backtestRunsResp,
      botPerfResp,
    ] = await Promise.all([
      apiGet<CurrentUserPayload | DashboardUser>(API_ENDPOINTS.auth.user),
      authService.health(),
      marketDataService.health(),
      strategyService.health(),
      backtestService.health(),
      symbolService.getAll(),
      strategyService.getAll(),
      backtestRunService.getAll(),
      botPerformanceService.getAll(),
    ]);

    const payload = currentUserResp.data;
    const resolvedUser = payload && typeof payload === "object" && "user" in payload
      ? (payload as CurrentUserPayload).user ?? null
      : (payload as DashboardUser | undefined) ?? null;

    setUser(resolvedUser);

    setCounts([
      { key: "symbols", label: "Symbols", icon: Database, value: symbolsResp.data?.length ?? null },
      { key: "strategies", label: "Strategies", icon: Bot, value: strategiesResp.data?.length ?? null },
      { key: "backtests", label: "Backtest Runs", icon: BarChart3, value: backtestRunsResp.data?.length ?? null },
      { key: "bots", label: "Bot Performance Records", icon: Activity, value: botPerfResp.data?.length ?? null },
    ]);

    setHealth([
      {
        key: "auth",
        label: "Auth API",
        status: authHealthResp.error ? "unhealthy" : normalizeHealthStatus(authHealthResp.data),
        details: authHealthResp.error,
      },
      {
        key: "data",
        label: "Data API",
        status: dataHealthResp.error ? "unhealthy" : normalizeHealthStatus(dataHealthResp.data),
        details: dataHealthResp.error,
      },
      {
        key: "strategy",
        label: "Strategy API",
        status: strategyHealthResp.error ? "unhealthy" : normalizeHealthStatus(strategyHealthResp.data),
        details: strategyHealthResp.error,
      },
      {
        key: "backtest",
        label: "Backtest API",
        status: backtestHealthResp.error ? "unhealthy" : normalizeHealthStatus(backtestHealthResp.data),
        details: backtestHealthResp.error,
      },
    ]);

    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  return (
    <DashboardLayout hideAssistant>
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-7 h-7 text-primary" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              System overview, health status, and admin shortcuts.
            </p>
            {user && (
              <p className="text-xs text-muted-foreground mt-1">
                Signed in as <span className="font-medium text-foreground">{user.username}</span> ({user.email})
              </p>
            )}
          </div>
          <Button onClick={loadAdminData} disabled={loading} variant="outline" className="w-full md:w-auto">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Backend Access</CardTitle>
            <CardDescription>Direct links to backend admin and operational endpoints.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <a
              href={`${backendBaseUrl}/admin/`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Django Admin</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{backendBaseUrl}/admin/</p>
            </a>
            <a
              href={`${backendBaseUrl}/api/`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">API Root</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{backendBaseUrl}/api/</p>
            </a>
            <a
              href={`${backendBaseUrl}/docs`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">API Docs</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{backendBaseUrl}/docs</p>
            </a>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {counts.map((item) => (
            <Card key={item.key} className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription>{item.label}</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <item.icon className="w-5 h-5 text-primary" />
                  {loading ? "..." : item.value ?? "N/A"}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              API Health
            </CardTitle>
            <CardDescription>
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleString()}` : "Loading health checks..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {health.map((item) => (
              <div key={item.key} className="rounded-md border border-border p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{item.label}</p>
                  {item.details && <p className="text-xs text-muted-foreground mt-0.5">{item.details}</p>}
                </div>
                <Badge variant={statusVariant(item.status)}>{item.status.toUpperCase()}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Detected Backend Endpoint Groups</CardTitle>
            <CardDescription>
              Synced from your backend URL config (`algoagent_api/urls.py`): auth, data, strategies, backtests, workflows, production, jobs, live, trading.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <code className="rounded bg-muted px-2 py-1">/api/auth/</code>
            <code className="rounded bg-muted px-2 py-1">/api/data/</code>
            <code className="rounded bg-muted px-2 py-1">/api/strategies/</code>
            <code className="rounded bg-muted px-2 py-1">/api/backtests/</code>
            <code className="rounded bg-muted px-2 py-1">/api/workflows/</code>
            <code className="rounded bg-muted px-2 py-1">/api/production/</code>
            <code className="rounded bg-muted px-2 py-1">/api/jobs/&lt;task_id&gt;/</code>
            <code className="rounded bg-muted px-2 py-1">/api/live/</code>
            <code className="rounded bg-muted px-2 py-1">/api/trading/</code>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
