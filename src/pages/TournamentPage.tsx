import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap, CheckCircle, Share2, Trophy, Users, ArrowRight,
  ChevronDown
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import microleagueBanner from "@/assets/microleague-banner.png";

const sports = ["Football", "Basketball", "Baseball"];

const howItWorks = [
  { step: 1, title: "Pick sport & size", desc: "Football, Basketball, or Baseball; 4 or 8 teams." },
  { step: 2, title: "Name your scenario", desc: "Unique names create a public URL and enable search." },
  { step: 3, title: "Seed your teams", desc: "Add team + year per slot. Higher seed is home." },
  { step: 4, title: "Start & simulate", desc: "Lock the bracket; run matchups (results open in a new tab)." },
  { step: 5, title: "Auto-advance & crown", desc: "Winners flow forward; champion gets a crown + shareables." },
];

const featureHighlights = [
  "4- & 8-team brackets, standard seeding",
  "Higher seed = home, every round",
  "Results open in a new tab",
  "Auto-advance winners (no manual edits)",
  "Unique scenario URLs (public & searchable)",
  "Shareable image + link",
  "Discord updates: created & completed",
];

const features = [
  { icon: Zap, title: "Fast, not fussy", desc: "Set it up once; run every game with a click." },
  { icon: CheckCircle, title: "Credible results", desc: "Powered by MicroLeague's trusted simulation engine." },
  { icon: Share2, title: "Share-ready", desc: "Download a bracket image and copy a public URL." },
  { icon: Trophy, title: "Community-first", desc: "Discord posts for created and completed brackets." },
];

const exampleScenarios = [
  { sport: "Football", name: "Best Pennsylvania Teams", size: "8-team bracket" },
  { sport: "Basketball", name: "Greatest Lakers Era", size: "4-team bracket" },
  { sport: "Baseball", name: "Yankees Legends Bracket", size: "8-team bracket" },
];

const faqs = [
  { q: "What bracket sizes are available?", a: "4- and 8-team brackets in Football, Basketball, and Baseball." },
  { q: "Who's the home team?", a: "The higher seed is always the home team in every round." },
  { q: "Can I edit after I start?", a: "No. Clicking Start Bracket locks seeds and teams for credible results." },
  { q: "Do injuries or fatigue carry over?", a: "Not in Phase 1. Each game is a clean single-game simulation." },
  { q: "How do I share my bracket?", a: "Use Download Image for a PNG or Copy Link for the public URL." },
  { q: "Where do results show up on Discord?", a: 'Per-game results post to the existing results channel. We also post "created" and "completed" updates to a scenario-updates channel.' },
  { q: "Who can run the simulations?", a: "Only the bracket creator can run simulations and advance rounds; anyone can view public brackets." },
  { q: "How do people find my bracket later?", a: "By your unique scenario name or the public link." },
];

const sportColors: Record<string, string> = {
  Football: "bg-primary text-primary-foreground",
  Basketball: "bg-primary text-primary-foreground",
  Baseball: "bg-primary text-primary-foreground",
};

const TournamentPage = () => {
  const [tournamentName, setTournamentName] = useState("");
  const [sport, setSport] = useState("");
  const [teamCount, setTeamCount] = useState<4 | 8>(4);
  const [bracketType, setBracketType] = useState<"single" | "multi">("single");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Hero */}
        <div className="relative overflow-hidden">
          <img src={microleagueBanner} alt="MicroLeague Sports Banner" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/60" />
          <div className="mlc-container py-20 md:py-28 relative z-10 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4"
            >
              Tournament Brackets
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-primary-foreground/70 max-w-xl mx-auto"
            >
              Build 4 or 8-team brackets. Simulate every matchup. Crown your champion.
            </motion.p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mlc-container py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="mlc-card">
                <f.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-bold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Create Bracket Form */}
        <div className="bg-muted">
          <div className="mlc-container py-16">
            <div className="max-w-2xl mx-auto">
              <div className="mlc-card-elevated">
                <span className="inline-block px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold mb-4">Step 1 of 2</span>
                <h2 className="text-2xl font-bold text-foreground mb-2">Create Tournament Bracket</h2>
                <p className="text-muted-foreground mb-8">Set up a 4 or 8-team tournament bracket to simulate championship matchups</p>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">
                      Tournament Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., March Madness 2024"
                      value={tournamentName}
                      onChange={(e) => setTournamentName(e.target.value)}
                      className="mlc-input"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Give your tournament a memorable name</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">
                      Sport <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={sport}
                        onChange={(e) => setSport(e.target.value)}
                        className="mlc-input appearance-none pr-10"
                      >
                        <option value="">Select a sport</option>
                        {sports.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">
                      Number of Teams <span className="text-destructive">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {([4, 8] as const).map((n) => (
                        <button
                          key={n}
                          onClick={() => setTeamCount(n)}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            teamCount === n
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <p className="text-2xl font-bold text-foreground">{n}</p>
                          <p className="text-sm text-muted-foreground">Teams</p>
                          <p className="text-xs text-primary font-medium">{n === 4 ? "2 Rounds" : "3 Rounds"}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">
                      Bracket Type <span className="text-destructive">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setBracketType("single")}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          bracketType === "single"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <p className="font-bold text-foreground">Single User</p>
                        <p className="text-xs text-muted-foreground">You control all teams</p>
                      </button>
                      <button
                        onClick={() => setBracketType("multi")}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          bracketType === "multi"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <p className="font-bold text-foreground">Multi User</p>
                        <p className="text-xs text-muted-foreground">Invite others to join</p>
                      </button>
                    </div>
                    {bracketType === "multi" && (
                      <p className="text-xs text-primary mt-2">
                        <Link to="#" className="underline">Create an account</Link> or <Link to="#" className="underline">sign in</Link> to create multi-user brackets.
                      </p>
                    )}
                  </div>

                  <button
                    disabled={!tournamentName || !sport}
                    className="mlc-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next: Select Teams <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mlc-container py-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">How It Works</h2>
          <div className="max-w-2xl mx-auto space-y-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-muted">
          <div className="mlc-container py-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-10">Feature Highlights (Phase 1)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {featureHighlights.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm text-foreground">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Example Scenarios */}
        <div className="mlc-container py-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-10">Example Scenarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exampleScenarios.map((s) => (
              <div key={s.name} className="mlc-card-elevated hover:border-primary/30 transition-all">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${sportColors[s.sport]}`}>
                  {s.sport}
                </span>
                <h3 className="font-bold text-foreground mb-1">{s.name}</h3>
                <p className="text-sm text-muted-foreground">{s.size}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mlc-gradient-bg py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-3">Crown your champion today.</h2>
            <p className="text-primary-foreground/70">Build it in minutes. Share it everywhere.</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mlc-container py-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-10">FAQ</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="mlc-card">
                <h3 className="font-bold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TournamentPage;
