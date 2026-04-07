import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy, Coins, ShoppingBag, BarChart3, Users, TrendingUp,
  Plus, Rocket, Gift, Star, CheckCircle2, ArrowUpRight,
  ImagePlus, DollarSign, Percent, Zap, Crown, Tag, Swords,
  Target, Clock, CalendarDays, MapPin, Shield, Settings,
  ChevronRight, ArrowRight, X, Flame, Award, Vote
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// ---- Token Launch Modal (pump.fun style) ----
const TokenLaunchModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  const [step, setStep] = useState<"config" | "liquidity" | "launched">("config");
  const [tokenName, setTokenName] = useState("");
  const [tokenTicker, setTokenTicker] = useState("");
  const [supply, setSupply] = useState("1000000");
  const [mlcLiquidity, setMlcLiquidity] = useState("5000");

  const launchFee = 250;
  const liquidityNum = parseInt(mlcLiquidity) || 0;
  const totalCost = launchFee + liquidityNum;

  const reset = () => { setStep("config"); setTokenName(""); setTokenTicker(""); setSupply("1000000"); setMlcLiquidity("5000"); };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            {step === "launched" ? "Token Launched!" : "Launch League Token"}
          </DialogTitle>
          <DialogDescription>
            {step === "config" && "Create your league token - pump.fun style on MicroLeague"}
            {step === "liquidity" && "Add MLC liquidity to enable trading"}
            {step === "launched" && "Your token is live on the MicroLeague DEX"}
          </DialogDescription>
        </DialogHeader>

        {step === "config" && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Token Name</label>
              <Input placeholder="e.g. Street Champions Coin" value={tokenName} onChange={(e) => setTokenName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Ticker Symbol</label>
              <Input placeholder="e.g. $SCC" value={tokenTicker} onChange={(e) => setTokenTicker(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Total Supply</label>
              <Input type="number" value={supply} onChange={(e) => setSupply(e.target.value)} />
            </div>
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-xs text-warning font-medium flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5" /> MLC charges 1% on every trade of your token
              </p>
            </div>
            <Button className="w-full" onClick={() => setStep("liquidity")} disabled={!tokenName || !tokenTicker}>
              Next: Add Liquidity <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {step === "liquidity" && (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Token</span>
                <span className="text-sm font-semibold text-foreground">{tokenName} ({tokenTicker})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Supply</span>
                <span className="text-sm font-medium text-foreground">{parseInt(supply).toLocaleString()}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">MLC Liquidity Amount</label>
              <Input type="number" value={mlcLiquidity} onChange={(e) => setMlcLiquidity(e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">Minimum 1,000 MLC required for initial liquidity pool</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Launch Fee</span>
                <span className="font-medium text-foreground">{launchFee.toLocaleString()} MLC</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Liquidity</span>
                <span className="font-medium text-foreground">{liquidityNum.toLocaleString()} MLC</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-sm">
                <span className="font-medium text-foreground">Total</span>
                <span className="font-bold text-primary">{totalCost.toLocaleString()} MLC</span>
              </div>
            </div>
            <Button className="w-full mlc-gradient-bg text-primary-foreground" onClick={() => setStep("launched")}>
              <Rocket className="w-4 h-4 mr-1" /> Launch Token
            </Button>
          </div>
        )}

        {step === "launched" && (
          <div className="text-center py-4 space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </motion.div>
            <div>
              <p className="text-lg font-bold text-foreground">{tokenTicker} is Live!</p>
              <p className="text-sm text-muted-foreground">Trading is now enabled on MicroLeague DEX</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border text-left space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Initial Price</span>
                <span className="font-medium text-foreground">${(liquidityNum / parseInt(supply || "1")).toFixed(6)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Liquidity Pool</span>
                <span className="font-medium text-foreground">{liquidityNum.toLocaleString()} MLC</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">MLC Tx Fee</span>
                <span className="font-medium text-warning">1% per trade</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ---- Merch Modal ----
const MerchModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  const [added, setAdded] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => { onOpenChange(false); setAdded(false); setName(""); setPrice(""); setDesc(""); }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-primary" /> Add Merchandise</DialogTitle>
          <DialogDescription>Add physical or digital merch for your community</DialogDescription>
        </DialogHeader>
        {added ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
            <p className="font-semibold text-foreground">Merch Item Added!</p>
          </motion.div>
        ) : (
          <div className="space-y-4 pt-2">
            <button className="w-full p-8 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-all flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground">
              <ImagePlus className="w-8 h-8" /><span className="text-sm">Upload Product Image</span>
            </button>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Product Name</label>
              <Input placeholder="e.g. League Championship Jersey" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Price (MLC)</label>
              <Input type="number" placeholder="500" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
              <Textarea placeholder="Product details..." value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} />
            </div>
            <Button className="w-full" onClick={handleAdd} disabled={!name || !price}><Plus className="w-4 h-4 mr-1" /> Add Product</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ---- Perks Modal ----
const PerksModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  const [added, setAdded] = useState(false);
  const [perkName, setPerkName] = useState("");
  const [tier, setTier] = useState("");
  const [requirement, setRequirement] = useState("");
  const tiers = ["Bronze (100 MLC)", "Silver (500 MLC)", "Gold (2,000 MLC)", "Diamond (10,000 MLC)"];

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => { onOpenChange(false); setAdded(false); setPerkName(""); setTier(""); setRequirement(""); }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Gift className="w-5 h-5 text-primary" /> Add Community Perk</DialogTitle>
          <DialogDescription>Define perks for your token holders</DialogDescription>
        </DialogHeader>
        {added ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" /><p className="font-semibold text-foreground">Perk Added!</p>
          </motion.div>
        ) : (
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Perk Name</label>
              <Input placeholder="e.g. VIP Match Day Access" value={perkName} onChange={(e) => setPerkName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Holder Tier</label>
              <div className="grid grid-cols-2 gap-2">
                {tiers.map((t) => (
                  <button key={t} onClick={() => setTier(t)} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${tier === t ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/50"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Requirement</label>
              <Input placeholder="e.g. Hold for 30+ days" value={requirement} onChange={(e) => setRequirement(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleAdd} disabled={!perkName || !tier}><Plus className="w-4 h-4 mr-1" /> Add Perk</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ---- New League Modal ----
const NewLeagueModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  const [step, setStep] = useState<"basics" | "rules" | "schedule" | "review" | "created">("basics");
  const [leagueName, setLeagueName] = useState("");
  const [leagueType, setLeagueType] = useState("");
  const [sport, setSport] = useState("");
  const [description, setDescription] = useState("");
  const [maxTeams, setMaxTeams] = useState("16");
  const [entryFee, setEntryFee] = useState("100");
  const [prizePool, setPrizePool] = useState("5000");
  const [format, setFormat] = useState("");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("");
  const [region, setRegion] = useState("");

  const types = ["Professional", "Amateur", "Community", "Invitational"];
  const sports = ["Football", "Basketball", "Cricket", "E-Sports", "Mixed"];
  const formats = ["Round Robin", "Knockout", "Swiss", "Double Elimination"];
  const durations = ["1 Week", "2 Weeks", "1 Month", "Season (3 Months)"];

  const reset = () => {
    setStep("basics"); setLeagueName(""); setLeagueType(""); setSport(""); setDescription("");
    setMaxTeams("16"); setEntryFee("100"); setPrizePool("5000"); setFormat(""); setStartDate(""); setDuration(""); setRegion("");
  };

  const stepIndex = { basics: 0, rules: 1, schedule: 2, review: 3, created: 4 };
  const progress = step === "created" ? 100 : ((stepIndex[step] + 1) / 4) * 100;

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            {step === "created" ? "League Created!" : "Create New League"}
          </DialogTitle>
          <DialogDescription>
            {step === "basics" && "Set up basic league information"}
            {step === "rules" && "Define rules and entry requirements"}
            {step === "schedule" && "Set the schedule and format"}
            {step === "review" && "Review and launch your league"}
            {step === "created" && "Your league is ready for players"}
          </DialogDescription>
        </DialogHeader>

        {step !== "created" && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Step {stepIndex[step] + 1} of 4</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {step === "basics" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">League Name</label>
              <Input placeholder="e.g. Premier Street League" value={leagueName} onChange={(e) => setLeagueName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Sport</label>
              <div className="flex flex-wrap gap-2">
                {sports.map((s) => (
                  <button key={s} onClick={() => setSport(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${sport === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/50"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">League Type</label>
              <div className="grid grid-cols-2 gap-2">
                {types.map((t) => (
                  <button key={t} onClick={() => setLeagueType(t)} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${leagueType === t ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/50"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
              <Textarea placeholder="Tell players what this league is about..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <Button className="w-full" onClick={() => setStep("rules")} disabled={!leagueName || !sport || !leagueType}>
              Next: Rules & Entry <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {step === "rules" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Max Teams / Players</label>
              <Input type="number" value={maxTeams} onChange={(e) => setMaxTeams(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Entry Fee (MLC)</label>
              <Input type="number" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">Set to 0 for free entry</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Prize Pool (MLC)</label>
              <Input type="number" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Tournament Format</label>
              <div className="grid grid-cols-2 gap-2">
                {formats.map((f) => (
                  <button key={f} onClick={() => setFormat(f)} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${format === f ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/50"}`}>{f}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("basics")}>Back</Button>
              <Button className="flex-1" onClick={() => setStep("schedule")} disabled={!format}>
                Next: Schedule <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === "schedule" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Duration</label>
              <div className="grid grid-cols-2 gap-2">
                {durations.map((d) => (
                  <button key={d} onClick={() => setDuration(d)} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${duration === d ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/50"}`}>{d}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Region</label>
              <Input placeholder="e.g. Global, North America, Europe" value={region} onChange={(e) => setRegion(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("rules")}>Back</Button>
              <Button className="flex-1" onClick={() => setStep("review")} disabled={!startDate || !duration}>
                Review <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">League</span>
                <span className="font-semibold text-foreground">{leagueName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sport</span>
                <span className="font-medium text-foreground">{sport}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium text-foreground">{leagueType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium text-foreground">{format}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Max Players</span>
                <span className="font-medium text-foreground">{maxTeams}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Entry Fee</span>
                <span className="font-medium text-foreground">{parseInt(entryFee).toLocaleString()} MLC</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Prize Pool</span>
                <span className="font-bold text-success">{parseInt(prizePool).toLocaleString()} MLC</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Start</span>
                <span className="font-medium text-foreground">{startDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium text-foreground">{duration}</span>
              </div>
              {region && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Region</span>
                  <span className="font-medium text-foreground">{region}</span>
                </div>
              )}
            </div>
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-xs text-warning font-medium">League creation fee: 50 MLC (deducted from your balance)</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("schedule")}>Back</Button>
              <Button className="flex-1 mlc-gradient-bg text-primary-foreground" onClick={() => setStep("created")}>
                <Trophy className="w-4 h-4 mr-1" /> Create League
              </Button>
            </div>
          </div>
        )}

        {step === "created" && (
          <div className="text-center py-4 space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8 text-success" />
            </motion.div>
            <div>
              <p className="text-lg font-bold text-foreground">{leagueName}</p>
              <p className="text-sm text-muted-foreground">Your league is live and accepting registrations!</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-primary/10 text-center">
                <p className="text-lg font-bold text-primary">{maxTeams}</p>
                <p className="text-xs text-muted-foreground">Max Players</p>
              </div>
              <div className="p-3 rounded-xl bg-success/10 text-center">
                <p className="text-lg font-bold text-success">{parseInt(prizePool).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Prize (MLC)</p>
              </div>
              <div className="p-3 rounded-xl bg-warning/10 text-center">
                <p className="text-lg font-bold text-warning">{format}</p>
                <p className="text-xs text-muted-foreground">Format</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ---- Create Challenge Modal ----
const CreateChallengeModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  const [step, setStep] = useState<"config" | "rewards" | "created">("config");
  const [title, setTitle] = useState("");
  const [challengeType, setChallengeType] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("100");
  const [rewardAmount, setRewardAmount] = useState("500");
  const [rewardType, setRewardType] = useState("");

  const challengeTypes = ["1v1 Duel", "Team vs Team", "Community Goal", "Streak Challenge"];
  const rewardTypes = ["MLC Tokens", "League Token", "Merch Item", "Exclusive Perk"];

  const reset = () => {
    setStep("config"); setTitle(""); setChallengeType(""); setDescription(""); setDeadline("");
    setMaxParticipants("100"); setRewardAmount("500"); setRewardType("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            {step === "created" ? "Challenge Created!" : "Create Challenge"}
          </DialogTitle>
          <DialogDescription>
            {step === "config" && "Set up a new challenge for your community"}
            {step === "rewards" && "Define rewards for participants"}
            {step === "created" && "Your challenge is live"}
          </DialogDescription>
        </DialogHeader>

        {step === "config" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Challenge Title</label>
              <Input placeholder="e.g. Win 5 matches in a row" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Challenge Type</label>
              <div className="grid grid-cols-2 gap-2">
                {challengeTypes.map((t) => (
                  <button key={t} onClick={() => setChallengeType(t)} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${challengeType === t ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/50"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
              <Textarea placeholder="Describe the challenge rules..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Deadline</label>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Max Participants</label>
                <Input type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} />
              </div>
            </div>
            <Button className="w-full" onClick={() => setStep("rewards")} disabled={!title || !challengeType}>
              Next: Set Rewards <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {step === "rewards" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Reward Type</label>
              <div className="grid grid-cols-2 gap-2">
                {rewardTypes.map((r) => (
                  <button key={r} onClick={() => setRewardType(r)} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${rewardType === r ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/50"}`}>{r}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Reward Amount</label>
              <Input type="number" value={rewardAmount} onChange={(e) => setRewardAmount(e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">Total reward pool for all winners</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Challenge</span>
                <span className="font-semibold text-foreground">{title}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium text-foreground">{challengeType}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Reward</span>
                <span className="font-bold text-success">{parseInt(rewardAmount).toLocaleString()} {rewardType}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("config")}>Back</Button>
              <Button className="flex-1 mlc-gradient-bg text-primary-foreground" onClick={() => setStep("created")} disabled={!rewardType}>
                <Swords className="w-4 h-4 mr-1" /> Launch Challenge
              </Button>
            </div>
          </div>
        )}

        {step === "created" && (
          <div className="text-center py-4 space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
              <Swords className="w-8 h-8 text-success" />
            </motion.div>
            <div>
              <p className="text-lg font-bold text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground">{challengeType} challenge is now live!</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-primary/10 text-center">
                <p className="text-lg font-bold text-primary">{maxParticipants}</p>
                <p className="text-xs text-muted-foreground">Max Players</p>
              </div>
              <div className="p-3 rounded-xl bg-success/10 text-center">
                <p className="text-lg font-bold text-success">{parseInt(rewardAmount).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{rewardType}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ---- Create Prediction Modal ----
const CreatePredictionModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  const [step, setStep] = useState<"setup" | "options" | "created">("setup");
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [minWager, setMinWager] = useState("10");
  const [maxWager, setMaxWager] = useState("1000");

  const categories = ["Match Outcome", "Player Stats", "Season Predictions", "Community Vote", "Fun / Meme"];

  const reset = () => {
    setStep("setup"); setQuestion(""); setCategory(""); setOptionA(""); setOptionB(""); setOptionC(""); setEndsAt(""); setMinWager("10"); setMaxWager("1000");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-primary" />
            {step === "created" ? "Prediction Live!" : "Create Prediction Poll"}
          </DialogTitle>
          <DialogDescription>
            {step === "setup" && "Create a prediction for your community to wager on"}
            {step === "options" && "Define the outcomes and wager limits"}
            {step === "created" && "Community members can now place their predictions"}
          </DialogDescription>
        </DialogHeader>

        {step === "setup" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Prediction Question</label>
              <Textarea placeholder="e.g. Who will win the Street Champions League finals?" value={question} onChange={(e) => setQuestion(e.target.value)} rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${category === c ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/50"}`}>{c}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Voting Ends</label>
              <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </div>
            <Button className="w-full" onClick={() => setStep("options")} disabled={!question || !category || !endsAt}>
              Next: Define Options <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {step === "options" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Option A (Required)</label>
              <Input placeholder="e.g. Team Alpha wins" value={optionA} onChange={(e) => setOptionA(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Option B (Required)</label>
              <Input placeholder="e.g. Team Beta wins" value={optionB} onChange={(e) => setOptionB(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Option C (Optional)</label>
              <Input placeholder="e.g. Draw" value={optionC} onChange={(e) => setOptionC(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Min Wager (MLC)</label>
                <Input type="number" value={minWager} onChange={(e) => setMinWager(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Max Wager (MLC)</label>
                <Input type="number" value={maxWager} onChange={(e) => setMaxWager(e.target.value)} />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Pool-based rewards:</span> Winners split the losing side's stakes proportionally. MLC takes a 2% platform fee.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("setup")}>Back</Button>
              <Button className="flex-1 mlc-gradient-bg text-primary-foreground" onClick={() => setStep("created")} disabled={!optionA || !optionB}>
                <Vote className="w-4 h-4 mr-1" /> Publish Prediction
              </Button>
            </div>
          </div>
        )}

        {step === "created" && (
          <div className="text-center py-4 space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
              <Vote className="w-8 h-8 text-success" />
            </motion.div>
            <div>
              <p className="text-lg font-bold text-foreground">Prediction is Live!</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">{question}</p>
            </div>
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-sm font-medium text-foreground">A: {optionA}</div>
              <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-sm font-medium text-foreground">B: {optionB}</div>
              {optionC && <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-sm font-medium text-foreground">C: {optionC}</div>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-muted/50 text-center">
                <p className="text-sm font-bold text-foreground">{parseInt(minWager).toLocaleString()} - {parseInt(maxWager).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">MLC Wager Range</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 text-center">
                <p className="text-sm font-bold text-foreground">{category}</p>
                <p className="text-xs text-muted-foreground">Category</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ---- Main Dashboard ----
const CreatorDashboard = () => {
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [merchModalOpen, setMerchModalOpen] = useState(false);
  const [perksModalOpen, setPerksModalOpen] = useState(false);
  const [leagueModalOpen, setLeagueModalOpen] = useState(false);
  const [challengeModalOpen, setChallengeModalOpen] = useState(false);
  const [predictionModalOpen, setPredictionModalOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<any>(null);

  const stats = [
    { label: "Community Members", value: "2,847", change: "+12%", icon: Users },
    { label: "Token Holders", value: "1,203", change: "+8%", icon: Coins },
    { label: "Revenue (MLC)", value: "45,200", change: "+23%", icon: DollarSign },
    { label: "Merch Sales", value: "384", change: "+15%", icon: ShoppingBag },
  ];

  const leagues = [
    { 
      name: "Street Champions League", members: 1240, maxMembers: 1500, status: "Active", type: "Professional", sport: "Football",
      format: "Round Robin", entryFee: 100, prizePool: 50000, startDate: "Jan 15, 2026", duration: "Season (3 Months)", region: "Global",
      description: "The ultimate street football league for top players worldwide.",
      revenue: 12400, matchesPlayed: 342, activeParticipants: 1180,
      standings: [
        { rank: 1, name: "Team Alpha", wins: 14, losses: 1, draws: 1, points: 43, trend: "up" },
        { rank: 2, name: "Street Kings", wins: 12, losses: 2, draws: 2, points: 38, trend: "up" },
        { rank: 3, name: "Urban FC", wins: 11, losses: 3, draws: 2, points: 35, trend: "down" },
        { rank: 4, name: "Night Owls", wins: 10, losses: 4, draws: 2, points: 32, trend: "same" },
        { rank: 5, name: "Road Warriors", wins: 9, losses: 5, draws: 2, points: 29, trend: "up" },
      ],
      recentMatches: [
        { teamA: "Team Alpha", teamB: "Street Kings", scoreA: 3, scoreB: 1, date: "Feb 10, 2026" },
        { teamA: "Urban FC", teamB: "Night Owls", scoreA: 2, scoreB: 2, date: "Feb 9, 2026" },
        { teamA: "Road Warriors", teamB: "Team Alpha", scoreA: 0, scoreB: 4, date: "Feb 8, 2026" },
      ],
      announcements: [
        { text: "Playoffs begin March 1st!", date: "Feb 8, 2026" },
        { text: "New scoring rules updated for knockout stage", date: "Feb 5, 2026" },
      ]
    },
    { 
      name: "Weekend Warriors Cup", members: 380, maxMembers: 512, status: "Draft", type: "Amateur", sport: "Basketball",
      format: "Knockout", entryFee: 50, prizePool: 15000, startDate: "Feb 20, 2026", duration: "2 Weeks", region: "North America",
      description: "Casual basketball league for weekend ballers.",
      revenue: 0, matchesPlayed: 0, activeParticipants: 0,
      standings: [], recentMatches: [], announcements: []
    },
  ];

  const tokens = [
    { name: "Street Champions Coin", ticker: "$SCC", price: "$0.0052", mcap: "$5,200", holders: 1203, change: "+18.4%" },
  ];

  const merch = [
    { name: "Championship Jersey 2026", price: "500 MLC", sold: 142, stock: 358, image: "🏆" },
    { name: "League Cap - Black Edition", price: "200 MLC", sold: 89, stock: 211, image: "🧢" },
    { name: "Digital Fan Pass (NFT)", price: "1,000 MLC", sold: 153, stock: "∞", image: "🎫" },
  ];

  const perks = [
    { name: "VIP Match Day Access", tier: "Gold", holders: 89, icon: Crown },
    { name: "Exclusive Discord Channel", tier: "Silver", holders: 342, icon: Star },
    { name: "Early Merch Drops", tier: "Bronze", holders: 1203, icon: Tag },
  ];

  const challenges = [
    { title: "Win 5 Matches Streak", type: "Streak Challenge", participants: 67, maxParticipants: 100, reward: "500 MLC", deadline: "Feb 20, 2026", status: "active" },
    { title: "1v1 Championship Duel", type: "1v1 Duel", participants: 32, maxParticipants: 32, reward: "1,000 MLC", deadline: "Feb 15, 2026", status: "full" },
    { title: "Score 100 Community Goals", type: "Community Goal", participants: 234, maxParticipants: 500, reward: "2,500 MLC", deadline: "Mar 1, 2026", status: "active" },
  ];

  const predictions = [
    { question: "Who wins the Street Champions League finals?", optionA: "Team Alpha", optionB: "Team Beta", votesA: 342, votesB: 287, poolSize: 6290, status: "active", endsIn: "2d 14h" },
    { question: "Will any player score a hat-trick this week?", optionA: "Yes", optionB: "No", votesA: 156, votesB: 203, poolSize: 3590, status: "active", endsIn: "5d 3h" },
    { question: "MVP of Season 1?", optionA: "Player X", optionB: "Player Y", optionC: "Player Z", votesA: 445, votesB: 312, votesC: 189, poolSize: 9460, status: "ended", endsIn: "Ended" },
  ];

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Creator Dashboard</h1>
              <Badge className="bg-success/10 text-success border-success/20">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Manage your leagues, tokens, merch, and community</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPerksModalOpen(true)}>
              <Gift className="w-4 h-4 mr-1" /> Add Perk
            </Button>
            <Button size="sm" className="mlc-gradient-bg text-primary-foreground" onClick={() => setTokenModalOpen(true)}>
              <Rocket className="w-4 h-4 mr-1" /> Launch Token
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="mlc-card">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-success">{stat.change}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="leagues" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-xl flex-wrap h-auto gap-1">
            <TabsTrigger value="leagues" className="rounded-lg data-[state=active]:bg-card"><Trophy className="w-4 h-4 mr-1.5" /> Leagues</TabsTrigger>
            <TabsTrigger value="challenges" className="rounded-lg data-[state=active]:bg-card">
              <Swords className="w-4 h-4 mr-1.5" /> Challenges
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none animate-pulse">New</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="rounded-lg data-[state=active]:bg-card">
              <Vote className="w-4 h-4 mr-1.5" /> Predictions
            </TabsTrigger>
            <TabsTrigger value="tokens" className="rounded-lg data-[state=active]:bg-card"><Coins className="w-4 h-4 mr-1.5" /> Tokens</TabsTrigger>
            <TabsTrigger value="merch" className="rounded-lg data-[state=active]:bg-card"><ShoppingBag className="w-4 h-4 mr-1.5" /> Merch</TabsTrigger>
            <TabsTrigger value="perks" className="rounded-lg data-[state=active]:bg-card"><Gift className="w-4 h-4 mr-1.5" /> Perks</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-card"><BarChart3 className="w-4 h-4 mr-1.5" /> Analytics</TabsTrigger>
          </TabsList>

          {/* Leagues Tab */}
          <TabsContent value="leagues">
            {selectedLeague ? (
              /* League Detail / Management View */
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => setSelectedLeague(null)} className="text-sm text-primary hover:underline flex items-center gap-1">
                    ← Back to Leagues
                  </button>
                </div>

                {/* League Header */}
                <div className="mlc-card-elevated bg-gradient-to-r from-primary/5 via-transparent to-success/5 border-primary/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Trophy className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl font-bold text-foreground">{selectedLeague.name}</h2>
                          <Badge className={selectedLeague.status === "Active" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}>
                            {selectedLeague.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{selectedLeague.sport} · {selectedLeague.type} · {selectedLeague.format} · {selectedLeague.region}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline"><Settings className="w-4 h-4 mr-1" /> Settings</Button>
                      <Button size="sm" variant="outline" onClick={() => setChallengeModalOpen(true)}><Swords className="w-4 h-4 mr-1" /> Challenge</Button>
                    </div>
                  </div>
                </div>

                {/* League Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="mlc-card text-center">
                    <Users className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{selectedLeague.members.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">/ {selectedLeague.maxMembers} players</p>
                  </div>
                  <div className="mlc-card text-center">
                    <Coins className="w-4 h-4 text-success mx-auto mb-1" />
                    <p className="text-lg font-bold text-success">{selectedLeague.prizePool.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Prize Pool (MLC)</p>
                  </div>
                  <div className="mlc-card text-center">
                    <DollarSign className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold text-primary">{selectedLeague.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Revenue (MLC)</p>
                  </div>
                  <div className="mlc-card text-center">
                    <BarChart3 className="w-4 h-4 text-warning mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{selectedLeague.matchesPlayed}</p>
                    <p className="text-xs text-muted-foreground">Matches Played</p>
                  </div>
                  <div className="mlc-card text-center">
                    <Zap className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{selectedLeague.activeParticipants.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Active Players</p>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="mlc-card">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Capacity</span>
                    <span>{selectedLeague.members} / {selectedLeague.maxMembers} ({Math.round((selectedLeague.members / selectedLeague.maxMembers) * 100)}%)</span>
                  </div>
                  <Progress value={(selectedLeague.members / selectedLeague.maxMembers) * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Standings */}
                  <div className="mlc-card-elevated">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Crown className="w-5 h-5 text-warning" /> Standings
                    </h3>
                    {selectedLeague.standings.length > 0 ? (
                      <div className="space-y-0">
                        <div className="grid grid-cols-6 text-xs font-medium text-muted-foreground pb-2 border-b border-border px-2">
                          <span>#</span><span className="col-span-2">Team</span><span className="text-center">W</span><span className="text-center">L</span><span className="text-center">Pts</span>
                        </div>
                        {selectedLeague.standings.map((team: any) => (
                          <div key={team.rank} className="grid grid-cols-6 items-center py-2.5 px-2 border-b border-border last:border-0 text-sm">
                            <span className={`font-bold ${team.rank <= 3 ? "text-primary" : "text-muted-foreground"}`}>
                              {team.rank <= 3 ? ["🥇", "🥈", "🥉"][team.rank - 1] : team.rank}
                            </span>
                            <span className="col-span-2 font-medium text-foreground">{team.name}</span>
                            <span className="text-center text-success font-medium">{team.wins}</span>
                            <span className="text-center text-destructive font-medium">{team.losses}</span>
                            <span className="text-center font-bold text-foreground">{team.points}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">League hasn't started yet</p>
                    )}
                  </div>

                  {/* Recent Matches + Announcements */}
                  <div className="space-y-6">
                    <div className="mlc-card-elevated">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Swords className="w-5 h-5 text-primary" /> Recent Matches
                      </h3>
                      {selectedLeague.recentMatches.length > 0 ? (
                        <div className="space-y-3">
                          {selectedLeague.recentMatches.map((match: any, i: number) => (
                            <div key={i} className="p-3 rounded-xl bg-secondary/30 border border-border">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 text-right">
                                  <p className="text-sm font-medium text-foreground">{match.teamA}</p>
                                </div>
                                <div className="px-4 text-center">
                                  <p className="text-lg font-bold text-primary">{match.scoreA} - {match.scoreB}</p>
                                  <p className="text-[10px] text-muted-foreground">{match.date}</p>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-foreground">{match.teamB}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No matches yet</p>
                      )}
                    </div>

                    <div className="mlc-card-elevated">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-warning" /> Announcements
                      </h3>
                      {selectedLeague.announcements.length > 0 ? (
                        <div className="space-y-3">
                          {selectedLeague.announcements.map((ann: any, i: number) => (
                            <div key={i} className="p-3 rounded-xl bg-warning/5 border border-warning/20">
                              <p className="text-sm font-medium text-foreground">{ann.text}</p>
                              <p className="text-xs text-muted-foreground mt-1">{ann.date}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No announcements</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* League Info Footer */}
                <div className="mlc-card">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Entry Fee</p>
                      <p className="text-sm font-bold text-foreground">{selectedLeague.entryFee} MLC</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <p className="text-sm font-bold text-foreground">{selectedLeague.startDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-bold text-foreground">{selectedLeague.duration}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Description</p>
                      <p className="text-sm text-muted-foreground">{selectedLeague.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* League List View */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Your Leagues</h2>
                  <Button size="sm" variant="outline" onClick={() => setLeagueModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" /> New League
                  </Button>
                </div>
                {leagues.map((league) => (
                  <motion.div 
                    key={league.name} 
                    whileHover={{ scale: 1.005 }}
                    className="mlc-card flex items-center justify-between cursor-pointer hover:border-primary/30 transition-all"
                    onClick={() => setSelectedLeague(league)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{league.name}</p>
                        <p className="text-xs text-muted-foreground">{league.sport} · {league.type} · {league.members.toLocaleString()} members</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={league.status === "Active" ? "default" : "secondary"} className={league.status === "Active" ? "bg-success/10 text-success border-success/20" : ""}>
                        {league.status}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </motion.div>
                ))}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <button onClick={() => setChallengeModalOpen(true)} className="mlc-card flex items-center gap-3 text-left hover:border-primary/30 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                      <Swords className="w-5 h-5 text-warning" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">Create Challenge</p>
                      <p className="text-xs text-muted-foreground">Set up duels and streak challenges</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                  <button onClick={() => setPredictionModalOpen(true)} className="mlc-card flex items-center gap-3 text-left hover:border-primary/30 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Vote className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">Create Prediction</p>
                      <p className="text-xs text-muted-foreground">Let fans wager on outcomes</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Active Challenges</h2>
                <Button size="sm" onClick={() => setChallengeModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Create Challenge
                </Button>
              </div>
              {challenges.map((ch) => (
                <motion.div key={ch.title} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mlc-card-elevated">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ch.status === "full" ? "bg-warning/10" : "bg-primary/10"}`}>
                        {ch.type === "1v1 Duel" ? <Swords className="w-5 h-5 text-primary" /> :
                         ch.type === "Streak Challenge" ? <Flame className="w-5 h-5 text-warning" /> :
                         <Target className="w-5 h-5 text-primary" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{ch.title}</p>
                        <p className="text-xs text-muted-foreground">{ch.type}</p>
                      </div>
                    </div>
                    <Badge className={ch.status === "full" ? "bg-warning/10 text-warning border-warning/20" : "bg-success/10 text-success border-success/20"}>
                      {ch.status === "full" ? "Full" : "Active"}
                    </Badge>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{ch.participants} / {ch.maxParticipants} participants</span>
                      <span>{Math.round((ch.participants / ch.maxParticipants) * 100)}%</span>
                    </div>
                    <Progress value={(ch.participants / ch.maxParticipants) * 100} className="h-1.5" />
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" /> Ends {ch.deadline}
                    </div>
                    <p className="text-sm font-bold text-success flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> {ch.reward}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Prediction Polls</h2>
                <Button size="sm" onClick={() => setPredictionModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Create Prediction
                </Button>
              </div>
              {predictions.map((pred, i) => {
                const totalVotes = pred.votesA + pred.votesB + (pred.votesC || 0);
                const pctA = totalVotes ? Math.round((pred.votesA / totalVotes) * 100) : 0;
                const pctB = totalVotes ? Math.round((pred.votesB / totalVotes) * 100) : 0;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="mlc-card-elevated">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-sm font-semibold text-foreground flex-1">{pred.question}</p>
                      <Badge className={pred.status === "active" ? "bg-success/10 text-success border-success/20 ml-2" : "bg-muted text-muted-foreground ml-2"}>
                        {pred.status === "active" ? pred.endsIn : "Ended"}
                      </Badge>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-foreground">{pred.optionA}</span>
                          <span className="text-muted-foreground">{pctA}% ({pred.votesA})</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pctA}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-foreground">{pred.optionB}</span>
                          <span className="text-muted-foreground">{pctB}% ({pred.votesB})</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full bg-warning" style={{ width: `${pctB}%` }} />
                        </div>
                      </div>
                      {pred.optionC && pred.votesC !== undefined && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-foreground">{pred.optionC}</span>
                            <span className="text-muted-foreground">{totalVotes ? Math.round((pred.votesC / totalVotes) * 100) : 0}% ({pred.votesC})</span>
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full rounded-full bg-success" style={{ width: `${totalVotes ? (pred.votesC / totalVotes) * 100 : 0}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground">{totalVotes} total votes</span>
                      <p className="text-sm font-bold text-primary flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" /> {pred.poolSize.toLocaleString()} MLC pool
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Tokens Tab */}
          <TabsContent value="tokens">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Your Tokens</h2>
                <Button size="sm" className="mlc-gradient-bg text-primary-foreground" onClick={() => setTokenModalOpen(true)}>
                  <Rocket className="w-4 h-4 mr-1" /> Launch New
                </Button>
              </div>
              {tokens.map((token) => (
                <div key={token.ticker} className="mlc-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full mlc-gradient-bg flex items-center justify-center">
                        <Coins className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{token.name}</p>
                        <p className="text-xs text-muted-foreground">{token.ticker}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{token.price}</p>
                      <p className="text-xs font-medium text-success">{token.change}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Market Cap</p>
                      <p className="text-sm font-semibold text-foreground">{token.mcap}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Holders</p>
                      <p className="text-sm font-semibold text-foreground">{token.holders.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">MLC Fee</p>
                      <p className="text-sm font-semibold text-warning">1% / trade</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">How Token Launching Works</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Launch your token pump.fun style - set supply, add MLC liquidity, and trading begins instantly.
                      MLC charges a 1% fee on every transaction to sustain the ecosystem.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Merch Tab */}
          <TabsContent value="merch">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Merchandise</h2>
                <Button size="sm" variant="outline" onClick={() => setMerchModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Item
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {merch.map((item) => (
                  <div key={item.name} className="mlc-card-elevated">
                    <div className="w-full h-32 rounded-lg bg-muted/50 flex items-center justify-center text-4xl mb-4">{item.image}</div>
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-lg font-bold text-primary mt-1">{item.price}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground">{item.sold} sold</span>
                      <span className="text-xs text-muted-foreground">Stock: {item.stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Perks Tab */}
          <TabsContent value="perks">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Community Perks</h2>
                <Button size="sm" variant="outline" onClick={() => setPerksModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Perk
                </Button>
              </div>
              {perks.map((perk) => {
                const Icon = perk.icon;
                return (
                  <div key={perk.name} className="mlc-card flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{perk.name}</p>
                        <p className="text-xs text-muted-foreground">{perk.holders} eligible holders</p>
                      </div>
                    </div>
                    <Badge className="bg-warning/10 text-warning border-warning/20">{perk.tier}</Badge>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Performance Analytics</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="mlc-card">
                  <p className="text-sm font-medium text-foreground mb-4">Community Growth</p>
                  <div className="space-y-3">
                    {[
                      { label: "This Week", value: 187, max: 300 },
                      { label: "This Month", value: 843, max: 1000 },
                      { label: "All Time", value: 2847, max: 5000 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium text-foreground">+{item.value}</span>
                        </div>
                        <Progress value={(item.value / item.max) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mlc-card">
                  <p className="text-sm font-medium text-foreground mb-4">Revenue Breakdown</p>
                  <div className="space-y-3">
                    {[
                      { label: "Token Trading Fees", value: "28,400 MLC", pct: 63 },
                      { label: "Merch Sales", value: "12,300 MLC", pct: 27 },
                      { label: "Perk Subscriptions", value: "4,500 MLC", pct: 10 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium text-foreground">{item.value} ({item.pct}%)</span>
                        </div>
                        <Progress value={item.pct} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <TokenLaunchModal open={tokenModalOpen} onOpenChange={setTokenModalOpen} />
      <MerchModal open={merchModalOpen} onOpenChange={setMerchModalOpen} />
      <PerksModal open={perksModalOpen} onOpenChange={setPerksModalOpen} />
      <NewLeagueModal open={leagueModalOpen} onOpenChange={setLeagueModalOpen} />
      <CreateChallengeModal open={challengeModalOpen} onOpenChange={setChallengeModalOpen} />
      <CreatePredictionModal open={predictionModalOpen} onOpenChange={setPredictionModalOpen} />
    </div>
  );
};

export default CreatorDashboard;
