import { motion } from "framer-motion";
import { Layers, ArrowRight, Shield, Zap } from "lucide-react";

const InfrastructureSection = () => {
  return (
    <section className="mlc-section bg-foreground text-background">
      <div className="mlc-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-2 lg:order-1"
          >
            <div className="relative max-w-md mx-auto">
              {/* Layer Stack */}
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="p-4 rounded-xl bg-background/10 border border-background/20 backdrop-blur"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">MLC</span>
                    </div>
                    <div>
                      <p className="font-semibold text-background">MicroLeague App-Chain</p>
                      <p className="text-sm text-background/60">Future: Custom L2</p>
                    </div>
                  </div>
                </motion.div>

                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-background/40 rotate-90" />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="p-4 rounded-xl bg-primary/20 border border-primary/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">🔵</span>
                    </div>
                    <div>
                      <p className="font-semibold text-background">Base Network</p>
                      <p className="text-sm text-background/60">Current: Ethereum L2</p>
                    </div>
                  </div>
                </motion.div>

                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-background/40 rotate-90" />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="p-4 rounded-xl bg-background/5 border border-background/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-background/20 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-background" />
                    </div>
                    <div>
                      <p className="font-semibold text-background">Ethereum Mainnet</p>
                      <p className="text-sm text-background/60">Foundation: L1 Security</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-1 lg:order-2"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/10 text-background text-sm font-medium mb-4">
              <Layers className="w-4 h-4" />
              Infrastructure
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-background mb-4">
              The Tech Stack
            </h2>
            <p className="text-lg text-background/70 mb-8">
              Running on Base right now. Building our own chain next. 
              You will not have to do anything when we upgrade.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-background">Works Everywhere</h3>
                  <p className="text-sm text-background/60">
                    Bridging between chains happens automatically. No manual work needed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-background">Smooth Upgrades</h3>
                  <p className="text-sm text-background/60">
                    When we move to our own chain, your experience stays the same. Just faster.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InfrastructureSection;
