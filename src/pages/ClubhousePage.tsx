import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, Trophy, MessageSquare, Star, Flame, Crown,
  ArrowRight, Zap, Shield, Target, Gamepad2, Award,
  TrendingUp, Heart, Share2, ChevronRight, LogIn
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import clubhouseLogo from "@/assets/microleague_clubhouse.webp";

const communityStats = [
  { label: "Active Members", value: "12,847", icon: Users },
  { label: "Simulations Run", value: "284K+", icon: Gamepad2 },
  { label: "Tournaments Created", value: "1,240", icon: Trophy },
  { label: "Total MLC Earned", value: "2.4M", icon: TrendingUp },
];

const featuredCreators = [
  { name: "Coach Mike", avatar: "⚽", followers: 3420, leagues: 8, sport: "Football", badge: "Verified" },
  { name: "BBall Dave", avatar: "🏀", followers: 2180, leagues: 5, sport: "Basketball", badge: "Top Creator" },
  { name: "GameMaster", avatar: "🎮", followers: 5640, leagues: 12, sport: "E-Sports", badge: "Diamond" },
  { name: "CricketFan", avatar: "🏏", followers: 1890, leagues: 3, sport: "Cricket", badge: "Rising" },
];

const trendingDiscussions = [
  { title: "1996 Bulls vs 2017 Warriors — Who wins?", replies: 342, likes: 1240, sport: "NBA", hot: true },
  { title: "Best NFL dynasty of all time?", replies: 189, likes: 876, sport: "NFL", hot: true },
  { title: "Should cross-era sims adjust for rule changes?", replies: 156, likes: 543, sport: "General", hot: false },
  { title: "My 8-team baseball bracket results — insane upsets!", replies: 98, likes: 412, sport: "MLB", hot: false },
  { title: "Prediction: MLC hits $0.05 before Q3", replies: 267, likes: 1102, sport: "MLC", hot: true },
];

const activeLeagues = [
  { name: "Street Champions League", sport: "Football", members: 1240, prizePool: "50,000 MLC", status: "Season Active" },
  { name: "Weekend Warriors Cup", sport: "Basketball", members: 380, prizePool: "15,000 MLC", status: "Open Entry" },
  { name: "E-Sports Arena S2", sport: "E-Sports", members: 2048, prizePool: "100,000 MLC", status: "Full" },
  { name: "Community Cricket Cup", sport: "Cricket", members: 156, prizePool: "5,000 MLC", status: "Open Entry" },
];

const recentResults = [
  { matchup: "1986 Mets vs 1927 Yankees", winner: "1927 Yankees", score: "6-3", sport: "MLB", time: "2 hours ago" },
  { matchup: "2007 Patriots vs 1985 Bears", winner: "1985 Bears", score: "24-21", sport: "NFL", time: "5 hours ago" },
  { matchup: "1996 Bulls vs 2017 Warriors", winner: "1996 Bulls", score: "108-102", sport: "NBA", time: "1 day ago" },
];

const creatorBenefits = [
  { icon: Trophy, title: "Launch Leagues", desc: "Create and manage competitive leagues with entry fees and prize pools." },
  { icon: Zap, title: "Launch Tokens", desc: "Create your own league token paired with MLC liquidity — pump.fun style." },
  { icon: Target, title: "Sell Merchandise", desc: "Offer branded merch to your community, payable in MLC." },
  { icon: Award, title: "Earn Revenue", desc: "Earn from entry fees, token trades (1% fee), and community engagement." },
];

const ClubhousePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Hero */}
        <div className="bg-background border-b border-border">
          <div className="mlc-container py-16 md:py-24 text-center">
            <motion.img
              src={clubhouseLogo}
              alt="MicroLeague Clubhouse"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-32 md:h-48 w-auto mx-auto mb-6"
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-xl mx-auto mb-8"
            >
              Where legends meet data. Join the community, debate matchups, follow creators, and climb the ranks.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link to="/simulate" className="mlc-btn-primary inline-flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" /> Sim Your Dream Matchup
              </Link>
              <a
                href="https://discord.gg/microleague"
                target="_blank"
                rel="noopener noreferrer"
                className="mlc-btn-secondary inline-flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> Join Our Discord
              </a>
            </motion.div>
          </div>
        </div>

        {/* Community Stats */}
        <div className="mlc-container py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {communityStats.map((stat) => (
              <div key={stat.label} className="mlc-card text-center">
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mlc-container pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Trending Discussions - 2 cols */}
            <div className="lg:col-span-2 space-y-6">
              <div className="mlc-card-elevated">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" /> Trending Discussions
                  </h2>
                  <span className="text-xs text-muted-foreground">Updated live</span>
                </div>
                <div className="space-y-0">
                  {trendingDiscussions.map((d, i) => (
                    <motion.div
                      key={d.title}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-secondary/30 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="px-2 py-0.5 rounded-full bg-secondary text-xs font-medium text-secondary-foreground">{d.sport}</span>
                          {d.hot && <Flame className="w-3.5 h-3.5 text-warning" />}
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">{d.title}</p>
                      </div>
                      <div className="flex items-center gap-4 ml-4 shrink-0">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {d.likes}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> {d.replies}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recent Simulation Results */}
              <div className="mlc-card-elevated">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                  <Gamepad2 className="w-5 h-5 text-primary" /> Recent Results
                </h2>
                <div className="space-y-3">
                  {recentResults.map((r) => (
                    <div key={r.matchup} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border">
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{r.sport}</span>
                        <p className="text-sm font-medium text-foreground mt-1">{r.matchup}</p>
                        <p className="text-xs text-muted-foreground">{r.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-success">{r.winner}</p>
                        <p className="text-xs text-muted-foreground">{r.score}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Leagues */}
              <div className="mlc-card-elevated">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" /> Active Leagues
                  </h2>
                  <Link to="/dashboard" className="text-xs text-primary hover:underline">View in Dashboard →</Link>
                </div>
                <div className="space-y-3">
                  {activeLeagues.map((l) => (
                    <div key={l.name} className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/30 transition-all cursor-pointer">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{l.name}</p>
                        <p className="text-xs text-muted-foreground">{l.sport} · {l.members} members</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{l.prizePool}</p>
                        <span className={`text-xs font-medium ${l.status === "Full" ? "text-destructive" : "text-success"}`}>{l.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Featured Creators */}
              <div className="mlc-card-elevated">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                  <Crown className="w-5 h-5 text-warning" /> Featured Creators
                </h2>
                <div className="space-y-3">
                  {featuredCreators.map((c) => (
                    <div key={c.name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/30 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl">
                        {c.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.sport} · {c.leagues} leagues</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">{c.badge}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Become a Creator CTA */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="mlc-card-elevated border-primary/20 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 mlc-gradient-bg" />
                <div className="pt-2">
                  <h2 className="text-lg font-bold text-foreground mb-2">Creator Program</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Launch leagues, create tokens, sell merch, and build your sports community on MicroLeague.
                  </p>
                  <div className="space-y-3 mb-6">
                    {creatorBenefits.map((b) => (
                      <div key={b.title} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <b.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{b.title}</p>
                          <p className="text-xs text-muted-foreground">{b.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Link
                      to="/creator"
                      className="mlc-btn-primary w-full flex items-center justify-center gap-2 text-sm"
                    >
                      <ArrowRight className="w-4 h-4" /> Become a Creator
                    </Link>
                    <Link
                      to="/creator"
                      className="mlc-btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                    >
                      <LogIn className="w-4 h-4" /> Login as Creator
                    </Link>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    4-step verification required · Free to apply
                  </p>
                </div>
              </motion.div>

              {/* Discord CTA */}
              <div className="mlc-card-elevated bg-[hsl(235,86%,55%)] border-none text-center">
                <MessageSquare className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="font-bold text-white mb-1">Join the Community</h3>
                <p className="text-sm text-white/70 mb-4">Debate matchups, share brackets, and connect with other fans on Discord.</p>
                <a
                  href="https://discord.gg/microleague"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-white text-[hsl(235,86%,55%)] hover:bg-white/90 transition-colors text-sm"
                >
                  Join Discord <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Quick Links */}
              <div className="mlc-card">
                <h3 className="font-semibold text-foreground mb-3">Quick Links</h3>
                <div className="space-y-2">
                  {[
                    { label: "Simulate a Matchup", href: "/simulate", icon: Gamepad2 },
                    { label: "Create a Tournament", href: "/tournament", icon: Trophy },
                    { label: "View Leaderboard", href: "/leaderboard", icon: TrendingUp },
                    { label: "My Dashboard", href: "/dashboard", icon: Users },
                  ].map((link) => (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <span className="flex items-center gap-2 text-sm text-foreground">
                        <link.icon className="w-4 h-4 text-primary" />
                        {link.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClubhousePage;
