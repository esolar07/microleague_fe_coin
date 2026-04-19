import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useAutoAuth } from "@/hooks/use-auto-auth";
import { useSsoExchange } from "@/hooks/use-sso-exchange";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/web3/wagmi";

const Index = lazy(() => import("./pages/Index"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CreatorPage = lazy(() => import("./pages/CreatorPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const SimulatePage = lazy(() => import("./pages/SimulatePage"));
const TournamentPage = lazy(() => import("./pages/TournamentPage"));
const ClubhousePage = lazy(() => import("./pages/ClubhousePage"));
const NotFound = lazy(() => import("./pages/NotFound"));
import CoinbaseProvider from "./providers/CoinbaseProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        // Don't retry on 401 — stale CDP session, let it fail silently
        if (error instanceof Error && error.message.includes("401"))
          return false;
        return failureCount < 2;
      },
    },
    mutations: {
      onError: (error: unknown) => {
        if (error instanceof Error && error.message.includes("401")) return;
        console.error(error);
      },
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

// Runs inside AuthProvider + WagmiProvider — auto-signs if wallet connected but no session
const AutoAuthGate = ({ children }: { children: React.ReactNode }) => {
  useAutoAuth();
  useSsoExchange(); // Handle SSO token exchange on app load
  return <>{children}</>;
};

const App = () => (
  <CoinbaseProvider>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ThemeProvider defaultTheme="light" storageKey="mlc-ui-theme">
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AutoAuthGate>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/simulate" element={<SimulatePage />} />
                        <Route
                          path="/tournament"
                          element={<TournamentPage />}
                        />
                        <Route path="/clubhouse" element={<ClubhousePage />} />
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <DashboardPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/creator"
                          element={
                            <ProtectedRoute>
                              <CreatorPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/leaderboard"
                          element={<LeaderboardPage />}
                        />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </AutoAuthGate>
                </BrowserRouter>
              </TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </CoinbaseProvider>
);

export default App;
