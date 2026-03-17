import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Coins, Gift, Users, Gamepad2, TrendingUp, ExternalLink, 
  Copy, CheckCircle, User, Wallet, Shield, Clock, ArrowUpRight,
  Calendar, Award, Settings, ChevronRight, X, Sparkles, Zap,
  Lock, Unlock, Timer, ArrowRight, BadgeCheck, Percent, BarChart3,
  Trophy, Star
} from "lucide-react";
import logo from "@/assets/logo.webp";
import QuestsSection from "./QuestsSection";
import PredictionPolls from "./PredictionPolls";
import ClaimRequestsHistory from "./ClaimRequestsHistory";

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

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [showVestingClaimModal, setShowVestingClaimModal] = useState(false);
  const [vestingClaimStep, setVestingClaimStep] = useState<"confirm" | "processing" | "done">("confirm");
  const [autoStakeEnabled, setAutoStakeEnabled] = useState(true);
  const [selectedClaimIndex, setSelectedClaimIndex] = useState<number | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<any>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinStep, setJoinStep] = useState<"details" | "confirm" | "joined">("details");

  // Available leagues mock data
  const availableLeagues = [
    { id: 1, name: "Street Champions League", sport: "Football", type: "Professional", creator: "Coach Mike", members: 1240, maxMembers: 1500, entryFee: 100, prizePool: 50000, format: "Round Robin", startDate: "Mar 1, 2026", duration: "Season (3 Months)", status: "Open", region: "Global", description: "The ultimate street football league. Compete against top players worldwide for massive prizes.", wins: null, rank: null },
    { id: 2, name: "Weekend Warriors Cup", sport: "Basketball", type: "Amateur", creator: "BBall Dave", members: 380, maxMembers: 512, entryFee: 50, prizePool: 15000, format: "Knockout", startDate: "Feb 20, 2026", duration: "2 Weeks", status: "Open", region: "North America", description: "Casual basketball league for weekend ballers. All skill levels welcome.", wins: null, rank: null },
    { id: 3, name: "E-Sports Arena S2", sport: "E-Sports", type: "Professional", creator: "GameMaster", members: 2048, maxMembers: 2048, entryFee: 200, prizePool: 100000, format: "Double Elimination", startDate: "Feb 15, 2026", duration: "1 Month", status: "Full", region: "Global", description: "Season 2 of the biggest e-sports league on MicroLeague.", wins: null, rank: null },
    { id: 4, name: "Community Cricket Cup", sport: "Cricket", type: "Community", creator: "CricketFan", members: 156, maxMembers: 256, entryFee: 0, prizePool: 5000, format: "Swiss", startDate: "Mar 15, 2026", duration: "1 Month", status: "Open", region: "Asia", description: "Free-to-enter community cricket tournament. Fun first, competition second!", wins: null, rank: null },
  ];

  const myLeagues = [
    { id: 5, name: "Premier Futsal League", sport: "Football", type: "Amateur", creator: "You", members: 64, maxMembers: 64, entryFee: 75, prizePool: 8000, format: "Round Robin", startDate: "Jan 20, 2026", duration: "Season (3 Months)", status: "Active", region: "Europe", description: "Fast-paced futsal action.", wins: 8, rank: 3, totalMatches: 12 },
  ];

  const handleJoinLeague = (league: any) => {
    setSelectedLeague(league);
    setJoinStep("details");
    setShowJoinModal(true);
  };

  const processJoin = () => {
    setJoinStep("joined");
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

  // Mock data
  const stats = {
    totalMLC: 4000,
    lockedTokens: 4000,
    availableTokens: 0,
    totalPoints: 1250,
    referrals: 12,
    pendingRewards: 250,
  };

  const referralHistory = [
    { user: "alice@***", action: "Signed up", reward: "+50 Points", date: "2 hours ago" },
    { user: "bob@***", action: "Purchased 1,000 MLC", reward: "+50 MLC", date: "Yesterday" },
    { user: "charlie@***", action: "Signed up", reward: "+50 Points", date: "3 days ago" },
    { user: "david@***", action: "Ran simulation", reward: "+25 Points", date: "5 days ago" },
    { user: "eve@***", action: "Purchased 500 MLC", reward: "+25 MLC", date: "1 week ago" },
  ];

  const recentActivity = [
    { action: "Purchased MLC", amount: "+4,000 MLC", time: "2 hours ago", type: "purchase" },
    { action: "Earned signup bonus", amount: "+100 Points", time: "2 hours ago", type: "bonus" },
    { action: "Referral signup", amount: "+50 Points", time: "Yesterday", type: "referral" },
    { action: "Simulation reward", amount: "+25 Points", time: "2 days ago", type: "simulation" },
    { action: "Referral purchase bonus", amount: "+50 MLC", time: "3 days ago", type: "referral" },
  ];

  // Vesting data
  const vestingData = {
    totalVested: 4000,
    totalClaimed: 0,
    totalRemaining: 4000,
    currentRate: 0.01,
    projectedRate: 0.025,
    rateChange: "+150%",
    stakingAPY: 12.5,
    nextClaimDate: "Apr 12, 2026",
    vestingStart: "Jan 12, 2026",
    vestingEnd: "Jan 12, 2027",
    cliffPeriod: "3 months",
  };

  const vestingSchedule = [
    { period: "Q1 2026", date: "Apr 12, 2026", amount: 1000, percentage: 25, status: "claimable" as const, daysLeft: 0 },
    { period: "Q2 2026", date: "Jul 12, 2026", amount: 1000, percentage: 25, status: "locked" as const, daysLeft: 152 },
    { period: "Q3 2026", date: "Oct 12, 2026", amount: 1000, percentage: 25, status: "locked" as const, daysLeft: 244 },
    { period: "Q4 2026", date: "Jan 12, 2027", amount: 1000, percentage: 25, status: "locked" as const, daysLeft: 336 },
  ];

  const handleVestingClaim = (index: number) => {
    setSelectedClaimIndex(index);
    setVestingClaimStep("confirm");
    setShowVestingClaimModal(true);
  };

  const processVestingClaim = () => {
    setVestingClaimStep("processing");
    setTimeout(() => {
      setVestingClaimStep("done");
    }, 2500);
  };

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
                onClick={() => setShowBuyModal(true)}
                className="mlc-btn-primary text-sm px-4 py-2"
              >
                Buy More MLC
              </motion.button>
              <button className="mlc-btn-secondary text-sm px-4 py-2">
                Disconnect
              </button>
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
                <p className="text-2xl font-bold text-foreground">{stats.totalMLC.toLocaleString()}</p>
                <p className="text-xs text-success mt-1">+5.2% value</p>
              </div>
              <div className="mlc-card-elevated">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Locked Tokens</span>
                  <Shield className="w-4 h-4 text-warning" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.lockedTokens.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Presale</p>
              </div>
              <div className="mlc-card-elevated">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Total Points</span>
                  <Award className="w-4 h-4 text-success" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.totalPoints.toLocaleString()}</p>
                <p className="text-xs text-success mt-1">+125 today</p>
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
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        activity.type === "purchase" ? "bg-primary/10" :
                        activity.type === "bonus" ? "bg-success/10" :
                        activity.type === "referral" ? "bg-warning/10" : 
                        activity.type === "simulation" ? "bg-primary/10" : "bg-secondary"
                      }`}>
                        {activity.type === "purchase" && <Coins className="w-5 h-5 text-primary" />}
                        {activity.type === "bonus" && <Gift className="w-5 h-5 text-success" />}
                        {activity.type === "referral" && <Users className="w-5 h-5 text-warning" />}
                        {activity.type === "simulation" && <Gamepad2 className="w-5 h-5 text-primary" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-success">{activity.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tokens Tab */}
        {activeTab === "tokens" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Token Balance Card */}
              <div className="mlc-card-elevated">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl mlc-gradient-bg flex items-center justify-center">
                    <Coins className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Balance</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalMLC.toLocaleString()} MLC</p>
                    <p className="text-sm text-success">≈ $40.00 USD</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-warning" />
                      <span className="text-muted-foreground">Locked (Presale)</span>
                    </div>
                    <span className="font-semibold text-foreground">{stats.lockedTokens.toLocaleString()} MLC</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-success" />
                      <span className="text-muted-foreground">Available</span>
                    </div>
                    <span className="font-semibold text-foreground">{stats.availableTokens.toLocaleString()} MLC</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Unlock Date</span>
                    </div>
                    <span className="font-semibold text-foreground">After Presale</span>
                  </div>
                </div>
              </div>

              {/* Token Value */}
              <div className="mlc-card-elevated">
                <h3 className="text-lg font-semibold text-foreground mb-4">Token Value</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                    <p className="text-2xl font-bold text-foreground">$0.01 <span className="text-sm text-muted-foreground">per MLC</span></p>
                  </div>
                  <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                    <p className="text-sm text-muted-foreground mb-1">Phase 2 Price</p>
                    <p className="text-2xl font-bold text-success">$0.015 <span className="text-sm text-success/70">+50%</span></p>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Expected Launch</p>
                    <p className="text-2xl font-bold text-primary">TBD</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase History */}
            <div className="mlc-card-elevated">
              <h3 className="text-lg font-semibold text-foreground mb-4">Purchase History</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-sm text-muted-foreground font-medium">Date</th>
                      <th className="text-left py-3 text-sm text-muted-foreground font-medium">Amount</th>
                      <th className="text-left py-3 text-sm text-muted-foreground font-medium">Price</th>
                      <th className="text-left py-3 text-sm text-muted-foreground font-medium">Total</th>
                      <th className="text-left py-3 text-sm text-muted-foreground font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="py-3 text-foreground">Jan 12, 2026</td>
                      <td className="py-3 text-foreground">4,000 MLC</td>
                      <td className="py-3 text-foreground">$0.01</td>
                      <td className="py-3 text-foreground">$40.00</td>
                      <td className="py-3"><span className="px-2 py-1 rounded-full bg-warning/10 text-warning text-xs">Locked</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        )}

        {/* Vesting Tab */}
        {activeTab === "vesting" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Vesting Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="mlc-card-elevated">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Total Vested</span>
                  <Lock className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{vestingData.totalVested.toLocaleString()} MLC</p>
                <p className="text-xs text-muted-foreground mt-1">Over 4 quarters</p>
              </div>
              <div className="mlc-card-elevated">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Claimed</span>
                  <Unlock className="w-4 h-4 text-success" />
                </div>
                <p className="text-2xl font-bold text-success">{vestingData.totalClaimed.toLocaleString()} MLC</p>
                <p className="text-xs text-muted-foreground mt-1">{((vestingData.totalClaimed / vestingData.totalVested) * 100).toFixed(0)}% of total</p>
              </div>
              <div className="mlc-card-elevated">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Remaining</span>
                  <Timer className="w-4 h-4 text-warning" />
                </div>
                <p className="text-2xl font-bold text-foreground">{vestingData.totalRemaining.toLocaleString()} MLC</p>
                <p className="text-xs text-muted-foreground mt-1">Next: {vestingData.nextClaimDate}</p>
              </div>
              <div className="mlc-card-elevated">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Staking APY</span>
                  <Percent className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-primary">{vestingData.stakingAPY}%</p>
                <p className="text-xs text-success mt-1">Auto-stake {autoStakeEnabled ? "ON" : "OFF"}</p>
              </div>
            </div>

            {/* Vesting Schedule Card */}
            <div className="mlc-card-elevated bg-gradient-to-r from-primary/5 via-transparent to-success/5 border-primary/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Vesting Schedule</h3>
                    <p className="text-sm text-muted-foreground">
                      {vestingData.vestingStart} → {vestingData.vestingEnd} · Cliff: {vestingData.cliffPeriod}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Claimed / Total</p>
                    <p className="text-lg font-bold text-foreground">
                      {vestingData.totalClaimed.toLocaleString()} / {vestingData.totalVested.toLocaleString()} MLC
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 rounded-full bg-secondary overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(vestingData.totalClaimed / vestingData.totalVested) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-success"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mb-6">
                <span>{((vestingData.totalClaimed / vestingData.totalVested) * 100).toFixed(0)}% claimed</span>
                <span>Next: {vestingData.nextClaimDate}</span>
              </div>

              {/* Claim Schedule Items */}
              <div className="space-y-2">
                {vestingSchedule.map((item, index) => (
                  <div
                    key={index}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
                      item.status === "locked"
                        ? "bg-secondary/30 border-border"
                        : "bg-success/5 border-success/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        item.status === "claimable" ? "bg-success/10" : "bg-warning/10"
                      }`}>
                        {item.status === "locked" ? (
                          <Lock className="w-4 h-4 text-warning" />
                        ) : (
                          <Unlock className="w-4 h-4 text-success" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{item.period}</p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-foreground text-sm">{item.amount.toLocaleString()} MLC</p>
                      {item.status === "locked" ? (
                        <span className="px-2.5 py-1 rounded-lg bg-warning/10 text-warning text-xs font-medium flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {item.daysLeft}d
                        </span>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleVestingClaim(index)}
                          className="px-3 py-1.5 rounded-lg bg-success text-success-foreground text-xs font-semibold flex items-center gap-1.5"
                        >
                          Claim <ArrowRight className="w-3 h-3" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Auto-Stake */}
              <div className="mt-4 p-3 rounded-xl bg-card border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Percent className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Auto-Stake Claimed Tokens</p>
                    <p className="text-xs text-muted-foreground">Earn {vestingData.stakingAPY}% APY automatically</p>
                  </div>
                </div>
                <button
                  onClick={() => setAutoStakeEnabled(!autoStakeEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoStakeEnabled ? "bg-success" : "bg-secondary"
                  }`}
                >
                  <motion.div
                    animate={{ x: autoStakeEnabled ? 24 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-card shadow-md"
                  />
                </button>
              </div>
            </div>

            {/* Token Value Projection */}
            <div className="mlc-card-elevated">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Value Projection
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-secondary/50 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Current Rate</p>
                  <p className="text-xl font-bold text-foreground">${vestingData.currentRate}</p>
                  <p className="text-xs text-muted-foreground">per MLC</p>
                </div>
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Projected Rate</p>
                  <p className="text-xl font-bold text-primary">${vestingData.projectedRate}</p>
                  <p className="text-xs text-success">{vestingData.rateChange}</p>
                </div>
                <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Projected Value</p>
                  <p className="text-xl font-bold text-success">${(vestingData.totalVested * vestingData.projectedRate).toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">at launch</p>
                </div>
              </div>
            </div>

            {/* Claim Requests History */}
            <ClaimRequestsHistory />
          </motion.div>
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

      {/* Vesting Claim Modal */}
      <AnimatePresence>
        {showVestingClaimModal && selectedClaimIndex !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (vestingClaimStep !== "processing") {
                  setShowVestingClaimModal(false);
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
                {vestingClaimStep === "confirm" && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                          <Unlock className="w-6 h-6 text-success" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">Claim Tokens</h2>
                          <p className="text-sm text-muted-foreground">{vestingSchedule[selectedClaimIndex].period} release</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowVestingClaimModal(false)}
                        className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
                      >
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-success/10 to-primary/10 border border-success/20 text-center">
                        <p className="text-sm text-muted-foreground">Tokens to Claim</p>
                        <p className="text-3xl font-bold text-foreground mt-1">
                          {vestingSchedule[selectedClaimIndex].amount.toLocaleString()} MLC
                        </p>
                        <p className="text-sm text-success mt-1">
                          ≈ ${(vestingSchedule[selectedClaimIndex].amount * vestingData.currentRate).toFixed(2)} USD
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Claim amount</span>
                          <span className="font-semibold text-foreground">{vestingSchedule[selectedClaimIndex].amount.toLocaleString()} MLC</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Current rate</span>
                          <span className="font-semibold text-foreground">${vestingData.currentRate}</span>
                        </div>
                        {autoStakeEnabled && (
                          <div className="flex justify-between items-center pt-2 border-t border-border">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Percent className="w-3.5 h-3.5" /> Auto-stake
                            </span>
                            <span className="font-semibold text-success">Enabled ({vestingData.stakingAPY}% APY)</span>
                          </div>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                        <p className="text-xs text-muted-foreground flex items-start gap-2">
                          <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                          This transaction is processed on-chain. Your tokens will appear in your wallet within a few minutes.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowVestingClaimModal(false)}
                        className="flex-1 mlc-btn-secondary"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={processVestingClaim}
                        className="flex-1 mlc-btn-primary flex items-center justify-center gap-2"
                      >
                        <Unlock className="w-4 h-4" />
                        Confirm Claim
                      </motion.button>
                    </div>
                  </>
                )}

                {vestingClaimStep === "processing" && (
                  <div className="py-12 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"
                    />
                    <h2 className="text-xl font-semibold text-foreground">Processing Claim</h2>
                    <p className="text-muted-foreground mt-2">Confirming on-chain transaction...</p>
                    <p className="text-xs text-muted-foreground mt-1">This usually takes less than a minute</p>
                  </div>
                )}

                {vestingClaimStep === "done" && (
                  <div className="py-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="w-10 h-10 text-success" />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-foreground">Tokens Claimed!</h2>
                    <p className="text-muted-foreground mt-2">
                      <span className="font-bold text-primary">{vestingSchedule[selectedClaimIndex].amount.toLocaleString()} MLC</span> added to your wallet
                    </p>
                    {autoStakeEnabled && (
                      <p className="text-sm text-success mt-2 flex items-center justify-center gap-1">
                        <BadgeCheck className="w-4 h-4" />
                        Auto-staked at {vestingData.stakingAPY}% APY
                      </p>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowVestingClaimModal(false)}
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

      {/* Buy More MLC Modal */}
      <AnimatePresence>
        {showBuyModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBuyModal(false)}
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
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl mlc-gradient-bg flex items-center justify-center">
                      <Coins className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Buy More MLC</h2>
                      <p className="text-sm text-muted-foreground">Phase 1 pricing active</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowBuyModal(false)}
                    className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current Price</span>
                      <span className="text-2xl font-bold text-primary">$0.01</span>
                    </div>
                    <p className="text-xs text-success mt-1">🟢 Phase 1 — Best price available!</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Amount (USD)</label>
                    <input 
                      type="number" 
                      placeholder="100" 
                      defaultValue={100}
                      className="mlc-input mt-1" 
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-secondary/50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">You'll receive</span>
                      <span className="text-lg font-bold text-foreground">~10,000 MLC</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-muted-foreground">Phase 1 Bonus</span>
                      <span className="text-sm font-medium text-success">+1,000 MLC (10%)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
                    <p className="text-xs text-warning flex items-start gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      Phase 1 ends January 15, 2026. After that, price increases to $0.015.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowBuyModal(false)}
                    className="flex-1 mlc-btn-secondary"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 mlc-btn-primary flex items-center justify-center gap-2"
                  >
                    <Coins className="w-4 h-4" />
                    Buy Now
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
    </div>
  );
};

export default UserDashboard;
