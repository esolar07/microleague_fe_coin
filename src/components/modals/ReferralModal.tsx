import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Copy,
  CheckCircle,
  Users,
  Coins,
  Gamepad2,
  Share2,
} from "lucide-react";

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const referralRewards = [
  {
    icon: Users,
    title: "Signup Bonus",
    description: "When a friend signs up",
    reward: "+50 Points",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Coins,
    title: "Purchase Bonus",
    description: "When they buy MLC tokens",
    reward: "+5% MLC",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Gamepad2,
    title: "Simulation Bonus",
    description: "When they run simulations",
    reward: "+25 Points",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
];

const ReferralModal = ({ isOpen, onClose }: ReferralModalProps) => {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://microleague.com/ref/ABC123XY";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="mlc-card-elevated w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl mlc-gradient-bg flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      Invite Friends
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Earn rewards together
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Referral Link */}
              <div className="bg-secondary/50 rounded-xl p-4 mb-6">
                <label className="text-sm font-medium text-foreground">
                  Your Referral Link
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className={`p-2 rounded-lg transition-colors ${
                      copied
                        ? "bg-success text-success-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Rewards */}
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-medium text-foreground">
                  Referral Rewards
                </h3>
                {referralRewards.map((reward, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${reward.bgColor} flex items-center justify-center`}
                      >
                        <reward.icon className={`w-5 h-5 ${reward.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {reward.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {reward.description}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${reward.color}`}>
                      {reward.reward}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Share Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button className="p-3 rounded-xl bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 transition-colors text-center">
                  <span className="text-xl">𝕏</span>
                  <p className="text-xs text-muted-foreground mt-1">Twitter</p>
                </button>
                <button className="p-3 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 transition-colors text-center">
                  <span className="text-xl">📱</span>
                  <p className="text-xs text-muted-foreground mt-1">Telegram</p>
                </button>
                <button className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-center">
                  <span className="text-xl">📧</span>
                  <p className="text-xs text-muted-foreground mt-1">Email</p>
                </button>
              </div>

              {/* Notice */}
              <p className="text-xs text-muted-foreground text-center mt-4">
                Rewards are capped and activity-based. Terms apply.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReferralModal;
