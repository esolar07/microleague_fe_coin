import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import microleagueBanner from "@/assets/microleague-banner.png";
import {
  Zap, Trophy, Users, Share2, ChevronDown, ArrowLeft, Play
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const sports = ["Football", "Basketball", "Baseball"];

const seasonsBysport: Record<string, string[]> = {
  Football: ["2023", "2022", "2021", "2020", "2019", "2018", "2017", "2007", "2001", "1998", "1996", "1985", "1972"],
  Basketball: ["2023", "2022", "2021", "2020", "2019", "2017", "2016", "1996", "1995", "1992", "1986"],
  Baseball: ["2023", "2022", "2021", "2020", "2019", "2018", "2017", "2004", "1998", "1986", "1927"],
};

const teamsBySpAndSeason: Record<string, string[]> = {
  "Football-2023": ["Kansas City Chiefs", "San Francisco 49ers", "Baltimore Ravens", "Detroit Lions"],
  "Football-2007": ["New England Patriots", "New York Giants", "Green Bay Packers", "Dallas Cowboys"],
  "Football-1985": ["Chicago Bears", "New England Patriots", "Miami Dolphins", "Los Angeles Rams"],
  "Basketball-2017": ["Golden State Warriors", "Cleveland Cavaliers", "San Antonio Spurs", "Houston Rockets"],
  "Basketball-1996": ["Chicago Bulls", "Seattle SuperSonics", "Orlando Magic", "Utah Jazz"],
  "Baseball-1986": ["New York Mets", "Boston Red Sox", "Houston Astros", "California Angels"],
  "Baseball-1927": ["New York Yankees", "Pittsburgh Pirates", "Philadelphia Athletics", "St. Louis Cardinals"],
};

const getTeams = (sport: string, season: string) => {
  return teamsBySpAndSeason[`${sport}-${season}`] || [
    `${sport} Team A`, `${sport} Team B`, `${sport} Team C`, `${sport} Team D`
  ];
};

const popularMatchups = [
  { tags: ["MLB", "Classic"], title: "1986 Mets vs 1927 Yankees", desc: "The Amazin' Mets take on Murderers' Row in this cross-era showdown." },
  { tags: ["NFL", "Dynasty"], title: "2007 Patriots vs 1985 Bears", desc: "Perfect season offense meets legendary defense in this epic clash." },
  { tags: ["NBA", "Goat"], title: "1996 Bulls vs 2017 Warriors", desc: "Jordan's championship team faces Curry's record-breaking squad." },
];

const features = [
  { icon: Zap, title: "Era-Rules Toggle", desc: "Adjustable Rule Sets" },
  { icon: Trophy, title: "Real Stats", desc: "Authentic team data" },
  { icon: Users, title: "Share Results", desc: "Post & debate outcomes" },
];

const SimulatePage = () => {
  const [sport, setSport] = useState("");
  const [homeSeason, setHomeSeason] = useState("");
  const [homeTeam, setHomeTeam] = useState("");
  const [awaySeason, setAwaySeason] = useState("");
  const [awayTeam, setAwayTeam] = useState("");

  const seasons = sport ? (seasonsBysport[sport] || []) : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Hero Banner */}
        <div className="relative overflow-hidden">
          <img src={microleagueBanner} alt="MicroLeague Sports Banner" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/60" />
          <div className="mlc-container py-20 md:py-28 relative z-10 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4 font-mono"
            >
              Dream Matchup Simulator
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-primary-foreground/70 max-w-xl mx-auto"
            >
              Pick any two teams from any era and watch history unfold. Our AI-powered engine simulates every play.
            </motion.p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mlc-container pt-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Features */}
        <div className="mlc-container py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="mlc-card text-center">
                <f.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Simulator Form */}
        <div className="mlc-container pb-16">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">Simulate a Cross-era Fantasy Match Up.</h2>
            <p className="text-muted-foreground">Select a sports team from any era.</p>
          </div>

          <div className="max-w-2xl mx-auto space-y-8">
            {/* Sport */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Sport:</label>
              <div className="relative">
                <select
                  value={sport}
                  onChange={(e) => { setSport(e.target.value); setHomeSeason(""); setHomeTeam(""); setAwaySeason(""); setAwayTeam(""); }}
                  className="mlc-input appearance-none pr-10"
                >
                  <option value="">Select a sport</option>
                  {sports.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Home Team */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Home Team Season:</label>
                <div className="relative">
                  <select
                    value={homeSeason}
                    onChange={(e) => { setHomeSeason(e.target.value); setHomeTeam(""); }}
                    className="mlc-input appearance-none pr-10"
                    disabled={!sport}
                  >
                    <option value="">Select Season</option>
                    {seasons.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Home Team Name:</label>
                <div className="relative">
                  <select
                    value={homeTeam}
                    onChange={(e) => setHomeTeam(e.target.value)}
                    className="mlc-input appearance-none pr-10"
                    disabled={!homeSeason}
                  >
                    <option value="">Select Home Team</option>
                    {(sport && homeSeason ? getTeams(sport, homeSeason) : []).map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Away Team */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Away Team Season:</label>
                <div className="relative">
                  <select
                    value={awaySeason}
                    onChange={(e) => { setAwaySeason(e.target.value); setAwayTeam(""); }}
                    className="mlc-input appearance-none pr-10"
                    disabled={!sport}
                  >
                    <option value="">Select Season</option>
                    {seasons.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Away Team Name:</label>
                <div className="relative">
                  <select
                    value={awayTeam}
                    onChange={(e) => setAwayTeam(e.target.value)}
                    className="mlc-input appearance-none pr-10"
                    disabled={!awaySeason}
                  >
                    <option value="">Select Away Team</option>
                    {(sport && awaySeason ? getTeams(sport, awaySeason) : []).map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <button
              disabled={!homeTeam || !awayTeam}
              className="mlc-btn-primary w-full md:w-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" /> Simulate Match Up
            </button>
          </div>
        </div>

        {/* Popular Matchups */}
        <div className="border-t border-border">
          <div className="mlc-container py-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-2">Popular Matchups</h2>
            <p className="text-center text-muted-foreground mb-10">See what the community is simulating</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {popularMatchups.map((m) => (
                <div key={m.title} className="mlc-card-elevated hover:border-primary/30 transition-all">
                  <div className="flex gap-2 mb-3">
                    {m.tags.map((t) => (
                      <span key={t} className="px-3 py-1 rounded-full border border-border text-xs font-medium text-foreground">{t}</span>
                    ))}
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{m.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{m.desc}</p>
                  <button className="w-full py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                    Try This Matchup
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SimulatePage;
