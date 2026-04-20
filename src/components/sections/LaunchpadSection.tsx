import { motion } from "framer-motion";
import { Rocket, Users, Globe, Sparkles } from "lucide-react";

const features = [
  {
    icon: Rocket,
    title: "Sports Simulations",
    description: "Build AI-powered leagues and actually make money from them.",
  },
  {
    icon: Users,
    title: "Your Own Leagues",
    description:
      "Creators run their own communities. Your league, your rules, your revenue.",
  },
  {
    icon: Globe,
    title: "Connected Communities",
    description:
      "Communities link together with shared governance. Bigger together.",
  },
  {
    icon: Sparkles,
    title: "MLC Utility",
    description:
      "Premium features, voting rights, and rewards. All unlocked with MLC.",
  },
];

const LaunchpadSection = () => {
  return (
    <section className="mlc-section bg-gradient-to-b from-secondary/30 to-background overflow-hidden">
      <div className="mlc-container px-4">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="mlc-badge-primary mb-4">Coming Soon</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The MicroLeague Launchpad
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              This is not just a platform. Creators, communities, and developers
              can build on top of what we have made. Think of it as your
              foundation.
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square max-w-md mx-auto relative">
              {/* Orbiting circles */}
              <div
                className="absolute inset-0 animate-spin"
                style={{ animationDuration: "20s" }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div
                className="absolute inset-4 animate-spin"
                style={{
                  animationDuration: "25s",
                  animationDirection: "reverse",
                }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-success" />
                </div>
              </div>
              <div
                className="absolute inset-8 animate-spin"
                style={{ animationDuration: "30s" }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-warning" />
                </div>
              </div>

              {/* Center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full mlc-gradient-bg flex items-center justify-center animate-pulse-glow">
                  <span className="text-primary-foreground font-bold text-2xl">
                    🚀
                  </span>
                </div>
              </div>

              {/* Background rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border border-primary/10" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 rounded-full border border-primary/5" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 rounded-full border border-primary/5" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LaunchpadSection;
