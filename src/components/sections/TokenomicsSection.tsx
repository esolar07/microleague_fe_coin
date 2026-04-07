import { motion } from "framer-motion";
import { AlertTriangle, Shield } from "lucide-react";

const tokenomicsData = [
  { label: "Presale", percentage: 20, color: "#3B82F6", bgClass: "bg-blue-500" },
  { label: "Community Rewards", percentage: 30, color: "#10B981", bgClass: "bg-emerald-500" },
  { label: "Treasury Reserve", percentage: 25, color: "#F59E0B", bgClass: "bg-amber-500" },
  { label: "Team & Advisors", percentage: 15, color: "#8B5CF6", bgClass: "bg-violet-500" },
  { label: "Liquidity & MM", percentage: 5, color: "#EC4899", bgClass: "bg-pink-500" },
  { label: "Ecosystem Partnerships", percentage: 5, color: "#06B6D4", bgClass: "bg-cyan-500" },
];

const TokenomicsSection = () => {
  return (
    <section className="mlc-section bg-secondary/30">
      <div className="mlc-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="mlc-badge-primary mb-4">Token Economics</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Where the Tokens Go
          </h2>
          <p className="text-lg text-muted-foreground">
            No hidden allocations. No surprise unlocks. Here is exactly how we split the supply.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative aspect-square max-w-md mx-auto"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {(() => {
                let cumulativePercent = 0;
                return tokenomicsData.map((item, index) => {
                  const startAngle = cumulativePercent * 3.6 - 90;
                  cumulativePercent += item.percentage;
                  const endAngle = cumulativePercent * 3.6 - 90;
                  
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;
                  
                  const x1 = 50 + 40 * Math.cos(startRad);
                  const y1 = 50 + 40 * Math.sin(startRad);
                  const x2 = 50 + 40 * Math.cos(endRad);
                  const y2 = 50 + 40 * Math.sin(endRad);
                  
                  const largeArc = item.percentage > 50 ? 1 : 0;
                  
                  const pathD = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
                  
                  return (
                    <motion.path
                      key={index}
                      d={pathD}
                      fill={item.color}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      style={{ transformOrigin: "center" }}
                    />
                  );
                });
              })()}
              {/* Inner circle for donut effect */}
              <circle cx="50" cy="50" r="25" className="fill-secondary" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">1B</p>
                <p className="text-sm text-muted-foreground">Total Supply</p>
              </div>
            </div>
          </motion.div>

          {/* Legend */}
          <div className="space-y-3">
            {tokenomicsData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${item.bgClass}`} />
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <span className="text-lg font-bold text-foreground">{item.percentage}%</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-16 max-w-6xl mx-auto"
        >
          {[
            { label: "Total Supply", value: "1,000,000,000 MLC" },
            { label: "Presale Phase 1 Price", value: "$0.01" },
            { label: "Presale - Phase 1 Ends", value: "Jan 15, 2026" },
            { label: "Presale - Phase 2 Price", value: "$0.015" },
            { label: "Launch Price", value: "TBD" },
            { label: "Blockchain", value: "Base" },
          ].map((metric, index) => (
            <div key={index} className="mlc-card text-center">
              <p className="text-lg font-bold text-foreground">{metric.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Security Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Important Security Information</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Risk Warning:</strong> Crypto assets are high risk. This site is informational and not financial advice.
                </p>
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong>Never share:</strong> Your private keys, seed phrases, or wallet passwords with anyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TokenomicsSection;
