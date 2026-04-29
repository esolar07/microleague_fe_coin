import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins,
  Gift,
  Users,
  Gamepad2,
  TrendingUp,
  ExternalLink,
  Copy,
  CheckCircle,
  User,
  Wallet,
  Shield,
  Clock,
  Calendar,
  Award,
  ChevronRight,
  X,
  Sparkles,
  Zap,
  Lock,
  Trophy,
  Star,
  Building2,
} from "lucide-react";
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useConnectors,
  useDisconnect,
  useReadContract,
  useSwitchChain,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { formatUnits } from "viem";
import logo from "@/assets/logo.webp";
import QuestsSection from "./QuestsSection";
import PredictionPolls from "./PredictionPolls";
import ClaimRequestsHistory from "./ClaimRequestsHistory";
import MyTokensTab from "./MyTokensTab";
import VestingTab from "./VestingTab";
import ProfileTab from "./ProfileTab";
import PaymentModal from "@/components/modals/PaymentModal";
import WalletModal from "@/components/modals/WalletModal";
import PresaleWidget from "@/components/presale/PresaleWidget";
import { useBankTransfers } from "@/hooks/use-bank-transfers";
import type { BankTransferRecord } from "@/services/bankTransfer";
import { APP_CHAIN } from "@/config/network";
import { PRESALE_ADDRESS, USDC_ADDRESS } from "@/config/presale";
import { tokenPresaleAbi } from "@/contracts/tokenPresaleAbi";
import { useAuth } from "@/hooks/use-auth";
import { requestSwitchChain } from "@/web3/requestSwitchChain";
import type { ActivityRecord } from "@/services/activity";
import { useActivity } from "@/hooks/use-activity";
import { useLinkEmail, useSignOut } from "@coinbase/cdp-hooks";
import { useUserProfile } from "@/hooks/useUserProfile";
import UserAvatar from "@/components/ui/UserAvatar";
import { redirectWithSso } from "@/services/sso";
import { SSO_URLS } from "@/config/sso";
import { performCompleteLogout } from "@/utils/logout";

const tabs: {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}[] = [
  { id: "overview", label: "Overview", icon: TrendingUp },
  { id: "simulations", label: "Simulations", icon: Gamepad2 },
  { id: "tournaments", label: "Tournaments", icon: Trophy },
  { id: "tokens", label: "My Tokens", icon: Coins },
  { id: "predictions", label: "Predictions", icon: Trophy, badge: "New" },
  { id: "quests", label: "Quests", icon: Star, badge: "New" },
  { id: "leagues", label: "Leagues", icon: Users, badge: "New" },
  { id: "vesting", label: "Vesting", icon: Lock },
  { id: "rewards", label: "Rewards & Referrals", icon: Gift },
  { id: "bank-transfers", label: "Bank Transfers", icon: Building2 },
  { id: "profile", label: "Profile", icon: User },
];

type League = {
  id: number;
  name: string;
  sport: string;
  type: string;
  creator: string;
  members: number;
  maxMembers: number;
  entryFee: number;
  prizePool: number;
  format: string;
  startDate: string;
  duration: string;
  status: string;
  region: string;
  description: string;
  wins: number | null;
  rank: number | null;
  totalMatches?: number;
};

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 30) return `${diffDay} days ago`;
  return new Date(timestamp).toLocaleDateString();
}

const ACTIVITY_ICON_MAP: Record<
  ActivityRecord["activityType"],
  { icon: React.ElementType; bg: string; color: string }
> = {
  Buy: { icon: Coins, bg: "bg-primary/10", color: "text-primary" },
  Claim: { icon: Gift, bg: "bg-success/10", color: "text-success" },
  Vesting_Created: { icon: Lock, bg: "bg-warning/10", color: "text-warning" },
};

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showPresaleWidget, setShowPresaleWidget] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(100);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinStep, setJoinStep] = useState<"details" | "confirm" | "joined">(
    "details",
  );
  const [isSsoRedirecting, setIsSsoRedirecting] = useState(false);

  // Wallet connection and auth
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { connect } = useConnect();
  const connectors = useConnectors();
  const { isAuthenticated, logout, user, token } = useAuth();
  const { signOut } = useSignOut();
  const navigate = useNavigate();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();

  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleWalletSelect = (method: "coinbase" | "rainbowkit") => {
    if (method === "coinbase") {
      const cbConnector = connectors.find(
        (c) =>
          c.id === "com.coinbase.wallet" ||
          (c.name?.toLowerCase().includes("coinbase") &&
            !c.id.toLowerCase().includes("cdp")),
      );
      if (cbConnector) {
        connect({ connector: cbConnector });
      } else {
        openConnectModal?.();
      }
    } else {
      openConnectModal?.();
    }
  };
  // SSO-enabled redirects to simulation frontend
  const openSimulationModal = async () => {
    const targetUrl = SSO_URLS.simulation.simulate;

    if (isAuthenticated && token) {
      setIsSsoRedirecting(true);
      // Yield to let React flush the state update and paint the loader
      await new Promise((r) => requestAnimationFrame(r));
      try {
        await redirectWithSso(targetUrl, token);
        // Keep loader visible briefly after new tab opens so the user sees it
        await new Promise((r) => setTimeout(r, 800));
      } finally {
        setIsSsoRedirecting(false);
      }
    } else {
      window.open(targetUrl, "_blank");
    }
  };

  const openTournamentModal = async () => {
    const targetUrl = SSO_URLS.simulation.tournament;

    if (isAuthenticated && token) {
      setIsSsoRedirecting(true);
      // Yield to let React flush the state update and paint the loader
      await new Promise((r) => requestAnimationFrame(r));
      try {
        await redirectWithSso(targetUrl, token);
        // Keep loader visible briefly after new tab opens so the user sees it
        await new Promise((r) => setTimeout(r, 800));
      } finally {
        setIsSsoRedirecting(false);
      }
    } else {
      window.open(targetUrl, "_blank");
    }
  };

  // Coinbase email login goes through CDP SDK (not wagmi), so wagmi won't have the address.
  // Fall back to the auth context's wallet address in that case.
  const effectiveAddress =
    address ?? (user?.walletAddress as `0x${string}` | undefined);
  const isWalletReady = isConnected || (isAuthenticated && !!effectiveAddress);
  const isOnCorrectChain = !isConnected || chainId === APP_CHAIN.id;

  const { data: profile } = useUserProfile(effectiveAddress || undefined);

  // Activity feed via React Query
  const {
    data: activityPage,
    isLoading: activityLoading,
    isError: activityError,
  } = useActivity(effectiveAddress);

  // Bank transfers — fetched via react-query
  const {
    data: bankTransferData = [],
    isLoading: bankTransferLoading,
    refetch: refetchBankTransfers,
  } = useBankTransfers(effectiveAddress);

  // Get USDC balance
  const { data: usdcBalance } = useBalance({
    address: effectiveAddress,
    token: USDC_ADDRESS,
    chainId: APP_CHAIN.id,
    query: {
      enabled: Boolean(effectiveAddress && USDC_ADDRESS),
      staleTime: 30_000,
    },
  });

  // Shared query config for presale contract reads — no staleTime to ensure fresh fetches
  // staleTime: 0 means data is ALWAYS considered stale, so refetch will always fetch fresh data
  // refetchInterval: 60s as fallback to keep data fresh even without user action
  // gcTime: 5m to cache successfully fetched data for offline use
  const contractQueryConfig = {
    staleTime: 0,
    refetchInterval: 60_000,
    gcTime: 300_000,
  };

  // Get current presale stage
  const { data: currentStage } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "currentStage",
    chainId: APP_CHAIN.id,
    query: { enabled: Boolean(PRESALE_ADDRESS), ...contractQueryConfig },
  });

  // Get sale token decimals
  const { data: saleTokenDecimals } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "saleTokenDecimals",
    chainId: APP_CHAIN.id,
    query: { enabled: Boolean(PRESALE_ADDRESS), staleTime: Infinity },
  });

  const saleTokenDecimalsNum =
    saleTokenDecimals !== undefined ? Number(saleTokenDecimals) : undefined;

  // Get user's total vested amount (total MLC purchased)
  const { data: userVestedAmount } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "vestedAmount",
    args: effectiveAddress ? [effectiveAddress] : undefined,
    chainId: APP_CHAIN.id,
    query: {
      enabled: Boolean(effectiveAddress && PRESALE_ADDRESS),
      ...contractQueryConfig,
    },
  });

  // Get user's total allocated amount (total MLC purchased/assigned)
  const { data: userTotalAllocated } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "totalAllocated",
    args: effectiveAddress ? [effectiveAddress] : undefined,
    chainId: APP_CHAIN.id,
    query: {
      enabled: Boolean(effectiveAddress && PRESALE_ADDRESS),
      ...contractQueryConfig,
    },
  });

  // Get user's total claimed amount
  const { data: userTotalClaimed } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "totalClaimed",
    args: effectiveAddress ? [effectiveAddress] : undefined,
    chainId: APP_CHAIN.id,
    query: {
      enabled: Boolean(effectiveAddress && PRESALE_ADDRESS),
      ...contractQueryConfig,
    },
  });

  // Get user's claimable amount (available MLC)
  const { data: userClaimableAmount } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "claimableAmount",
    args: effectiveAddress ? [effectiveAddress] : undefined,
    chainId: APP_CHAIN.id,
    query: {
      enabled: Boolean(effectiveAddress && PRESALE_ADDRESS),
      ...contractQueryConfig,
    },
  });

  // Get user's purchases for current stage
  const currentStageId = currentStage?.[0];
  const { data: userStagePurchases } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "buyerPurchasedForStage",
    args:
      effectiveAddress && currentStageId !== undefined
        ? [currentStageId, effectiveAddress]
        : undefined,
    chainId: APP_CHAIN.id,
    query: {
      enabled: Boolean(
        effectiveAddress && PRESALE_ADDRESS && currentStageId !== undefined,
      ),
      ...contractQueryConfig,
    },
  });

  // Get token amount purchased for current stage (if contract tracks it)
  const { data: userStageTokenPurchases } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "buyerPurchased",
    args:
      effectiveAddress && currentStageId !== undefined
        ? [currentStageId, effectiveAddress]
        : undefined,
    chainId: APP_CHAIN.id,
    query: {
      enabled: Boolean(
        effectiveAddress && PRESALE_ADDRESS && currentStageId !== undefined,
      ),
      ...contractQueryConfig,
    },
  });

  // Calculate real MLC amounts
  const totalAllocatedMLC =
    userTotalAllocated !== undefined && saleTokenDecimalsNum !== undefined
      ? Number(formatUnits(userTotalAllocated, saleTokenDecimalsNum))
      : 0;

  const totalClaimedMLC =
    userTotalClaimed !== undefined && saleTokenDecimalsNum !== undefined
      ? Number(formatUnits(userTotalClaimed, saleTokenDecimalsNum))
      : 0;

  // "Vested" in the contract sense (released so far). Often 0 during cliff.
  const totalVestedSoFarMLC =
    userVestedAmount !== undefined && saleTokenDecimalsNum !== undefined
      ? Number(formatUnits(userVestedAmount, saleTokenDecimalsNum))
      : 0;

  const claimableMLC =
    userClaimableAmount !== undefined && saleTokenDecimalsNum !== undefined
      ? Number(formatUnits(userClaimableAmount, saleTokenDecimalsNum))
      : 0;

  // Locked = allocated minus (already claimed + currently claimable)
  const lockedTokens = Math.max(
    0,
    totalAllocatedMLC - totalClaimedMLC - claimableMLC,
  );

  // Real-time stats combining contract data and mock data
  const stats = {
    totalMLC: isWalletReady ? totalAllocatedMLC : 0,
    lockedTokens: isWalletReady ? lockedTokens : 0,
    availableTokens: isWalletReady ? claimableMLC : 0,
    totalClaimedMLC: isWalletReady ? totalClaimedMLC : 0,
    vestedSoFarMLC: isWalletReady ? totalVestedSoFarMLC : 0,
    totalPoints: 1250, // This could come from a points contract
    pendingRewards: 250, // This could come from a rewards contract
    usdcBalance: usdcBalance
      ? Number(usdcBalance.value) / Math.pow(10, usdcBalance.decimals)
      : 0,
  };

  // Available leagues mock data
  const availableLeagues: League[] = [
    {
      id: 1,
      name: "Street Champions League",
      sport: "Football",
      type: "Professional",
      creator: "Coach Mike",
      members: 1240,
      maxMembers: 1500,
      entryFee: 100,
      prizePool: 50000,
      format: "Round Robin",
      startDate: "Mar 1, 2026",
      duration: "Season (3 Months)",
      status: "Open",
      region: "Global",
      description:
        "The ultimate street football league. Compete against top players worldwide for massive prizes.",
      wins: null,
      rank: null,
    },
    {
      id: 2,
      name: "Weekend Warriors Cup",
      sport: "Basketball",
      type: "Amateur",
      creator: "BBall Dave",
      members: 380,
      maxMembers: 512,
      entryFee: 50,
      prizePool: 15000,
      format: "Knockout",
      startDate: "Feb 20, 2026",
      duration: "2 Weeks",
      status: "Open",
      region: "North America",
      description:
        "Casual basketball league for weekend ballers. All skill levels welcome.",
      wins: null,
      rank: null,
    },
    {
      id: 3,
      name: "E-Sports Arena S2",
      sport: "E-Sports",
      type: "Professional",
      creator: "GameMaster",
      members: 2048,
      maxMembers: 2048,
      entryFee: 200,
      prizePool: 100000,
      format: "Double Elimination",
      startDate: "Feb 15, 2026",
      duration: "1 Month",
      status: "Full",
      region: "Global",
      description: "Season 2 of the biggest e-sports league on MicroLeague.",
      wins: null,
      rank: null,
    },
    {
      id: 4,
      name: "Community Cricket Cup",
      sport: "Cricket",
      type: "Community",
      creator: "CricketFan",
      members: 156,
      maxMembers: 256,
      entryFee: 0,
      prizePool: 5000,
      format: "Swiss",
      startDate: "Mar 15, 2026",
      duration: "1 Month",
      status: "Open",
      region: "Asia",
      description:
        "Free-to-enter community cricket tournament. Fun first, competition second!",
      wins: null,
      rank: null,
    },
  ];

  const myLeagues: League[] = [
    {
      id: 5,
      name: "Premier Futsal League",
      sport: "Football",
      type: "Amateur",
      creator: "You",
      members: 64,
      maxMembers: 64,
      entryFee: 75,
      prizePool: 8000,
      format: "Round Robin",
      startDate: "Jan 20, 2026",
      duration: "Season (3 Months)",
      status: "Active",
      region: "Europe",
      description: "Fast-paced futsal action.",
      wins: 8,
      rank: 3,
      totalMatches: 12,
    },
  ];

  const handleJoinLeague = (league: League) => {
    setSelectedLeague(league);
    setJoinStep("details");
    setShowJoinModal(true);
  };

  const processJoin = () => {
    setJoinStep("joined");
  };

  const handleBuyMoreMLC = (amount: number = 100) => {
    setPurchaseAmount(amount);
    setShowPresaleWidget(true);
  };

  const handlePaymentSuccess = () => {
    setShowBuyModal(false);
    setShowPresaleWidget(false);
    // Could add success notification here
  };

  const handleWidgetBuy = (amount: number) => {
    setPurchaseAmount(amount);
    setShowPresaleWidget(false);
    setShowBuyModal(true);
  };

  const handleLogoutAndDisconnect = async () => {
    if (isConnected || isAuthenticated) {
      // Sign out from Coinbase CDP session — 401 means session already expired, that's fine
      try {
        await signOut();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes("401") && !msg.includes("Unauthorized")) {
          console.error("signOut error:", err);
        }
      }

      // Disconnect wallet
      if (isConnected) disconnect();

      // Clear auth state
      if (isAuthenticated) logout();

      // Perform comprehensive cleanup
      await performCompleteLogout(queryClient);

      // Navigate to home
      navigate("/");
    } else {
      openConnectModal?.();
    }
  };

  const referralCode = user?.referralId ?? "";
  const referralLink = referralCode
    ? `https://microleague.com/ref/${referralCode}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralHistory = [
    {
      user: "alice@***",
      action: "Signed up",
      reward: "+50 Points",
      date: "2 hours ago",
    },
    {
      user: "bob@***",
      action: "Purchased 1,000 MLC",
      reward: "+50 MLC",
      date: "Yesterday",
    },
    {
      user: "charlie@***",
      action: "Signed up",
      reward: "+50 Points",
      date: "3 days ago",
    },
    {
      user: "david@***",
      action: "Ran simulation",
      reward: "+25 Points",
      date: "5 days ago",
    },
    {
      user: "eve@***",
      action: "Purchased 500 MLC",
      reward: "+25 MLC",
      date: "1 week ago",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="mlc-container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center">
                <img src={logo} alt="MicroLeague" className="h-10 w-auto" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, User
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleBuyMoreMLC(100)}
                className="mlc-btn-primary text-sm px-4 py-2"
              >
                Buy More MLC
              </motion.button>

              {/* Avatar — opens Profile tab */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("profile")}
                className="relative flex-shrink-0"
                aria-label="Open profile"
              >
                <UserAvatar
                  avatar={profile?.avatar}
                  displayName={profile?.displayName}
                  email={profile?.email}
                  walletAddress={effectiveAddress}
                  size="md"
                  className="border-2 border-primary/30 hover:border-primary transition-colors"
                />
                {(isConnected || isAuthenticated) && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-card" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card sticky top-[72px] z-20">
        <div className="mlc-container">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide ">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap relative ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {"badge" in tab && tab.badge && (
                  <span className="px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mlc-container py-8">
        {/* Connection Status Banner — hide for Coinbase CDP email users (no wagmi connection) */}
        {!isConnected &&
          !(isAuthenticated && user?.walletType === "coinbase") && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-center gap-3"
            >
              <Wallet className="w-5 h-5 text-warning" />
              <div className="flex-1">
                <p className="text-sm font-medium text-warning">
                  Wallet Not Connected
                </p>
                <p className="text-xs text-muted-foreground">
                  Connect your wallet to view your MLC balance and transaction
                  history
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowWalletModal(true)}
                className="mlc-btn-secondary text-sm px-4 py-2"
              >
                Connect Wallet
              </motion.button>
            </motion.div>
          )}

        {/* Network Mismatch Banner */}
        {isConnected && !isOnCorrectChain && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-center gap-3"
          >
            <Shield className="w-5 h-5 text-warning" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warning">Wrong Network</p>
              <p className="text-xs text-muted-foreground">
                Your dashboard is configured for{" "}
                <span className="font-medium">{APP_CHAIN.name}</span>. Switch
                networks to load your presale balance.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSwitchingChain}
              onClick={async () => {
                try {
                  await requestSwitchChain(APP_CHAIN);
                } catch {
                  // fallback prompt via wagmi
                  await switchChainAsync({ chainId: APP_CHAIN.id });
                }
              }}
              className="mlc-btn-secondary text-sm px-4 py-2 disabled:opacity-60"
            >
              {isSwitchingChain
                ? "Switching..."
                : `Switch to ${APP_CHAIN.name}`}
            </motion.button>
          </motion.div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="mlc-card-elevated">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Total MLC
                  </span>
                  <Coins className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {!isWalletReady
                    ? "—"
                    : userVestedAmount === undefined
                      ? "Loading..."
                      : stats.totalMLC.toLocaleString()}
                </p>
                <p className="text-xs text-success mt-1">
                  {!isWalletReady
                    ? "Connect wallet"
                    : userVestedAmount === undefined
                      ? "Fetching data..."
                      : "+5.2% value"}
                </p>
              </div>
              <div className="mlc-card-elevated">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Locked Tokens
                  </span>
                  <Shield className="w-4 h-4 text-warning" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {!isWalletReady
                    ? "—"
                    : userVestedAmount === undefined
                      ? "Loading..."
                      : stats.lockedTokens.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {!isWalletReady
                    ? "Connect wallet"
                    : userVestedAmount === undefined
                      ? "Fetching data..."
                      : "Presale"}
                </p>
              </div>
              <div className="mlc-card-elevated">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    USDC Balance
                  </span>
                  <Wallet className="w-4 h-4 text-success" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {!isWalletReady
                    ? "—"
                    : usdcBalance === undefined
                      ? "Loading..."
                      : `${stats.usdcBalance.toFixed(2)}`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {!isWalletReady
                    ? "Connect wallet"
                    : usdcBalance === undefined
                      ? "Fetching data..."
                      : "Available"}
                </p>
              </div>
              <div className="mlc-card-elevated">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Referrals
                  </span>
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  Coming Soon
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Referrals are not live yet
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("simulations")}
                className="mlc-card-elevated flex items-center gap-4 text-left hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    Launch Simulation
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Start earning rewards
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("rewards")}
                className="mlc-card-elevated flex items-center gap-4 text-left hover:border-muted/30 transition-colors relative overflow-hidden group"
              >
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
                  Coming Soon
                </div>
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Claim Rewards</p>
                  <p className="text-sm text-muted-foreground">
                    Rewards launching soon
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="mlc-card-elevated hover:border-warning/30 transition-colors relative overflow-hidden group cursor-pointer"
              >
                {/* Hover tooltip */}
                <div className="absolute inset-0 bg-gradient-to-r from-warning/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-0" />

                <div className="relative z-10">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-warning" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        Share & Earn
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Invite friends, earn rewards
                      </p>
                    </div>
                    <Zap className="w-5 h-5 text-warning animate-pulse" />
                  </div>

                  {/* Referral Code Display */}
                  <div className="mt-4 p-3 rounded-xl bg-secondary/80 border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Your Referral Code
                        </p>
                        <p className="text-lg font-bold text-foreground font-mono">
                          {referralCode}
                        </p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopyCode}
                        className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2"
                      >
                        {copied ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        {copied ? "Copied!" : "Copy"}
                      </motion.button>
                    </div>
                  </div>

                  {/* Urgency message on hover */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    className="overflow-hidden group-hover:h-auto group-hover:opacity-100 transition-all duration-300"
                  >
                    <div className="mt-3 p-2 rounded-lg bg-warning/10 border border-warning/20 text-center">
                      <p className="text-xs text-warning font-medium flex items-center justify-center gap-1">
                        <Zap className="w-3 h-3" />
                        Earn 5% bonus on every referral purchase!
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <div className="mlc-card-elevated">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Recent Activity
                </h3>
                <button className="text-sm text-primary hover:underline">
                  View all
                </button>
              </div>
              <div className="space-y-0">
                {!isWalletReady ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <Wallet className="w-5 h-5 mr-2" />
                    <span>Connect your wallet to view activity</span>
                  </div>
                ) : activityLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : activityError ? (
                  <div className="flex items-center justify-center py-8 text-destructive">
                    <span>Failed to load recent activity</span>
                  </div>
                ) : (activityPage?.data ?? []).length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <span>No recent activity</span>
                  </div>
                ) : (
                  (activityPage?.data ?? []).map((activity) => {
                    const mapping = ACTIVITY_ICON_MAP[activity.activityType];
                    const IconComponent = mapping.icon;
                    return (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between py-4 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${mapping.bg}`}
                          >
                            <IconComponent
                              className={`w-5 h-5 ${mapping.color}`}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {activity.action}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatRelativeTime(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-success">
                          +{activity.amount.toLocaleString()} MLC
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tokens Tab */}
        {activeTab === "tokens" && (
          <MyTokensTab
            address={effectiveAddress}
            isConnected={isWalletReady}
            isOnCorrectChain={isOnCorrectChain}
            saleTokenDecimals={saleTokenDecimalsNum}
            userTotalAllocated={userTotalAllocated}
            userTotalClaimed={userTotalClaimed}
            userClaimableAmount={userClaimableAmount}
          />
        )}

        {/* Vesting Tab */}
        {activeTab === "vesting" && (
          <VestingTab
            address={effectiveAddress}
            isConnected={isWalletReady}
            isOnCorrectChain={isOnCorrectChain}
            saleTokenDecimals={saleTokenDecimalsNum}
          />
        )}

        {/* Leagues Tab */}
        {activeTab === "leagues" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            {/* My Active Leagues */}
            <div className="h-[calc(94vh-200px)] overflow-y-auto scrollbar-hide py-4">
              {myLeagues.length > 0 && (
                <div className="">
                  {/* <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                   My Leagues
                </h3> */}
                  <div className="space-y-3">
                    {myLeagues.map((league) => (
                      <motion.div
                        key={league.id}
                        whileHover={{ scale: 1.005 }}
                        className="mlc-card-elevated cursor-pointer hover:border-primary/30 transition-all"
                        onClick={() => handleJoinLeague(league)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Trophy className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {league.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {league.sport} · {league.type} · {league.format}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-lg font-bold text-foreground">
                                #{league.rank}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Rank
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-success">
                                {league.wins}W
                              </p>
                              <p className="text-xs text-muted-foreground">
                                / {league.totalMatches}
                              </p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold">
                              Active
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Browse Leagues */}
              <div className="">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> Browse Leagues
                </h3>
                <div className="grid gap-4">
                  {availableLeagues.map((league) => (
                    <motion.div
                      key={league.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mlc-card-elevated hover:border-primary/30 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Trophy className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-foreground">
                                {league.name}
                              </p>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  league.status === "Open"
                                    ? "bg-success/10 text-success"
                                    : "bg-warning/10 text-warning"
                                }`}
                              >
                                {league.status}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {league.sport} · {league.type} · by{" "}
                              {league.creator}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {league.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* League Stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-secondary/50 text-center">
                          <p className="text-xs text-muted-foreground">
                            Players
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {league.members.toLocaleString()} /{" "}
                            {league.maxMembers.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-secondary/50 text-center">
                          <p className="text-xs text-muted-foreground">
                            Entry Fee
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {league.entryFee > 0
                              ? `${league.entryFee} MLC`
                              : "Free"}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-success/10 text-center">
                          <p className="text-xs text-muted-foreground">
                            Prize Pool
                          </p>
                          <p className="text-sm font-bold text-success">
                            {league.prizePool.toLocaleString()} MLC
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-secondary/50 text-center">
                          <p className="text-xs text-muted-foreground">
                            Format
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {league.format}
                          </p>
                        </div>
                      </div>

                      {/* Fill Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>
                            {league.members} / {league.maxMembers} players
                          </span>
                          <span>
                            {Math.round(
                              (league.members / league.maxMembers) * 100,
                            )}
                            % filled
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full ${league.status === "Full" ? "bg-warning" : "bg-primary"}`}
                            style={{
                              width: `${(league.members / league.maxMembers) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {league.startDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {league.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" /> {league.region}
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleJoinLeague(league)}
                          disabled={league.status === "Full"}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            league.status === "Full"
                              ? "bg-secondary text-muted-foreground cursor-not-allowed"
                              : "mlc-gradient-bg text-primary-foreground"
                          }`}
                        >
                          {league.status === "Full" ? "Full" : "Join League"}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pointer-events-auto absolute h-[calc(95vh-200px)] inset-0 z-10 rounded-3xl  backdrop-blur-3xl border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-semibold text-foreground">
                  Coming Soon
                </p>
                <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-md mx-auto">
                  Leagues are on the way — stay tuned for the full experience.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quests Tab */}
        {activeTab === "quests" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <QuestsSection />
            <div className="pointer-events-auto absolute inset-0 z-10 rounded-3xl  backdrop-blur-3xl border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-semibold text-foreground">
                  Coming Soon
                </p>
                <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-md mx-auto">
                  Quests are being built and will be available soon.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Predictions Tab */}
        {activeTab === "predictions" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <PredictionPolls />
            <div className="pointer-events-auto absolute h-[calc(95vh-200px)] inset-0 z-10 rounded-3xl  backdrop-blur-3xl border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-semibold text-foreground">
                  Coming Soon
                </p>
                <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-md mx-auto">
                  Predictions are launching shortly — check back soon.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Rewards & Referrals Tab */}
        {activeTab === "rewards" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative min-h-[400px]"
          >
            {/* Background content — blurred by overlay */}
            <div className="space-y-6 pointer-events-none select-none">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  "Total Points",
                  "Pending Rewards",
                  "Total Referrals",
                  "Referral Earnings",
                ].map((label) => (
                  <div key={label} className="mlc-card">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">—</p>
                  </div>
                ))}
              </div>
              <div className="mlc-card-elevated h-48" />
              <div className="mlc-card-elevated h-32" />
            </div>

            {/* Coming Soon overlay */}
            <div className="pointer-events-auto absolute inset-0 z-10 rounded-3xl backdrop-blur-3xl border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] flex flex-col items-center justify-center gap-6 p-8">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-semibold text-foreground">
                  Coming Soon
                </p>
                <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-md mx-auto">
                  Rewards and referral tracking are launching soon — your
                  referral link is ready to share now.
                </p>
              </div>

              {/* Referral link — live data from backend */}
              {referralLink && (
                <div className="w-full max-w-md bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5">
                  <p className="text-sm font-semibold text-foreground mb-3">
                    Your Referral Link
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={referralLink}
                      readOnly
                      className="flex-1 mlc-input text-xs"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCopy}
                      className={`px-4 py-3 rounded-xl font-medium transition-colors flex-shrink-0 ${
                        copied
                          ? "bg-success text-success-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Referral code:{" "}
                    <span className="font-mono font-medium text-foreground">
                      {referralCode}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Simulations Tab */}
        {activeTab === "simulations" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Launch Card */}
            <div className="mlc-card-elevated text-center py-12">
              <div className="w-20 h-20 rounded-2xl mlc-gradient-bg flex items-center justify-center mx-auto mb-6">
                <Gamepad2 className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Sports Simulations Hub
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                Run AI-powered sports simulations, join leagues, and earn
                rewards through active participation.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openSimulationModal}
                className="mlc-btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
              >
                Launch Simulation
                <ExternalLink className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Simulation Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="mlc-card">
                <Gamepad2 className="w-8 h-8 text-primary mb-3" />
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Simulations Run</p>
              </div>
              <div className="mlc-card">
                <Award className="w-8 h-8 text-success mb-3" />
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Points Earned</p>
              </div>
              <div className="mlc-card">
                <TrendingUp className="w-8 h-8 text-warning mb-3" />
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Win Rate</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tournaments Tab */}
        {activeTab === "tournaments" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="mlc-card-elevated text-center py-12">
              <div className="w-20 h-20 rounded-2xl mlc-gradient-bg flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Tournament Hub
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                Discover upcoming tournaments, join competition pools, and track
                your standings.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openTournamentModal}
                className="mlc-btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
              >
                View Tournaments
                <ExternalLink className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="mlc-card">
                <Trophy className="w-8 h-8 text-primary mb-3" />
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">
                  Active Tournaments
                </p>
              </div>
              <div className="mlc-card">
                <Users className="w-8 h-8 text-success mb-3" />
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Teams Joined</p>
              </div>
              <div className="mlc-card">
                <Sparkles className="w-8 h-8 text-warning mb-3" />
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Prize Pools</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bank Transfers Tab */}
        {activeTab === "bank-transfers" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="mlc-card-elevated">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Bank Transfer Submissions
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Track the status of your bank transfer verifications
                  </p>
                </div>
                <Building2 className="w-5 h-5 text-muted-foreground" />
              </div>

              {!effectiveAddress ? (
                <div className="py-10 text-center text-muted-foreground text-sm">
                  Connect your wallet to view bank transfers.
                </div>
              ) : bankTransferLoading ? (
                <div className="py-10 flex justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                  />
                </div>
              ) : bankTransferData.length === 0 ? (
                <div className="py-10 text-center">
                  <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-muted-foreground">
                    No bank transfers submitted yet.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use the Bank / Wire Transfer option when purchasing MLC.
                  </p>
                </div>
              ) : (
                <div className="space-y-0 divide-y divide-border">
                  {bankTransferData.map((transfer) => (
                    <div
                      key={transfer.id}
                      className="py-4 flex items-start gap-4"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          transfer.status === "Verified"
                            ? "bg-success/10"
                            : transfer.status === "Rejected"
                              ? "bg-destructive/10"
                              : "bg-warning/10"
                        }`}
                      >
                        {transfer.status === "Verified" ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : transfer.status === "Rejected" ? (
                          <X className="w-5 h-5 text-destructive" />
                        ) : (
                          <Clock className="w-5 h-5 text-warning" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="font-medium text-foreground text-sm">
                            ${transfer.amount.toLocaleString()} USD
                          </p>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              transfer.status === "Verified"
                                ? "bg-success/10 text-success"
                                : transfer.status === "Rejected"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-warning/10 text-warning"
                            }`}
                          >
                            {transfer.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {transfer.senderName} · {transfer.bankName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ref: {transfer.transactionRef} ·{" "}
                          {new Date(transfer.createdAt).toLocaleDateString()}
                        </p>
                        {transfer.verificationNote && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            "{transfer.verificationNote}"
                          </p>
                        )}
                        {transfer.proofUrl && (
                          <a
                            href={transfer.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-1 inline-block"
                          >
                            View proof
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && <ProfileTab />}
      </div>

      {/* Claim Rewards Modal */}

      {/* PaymentModal for Buy More MLC */}
      <PaymentModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        onSuccess={handlePaymentSuccess}
        amount={purchaseAmount}
        mlcAmount={purchaseAmount / 0.001}
        onTransactionSuccess={async () => {
          await refetchBankTransfers();
          // Clear all contract query cache to force fresh data fetch
          await queryClient.invalidateQueries({
            queryKey: ["readContract"],
          });
          // Refetch all presale contract reads after purchase
          await queryClient.refetchQueries({
            queryKey: ["readContract"],
            type: "all",
          });
          // Refetch activity to show the new buy transaction
          await queryClient.refetchQueries({
            queryKey: ["activity"],
            type: "all",
          });
        }}
      />
      {/* Join League Modal */}
      <AnimatePresence>
        {showJoinModal && selectedLeague && (
          <>
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowJoinModal(false)}
                className="fixed inset-0 bg-foreground/20 z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4"
              />
              <div className="mlc-card-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">
                        {joinStep === "joined"
                          ? "You're In!"
                          : selectedLeague.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {joinStep === "details" &&
                          `${selectedLeague.sport} · ${selectedLeague.type}`}
                        {joinStep === "confirm" && "Confirm your entry"}
                        {joinStep === "joined" && "Welcome to the league!"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {joinStep === "details" && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {selectedLeague.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-secondary/50">
                        <p className="text-xs text-muted-foreground">Format</p>
                        <p className="text-sm font-bold text-foreground">
                          {selectedLeague.format}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-secondary/50">
                        <p className="text-xs text-muted-foreground">
                          Duration
                        </p>
                        <p className="text-sm font-bold text-foreground">
                          {selectedLeague.duration}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-secondary/50">
                        <p className="text-xs text-muted-foreground">Players</p>
                        <p className="text-sm font-bold text-foreground">
                          {selectedLeague.members} / {selectedLeague.maxMembers}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-secondary/50">
                        <p className="text-xs text-muted-foreground">Region</p>
                        <p className="text-sm font-bold text-foreground">
                          {selectedLeague.region}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          Prize Pool
                        </span>
                        <span className="text-lg font-bold text-success">
                          {selectedLeague.prizePool.toLocaleString()} MLC
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Entry Fee
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {selectedLeague.entryFee > 0
                            ? `${selectedLeague.entryFee} MLC`
                            : "Free"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Starts{" "}
                        {selectedLeague.startDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" /> by{" "}
                        {selectedLeague.creator}
                      </span>
                    </div>

                    {selectedLeague.wins !== null ? (
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <p className="text-sm font-medium text-foreground mb-3">
                          Your Stats
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <p className="text-xl font-bold text-primary">
                              #{selectedLeague.rank}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Rank
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-bold text-success">
                              {selectedLeague.wins}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Wins
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-bold text-foreground">
                              {selectedLeague.totalMatches}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Matches
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setJoinStep("confirm")}
                        disabled={selectedLeague.status === "Full"}
                        className="w-full mlc-btn-primary flex items-center justify-center gap-2"
                      >
                        {selectedLeague.status === "Full" ? (
                          "League Full"
                        ) : (
                          <>
                            Join League
                            {selectedLeague.entryFee > 0 && (
                              <span className="opacity-75">
                                ({selectedLeague.entryFee} MLC)
                              </span>
                            )}
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                )}

                {joinStep === "confirm" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">League</span>
                        <span className="font-semibold text-foreground">
                          {selectedLeague.name}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Entry Fee</span>
                        <span className="font-bold text-foreground">
                          {selectedLeague.entryFee > 0
                            ? `${selectedLeague.entryFee} MLC`
                            : "Free"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Prize Pool
                        </span>
                        <span className="font-bold text-success">
                          {selectedLeague.prizePool.toLocaleString()} MLC
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Your Balance
                        </span>
                        <span className="font-medium text-foreground">
                          {stats.totalMLC.toLocaleString()} MLC
                        </span>
                      </div>
                      {selectedLeague.entryFee > 0 && (
                        <div className="border-t border-border pt-2 flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            After Entry
                          </span>
                          <span className="font-bold text-foreground">
                            {(
                              stats.totalMLC - selectedLeague.entryFee
                            ).toLocaleString()}{" "}
                            MLC
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                      <p className="text-xs text-warning font-medium">
                        Entry fee is non-refundable once the league starts. You
                        can withdraw before the start date.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setJoinStep("details")}
                        className="flex-1 mlc-btn-secondary"
                      >
                        Back
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={processJoin}
                        className="flex-1 mlc-btn-primary flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Confirm & Join
                      </motion.button>
                    </div>
                  </div>
                )}

                {joinStep === "joined" && (
                  <div className="text-center py-4 space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto"
                    >
                      <CheckCircle className="w-8 h-8 text-success" />
                    </motion.div>
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        Welcome to {selectedLeague.name}!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        You're now registered. Good luck!
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-primary/10 text-center">
                        <p className="text-lg font-bold text-primary">
                          {selectedLeague.format}
                        </p>
                        <p className="text-xs text-muted-foreground">Format</p>
                      </div>
                      <div className="p-3 rounded-xl bg-success/10 text-center">
                        <p className="text-lg font-bold text-success">
                          {selectedLeague.prizePool.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Prize (MLC)
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-warning/10 text-center">
                        <p className="text-lg font-bold text-warning">
                          {selectedLeague.startDate}
                        </p>
                        <p className="text-xs text-muted-foreground">Starts</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowJoinModal(false)}
                      className="w-full mlc-btn-primary"
                    >
                      Done
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Presale Widget */}
      {showPresaleWidget && (
        <>
          <div
            onClick={() => setShowPresaleWidget(false)}
            className="fixed inset-0 bg-foreground/20 z-40"
          />
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="relative">
              <button
                onClick={() => setShowPresaleWidget(false)}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
              <PresaleWidget onBuyClick={handleWidgetBuy} />
            </div>
          </div>
        </>
      )}

      {/* PaymentModal for Buy More MLC */}
      <PaymentModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        onSuccess={handlePaymentSuccess}
        amount={purchaseAmount}
        mlcAmount={purchaseAmount / 0.001}
        onTransactionSuccess={async () => {
          await refetchBankTransfers();
          // Clear all contract query cache to force fresh data fetch
          await queryClient.invalidateQueries({
            queryKey: ["readContract"],
          });
          // Refetch all presale contract reads after purchase
          await queryClient.refetchQueries({
            queryKey: ["readContract"],
            type: "all",
          });
          // Refetch activity to show the new buy transaction
          await queryClient.refetchQueries({
            queryKey: ["activity"],
            type: "all",
          });
        }}
      />

      {/* Wallet selection modal */}
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onSelectWallet={handleWalletSelect}
        onEmailAlreadySignedIn={() => setShowWalletModal(false)}
      />

      {/* SSO Redirect Loading Overlay */}
      {isSsoRedirecting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="mlc-card-elevated p-8 text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Redirecting...
            </h3>
            <p className="text-sm text-muted-foreground">
              Setting up your secure session
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
