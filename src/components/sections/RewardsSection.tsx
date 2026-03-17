import { motion } from "framer-motion";
import { Gift, Coins, Gamepad2, AlertTriangle } from "lucide-react";

const rewards = [
  {
    icon: Gift,
    title: "Signup Rewards",
    description: "Create an account and finish onboarding. That is it. You get points just for showing up.",
    reward: "Up to 100 Points",
    type: "Points",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Coins,
    title: "Purchase Rewards",
    description: "Buy during presale and we throw in extra tokens on top. Early supporters get the bonus.",
    reward: "Up to 5% Bonus",
    type: "MLC Tokens",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Gamepad2,
    title: "Activity Rewards",
    description: "Play games, run simulations, join leagues. The more active you are, the more you earn.",
    reward: "Variable Points",
    type: "Points",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
];

const RewardsSection = () => {
  return (
    <section className="mlc-section bg-background">
      <div className="mlc-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="mlc-badge-primary mb-4">Rewards Engine</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Get Rewarded for Playing
          </h2>
          <p className="text-lg text-muted-foreground">
            We pay you for doing what you already want to do. Play games, earn rewards. No tricks.
          </p>
        </motion.div>

        {/* Rewards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {rewards.map((reward, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="mlc-card-elevated text-center"
            >
              <div className={`w-16 h-16 rounded-2xl ${reward.bgColor} flex items-center justify-center mx-auto mb-4`}>
                <reward.icon className={`w-8 h-8 ${reward.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{reward.title}</h3>
              <p className="text-muted-foreground mb-4">{reward.description}</p>
              <div className="inline-block px-4 py-2 rounded-full bg-secondary">
                <span className={`font-semibold ${reward.color}`}>{reward.reward}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{reward.type}</p>
            </motion.div>
          ))}
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <div className="p-6 rounded-2xl bg-warning/5 border border-warning/20">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">Important Notice</h4>
                <p className="text-sm text-muted-foreground">
                  Rewards are capped and based on real activity. MLC is not an investment 
                  and there are <strong>no guaranteed returns</strong>. You earn by playing, 
                  not by sitting around waiting.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RewardsSection;
