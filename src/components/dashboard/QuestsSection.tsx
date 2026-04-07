import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2, Users, Share2, ShoppingCart, CheckCircle, Clock,
  Coins, Star, ChevronRight, Sparkles, Trophy, Target, X,
  Play, ArrowRight, PartyPopper
} from "lucide-react";

interface Quest {
  id: string;
  title: string;
  description: string;
  reward: number;
  rewardType: "MLC" | "Points";
  icon: React.ElementType;
  category: "onboarding" | "social" | "engagement" | "referral";
  progress: number;
  total: number;
  status: "available" | "in_progress" | "completed" | "claimed";
  difficulty: "easy" | "medium" | "hard";
  xp: number;
}

const categoryColors = {
  onboarding: { bg: "bg-primary/10", text: "text-primary", label: "Getting Started" },
  social: { bg: "bg-accent", text: "text-accent-foreground", label: "Social" },
  engagement: { bg: "bg-warning/10", text: "text-warning", label: "Engagement" },
  referral: { bg: "bg-success/10", text: "text-success", label: "Referral" },
};

const difficultyColors = {
  easy: "text-success",
  medium: "text-warning",
  hard: "text-destructive",
};

const initialQuests: Quest[] = [
  {
    id: "first-sim",
    title: "Run Your First Simulation",
    description: "Launch any sports simulation to get started and earn your first reward.",
    reward: 100,
    rewardType: "MLC",
    icon: Gamepad2,
    category: "onboarding",
    progress: 0,
    total: 1,
    status: "available",
    difficulty: "easy",
    xp: 50,
  },
  {
    id: "refer-signup",
    title: "Refer a Friend Who Signs Up",
    description: "Share your referral link. When someone creates an account, you both earn rewards.",
    reward: 150,
    rewardType: "Points",
    icon: Users,
    category: "referral",
    progress: 0,
    total: 1,
    status: "available",
    difficulty: "easy",
    xp: 75,
  },
  {
    id: "refer-purchase",
    title: "Referral Makes a Purchase",
    description: "When your referred friend buys MLC tokens, you get a bonus on top.",
    reward: 200,
    rewardType: "MLC",
    icon: ShoppingCart,
    category: "referral",
    progress: 0,
    total: 1,
    status: "available",
    difficulty: "medium",
    xp: 150,
  },
  {
    id: "social-share",
    title: "Share MicroLeague on Social Media",
    description: "Post about MicroLeague on X/Twitter and tag @MicroLeagueCoin to verify.",
    reward: 75,
    rewardType: "Points",
    icon: Share2,
    category: "social",
    progress: 0,
    total: 1,
    status: "available",
    difficulty: "easy",
    xp: 40,
  },
  {
    id: "five-sims",
    title: "Complete 5 Simulations",
    description: "Run five different simulations to show you're serious about the platform.",
    reward: 500,
    rewardType: "MLC",
    icon: Target,
    category: "engagement",
    progress: 2,
    total: 5,
    status: "in_progress",
    difficulty: "medium",
    xp: 200,
  },
  {
    id: "buy-mlc",
    title: "Purchase MLC Tokens",
    description: "Buy any amount of MLC during the presale to unlock this quest.",
    reward: 100,
    rewardType: "Points",
    icon: Coins,
    category: "onboarding",
    progress: 1,
    total: 1,
    status: "completed",
    difficulty: "easy",
    xp: 50,
  },
  {
    id: "refer-three",
    title: "Refer 3 Friends",
    description: "Bring three friends to MicroLeague. Each signup counts toward this quest.",
    reward: 300,
    rewardType: "MLC",
    icon: Trophy,
    category: "referral",
    progress: 3,
    total: 3,
    status: "claimed",
    difficulty: "hard",
    xp: 300,
  },
];

const QuestsSection = () => {
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [actionStep, setActionStep] = useState<"detail" | "starting" | "progressing" | "completing" | "claiming" | "done">("detail");
  const [filter, setFilter] = useState<"all" | "available" | "in_progress" | "completed">("all");
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalXP = quests.filter(q => q.status === "claimed").reduce((sum, q) => sum + q.xp, 0);
  const level = Math.floor(totalXP / 200) + 1;
  const xpToNext = 200 - (totalXP % 200);

  const filtered = quests.filter(q => {
    if (filter === "all") return true;
    if (filter === "completed") return q.status === "completed" || q.status === "claimed";
    return q.status === filter;
  });

  const updateQuest = (id: string, updates: Partial<Quest>) => {
    setQuests(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
    if (selectedQuest?.id === id) {
      setSelectedQuest(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleStartQuest = () => {
    if (!selectedQuest) return;
    setActionStep("starting");
    setTimeout(() => {
      updateQuest(selectedQuest.id, { status: "in_progress", progress: 0 });
      setActionStep("progressing");
      // Simulate progress
      let prog = 0;
      progressIntervalRef.current = setInterval(() => {
        prog++;
        updateQuest(selectedQuest.id, { progress: prog });
        if (prog >= selectedQuest.total) {
          clearInterval(progressIntervalRef.current!);
          progressIntervalRef.current = null;
          setTimeout(() => {
            updateQuest(selectedQuest.id, { status: "completed", progress: selectedQuest.total });
            setActionStep("completing");
          }, 500);
        }
      }, 800);
    }, 1200);
  };

  const handleClaimReward = () => {
    if (!selectedQuest) return;
    setActionStep("claiming");
    setTimeout(() => {
      updateQuest(selectedQuest.id, { status: "claimed" });
      setActionStep("done");
    }, 1500);
  };

  const openQuestDetail = (quest: Quest) => {
    setSelectedQuest(quest);
    setActionStep("detail");
  };

  const closeModal = () => {
    setSelectedQuest(null);
    setActionStep("detail");
  };

  return (
    <div className="space-y-6">
      {/* Level & XP Banner */}
      <div className="mlc-card-elevated bg-gradient-to-r from-primary/10 via-accent to-primary/5 border-primary/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center relative">
              <Star className="w-8 h-8 text-primary" />
              <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {level}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Level</p>
              <p className="text-2xl font-bold text-foreground">Level {level}</p>
              <p className="text-xs text-muted-foreground">{xpToNext} XP to Level {level + 1}</p>
            </div>
          </div>
          <div className="w-full sm:w-48">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{totalXP} XP</span>
              <span>{totalXP + xpToNext} XP</span>
            </div>
            <div className="h-3 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((totalXP % 200) / 200) * 100}%` }}
                transition={{ duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-success"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All Quests" },
          { id: "available", label: "Available" },
          { id: "in_progress", label: "In Progress" },
          { id: "completed", label: "Completed" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Quest Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((quest, index) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => openQuestDetail(quest)}
            className={`mlc-card-elevated cursor-pointer relative overflow-hidden group ${
              quest.status === "claimed" ? "opacity-60" : ""
            }`}
          >
            {quest.status === "completed" && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-success text-success-foreground text-xs font-bold"
              >
                Claim!
              </motion.div>
            )}
            {quest.status === "claimed" && (
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Done
              </div>
            )}
            {quest.status === "in_progress" && (
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                In Progress
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryColors[quest.category].bg}`}>
                <quest.icon className={`w-6 h-6 ${categoryColors[quest.category].text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium ${categoryColors[quest.category].text}`}>
                    {categoryColors[quest.category].label}
                  </span>
                  <span className={`text-xs ${difficultyColors[quest.difficulty]}`}>
                    {quest.difficulty === "easy" ? "★" : quest.difficulty === "medium" ? "★★" : "★★★"}
                  </span>
                </div>
                <h4 className="font-semibold text-foreground text-sm">{quest.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{quest.description}</p>

                {/* Progress bar for in_progress */}
                {quest.status === "in_progress" && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{quest.progress}/{quest.total}</span>
                      <span>{Math.round((quest.progress / quest.total) * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        animate={{ width: `${(quest.progress / quest.total) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-bold text-primary">
                      +{quest.reward} {quest.rewardType}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">+{quest.xp} XP</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quest Detail / Action Modal */}
      <AnimatePresence>
        {selectedQuest && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (actionStep === "detail" || actionStep === "done" || actionStep === "completing") closeModal(); }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="mlc-card-elevated w-full max-w-md">
                {/* Detail View */}
                {actionStep === "detail" && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${categoryColors[selectedQuest.category].bg}`}>
                          <selectedQuest.icon className={`w-6 h-6 ${categoryColors[selectedQuest.category].text}`} />
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${categoryColors[selectedQuest.category].text}`}>
                            {categoryColors[selectedQuest.category].label}
                          </p>
                          <h3 className="font-semibold text-foreground">{selectedQuest.title}</h3>
                        </div>
                      </div>
                      <button
                        onClick={closeModal}
                        className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
                      >
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{selectedQuest.description}</p>

                    <div className="p-4 rounded-xl bg-secondary/50 space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Reward</span>
                        <span className="font-bold text-primary">+{selectedQuest.reward} {selectedQuest.rewardType}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">XP Earned</span>
                        <span className="font-semibold text-foreground">+{selectedQuest.xp} XP</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Difficulty</span>
                        <span className={`font-medium capitalize ${difficultyColors[selectedQuest.difficulty]}`}>
                          {selectedQuest.difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="font-semibold text-foreground">{selectedQuest.progress}/{selectedQuest.total}</span>
                      </div>
                    </div>

                    {selectedQuest.status === "in_progress" && (
                      <div className="mb-4">
                        <div className="h-3 rounded-full bg-secondary overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            animate={{ width: `${(selectedQuest.progress / selectedQuest.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {selectedQuest.status === "available" && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleStartQuest}
                        className="w-full mlc-btn-primary flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Start Quest
                      </motion.button>
                    )}

                    {selectedQuest.status === "in_progress" && (
                      <div className="text-center py-3 rounded-xl bg-primary/5 border border-primary/20">
                        <p className="text-sm text-primary flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4" />
                          In progress: {selectedQuest.progress}/{selectedQuest.total}
                        </p>
                      </div>
                    )}

                    {selectedQuest.status === "completed" && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleClaimReward}
                        className="w-full mlc-btn-primary flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-5 h-5" />
                        Claim +{selectedQuest.reward} {selectedQuest.rewardType}
                      </motion.button>
                    )}

                    {selectedQuest.status === "claimed" && (
                      <div className="text-center py-3 rounded-xl bg-muted">
                        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Already claimed
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Starting animation */}
                {actionStep === "starting" && (
                  <div className="py-12 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"
                    />
                    <h3 className="text-lg font-semibold text-foreground">Starting Quest...</h3>
                    <p className="text-sm text-muted-foreground mt-2">Initializing {selectedQuest.title}</p>
                  </div>
                )}

                {/* Progressing with live updates */}
                {actionStep === "progressing" && (
                  <div className="py-8 text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${categoryColors[selectedQuest.category].bg}`}>
                      <selectedQuest.icon className={`w-8 h-8 ${categoryColors[selectedQuest.category].text}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Quest In Progress</h3>
                    <p className="text-sm text-muted-foreground mt-1">{selectedQuest.title}</p>
                    <div className="mt-6 px-8">
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>{selectedQuest.progress}/{selectedQuest.total}</span>
                        <span>{Math.round((selectedQuest.progress / selectedQuest.total) * 100)}%</span>
                      </div>
                      <div className="h-4 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-success"
                          animate={{ width: `${(selectedQuest.progress / selectedQuest.total) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">Simulating activity...</p>
                  </div>
                )}

                {/* Quest completed — ready to claim */}
                {actionStep === "completing" && (
                  <div className="py-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="w-10 h-10 text-success" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-foreground">Quest Completed! 🎉</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      You've completed <span className="font-semibold text-foreground">{selectedQuest.title}</span>
                    </p>

                    <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-success/10 border border-success/20">
                      <p className="text-sm text-muted-foreground">Your reward</p>
                      <p className="text-2xl font-bold text-primary mt-1">+{selectedQuest.reward} {selectedQuest.rewardType}</p>
                      <p className="text-xs text-muted-foreground mt-1">+{selectedQuest.xp} XP</p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClaimReward}
                      className="w-full mlc-btn-primary mt-6 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Claim Reward
                    </motion.button>
                  </div>
                )}

                {/* Claiming animation */}
                {actionStep === "claiming" && (
                  <div className="py-12 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 border-4 border-success border-t-transparent rounded-full mx-auto mb-6"
                    />
                    <h3 className="text-lg font-semibold text-foreground">Claiming Reward...</h3>
                    <p className="text-sm text-muted-foreground mt-2">Processing your {selectedQuest.reward} {selectedQuest.rewardType}</p>
                  </div>
                )}

                {/* Done — reward claimed */}
                {actionStep === "done" && (
                  <div className="py-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"
                    >
                      <PartyPopper className="w-10 h-10 text-success" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-foreground">Reward Claimed! 🎉</h3>
                    <p className="text-muted-foreground mt-2">
                      You earned <span className="font-bold text-primary">+{selectedQuest.reward} {selectedQuest.rewardType}</span>
                    </p>
                    <p className="text-sm text-success mt-1">+{selectedQuest.xp} XP added to your level</p>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={closeModal}
                      className="mlc-btn-primary mt-6"
                    >
                      Continue
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

export default QuestsSection;
