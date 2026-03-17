import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Info, Zap } from "lucide-react";

interface PresaleWidgetProps {
  onBuyClick: () => void;
  mlcPrice?: number;
}

const PresaleWidget = ({ onBuyClick, mlcPrice = 0.01 }: PresaleWidgetProps) => {
  const [usdAmount, setUsdAmount] = useState<string>("100");

  const mlcAmount = usdAmount ? (parseFloat(usdAmount) / mlcPrice).toFixed(0) : "0";

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    setUsdAmount(numericValue);
  };

  const quickAmounts = [100, 500, 1000, 5000];

  // Presale stats
  const soldAmount = 2200;
  const totalCap = 200000000;
  const progressPercent = (soldAmount / totalCap) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mlc-card-elevated max-w-md w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Buy MLC Tokens</h3>
          <p className="text-sm text-muted-foreground">Presale Phase 1</p>
        </div>
        <div className="mlc-badge-primary">
          <Zap className="w-3 h-3 mr-1" />
          Live Now
        </div>
      </div>

      {/* Price Display */}
      <div className="bg-secondary/50 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Price</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">${mlcPrice}</span>
            <span className="text-sm text-muted-foreground">USDC per MLC</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Presale Progress</span>
          <span className="text-foreground font-medium">{progressPercent.toFixed(4)}% Complete</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(progressPercent, 0.5)}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full mlc-gradient-bg rounded-full"
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Sold: {soldAmount.toLocaleString()} MLC</span>
          <span>Total Cap: {(totalCap / 1000000).toFixed(0)}M MLC</span>
        </div>
      </div>

      {/* USD Input */}
      <div className="space-y-3 mb-4">
        <label className="text-sm font-medium text-foreground">You Pay</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
          <input
            type="text"
            value={usdAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="mlc-input pl-8 pr-16 text-xl font-semibold"
            placeholder="0.00"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">USD</span>
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div className="flex gap-2 mb-6">
        {quickAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => setUsdAmount(amount.toString())}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              usdAmount === amount.toString()
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            ${amount}
          </button>
        ))}
      </div>

      {/* MLC Output */}
      <div className="space-y-3 mb-6">
        <label className="text-sm font-medium text-foreground">You Receive</label>
        <div className="bg-accent rounded-xl p-4 border-2 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full mlc-gradient-bg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">MLC</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{parseFloat(mlcAmount).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">MicroLeague Coin</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buy Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onBuyClick}
        className="w-full mlc-btn-primary flex items-center justify-center gap-2 text-lg py-4"
      >
        Buy MLC
        <ArrowRight className="w-5 h-5" />
      </motion.button>

      {/* Phase End Notice */}
      <p className="text-center text-sm text-muted-foreground mt-4">
        Presale - Phase 1 Ends <span className="font-medium text-foreground">January 15, 2026</span>
      </p>

      {/* Info Notice */}
      <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Tokens are locked until presale ends. No guaranteed returns. Rewards are activity-based only.
        </p>
      </div>
    </motion.div>
  );
};

export default PresaleWidget;
