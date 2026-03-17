import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Calendar, Rocket, Clock, Sparkles } from "lucide-react";

interface TokenGrowthSectionProps {
  onBuyClick: () => void;
}

const phases = [
  {
    name: "Phase 1",
    status: "live",
    price: "$0.01",
    bonus: "+10% Bonus",
    date: "Now - Jan 15, 2026",
  },
  {
    name: "Phase 2",
    status: "upcoming",
    price: "$0.015",
    bonus: "+5% Bonus",
    date: "Jan 16 - Feb 28, 2026",
  },
  {
    name: "Launch",
    status: "future",
    price: "TBD",
    bonus: "Exchange Listing",
    date: "Q2 2026",
  },
];

const TokenGrowthSection = ({ onBuyClick }: TokenGrowthSectionProps) => {
  return (
    <section className="mlc-section bg-gradient-to-b from-background to-primary/5">
      <div className="mlc-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="mlc-badge-primary mb-4">
            <TrendingUp className="w-3 h-3 mr-1" />
            Token Growth
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Buy Early, Pay Less
          </h2>
          <p className="text-lg text-muted-foreground">
            Price goes up every phase. Right now you are getting the lowest price we will ever offer.
          </p>
        </motion.div>

        {/* Price Timeline */}
        <div className="max-w-5xl mx-auto mb-16">
          {/* Desktop Layout */}
          <div className="hidden md:block relative">
            {/* Progress Line Container - aligned with dots */}
            <div className="absolute top-4 left-0 right-0 flex items-center justify-center px-[calc(16.67%)]">
              <div className="w-full h-0.5 bg-border relative">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "50%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>

            {/* Phases Grid - Desktop */}
            <div className="grid grid-cols-3 gap-8">
              {phases.map((phase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="flex flex-col items-center"
                >
                  {/* Connector dot */}
                  <div className="relative z-10 mb-6">
                    <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center ${
                      phase.status === "live" 
                        ? "bg-primary border-primary shadow-lg shadow-primary/30" 
                        : phase.status === "upcoming"
                        ? "bg-background border-primary/50"
                        : "bg-background border-border"
                    }`}>
                      {phase.status === "live" && (
                        <motion.div
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          className="w-3 h-3 rounded-full bg-white"
                        />
                      )}
                    </div>
                  </div>

                  {/* Card */}
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className={`relative w-full p-6 rounded-2xl border-2 transition-all ${
                      phase.status === "live" 
                        ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary shadow-xl shadow-primary/10" 
                        : phase.status === "upcoming"
                        ? "bg-card border-primary/30 hover:border-primary/50"
                        : "bg-card border-border hover:border-primary/30"
                    }`}
                  >
                    {/* Status Badge */}
                    {phase.status === "live" && (
                      <motion.div
                        animate={{ opacity: [1, 0.7, 1] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        className="absolute -top-3 left-1/2 -translate-x-1/2"
                      >
                        <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg whitespace-nowrap">
                          🟢 LIVE NOW
                        </span>
                      </motion.div>
                    )}
                    {phase.status === "upcoming" && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border whitespace-nowrap">
                          Coming Soon
                        </span>
                      </div>
                    )}

                    <div className="text-center pt-2">
                      <h3 className={`text-lg font-bold ${
                        phase.status === "live" ? "text-primary" : "text-foreground"
                      }`}>{phase.name}</h3>
                      
                      <div className={`text-4xl lg:text-5xl font-bold my-4 ${
                        phase.status === "live" ? "mlc-gradient-text" : "text-foreground"
                      }`}>
                        {phase.price}
                      </div>
                      
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                        phase.status === "live" 
                          ? "bg-success/10 text-success" 
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        {phase.status === "live" && <Sparkles className="w-3.5 h-3.5" />}
                        {phase.bonus}
                      </div>
                      
                      <div className="flex items-center justify-center gap-1.5 mt-4 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {phase.date}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile Layout - Vertical Timeline */}
          <div className="md:hidden relative">
            {/* Vertical Progress Line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border">
              <motion.div 
                initial={{ height: 0 }}
                whileInView={{ height: "33%" }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5 }}
                className="w-full bg-primary rounded-full"
              />
            </div>

            {/* Phases - Mobile */}
            <div className="space-y-6">
              {phases.map((phase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="flex items-start gap-4"
                >
                  {/* Connector dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center ${
                      phase.status === "live" 
                        ? "bg-primary border-primary shadow-lg shadow-primary/30" 
                        : phase.status === "upcoming"
                        ? "bg-background border-primary/50"
                        : "bg-background border-border"
                    }`}>
                      {phase.status === "live" && (
                        <motion.div
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          className="w-2.5 h-2.5 rounded-full bg-white"
                        />
                      )}
                    </div>
                  </div>

                  {/* Card */}
                  <div className={`relative flex-1 p-5 rounded-xl border-2 transition-all ${
                    phase.status === "live" 
                      ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary shadow-lg shadow-primary/10" 
                      : phase.status === "upcoming"
                      ? "bg-card border-primary/30"
                      : "bg-card border-border"
                  }`}>
                    {/* Status Badge */}
                    {phase.status === "live" && (
                      <span className="absolute -top-2.5 left-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-lg">
                        🟢 LIVE NOW
                      </span>
                    )}
                    {phase.status === "upcoming" && (
                      <span className="absolute -top-2.5 left-4 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-[10px] font-medium border border-border">
                        Coming Soon
                      </span>
                    )}

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div>
                        <h3 className={`text-base font-bold ${
                          phase.status === "live" ? "text-primary" : "text-foreground"
                        }`}>{phase.name}</h3>
                        
                        <div className={`text-2xl font-bold mt-1 ${
                          phase.status === "live" ? "mlc-gradient-text" : "text-foreground"
                        }`}>
                          {phase.price}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          phase.status === "live" 
                            ? "bg-success/10 text-success" 
                            : "bg-secondary text-muted-foreground"
                        }`}>
                          {phase.status === "live" && <Sparkles className="w-3 h-3" />}
                          {phase.bonus}
                        </div>
                        
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {phase.date}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Growth Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          <div className="mlc-card-elevated text-center">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <p className="text-3xl font-bold text-success">+50%</p>
            <p className="text-sm text-muted-foreground mt-1">Phase 1 → Phase 2</p>
          </div>
          <div className="mlc-card-elevated text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">Limited Time</p>
            <p className="text-sm text-muted-foreground mt-1">Phase 1 ends Jan 15, 2026</p>
          </div>
          <div className="mlc-card-elevated text-center">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-6 h-6 text-warning" />
            </div>
            <p className="text-3xl font-bold text-foreground">First Access</p>
            <p className="text-sm text-muted-foreground mt-1">Earliest supporters benefit most</p>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative overflow-hidden rounded-3xl mlc-gradient-bg p-8 md:p-12 text-center"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              This is the Cheapest it Gets
            </h3>
            <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
              When Phase 1 ends, price jumps 50%. If you are thinking about it, 
              now is the time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBuyClick}
                className="px-8 py-4 rounded-xl bg-white text-primary font-semibold text-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
              >
                Buy MLC Now
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <div className="text-primary-foreground/80 text-sm">
                <span className="font-semibold text-primary-foreground">$0.01</span> per token
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TokenGrowthSection;
