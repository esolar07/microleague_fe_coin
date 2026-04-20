import { motion } from "framer-motion";
import { RefreshCcw, Lock, TrendingUp, Shield } from "lucide-react";

const principles = [
  {
    icon: RefreshCcw,
    title: "Circular Economy",
    description:
      "Rewards come from real activity. Value stays in the system, not in someone's pocket.",
  },
  {
    icon: Lock,
    title: "Controlled Supply",
    description:
      "Fixed supply. Structured vesting. No surprise dumps. We planned this out.",
  },
  {
    icon: TrendingUp,
    title: "Usage Drives Value",
    description:
      "More people using the platform means more demand for MLC. That is how it works.",
  },
  {
    icon: Shield,
    title: "Treasury Management",
    description:
      "We have reserves set aside for development and keeping things running long-term.",
  },
];

const SustainabilitySection = () => {
  return (
    <section className="mlc-section bg-background overflow-hidden">
      <div className="mlc-container px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
        >
          <span className="mlc-badge-primary mb-4">Sustainability</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Built to Last
          </h2>
          <p className="text-lg text-muted-foreground">
            We are not here for a quick pump. The economics are designed for
            sustainable growth that actually makes sense.
          </p>
        </motion.div>

        {/* Principles Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {principles.map((principle, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="mlc-card-elevated flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <principle.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {principle.title}
                </h3>
                <p className="text-muted-foreground">{principle.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SustainabilitySection;
