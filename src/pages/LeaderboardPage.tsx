import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy, Crown, Medal, Star, TrendingUp, Coins, Users,
  Flame, Zap, Shield, ChevronDown, ArrowUpRight, Award,
  Target, Sparkles
} from "lucide-react";
import Header from "@/components/layout/Header";
import logo from "@/assets/logo.webp";

const LeaderboardPage = () => {
  const [activeFilter, setActiveFilter] = useState<"all" | "weekly" | "monthly" | "alltime">("all");
  const [activeCategory, setActiveCategory] = useState<"overall" | "simulations" | "predictions" | "referrals">("overall");

  const filters = [
    { id: "all" as const, label: "This Season" },
    { id: "weekly" as const, label: "This Week" },
    { id: "monthly" as const, label: "This Month" },
    { id: "alltime" as const, label: "All Time" },
  ];

  const categories = [
    { id: "overall" as const, label: "Overall", icon: Trophy },
    { id: "simulations" as const, label: "Simulations", icon: Target },
    { id: "predictions" as const, label: "Predictions", icon: Star },
    { id: "referrals" as const, label: "Referrals", icon: Users },
  ];

  // Top 3 podium
  const topThree = [
    {
      rank: 1,
      name: "CryptoKing_99",
      avatar: "👑",
      totalMLC: 284500,
      rewards: 42000,
      tier: "Diamond",
      streak: 34,
      badge: "🏆",
      change: "+4.2%",
    },
    {
      rank: 2,
      name: "StreetBaller",
      avatar: "⚽",
      totalMLC: 198200,
      rewards: 31500,
      tier: "Diamond",
      streak: 22,
      badge: "🥈",
      change: "+2.8%",
    },
    {
      rank: 3,
      name: "PredictionPro",
      avatar: "🎯",
      totalMLC: 167800,
      rewards: 25200,
      tier: "Platinum",
      streak: 18,
      badge: "🥉",
      change: "+3.1%",
    },
  ];

  // Extended leaderboard
  const leaderboard = [
    { rank: 4, name: "LeagueHero", avatar: "🏅", totalMLC: 142300, rewards: 18900, tier: "Platinum", streak: 15, change: "+1.9%" },
    { rank: 5, name: "TokenMaster", avatar: "💎", totalMLC: 128750, rewards: 16400, tier: "Gold", streak: 12, change: "+2.4%" },
    { rank: 6, name: "GameChanger", avatar: "🔥", totalMLC: 115200, rewards: 14800, tier: "Gold", streak: 10, change: "+1.5%" },
    { rank: 7, name: "MLC_Whale", avatar: "🐋", totalMLC: 104600, rewards: 13200, tier: "Gold", streak: 9, change: "-0.3%" },
    { rank: 8, name: "SimRunner", avatar: "🎮", totalMLC: 98400, rewards: 11700, tier: "Gold", streak: 8, change: "+3.7%" },
    { rank: 9, name: "QuestKing", avatar: "⭐", totalMLC: 87200, rewards: 10500, tier: "Silver", streak: 14, change: "+0.8%" },
    { rank: 10, name: "FutsalFan", avatar: "⚡", totalMLC: 79800, rewards: 9200, tier: "Silver", streak: 7, change: "+1.2%" },
    { rank: 11, name: "BettorX", avatar: "🎰", totalMLC: 72400, rewards: 8100, tier: "Silver", streak: 6, change: "-1.1%" },
    { rank: 12, name: "ChainGamer", avatar: "🎯", totalMLC: 68900, rewards: 7500, tier: "Silver", streak: 5, change: "+0.4%" },
    { rank: 13, name: "RefKing", avatar: "🤝", totalMLC: 61200, rewards: 6800, tier: "Bronze", streak: 11, change: "+5.2%" },
    { rank: 14, name: "SportsFan21", avatar: "🏀", totalMLC: 55400, rewards: 5900, tier: "Bronze", streak: 4, change: "+0.7%" },
    { rank: 15, name: "MLCNewbie", avatar: "🌟", totalMLC: 48700, rewards: 4200, tier: "Bronze", streak: 3, change: "+8.1%" },
  ];

  // Current user stats
  const myRank = {
    rank: 247,
    name: "You",
    avatar: "🧑",
    totalMLC: 4000,
    rewards: 250,
    tier: "Bronze",
    streak: 2,
    change: "+12.5%",
    percentile: "Top 18%",
  };

  // Rank tiers
  const rankTiers = [
    { name: "Diamond", icon: "💎", minMLC: 150000, color: "from-blue-400 to-purple-500", holders: 12 },
    { name: "Platinum", icon: "⚡", minMLC: 100000, color: "from-slate-300 to-slate-500", holders: 34 },
    { name: "Gold", icon: "🥇", minMLC: 50000, color: "from-yellow-400 to-amber-500", holders: 156 },
    { name: "Silver", icon: "🥈", minMLC: 10000, color: "from-gray-300 to-gray-400", holders: 489 },
    { name: "Bronze", icon: "🥉", minMLC: 0, color: "from-amber-600 to-amber-700", holders: 2156 },
  ];

  // Season rewards
  const seasonRewards = [
    { position: "1st Place", reward: "50,000 MLC + Diamond NFT", icon: Crown },
    { position: "2nd Place", reward: "30,000 MLC + Platinum NFT", icon: Medal },
    { position: "3rd Place", reward: "15,000 MLC + Gold NFT", icon: Award },
    { position: "Top 10", reward: "5,000 MLC + Silver Badge", icon: Star },
    { position: "Top 50", reward: "1,000 MLC + Bronze Badge", icon: Shield },
  ];

  const tierColor = (tier: string) => {
    switch (tier) {
      case "Diamond": return "text-blue-400";
      case "Platinum": return "text-slate-400";
      case "Gold": return "text-yellow-500";
      case "Silver": return "text-gray-400";
      default: return "text-amber-600";
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Trophy className="w-8 h-8 text-primary" />
                Leaderboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Season 1 — Compete, earn, and climb the ranks</p>
            </div>
            <Link to="/dashboard" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              Back to Dashboard
            </Link>
          </div>

          {/* Your Rank Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mlc-card-elevated bg-gradient-to-r from-primary/10 via-transparent to-success/10 border-primary/20 mb-8"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                  {myRank.avatar}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Your Position</p>
                  <p className="text-2xl font-bold text-foreground">#{myRank.rank}</p>
                  <p className="text-xs text-primary font-medium">{myRank.percentile}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Total MLC</p>
                  <p className="text-lg font-bold text-foreground">{myRank.totalMLC.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Rewards Earned</p>
                  <p className="text-lg font-bold text-success">{myRank.rewards.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Tier</p>
                  <p className={`text-lg font-bold ${tierColor(myRank.tier)}`}>{myRank.tier}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Streak</p>
                  <p className="text-lg font-bold text-warning flex items-center gap-1"><Flame className="w-4 h-4" />{myRank.streak}d</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters & Category */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-1.5">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeFilter === f.id
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Top 3 Podium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          >
            {/* 2nd Place */}
            <div className="sm:order-1 sm:mt-8">
              <div className="mlc-card-elevated text-center relative overflow-hidden group hover:border-primary/30 transition-all">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-muted to-muted-foreground/50" />
                <div className="text-4xl mb-3">{topThree[1].badge}</div>
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center text-3xl mx-auto mb-3">
                  {topThree[1].avatar}
                </div>
                <p className="font-bold text-foreground">{topThree[1].name}</p>
                <p className={`text-xs font-medium ${tierColor(topThree[1].tier)} mb-3`}>{topThree[1].tier}</p>
                <div className="p-3 rounded-xl bg-secondary/50 mb-2">
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                  <p className="text-xl font-bold text-foreground">{topThree[1].totalMLC.toLocaleString()} MLC</p>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><Coins className="w-3 h-3" /> {topThree[1].rewards.toLocaleString()} rewards</span>
                  <span className="text-success font-medium flex items-center gap-1"><Flame className="w-3 h-3" /> {topThree[1].streak}d streak</span>
                </div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="sm:order-2">
              <div className="mlc-card-elevated text-center relative overflow-hidden group hover:border-primary/30 transition-all border-primary/20">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-warning to-primary" />
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="text-5xl mb-3"
                >
                  {topThree[0].badge}
                </motion.div>
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl mx-auto mb-3 ring-2 ring-primary/30">
                  {topThree[0].avatar}
                </div>
                <p className="text-lg font-bold text-foreground">{topThree[0].name}</p>
                <p className={`text-xs font-medium ${tierColor(topThree[0].tier)} mb-3`}>{topThree[0].tier}</p>
                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20 mb-3">
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-bold text-foreground">{topThree[0].totalMLC.toLocaleString()} MLC</p>
                  <p className="text-sm text-success font-medium">{topThree[0].change}</p>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><Coins className="w-3 h-3" /> {topThree[0].rewards.toLocaleString()} rewards</span>
                  <span className="text-warning font-medium flex items-center gap-1"><Flame className="w-3 h-3" /> {topThree[0].streak}d streak</span>
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="sm:order-3 sm:mt-8">
              <div className="mlc-card-elevated text-center relative overflow-hidden group hover:border-primary/30 transition-all">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-warning to-warning/70" />
                <div className="text-4xl mb-3">{topThree[2].badge}</div>
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center text-3xl mx-auto mb-3">
                  {topThree[2].avatar}
                </div>
                <p className="font-bold text-foreground">{topThree[2].name}</p>
                <p className={`text-xs font-medium ${tierColor(topThree[2].tier)} mb-3`}>{topThree[2].tier}</p>
                <div className="p-3 rounded-xl bg-secondary/50 mb-2">
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                  <p className="text-xl font-bold text-foreground">{topThree[2].totalMLC.toLocaleString()} MLC</p>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><Coins className="w-3 h-3" /> {topThree[2].rewards.toLocaleString()} rewards</span>
                  <span className="text-success font-medium flex items-center gap-1"><Flame className="w-3 h-3" /> {topThree[2].streak}d streak</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Leaderboard Table */}
            <div className="lg:col-span-2">
              <div className="mlc-card-elevated">
                <h3 className="text-lg font-semibold text-foreground mb-4">Rankings</h3>
                <div className="space-y-0">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground pb-3 border-b border-border px-3">
                    <span className="col-span-1">#</span>
                    <span className="col-span-3">Player</span>
                    <span className="col-span-2 text-right">Total MLC</span>
                    <span className="col-span-2 text-right">Rewards</span>
                    <span className="col-span-2 text-center">Tier</span>
                    <span className="col-span-2 text-right">Change</span>
                  </div>

                  {leaderboard.map((player, i) => (
                    <motion.div
                      key={player.rank}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="grid grid-cols-12 gap-2 items-center py-3 px-3 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors rounded-lg"
                    >
                      <span className="col-span-1 font-bold text-sm text-muted-foreground">{player.rank}</span>
                      <div className="col-span-3 flex items-center gap-2">
                        <span className="text-lg">{player.avatar}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{player.name}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5 text-warning" />{player.streak}d
                          </p>
                        </div>
                      </div>
                      <span className="col-span-2 text-right text-sm font-bold text-foreground">{player.totalMLC.toLocaleString()}</span>
                      <span className="col-span-2 text-right text-sm font-medium text-success">{player.rewards.toLocaleString()}</span>
                      <span className={`col-span-2 text-center text-xs font-medium ${tierColor(player.tier)}`}>{player.tier}</span>
                      <span className={`col-span-2 text-right text-xs font-medium ${player.change.startsWith("+") ? "text-success" : "text-destructive"}`}>
                        {player.change}
                      </span>
                    </motion.div>
                  ))}

                  {/* Your position highlight */}
                  <div className="mt-2 pt-2 border-t-2 border-primary/30">
                    <div className="grid grid-cols-12 gap-2 items-center py-3 px-3 bg-primary/5 rounded-xl border border-primary/20">
                      <span className="col-span-1 font-bold text-sm text-primary">{myRank.rank}</span>
                      <div className="col-span-3 flex items-center gap-2">
                        <span className="text-lg">{myRank.avatar}</span>
                        <div>
                          <p className="text-sm font-bold text-primary">{myRank.name}</p>
                          <p className="text-[10px] text-muted-foreground">{myRank.percentile}</p>
                        </div>
                      </div>
                      <span className="col-span-2 text-right text-sm font-bold text-foreground">{myRank.totalMLC.toLocaleString()}</span>
                      <span className="col-span-2 text-right text-sm font-medium text-success">{myRank.rewards.toLocaleString()}</span>
                      <span className={`col-span-2 text-center text-xs font-medium ${tierColor(myRank.tier)}`}>{myRank.tier}</span>
                      <span className="col-span-2 text-right text-xs font-medium text-success">{myRank.change}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Rank Tiers */}
              <div className="mlc-card-elevated">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-warning" /> Rank Tiers
                </h3>
                <div className="space-y-3">
                  {rankTiers.map((tier) => (
                    <div key={tier.name} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{tier.icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{tier.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {tier.minMLC > 0 ? `${tier.minMLC.toLocaleString()}+ MLC` : "Starting tier"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">{tier.holders}</p>
                        <p className="text-[10px] text-muted-foreground">holders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Season Rewards */}
              <div className="mlc-card-elevated">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> Season Rewards
                </h3>
                <div className="space-y-3">
                  {seasonRewards.map((sr) => {
                    const Icon = sr.icon;
                    return (
                      <div key={sr.position} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{sr.position}</p>
                          <p className="text-xs text-muted-foreground">{sr.reward}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats Summary */}
              <div className="mlc-card-elevated">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" /> Season Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Players</span>
                    <span className="text-sm font-bold text-foreground">2,847</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total MLC Distributed</span>
                    <span className="text-sm font-bold text-success">1.2M MLC</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Leagues</span>
                    <span className="text-sm font-bold text-foreground">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Season Ends</span>
                    <span className="text-sm font-bold text-warning">42 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeaderboardPage;
