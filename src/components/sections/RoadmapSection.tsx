import { motion } from "framer-motion";
import { CheckCircle, Circle } from "lucide-react";

const phases = [
  {
    phase: "Phase 1",
    title: "Presale and Rewards Go Live",
    status: "current",
    items: [
      "Public presale starts",
      "Rewards engine turns on",
      "Community starts building",
    ],
  },
  {
    phase: "Phase 2",
    title: "Fantasy 365",
    status: "upcoming",
    items: [
      "Simulations run all year",
      "Smarter AI matchmaking",
      "Mobile app drops",
    ],
  },
  {
    phase: "Phase 3",
    title: "Creator Economy",
    status: "upcoming",
    items: [
      "Tools for creators to build leagues",
      "Revenue sharing kicks in",
      "Custom league templates",
    ],
  },
  {
    phase: "Phase 4",
    title: "Launchpad",
    status: "upcoming",
    items: [
      "Open up to third-party apps",
      "Community ecosystems expand",
      "Governance goes live",
    ],
  },
  {
    phase: "Phase 5",
    title: "Our Own Chain",
    status: "upcoming",
    items: [
      "MicroLeague app-chain launches",
      "Bridge to other chains",
      "Enterprise deals",
    ],
  },
];

const RoadmapSection = () => {
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
          <span className="mlc-badge-primary mb-4">Roadmap</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What We Are Building
          </h2>
          <p className="text-lg text-muted-foreground">
            Here is the plan. We ship fast and we keep you updated.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-0.5" />

          <div className="space-y-12">
            {phases.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex items-start gap-8 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div
                  className={`flex-1 ml-12 md:ml-0 ${index % 2 === 0 ? "md:text-right md:pr-12" : "md:pl-12"}`}
                >
                  <div
                    className={`mlc-card inline-block text-left ${phase.status === "current" ? "border-primary" : ""}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-sm font-medium ${phase.status === "current" ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {phase.phase}
                      </span>
                      {phase.status === "current" && (
                        <span className="mlc-badge-primary text-[10px]">
                          Current
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {phase.title}
                    </h3>
                    <ul className="space-y-2">
                      {phase.items.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="flex items-center gap-2 text-muted-foreground"
                        >
                          <CheckCircle
                            className={`w-4 h-4 ${phase.status === "current" ? "text-primary" : "text-muted-foreground/50"}`}
                          />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Circle Indicator */}
                <div
                  className={`absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    phase.status === "current"
                      ? "mlc-gradient-bg animate-pulse-glow"
                      : "bg-card border-2 border-border"
                  }`}
                >
                  {phase.status === "current" ? (
                    <Circle className="w-3 h-3 text-primary-foreground fill-current" />
                  ) : (
                    <Circle className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden md:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoadmapSection;
