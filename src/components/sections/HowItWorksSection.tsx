import { motion } from "framer-motion";
import {
  Users,
  Zap,
  Gift,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Infinity as InfinityIcon,
} from "lucide-react";
import { useState, useEffect } from "react";

const steps = [
  {
    step: "01",
    title: "You Play",
    description:
      "Join leagues, run simulations, compete with friends. Do what you love.",
    icon: Users,
    color: "from-blue-500 to-cyan-500",
  },
  {
    step: "02",
    title: "Platform Earns",
    description:
      "Every game, every bet, every interaction brings revenue into the ecosystem.",
    icon: Zap,
    color: "from-purple-500 to-pink-500",
  },
  {
    step: "03",
    title: "Buyback and Burn",
    description:
      "We use that revenue to buy back MLC tokens and burn them. Less supply, more value.",
    icon: RefreshCw,
    color: "from-amber-500 to-orange-500",
  },
  {
    step: "04",
    title: "Price Goes Up",
    description:
      "Fewer tokens plus more demand equals higher price. Simple math.",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-500",
  },
];

const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);

  return (
    <section className="mlc-section bg-secondary/30 overflow-hidden">
      <div className="mlc-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="mlc-badge-primary mb-4">Economic Model</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How the Flywheel Works
          </h2>
          <p className="text-lg text-muted-foreground">
            You play. We earn. We buy back tokens. Price goes up. Rinse and
            repeat.
          </p>
        </motion.div>

        {/* Flywheel Visual */}
        <div className="relative max-w-5xl mx-auto">
          {/* Central Spinning Flywheel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative mx-auto w-[280px] h-[280px] md:w-[400px] md:h-[400px]"
          >
            {/* Outer Ring - Animated */}
            <motion.div
              animate={{ rotate: isSpinning ? 360 : 0 }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="absolute inset-0 rounded-full border-4 border-dashed border-primary/20"
            />

            {/* Middle Ring */}
            <motion.div
              animate={{ rotate: isSpinning ? -360 : 0 }}
              transition={{
                duration: 30,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="absolute inset-4 md:inset-6 rounded-full border-2 border-primary/30"
            />

            {/* Step Nodes */}
            {steps.map((step, index) => {
              const angle = (index * 90 - 45) * (Math.PI / 180);
              const radius = 110;
              const mdRadius = 160;
              const x = Math.cos(angle);
              const y = Math.sin(angle);
              const isActive = activeStep === index;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  className="absolute"
                  style={{
                    left: `calc(50% + ${x * radius}px)`,
                    top: `calc(50% + ${y * radius}px)`,
                    transform: "translate(-50%, -50%)",
                  }}
                  onMouseEnter={() => setActiveStep(index)}
                >
                  <motion.div
                    animate={
                      isActive
                        ? {
                            scale: 1.15,
                            boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)",
                          }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.3 }}
                    className={`relative  w-14 h-14 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center cursor-pointer shadow-lg`}
                    style={{
                      left: `calc(50% + ${x * mdRadius}px - 50%)`,
                      top: `calc(50% + ${y * mdRadius}px - 50%)`,
                    }}
                  >
                    <step.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />

                    {/* Pulse Ring */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                        className={`absolute inset-0  rounded-full bg-gradient-to-br ${step.color}`}
                      />
                    )}
                  </motion.div>
                </motion.div>
              );
            })}

            {/* Connecting Arrows */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="6"
                  markerHeight="6"
                  refX="3"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L6,3 L0,6 Z" className="fill-primary/40" />
                </marker>
              </defs>
              <motion.circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                className="stroke-primary/20"
                strokeWidth="0.5"
                strokeDasharray="3 3"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 10,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                style={{ transformOrigin: "center" }}
              />
            </svg>

            {/* Center Logo/Infinity */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                  "0 0 40px rgba(59, 130, 246, 0.5)",
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              className="absolute inset-0 m-auto w-20 h-20 md:w-28 md:h-28 rounded-full mlc-gradient-bg flex items-center justify-center shadow-xl"
            >
              <InfinityIcon
                className="w-10 h-10 md:w-14 md:h-14 text-white"
                strokeWidth={2.5}
              />
            </motion.div>
          </motion.div>

          {/* Step Details Card */}
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-12 max-w-lg mx-auto"
          >
            <div className="mlc-card-elevated text-center">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${steps[activeStep].color} flex items-center justify-center mx-auto mb-4 shadow-lg`}
              >
                {(() => {
                  const Icon = steps[activeStep].icon;
                  return <Icon className="w-8 h-8 text-white" />;
                })()}
              </div>
              <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {steps[activeStep].step}
              </span>
              <h3 className="text-xl font-semibold text-foreground mt-2 mb-2">
                {steps[activeStep].title}
              </h3>
              <p className="text-muted-foreground">
                {steps[activeStep].description}
              </p>
            </div>
          </motion.div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeStep === index
                    ? "bg-primary w-8"
                    : "bg-primary/30 hover:bg-primary/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Flow Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, y: -4 }}
              onClick={() => setActiveStep(index)}
              className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                activeStep === index
                  ? "bg-primary/10 border-primary shadow-lg"
                  : "bg-card border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center`}
                >
                  <step.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-primary/60">
                  {step.step}
                </span>
              </div>
              <h4 className="font-semibold text-foreground text-sm">
                {step.title}
              </h4>

              {index < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 z-10" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
