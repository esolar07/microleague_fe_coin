import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Coins, Gift, Users, Gamepad2, TrendingUp, ExternalLink, 
  Copy, CheckCircle, User, Wallet, Shield, Clock,
  Calendar, Award, ChevronRight, X, Sparkles, Zap,
  Lock,
  Trophy, Star
} from "lucide-react";
import {
  useAccount,
  useBalance,
  useChainId,
  useDisconnect,
  useReadContract,
  useSwitchChain,
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { formatUnits } from "viem";
import logo from "@/assets/logo.webp";
import QuestsSection from "./QuestsSection";
import PredictionPolls from "./PredictionPolls";
import ClaimRequestsHistory from "./ClaimRequestsHistory";
import MyTokensTab from "./MyTokensTab";
import VestingTab from "./VestingTab";
import PaymentModal from "@/components/modals/PaymentModal";
import PresaleWidget from "@/components/presale/PresaleWidget";
import { APP_CHAIN } from "@/config/network";
import { PRESALE_ADDRESS, USDC_ADDRESS } from "@/config/presale";
import { tokenPresaleAbi } from "@/contracts/tokenPresaleAbi";
import { useAuth } from "@/hooks/use-auth";
import { requestSwitchChain } from "@/web3/requestSwitchChain";
import { getRecentActivity, type ActivityRecord } from "@/services/activity";

const tabs: { id: string; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: "overview", label: "Overview", icon: TrendingUp },
  { id: "simulations", label: "Simulations", icon: Gamepad2 },
  { id: "tokens", label: "My Tokens", icon: Coins },
  { id: "predictions", label: "Predictions", icon: Trophy, badge: "New" },
  { id: "quests", label: "Quests", icon: Star, badge: "New" },
  { id: "leagues", label: "Leagues", icon: Users, badge: "New" },
  { id: "vesting", label: "Vesting", icon: Lock },
  { id: "rewards", label: "Rewards & Referrals", icon: Gift },
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

const ACTIVITY_ICON_MAP: Record<ActivityRecord["activityType"], { icon: React.ElementType; bg: string; color: string }> = {
  Buy: { icon: Coins, bg: "bg-primary/10", color: "text-primary" },
  Claim: { icon: Gift, bg: "bg-success/10", color: "text-success" },
  Vesting_Created: { icon: Lock, bg: "bg-warning/10", color: "text-warning" },
};

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showPresaleWidget, setShowPresaleWidget] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(100);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinStep, setJoinStep] = useState<"details" | "confirm" | "joined">("details");

  // Activity feed state
  const [activityData, setActivityData] = useState<ActivityRecord[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);

  // Wallet connection and auth
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const isOnCorrectChain = !isConnected || chainId === APP_CHAIN.id;

  // Fetch recent activity when wallet is connected
  useEffect(() => {
    if (!address) {
      setActivityData([]);
      setActivityError(null);
      return;
    }
    let cancelled = false;
    setActivityLoading(true);
    setActivityError(null);
    getRecentActivity(address)
      .then((res) => {
        if (!cancelled) setActivityData(res.data);
      })
      .catch(() => {
        if (!cancelled) setActivityError("Failed to load recent activity");
      })
      .finally(() => {
        if (!cancelled) setActivityLoading(false);
      });
    return () => { cancelled = true; };
  }, [address]);

  // Get USDC balance
  const { data: usdcBalance } = useBalance({
    address,
    token: USDC_ADDRESS,
    chainId: APP_CHAIN.id,
    query: { enabled: Boolean(address && USDC_ADDRESS) },
  });

  // Get current presale stage
  const { data: currentStage } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "currentStage",
    chainId: APP_CHAIN.id,
    query: { enabled: Boolean(PRESALE_ADDRESS) },
  });

  // Get sale token decimals
  const { data: saleTokenDecimals } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "saleTokenDecimals",
    chainId: APP_CHAIN.id,
    query: { enabled: Boolean(PRESALE_ADDRESS) },
  });

  const saleTokenDecimalsNum =
    saleTokenDecimals !== undefined ? Number(saleTokenDecimals) : undefined;

  // Get user's total vested amount (total MLC purchased)
  const { data: userVestedAmount } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "vestedAmount",
    args: address ? [address] : undefined,
    chainId: APP_CHAIN.id,
    query: { enabled: Boolean(address && PRESALE_ADDRESS) },
  });

  // Get user's total allocated amount (total MLC purchased/assigned)
  const { data: userTotalAllocated } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "totalAllocated",
    args: address ? [address] : undefined,
    chainId: APP_CHAIN.id,
    query: { enabled: Boolean(address && PRESALE_ADDRESS) },
  });

  // Get user's total claimed amount
  const { data: userTotalClaimed } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "totalClaimed",
    args: address ? [address] : undefined,
    chainId: APP_CHAIN.id,
    query: { enabled: Boolean(address && PRESALE_ADDRESS) },
  });

  // Get user's claimable amount (available MLC)
  const { data: userClaimableAmount } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "claimableAmount",
    args: address ? [address] : undefined,
    chainId: APP_CHAIN.id,
    query: { enabled: Boolean(address && PRESALE_ADDRESS) },
  });

  // Get user's purchases for current stage
  const currentStageId = currentStage?.[0];
  const { data: userStagePurchases } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "buyerPurchasedForStage",
    args: address && currentStageId !== undefined ? [currentStageId, address] : undefined,
    chainId: APP_CHAIN.id,
    query: { enabled: Boolean(address && PRESALE_ADDRESS && currentStageId !== undefined) },
  });

  // Get token amount purchased for current stage (if contract tracks it)
  const { data: userStageTokenPurchases } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "buyerPurchased",
    args: address && currentStageId !== undefined ? [currentStageId, address] : undefined,
    chainId: APP_CHAIN.id,
    query: { enabled: Boolean(address && PRESALE_ADDRESS && currentStageId !== undefined) },
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

  const claimableMLC = userClaimableAmount !== undefined && saleTokenDecimalsNum !== undefined
    ? Number(formatUnits(userClaimableAmount, saleTokenDecimalsNum))
    : 0;

  // Locked = allocated minus (already claimed + currently claimable)
  const lockedTokens = Math.max(0, totalAllocatedMLC - totalClaimedMLC - claimableMLC);

  // Debug logging for development
  console.log("=== MLC DASHBOARD DEBUG ===");
  console.log("Connected:", isConnected);
  console.log("Address:", address);
  console.log("PRESALE_ADDRESS:", PRESALE_ADDRESS);
  console.log("Current Stage ID:", currentStageId);
  console.log("Sale Token Decimals (raw):", saleTokenDecimals);
  console.log("Sale Token Decimals (number):", saleTokenDecimalsNum);
  console.log("User Total Allocated (raw):", userTotalAllocated?.toString());
  console.log("User Total Claimed (raw):", userTotalClaimed?.toString());
  console.log("User Vested Amount (raw):", userVestedAmount?.toString());
  console.log("User Claimable Amount (raw):", userClaimableAmount?.toString());
  console.log("User Stage Purchases (raw):", userStagePurchases?.toString());
  console.log("User Stage Token Purchases (raw):", userStageTokenPurchases?.toString());
  console.log("Calculated Total Allocated MLC:", totalAllocatedMLC);
  console.log("Calculated Claimable Tokens:", claimableMLC);
  console.log("Calculated Total Claimed MLC:", totalClaimedMLC);
  console.log("Calculated Vested-So-Far MLC:", totalVestedSoFarMLC);
  console.log("Calculated Locked Tokens:", lockedTokens);
  console.log("USDC Balance:", usdcBalance);

  // Real-time stats combining contract data and mock data
  const stats = {
    totalMLC: isConnected ? totalAllocatedMLC : 0,
    lockedTokens: isConnected ? lockedTokens : 0,
    availableTokens: isConnected ? claimableMLC : 0,
    totalClaimedMLC: isConnected ? totalClaimedMLC : 0,
    vestedSoFarMLC: isConnected ? totalVestedSoFarMLC : 0,
    totalPoints: 1250, // This could come from a points contract
    referrals: 12, // This could come from a referral contract
    pendingRewards: 250, // This could come from a rewards contract
    usdcBalance: usdcBalance ? Number(usdcBalance.value) / Math.pow(10, usdcBalance.decimals) : 0,
  };

  // Available leagues mock data
  const availableLeagues: League[] = [
    { id: 1, name: "Street Champions League", sport: "Football", type: "Professional", creator: "Coach Mike", members: 1240, maxMembers: 1500, entryFee: 100, prizePool: 50000, format: "Round Robin", startDate: "Mar 1, 2026", duration: "Season (3 Months)", status: "Open", region: "Global", description: "The ultimate street football league. Compete against top players worldwide for massive prizes.", wins: null, rank: null },
    { id: 2, name: "Weekend Warriors Cup", sport: "Basketball", type: "Amateur", creator: "BBall Dave", members: 380, maxMembers: 512, entryFee: 50, prizePool: 15000, format: "Knockout", startDate: "Feb 20, 2026", duration: "2 Weeks", status: "Open", region: "North America", description: "Casual basketball league for weekend ballers. All skill levels welcome.", wins: null, rank: null },
    { id: 3, name: "E-Sports Arena S2", sport: "E-Sports", type: "Professional", creator: "GameMaster", members: 2048, maxMembers: 2048, entryFee: 200, prizePool: 100000, format: "Double Elimination", startDate: "Feb 15, 2026", duration: "1 Month", status: "Full", region: "Global", description: "Season 2 of the biggest e-sports league on MicroLeague.", wins: null, rank: null },
    { id: 4, name: "Community Cricket Cup", sport: "Cricket", type: "Community", creator: "CricketFan", members: 156, maxMembers: 256, entryFee: 0, prizePool: 5000, format: "Swiss", startDate: "Mar 15, 2026", duration: "1 Month", status: "Open", region: "Asia", description: "Free-to-enter community cricket tournament. Fun first, competition second!", wins: null, rank: null },
  ];

  const myLeagues: League[] = [
    { id: 5, name: "Premier Futsal League", sport: "Football", type: "Amateur", creator: "You", members: 64, maxMembers: 64, entryFee: 75, prizePool: 8000, format: "Round Robin", startDate: "Jan 20, 2026", duration: "Season (3 Months)", status: "Active", region: "Europe", description: "Fast-paced futsal action.", wins: 8, rank: 3, totalMatches: 12 },
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
    console.log("🛒 Buy More MLC triggered with amount:", amount);
    setPurchaseAmount(amount);
    setShowPresaleWidget(true);
  };

  const handlePaymentSuccess = () => {
    setShowBuyModal(false);
    setShowPresaleWidget(false);
    // Could add success notification here
  };

  const handleWidgetBuy = (amount: number) => {
    console.log("💰 Purchase amount from widget:", amount);
    setPurchaseAmount(amount);
    setShowPresaleWidget(false);
    setShowBuyModal(true);
  };

  const handleLogoutAndDisconnect = () => {
    if (isConnected || isAuthenticated) {
      // Logout user authentication
      if (isAuthenticated) {
        logout();
      }
      // Disconnect wallet
      if (isConnected) {
        disconnect();
      }
      // Redirect to home page
      navigate("/");
    } else {
      // Open connect modal if not connected
      openConnectModal?.();
    }
  };

  const referralCode = "ABC123XY";
  const referralLink = `https://microleague.com/ref/${referralCode}`;

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

  const handleClaimRewards = () => {
    setIsClaiming(true);
    setTimeout(() => {
      setIsClaiming(false);
      setClaimSuccess(true);
    }, 2000);
  };

  const referralHistory = [
    { user: "alice@***", action: "Signed up", reward: "+50 Points", date: "2 hours ago" },
    { user: "bob@***", action: "Purchased 1,000 MLC", reward: "+50 MLC", date: "Yesterday" },
    { user: "charlie@***", action: "Signed up", reward: "+50 Points", date: "3 days ago" },
    { user: "david@***", action: "Ran simulation", reward: "+25 Points", date: "5 days ago" },
    { user: "eve@***", action: "Purchased 500 MLC", reward: "+25 MLC", date: "1 week ago" },
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
                <p className="text-sm text-muted-foreground">Welcome back, User</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleBuyMoreMLC(100)}
                className="mlc-btn-primary text-sm px-4 py-2"
              >
                Buy More MLC
              </motion.button>
              
              {/* Wallet Status Indicator */}
              {isConnected && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/20">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  <span className="text-xs text-success font-medium">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connected"}
                  </span>
                </div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogoutAndDisconnect}
                className="mlc-btn-secondary text-sm px-4 py-2 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                {isConnected || isAuthenticated ? "Logout & Disconnect" : "Connect Wallet"}
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card sticky top-[72px] z-20">
        <div className="mlc-container">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
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
        {/* Connection Status Banner */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-center gap-3"
          >
            <Wallet className="w-5 h-5 text-warning" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warning">Wallet Not Connected</p>
              <p className="text-xs text-muted-foreground">Connect your wallet to view your MLC balance and transaction history</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openConnectModal?.()}
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
                Your dashboard is configured for <span className="font-medium">{APP_CHAIN.name}</span>. Switch networks to load your presale balance.
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
              {isSwitchingChain ? "Switching..." : `Switch to ${APP_CHAIN.name}`}
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
                  <span className="text-sm text-muted-foreground">Total MLC</span>
                  <Coins className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {!isConnected ? "—" : 
                   userVestedAmount === undefined ? "Loading..." : 
                   stats.totalMLC.toLocaleString()}
                </p>
                <p className="text-xs text-success mt-1">
                  {!isConnected ? "Connect wallet" : 
                   userVestedAmount === undefined ? "Fetching data..." :
                   "+5.2% value"}
                </p>
              </div>
              <div className="mlc-card-elevated">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Locked Tokens</span>
                  <Shield className="w-4 h-4 text-warning" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {!isConnected ? "—" : 
                   userVestedAmount === undefined ? "Loading..." : 
                   stats.lockedTokens.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {!isConnected ? "Connect wallet" : 
                   userVestedAmount === undefined ? "Fetching data..." :
                   "Presale"}
                </p>
              </div>
              <div className="mlc-card-elevated">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">USDC Balance</span>
                  <Wallet className="w-4 h-4 text-success" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {!isConnected ? "—" : 
                   usdcBalance === undefined ? "Loading..." :
                   `${stats.usdcBalance.toFixed(2)}`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {!isConnected ? "Connect wallet" : 
                   usdcBalance === undefined ? "Fetching data..." :
                   "Available"}
                </p>
              </div>
              <div className="mlc-card-elevated">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Referrals</span>
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.referrals}</p>
                <p className="text-xs text-primary mt-1">Active</p>
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
                  <p className="font-semibold text-foreground">Launch Simulation</p>
                  <p className="text-sm text-muted-foreground">Start earning rewards</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowClaimModal(true)}
                className="mlc-card-elevated flex items-center gap-4 text-left hover:border-success/30 transition-colors relative overflow-hidden group"
              >
                {stats.pendingRewards > 0 && (
                  <motion.div 
                    className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-success text-success-foreground text-xs font-bold"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Claim Now!
                  </motion.div>
                )}
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Claim Rewards</p>
                  <p className="text-sm text-muted-foreground">{stats.pendingRewards} points pending</p>
                </div>
                <Sparkles className="w-5 h-5 text-success opacity-0 group-hover:opacity-100 transition-opacity" />
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
                      <p className="font-semibold text-foreground">Share & Earn</p>
                      <p className="text-sm text-muted-foreground">Invite friends, earn rewards</p>
                    </div>
                    <Zap className="w-5 h-5 text-warning animate-pulse" />
                  </div>
                  
                  {/* Referral Code Display */}
                  <div className="mt-4 p-3 rounded-xl bg-secondary/80 border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Your Referral Code</p>
                        <p className="text-lg font-bold text-foreground font-mono">{referralCode}</p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopyCode}
                        className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2"
                      >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
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
                <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
                <button className="text-sm text-primary hover:underline">View all</button>
              </div>
              <div className="space-y-0">
                {!isConnected ? (
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
                    <span>{activityError}</span>
                  </div>
                ) : activityData.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <span>No recent activity</span>
                  </div>
                ) : (
                  activityData.map((activity) => {
                    const mapping = ACTIVITY_ICON_MAP[activity.activityType];
                    const IconComponent = mapping.icon;
                    return (
                      <div key={activity.id} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mapping.bg}`}>
                            <IconComponent className={`w-5 h-5 ${mapping.color}`} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{activity.action}</p>
                            <p className="text-sm text-muted-foreground">{formatRelativeTime(activity.timestamp)}</p>
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
            address={address}
            isConnected={isConnected}
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
            address={address}
            isConnected={isConnected}
            isOnCorrectChain={isOnCorrectChain}
            saleTokenDecimals={saleTokenDecimalsNum}
          />
        )}

        {/* Leagues Tab */}
        {activeTab === "leagues" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* My Active Leagues */}
            {myLeagues.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" /> My Leagues
                </h3>
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
                            <p className="font-semibold text-foreground">{league.name}</p>
                            <p className="text-xs text-muted-foreground">{league.sport} · {league.type} · {league.format}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-lg font-bold text-foreground">#{league.rank}</p>
                            <p className="text-xs text-muted-foreground">Rank</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-success">{league.wins}W</p>
                            <p className="text-xs text-muted-foreground">/ {league.totalMatches}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold">Active</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Browse Leagues */}
            <div>
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
                            <p className="font-semibold text-foreground">{league.name}</p>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              league.status === "Open" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                            }`}>{league.status}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{league.sport} · {league.type} · by {league.creator}</p>
                          <p className="text-sm text-muted-foreground mt-1">{league.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* League Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-secondary/50 text-center">
                        <p className="text-xs text-muted-foreground">Players</p>
                        <p className="text-sm font-bold text-foreground">{league.members.toLocaleString()} / {league.maxMembers.toLocaleString()}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-secondary/50 text-center">
                        <p className="text-xs text-muted-foreground">Entry Fee</p>
                        <p className="text-sm font-bold text-foreground">{league.entryFee > 0 ? `${league.entryFee} MLC` : "Free"}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-success/10 text-center">
                        <p className="text-xs text-muted-foreground">Prize Pool</p>
                        <p className="text-sm font-bold text-success">{league.prizePool.toLocaleString()} MLC</p>
                      </div>
                      <div className="p-2 rounded-lg bg-secondary/50 text-center">
                        <p className="text-xs text-muted-foreground">Format</p>
                        <p className="text-sm font-bold text-foreground">{league.format}</p>
                      </div>
                    </div>

                    {/* Fill Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{league.members} / {league.maxMembers} players</span>
                        <span>{Math.round((league.members / league.maxMembers) * 100)}% filled</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full ${league.status === "Full" ? "bg-warning" : "bg-primary"}`}
                          style={{ width: `${(league.members / league.maxMembers) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {league.startDate}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {league.duration}</span>
                        <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {league.region}</span>
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
          </motion.div>
        )}

        {/* Quests Tab */}
        {activeTab === "quests" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <QuestsSection />
          </motion.div>
        )}

        {/* Predictions Tab */}
        {activeTab === "predictions" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PredictionPolls />
          </motion.div>
        )}

        {/* Rewards & Referrals Tab */}
        {activeTab === "rewards" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="mlc-card">
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.totalPoints.toLocaleString()}</p>
              </div>
              <div className="mlc-card">
                <p className="text-sm text-muted-foreground">Pending Rewards</p>
                <p className="text-2xl font-bold text-success mt-1">{stats.pendingRewards}</p>
              </div>
              <div className="mlc-card">
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.referrals}</p>
              </div>
              <div className="mlc-card">
                <p className="text-sm text-muted-foreground">Referral Earnings</p>
                <p className="text-2xl font-bold text-primary mt-1">125 MLC</p>
              </div>
            </div>

            {/* Referral Link */}
            <div className="mlc-card-elevated">
              <h3 className="text-lg font-semibold text-foreground mb-4">Your Referral Link</h3>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 mlc-input"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCopy}
                  className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                    copied ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </motion.button>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="p-3 rounded-xl bg-secondary text-center">
                  <p className="text-sm text-muted-foreground">Signup Bonus</p>
                  <p className="text-lg font-bold text-primary">+50 Points</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary text-center">
                  <p className="text-sm text-muted-foreground">Purchase Bonus</p>
                  <p className="text-lg font-bold text-success">+5% MLC</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary text-center">
                  <p className="text-sm text-muted-foreground">Simulation Bonus</p>
                  <p className="text-lg font-bold text-warning">+25 Points</p>
                </div>
              </div>

              {/* Referral Tiers */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-success/5 border border-primary/20">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Referral Reward Tiers
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">🥉 1-5 Referrals</span>
                    <span className="font-medium text-foreground">5% bonus on their purchases</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">🥈 6-15 Referrals</span>
                    <span className="font-medium text-foreground">7% bonus + 100 bonus points</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">🥇 16-50 Referrals</span>
                    <span className="font-medium text-foreground">10% bonus + 500 bonus points</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">💎 50+ Referrals</span>
                    <span className="font-medium text-success">15% bonus + VIP Status</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Earn a percentage of MLC for every purchase your referrals make, plus bonus points for each signup!
                </p>
              </div>
            </div>

            {/* Claim Rewards */}
            <div className="mlc-card-elevated bg-gradient-to-r from-success/10 to-primary/10 border-success/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Pending Rewards</h3>
                  <p className="text-3xl font-bold text-success mt-2">{stats.pendingRewards} Points</p>
                  <p className="text-sm text-muted-foreground mt-1">Available to claim</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowClaimModal(true)}
                  className="mlc-btn-primary"
                >
                  Claim Rewards
                </motion.button>
              </div>
            </div>

            {/* Referral History */}
            <div className="mlc-card-elevated">
              <h3 className="text-lg font-semibold text-foreground mb-4">Referral History</h3>
              <div className="space-y-0">
                {referralHistory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.user}</p>
                        <p className="text-sm text-muted-foreground">{item.action} • {item.date}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-success">{item.reward}</span>
                  </div>
                ))}
              </div>
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
              <h2 className="text-2xl font-bold text-foreground mb-2">Sports Simulations Hub</h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                Run AI-powered sports simulations, join leagues, and earn rewards through active participation.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-2xl"
          >
            {/* Profile Card */}
            <div className="mlc-card-elevated">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">User Profile</h2>
                  <p className="text-sm text-muted-foreground">Manage your account settings</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <input
                    type="email"
                    value="user@example.com"
                    readOnly
                    className="mlc-input mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Display Name</label>
                  <input
                    type="text"
                    placeholder="Enter your display name"
                    className="mlc-input mt-2"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mlc-btn-primary mt-6"
              >
                Save Changes
              </motion.button>
            </div>

            {/* Wallet Settings */}
            <div className="mlc-card-elevated">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Wallet Settings</h3>
              </div>

              <div className="p-4 rounded-xl bg-secondary/50 mb-4">
                <p className="text-sm text-muted-foreground mb-1">Connected Wallet</p>
                <p className="font-mono text-foreground">0x1234...5678</p>
              </div>

              <div className="flex gap-3">
                <button className="mlc-btn-secondary flex-1">Change Wallet</button>
                <button className="mlc-btn-secondary flex-1">Export Keys</button>
              </div>
            </div>

            {/* Security */}
            <div className="mlc-card-elevated">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-success" />
                <h3 className="text-lg font-semibold text-foreground">Security</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                  </div>
                  <button className="mlc-btn-secondary text-sm">Enable</button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                  <div>
                    <p className="font-medium text-foreground">Login Notifications</p>
                    <p className="text-sm text-muted-foreground">Get notified of new logins</p>
                  </div>
                  <button className="mlc-btn-secondary text-sm">Enable</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Claim Rewards Modal */}
      <AnimatePresence>
        {showClaimModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isClaiming) {
                  setShowClaimModal(false);
                  setClaimSuccess(false);
                }
              }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="mlc-card-elevated w-full max-w-md">
                {!claimSuccess ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                          <Gift className="w-6 h-6 text-success" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">Claim Rewards</h2>
                          <p className="text-sm text-muted-foreground">Convert points to MLC</p>
                        </div>
                      </div>
                      {!isClaiming && (
                        <button 
                          onClick={() => setShowClaimModal(false)}
                          className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
                        >
                          <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-success/10 to-primary/10 border border-success/20">
                        <p className="text-sm text-muted-foreground">Available to Claim</p>
                        <p className="text-3xl font-bold text-success mt-1">{stats.pendingRewards} Points</p>
                      </div>

                      <div className="p-4 rounded-xl bg-secondary/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Points to Claim</span>
                          <span className="font-semibold text-foreground">{stats.pendingRewards}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Conversion Rate</span>
                          <span className="font-semibold text-foreground">100 Points = 1 MLC</span>
                        </div>
                        <div className="border-t border-border pt-2 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-foreground">You'll Receive</span>
                            <span className="text-lg font-bold text-primary">{(stats.pendingRewards / 100).toFixed(1)} MLC</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
                        <p className="text-xs text-warning flex items-start gap-2">
                          <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          Claimed MLC will be added to your locked balance and released after the presale ends.
                        </p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClaimRewards}
                      disabled={isClaiming}
                      className="w-full mlc-btn-primary mt-6 flex items-center justify-center gap-2"
                    >
                      {isClaiming ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Claim {stats.pendingRewards} Points
                        </>
                      )}
                    </motion.button>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="w-10 h-10 text-success" />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-foreground">Rewards Claimed!</h2>
                    <p className="text-muted-foreground mt-2">
                      You've received <span className="font-bold text-primary">{(stats.pendingRewards / 100).toFixed(1)} MLC</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Added to your locked balance</p>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowClaimModal(false);
                        setClaimSuccess(false);
                      }}
                      className="mlc-btn-primary mt-6"
                    >
                      Done
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PaymentModal for Buy More MLC */}
      <PaymentModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        onSuccess={handlePaymentSuccess}
        amount={purchaseAmount}
        mlcAmount={purchaseAmount / 0.001}
      />
      {/* Join League Modal */}
      <AnimatePresence>
        {showJoinModal && selectedLeague && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowJoinModal(false)}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="mlc-card-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">
                        {joinStep === "joined" ? "You're In!" : selectedLeague.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {joinStep === "details" && `${selectedLeague.sport} · ${selectedLeague.type}`}
                        {joinStep === "confirm" && "Confirm your entry"}
                        {joinStep === "joined" && "Welcome to the league!"}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowJoinModal(false)} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {joinStep === "details" && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{selectedLeague.description}</p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-secondary/50">
                        <p className="text-xs text-muted-foreground">Format</p>
                        <p className="text-sm font-bold text-foreground">{selectedLeague.format}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-secondary/50">
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="text-sm font-bold text-foreground">{selectedLeague.duration}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-secondary/50">
                        <p className="text-xs text-muted-foreground">Players</p>
                        <p className="text-sm font-bold text-foreground">{selectedLeague.members} / {selectedLeague.maxMembers}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-secondary/50">
                        <p className="text-xs text-muted-foreground">Region</p>
                        <p className="text-sm font-bold text-foreground">{selectedLeague.region}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Prize Pool</span>
                        <span className="text-lg font-bold text-success">{selectedLeague.prizePool.toLocaleString()} MLC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Entry Fee</span>
                        <span className="text-sm font-bold text-foreground">{selectedLeague.entryFee > 0 ? `${selectedLeague.entryFee} MLC` : "Free"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Starts {selectedLeague.startDate}</span>
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> by {selectedLeague.creator}</span>
                    </div>

                    {selectedLeague.wins !== null ? (
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <p className="text-sm font-medium text-foreground mb-3">Your Stats</p>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <p className="text-xl font-bold text-primary">#{selectedLeague.rank}</p>
                            <p className="text-xs text-muted-foreground">Rank</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-bold text-success">{selectedLeague.wins}</p>
                            <p className="text-xs text-muted-foreground">Wins</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-bold text-foreground">{selectedLeague.totalMatches}</p>
                            <p className="text-xs text-muted-foreground">Matches</p>
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
                        {selectedLeague.status === "Full" ? "League Full" : (
                          <>
                            Join League
                            {selectedLeague.entryFee > 0 && <span className="opacity-75">({selectedLeague.entryFee} MLC)</span>}
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
                        <span className="font-semibold text-foreground">{selectedLeague.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Entry Fee</span>
                        <span className="font-bold text-foreground">{selectedLeague.entryFee > 0 ? `${selectedLeague.entryFee} MLC` : "Free"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Prize Pool</span>
                        <span className="font-bold text-success">{selectedLeague.prizePool.toLocaleString()} MLC</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Your Balance</span>
                        <span className="font-medium text-foreground">{stats.totalMLC.toLocaleString()} MLC</span>
                      </div>
                      {selectedLeague.entryFee > 0 && (
                        <div className="border-t border-border pt-2 flex justify-between text-sm">
                          <span className="text-muted-foreground">After Entry</span>
                          <span className="font-bold text-foreground">{(stats.totalMLC - selectedLeague.entryFee).toLocaleString()} MLC</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                      <p className="text-xs text-warning font-medium">Entry fee is non-refundable once the league starts. You can withdraw before the start date.</p>
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
                      <p className="text-lg font-bold text-foreground">Welcome to {selectedLeague.name}!</p>
                      <p className="text-sm text-muted-foreground">You're now registered. Good luck!</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-primary/10 text-center">
                        <p className="text-lg font-bold text-primary">{selectedLeague.format}</p>
                        <p className="text-xs text-muted-foreground">Format</p>
                      </div>
                      <div className="p-3 rounded-xl bg-success/10 text-center">
                        <p className="text-lg font-bold text-success">{selectedLeague.prizePool.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Prize (MLC)</p>
                      </div>
                      <div className="p-3 rounded-xl bg-warning/10 text-center">
                        <p className="text-lg font-bold text-warning">{selectedLeague.startDate}</p>
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
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Presale Widget */}
      <AnimatePresence>
        {showPresaleWidget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPresaleWidget(false)}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 100, x: "-50%" }}
              className="fixed bottom-4 left-1/2 z-50"
            >
              <div className="relative">
                <button
                  onClick={() => setShowPresaleWidget(false)}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>
                <PresaleWidget onBuyClick={handleWidgetBuy} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PaymentModal for Buy More MLC */}
      <PaymentModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        onSuccess={handlePaymentSuccess}
        amount={purchaseAmount}
        mlcAmount={purchaseAmount / 0.001}
      />
    </div>
  );
};

export default UserDashboard;
