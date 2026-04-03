import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { chains, wagmiConfig } from "@/web3/wagmi";

const Index = lazy(() => import("./pages/Index"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CreatorPage = lazy(() => import("./pages/CreatorPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const SimulatePage = lazy(() => import("./pages/SimulatePage"));
const TournamentPage = lazy(() => import("./pages/TournamentPage"));
const ClubhousePage = lazy(() => import("./pages/ClubhousePage"));
const NotFound = lazy(() => import("./pages/NotFound"));
import CoinbaseProvider from "./providers/CoinbaseProvider";

const queryClient = new QueryClient();


const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <CoinbaseProvider>
        <RainbowKitProvider >
          <ThemeProvider defaultTheme="light" storageKey="mlc-ui-theme">
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/simulate" element={<SimulatePage />} />
                      <Route path="/tournament" element={<TournamentPage />} />
                      <Route path="/clubhouse" element={<ClubhousePage />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/creator" element={<CreatorPage />} />
                      <Route path="/leaderboard" element={<LeaderboardPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
        </RainbowKitProvider>
      </CoinbaseProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
