import { motion } from "framer-motion";
import { Gamepad2, TrendingUp, Users, Award, Rocket, Shield } from "lucide-react";

const reasons = [
  {
    icon: Gamepad2,
    title: "Sports Simulation Engine",
    description: "Run fantasy leagues with AI simulations that work all year round. No off-season here.",
  },
  {
    icon: TrendingUp,
    title: "Sustainable Economics",
    description: "Rewards come from real activity, not thin air. The more you play, the more you earn.",
  },
  {
    icon: Users,
    title: "Community Governance",
    description: "Hold MLC and you get a vote. Help decide what gets built next.",
  },
  {
    icon: Award,
    title: "Real Utility",
    description: "MLC unlocks premium features, exclusive leagues, and bonus rewards. It actually does something.",
  },
  {
    icon: Rocket,
    title: "Creator Economy",
    description: "Creators can launch their own leagues and earn from them. Build your community, get paid.",
  },
  {
    icon: Shield,
    title: "Institutional Grade",
    description: "Enterprise security, compliance-ready, fully transparent. We built this to last.",
  },
];

const WhyMlcSection = () => {
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
          <span className="mlc-badge-primary mb-4">Why MLC</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why MicroLeague Coin?
          </h2>
          <p className="text-lg text-muted-foreground">
            Not another hype token. MLC has real utility, sustainable economics, 
            and we built it for people who actually want to use it.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="mlc-card-elevated group hover:border-primary/20"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <reason.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{reason.title}</h3>
              <p className="text-muted-foreground">{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyMlcSection;
