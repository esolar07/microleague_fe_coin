import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Users,
  Clock,
  Coins,
  TrendingUp,
  X,
  CheckCircle,
  Flame,
  Target,
  ShoppingCart,
  Shield,
} from "lucide-react";

interface PollOption {
  label: string;
  mlcRequired: number;
  participants: number;
  totalPool: number;
  logo: string;
}

interface Poll {
  id: string;
  title: string;
  description: string;
  category: string;
  endsIn: string;
  totalPool: number;
  totalParticipants: number;
  options: [PollOption, PollOption];
  status: "active" | "ended" | "upcoming";
  hot?: boolean;
  userVote?: number;
}

const TEAM_LOGOS: Record<string, string> = {
  "Boston Celtics":
    "https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg",
  "Denver Nuggets":
    "https://cdn.nba.com/logos/nba/1610612743/primary/L/logo.svg",
  "Real Madrid":
    "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  "Manchester City":
    "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  "Patrick Mahomes":
    "https://upload.wikimedia.org/wikipedia/en/e/e1/Kansas_City_Chiefs_logo.svg",
  "Jalen Hurts":
    "https://upload.wikimedia.org/wikipedia/en/8/8e/Philadelphia_Eagles_logo.svg",
  "Erling Haaland":
    "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  "Mohamed Salah":
    "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
};

const polls: Poll[] = [
  {
    id: "nba-finals",
    title: "NBA Finals 2026 Champion",
    description:
      "Who wins it all this year? Pick your side and back it with MLC.",
    category: "Basketball",
    endsIn: "3d 14h",
    totalPool: 45000,
    totalParticipants: 312,
    options: [
      {
        label: "Boston Celtics",
        mlcRequired: 50,
        participants: 180,
        totalPool: 27000,
        logo: TEAM_LOGOS["Boston Celtics"],
      },
      {
        label: "Denver Nuggets",
        mlcRequired: 50,
        participants: 132,
        totalPool: 18000,
        logo: TEAM_LOGOS["Denver Nuggets"],
      },
    ],
    status: "active",
    hot: true,
  },
  {
    id: "ucl-winner",
    title: "Champions League Winner",
    description:
      "The biggest prize in European football. Who lifts the trophy?",
    category: "Football",
    endsIn: "12d 8h",
    totalPool: 38500,
    totalParticipants: 245,
    options: [
      {
        label: "Real Madrid",
        mlcRequired: 100,
        participants: 140,
        totalPool: 22000,
        logo: TEAM_LOGOS["Real Madrid"],
      },
      {
        label: "Manchester City",
        mlcRequired: 100,
        participants: 105,
        totalPool: 16500,
        logo: TEAM_LOGOS["Manchester City"],
      },
    ],
    status: "active",
  },
  {
    id: "superbowl",
    title: "Super Bowl LXI MVP",
    description: "Which player takes home the most valuable player award?",
    category: "Football (NFL)",
    endsIn: "28d 2h",
    totalPool: 22000,
    totalParticipants: 156,
    options: [
      {
        label: "Patrick Mahomes",
        mlcRequired: 75,
        participants: 98,
        totalPool: 14200,
        logo: TEAM_LOGOS["Patrick Mahomes"],
      },
      {
        label: "Jalen Hurts",
        mlcRequired: 75,
        participants: 58,
        totalPool: 7800,
        logo: TEAM_LOGOS["Jalen Hurts"],
      },
    ],
    status: "active",
  },
  {
    id: "premier-league",
    title: "Premier League Top Scorer",
    description: "Who finishes the season with the most goals?",
    category: "Football",
    endsIn: "Ended",
    totalPool: 31000,
    totalParticipants: 198,
    options: [
      {
        label: "Erling Haaland",
        mlcRequired: 50,
        participants: 142,
        totalPool: 22500,
        logo: TEAM_LOGOS["Erling Haaland"],
      },
      {
        label: "Mohamed Salah",
        mlcRequired: 50,
        participants: 56,
        totalPool: 8500,
        logo: TEAM_LOGOS["Mohamed Salah"],
      },
    ],
    status: "ended",
    userVote: 0,
  },
];

const PredictionPolls = () => {
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [voteStep, setVoteStep] = useState<
    "select" | "confirm" | "processing" | "done"
  >("select");
  const [useBalance, setUseBalance] = useState(true);
  const [useNft, setUseNft] = useState(false);
  const [filter, setFilter] = useState<"active" | "ended" | "my_votes">(
    "active",
  );

  const userBalance = 4000;
  const hasNft = true; // mock: user holds membership NFT

  const filtered = polls.filter((p) => {
    if (filter === "active") return p.status === "active";
    if (filter === "ended") return p.status === "ended";
    if (filter === "my_votes") return p.userVote !== undefined;
    return true;
  });

  const getExpectedReturn = (poll: Poll, optionIndex: number) => {
    const option = poll.options[optionIndex];
    const otherOption = poll.options[1 - optionIndex];
    const yourShare =
      option.mlcRequired / (option.totalPool + option.mlcRequired);
    const potentialWin = otherOption.totalPool * yourShare;
    return option.mlcRequired + potentialWin;
  };

  const getMultiplier = (poll: Poll, optionIndex: number) => {
    return (
      getExpectedReturn(poll, optionIndex) /
      poll.options[optionIndex].mlcRequired
    ).toFixed(1);
  };

  const handleVote = () => {
    setVoteStep("processing");
    setTimeout(() => setVoteStep("done"), 2000);
  };

  const resetModal = () => {
    setSelectedPoll(null);
    setSelectedOption(null);
    setVoteStep("select");
    setUseNft(false);
  };

  return (
    <div className="space-y-6 h-[calc(95vh-200px)] overflow-y-auto scrollbar-hide py-4">
      {/* Header Banner */}
      <div className="mlc-card-elevated bg-gradient-to-r from-warning/10 via-primary/5 to-warning/10 border-warning/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center">
              <Trophy className="w-7 h-7 text-warning" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Predictions</h2>
              <p className="text-sm text-muted-foreground">
                Vote on sports outcomes with MLC. Winners split the losing pool.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasNft && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">NFT Member</p>
                  <p className="text-sm font-bold text-primary">Active</p>
                </div>
              </div>
            )}
            <div className="p-3 rounded-xl bg-secondary/80 border border-border">
              <p className="text-xs text-muted-foreground">Your Balance</p>
              <p className="text-lg font-bold text-foreground">
                {userBalance.toLocaleString()} MLC
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works mini */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-secondary/50 text-center">
          <Target className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xs font-medium text-foreground">Pick a Side</p>
          <p className="text-xs text-muted-foreground">
            Choose your prediction
          </p>
        </div>
        <div className="p-3 rounded-xl bg-secondary/50 text-center">
          <Coins className="w-5 h-5 text-warning mx-auto mb-1" />
          <p className="text-xs font-medium text-foreground">Stake MLC</p>
          <p className="text-xs text-muted-foreground">
            Use balance or buy more
          </p>
        </div>
        <div className="p-3 rounded-xl bg-secondary/50 text-center">
          <TrendingUp className="w-5 h-5 text-success mx-auto mb-1" />
          <p className="text-xs font-medium text-foreground">Win Rewards</p>
          <p className="text-xs text-muted-foreground">
            Losers' pool goes to winners
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { id: "active", label: "Active Polls" },
          { id: "ended", label: "Ended" },
          { id: "my_votes", label: "My Votes" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Poll Cards */}
      <div className="space-y-4">
        {filtered.map((poll, index) => (
          <motion.div
            key={poll.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="mlc-card-elevated"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {poll.category}
                  </span>
                  {poll.hot && (
                    <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Hot
                    </span>
                  )}
                  {poll.status === "ended" && (
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                      Ended
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground">{poll.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {poll.description}
                </p>
              </div>
            </div>

            {/* Options Side by Side */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {poll.options.map((option, optIdx) => {
                const poolPercentage =
                  (option.totalPool / poll.totalPool) * 100;
                const isUserVote = poll.userVote === optIdx;
                return (
                  <div
                    key={optIdx}
                    className={`p-4 rounded-xl border transition-all ${
                      isUserVote
                        ? "border-primary bg-primary/5"
                        : "border-border bg-secondary/30"
                    } ${poll.status === "active" ? "cursor-pointer hover:border-primary/50" : ""}`}
                    onClick={() => {
                      if (poll.status === "active") {
                        setSelectedPoll(poll);
                        setSelectedOption(optIdx);
                        setVoteStep("confirm");
                      }
                    }}
                  >
                    {/* Team logo + name */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/80 border border-border flex items-center justify-center overflow-hidden shrink-0">
                        <img
                          src={option.logo}
                          alt={option.label}
                          className="w-7 h-7 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                      <p className="font-semibold text-foreground text-sm">
                        {option.label}
                      </p>
                    </div>

                    <div className="h-2 rounded-full bg-secondary overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full ${optIdx === 0 ? "bg-primary" : "bg-warning"}`}
                        style={{ width: `${poolPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {option.participants} votes
                      </span>
                      <span className="font-medium text-foreground">
                        {poolPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Entry</span>
                        <span className="font-semibold text-foreground">
                          {option.mlcRequired} MLC
                        </span>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-muted-foreground">
                          Est. return
                        </span>
                        <span className="font-semibold text-success">
                          {getExpectedReturn(poll, optIdx).toFixed(0)} MLC (
                          {getMultiplier(poll, optIdx)}x)
                        </span>
                      </div>
                    </div>
                    {isUserVote && (
                      <div className="mt-2 text-center">
                        <span className="text-xs text-primary font-medium flex items-center justify-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Your vote
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" />{" "}
                  {poll.totalPool.toLocaleString()} MLC pool
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {poll.totalParticipants}{" "}
                  voters
                </span>
              </div>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {poll.endsIn}
              </span>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="mlc-card-elevated text-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No polls here yet.</p>
          </div>
        )}
      </div>

      {/* Vote Modal */}
      <AnimatePresence>
        {selectedPoll && selectedOption !== null && voteStep !== "select" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (voteStep !== "processing") resetModal();
              }}
              className="fixed inset-0 bg-foreground/20 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="mlc-card-elevated w-full max-w-md">
                {voteStep === "confirm" && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        Confirm Your Vote
                      </h3>
                      <button
                        onClick={resetModal}
                        className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
                      >
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20 mb-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-secondary/80 border border-border flex items-center justify-center overflow-hidden shrink-0">
                        <img
                          src={selectedPoll.options[selectedOption].logo}
                          alt={selectedPoll.options[selectedOption].label}
                          className="w-10 h-10 object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {selectedPoll.title}
                        </p>
                        <p className="text-xl font-bold text-foreground">
                          {selectedPoll.options[selectedOption].label}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-secondary/50 space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Entry cost
                        </span>
                        <span className="font-bold text-foreground">
                          {useNft
                            ? "Free (NFT)"
                            : `${selectedPoll.options[selectedOption].mlcRequired} MLC`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Est. return if you win
                        </span>
                        <span className="font-bold text-success">
                          {getExpectedReturn(
                            selectedPoll,
                            selectedOption,
                          ).toFixed(0)}{" "}
                          MLC ({getMultiplier(selectedPoll, selectedOption)}x)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          If you lose
                        </span>
                        <span className="font-medium text-destructive">
                          {useNft
                            ? "No loss (NFT protected)"
                            : `-${selectedPoll.options[selectedOption].mlcRequired} MLC`}
                        </span>
                      </div>
                    </div>

                    {/* Payment source */}
                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium text-foreground">
                        Pay with:
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => {
                            setUseBalance(true);
                            setUseNft(false);
                          }}
                          className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                            useBalance && !useNft
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          <Coins className="w-4 h-4 mx-auto mb-1" />
                          MLC Balance
                          <p className="text-xs mt-0.5">
                            {userBalance.toLocaleString()}
                          </p>
                        </button>
                        <button
                          onClick={() => {
                            setUseBalance(false);
                            setUseNft(false);
                          }}
                          className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                            !useBalance && !useNft
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          <ShoppingCart className="w-4 h-4 mx-auto mb-1" />
                          Buy MLC
                          <p className="text-xs mt-0.5">Purchase</p>
                        </button>
                        <button
                          onClick={() => {
                            setUseNft(true);
                            setUseBalance(false);
                          }}
                          disabled={!hasNft}
                          className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                            useNft
                              ? "border-primary bg-primary/5 text-primary"
                              : hasNft
                                ? "border-border text-muted-foreground hover:border-primary/30"
                                : "border-border text-muted-foreground opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <Shield className="w-4 h-4 mx-auto mb-1" />
                          NFT Pass
                          <p className="text-xs mt-0.5">
                            {hasNft ? "Free vote" : "Not held"}
                          </p>
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={resetModal}
                        className="flex-1 mlc-btn-secondary"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleVote}
                        className="flex-1 mlc-btn-primary flex items-center justify-center gap-2"
                      >
                        <Trophy className="w-4 h-4" />
                        {useNft ? "Vote with NFT" : "Place Vote"}
                      </motion.button>
                    </div>
                  </>
                )}

                {voteStep === "processing" && (
                  <div className="py-12 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"
                    />
                    <h3 className="text-xl font-semibold text-foreground">
                      Processing Vote
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      {useNft
                        ? "Verifying your Membership NFT..."
                        : "Locking your MLC into the pool..."}
                    </p>
                  </div>
                )}

                {voteStep === "done" && (
                  <div className="py-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="w-10 h-10 text-success" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-foreground">
                      Vote Placed!
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      You voted for{" "}
                      <span className="font-bold text-primary">
                        {selectedPoll!.options[selectedOption!].label}
                      </span>
                    </p>
                    {useNft && (
                      <p className="text-xs text-primary mt-1 flex items-center justify-center gap-1">
                        <Shield className="w-3 h-3" /> Applied with Membership
                        NFT
                      </p>
                    )}
                    <p className="text-sm text-success mt-1">
                      Potential return:{" "}
                      {getExpectedReturn(
                        selectedPoll!,
                        selectedOption!,
                      ).toFixed(0)}{" "}
                      MLC
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetModal}
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
    </div>
  );
};

export default PredictionPolls;
