import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import SessionExpirationHandler from "@/components/SessionExpirationHandler";
import { TutorProvider } from "@/context/TutorContext";

// Eager load critical pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import Legal from "./pages/Legal";

// Lazy load non-critical pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const StrategyBuilder = lazy(() => import("./pages/StrategyBuilder"));
const Strategy = lazy(() => import("./pages/Strategy"));
const Backtesting = lazy(() => import("./pages/Backtesting"));
const Settings = lazy(() => import("./pages/Settings"));
const ConnectionTest = lazy(() => import("./pages/ConnectionTest"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const DemoPage = lazy(() => import("./pages/Demo").then(module => ({ default: module.DemoPage })));
const Docs = lazy(() => import("./pages/Docs"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Root route: redirect authenticated users straight to dashboard
function RootPage() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SpeedInsights />
      <Analytics />
      <BrowserRouter>
        <TutorProvider>
          <AuthProvider>
            <SessionExpirationHandler />
            <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<RootPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/test-connection" element={<ConnectionTest />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/strategy-builder"
                element={
                  <ProtectedRoute>
                    <StrategyBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/strategy"
                element={
                  <ProtectedRoute>
                    <Strategy />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/backtesting/:strategyId"
                element={
                  <ProtectedRoute>
                    <Backtesting />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/demo"
                element={
                  <ProtectedRoute>
                    <DemoPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/error/:code" element={<ErrorPage />} />
              <Route path="/docs" element={<Docs />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </AuthProvider>
        </TutorProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
