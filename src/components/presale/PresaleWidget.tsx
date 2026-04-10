import { useState, useMemo } from "react";
import { ArrowRight, Info, Zap, AlertTriangle } from "lucide-react";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { PRESALE_ADDRESS } from "@/config/presale";
import { APP_CHAIN } from "@/config/network";
import { tokenPresaleAbi } from "@/contracts/tokenPresaleAbi";

interface PresaleWidgetProps {
  onBuyClick: (amount: number) => void;
  mlcPrice?: number;
  onTransactionSuccess?: () => Promise<void>; // New callback for refetching stats
}

const PresaleWidget = ({
  onBuyClick,
  mlcPrice = 0.01,
  onTransactionSuccess,
}: PresaleWidgetProps) => {
  const [usdAmount, setUsdAmount] = useState<string>("100");

  // Memoize query config to prevent RPC loops
  const queryConfig = useMemo(
    () => ({
      enabled: Boolean(PRESALE_ADDRESS),
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 10000, // Consider data fresh for 10 seconds
      gcTime: 300000, // Keep in cache for 5 minutes
    }),
    [],
  );

  const { data: currentStage } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "currentStage",
    chainId: APP_CHAIN.id,
    query: queryConfig,
  });

  const { data: saleTokenDecimals } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "saleTokenDecimals",
    chainId: APP_CHAIN.id,
    query: queryConfig,
  });

  // Memoize all calculations to prevent unnecessary recalculations
  const calculatedValues = useMemo(() => {
    const stage = currentStage?.[1];
    const stagePriceUsd =
      stage?.price !== undefined
        ? Number(formatUnits(stage.price, 18))
        : undefined;
    const effectivePrice = stagePriceUsd ?? mlcPrice;

    const mlcAmount = usdAmount
      ? (parseFloat(usdAmount) / effectivePrice).toFixed(0)
      : "0";

    // Calculate minimum buy tokens and USD amount
    const minBuyTokens =
      stage?.minBuyTokens !== undefined && saleTokenDecimals !== undefined
        ? Number(formatUnits(stage.minBuyTokens, saleTokenDecimals))
        : 10000; // fallback to 10,000 tokens

    const minUsdAmount = minBuyTokens * effectivePrice;
    const currentUsdAmount = parseFloat(usdAmount) || 0;
    const currentMlcAmount = parseFloat(mlcAmount) || 0;

    // Validation states
    const isBelowMinimum =
      currentUsdAmount > 0 && currentMlcAmount < minBuyTokens;
    const isValidAmount =
      currentUsdAmount > 0 && currentMlcAmount >= minBuyTokens;

    // Presale stats
    const soldAmount =
      stage?.soldAmount !== undefined && saleTokenDecimals !== undefined
        ? Number(formatUnits(stage.soldAmount, saleTokenDecimals))
        : 2200;
    const totalCap =
      stage?.offeredAmount !== undefined && saleTokenDecimals !== undefined
        ? Number(formatUnits(stage.offeredAmount, saleTokenDecimals))
        : 200000000;
    const progressPercent = (soldAmount / totalCap) * 100;

    const stageEnd =
      stage?.endTime !== undefined
        ? new Date(Number(stage.endTime) * 1000)
        : null;

    return {
      stage,
      effectivePrice,
      mlcAmount,
      minBuyTokens,
      minUsdAmount,
      currentUsdAmount,
      currentMlcAmount,
      isBelowMinimum,
      isValidAmount,
      soldAmount,
      totalCap,
      progressPercent,
      stageEnd,
    };
  }, [currentStage, saleTokenDecimals, usdAmount, mlcPrice]);

  const {
    effectivePrice,
    mlcAmount,
    minBuyTokens,
    minUsdAmount,
    currentUsdAmount,
    isBelowMinimum,
    isValidAmount,
    soldAmount,
    totalCap,
    progressPercent,
    stageEnd,
  } = calculatedValues;

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    setUsdAmount(numericValue);
  };

  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <div className="mlc-card-elevated max-w-md w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Buy MLC Tokens
          </h3>
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
            <span className="text-xl font-bold text-foreground">
              ${effectivePrice}
            </span>
            <span className="text-sm text-muted-foreground">USDC per MLC</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Presale Progress</span>
          <span className="text-foreground font-medium">
            {progressPercent.toFixed(4)}% Complete
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            style={{ width: `${Math.max(progressPercent, 0.5)}%` }}
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
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
            $
          </span>
          <input
            type="text"
            value={usdAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className={`mlc-input pl-8 pr-16 text-xl font-semibold ${
              isBelowMinimum ? "border-red-500 focus:border-red-500" : ""
            }`}
            placeholder="0.00"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
            USD
          </span>
        </div>

        {/* Minimum amount validation message */}
        {isBelowMinimum && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-red-700 font-medium">
                Minimum purchase required
              </p>
              <p className="text-red-600">
                You must buy at least {minBuyTokens.toLocaleString()} MLC tokens
                (${minUsdAmount.toFixed(2)} USD minimum)
              </p>
            </div>
          </div>
        )}

        {/* Helpful info about minimum */}
        {currentUsdAmount === 0 && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-700 font-medium">Minimum Purchase</p>
              <p className="text-blue-600">
                Minimum buy amount: {minBuyTokens.toLocaleString()} MLC tokens
                (${minUsdAmount.toFixed(2)} USD)
              </p>
            </div>
          </div>
        )}
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
        {/* Add minimum amount button if it's not already in quick amounts */}
        {!quickAmounts.includes(Math.ceil(minUsdAmount)) && (
          <button
            onClick={() => setUsdAmount(Math.ceil(minUsdAmount).toString())}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 border-2 border-primary/30 ${
              usdAmount === Math.ceil(minUsdAmount).toString()
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}
          >
            Min ${Math.ceil(minUsdAmount)}
          </button>
        )}
      </div>

      {/* MLC Output */}
      <div className="space-y-3 mb-6">
        <label className="text-sm font-medium text-foreground">
          You Receive
        </label>
        <div className="bg-accent rounded-xl p-4 border-2 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full mlc-gradient-bg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  MLC
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {parseFloat(mlcAmount).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  MicroLeague Coin
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buy Button */}
      <button
        onClick={() => isValidAmount && onBuyClick(parseFloat(usdAmount) || 0)}
        disabled={!isValidAmount}
        className={`w-full flex items-center justify-center gap-2 text-lg py-4 transition-all duration-200 ${
          isValidAmount
            ? "mlc-btn-primary cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isBelowMinimum ? "Amount Too Low" : "Buy MLC"}
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Phase End Notice */}
      <p className="text-center text-sm text-muted-foreground mt-4">
        Presale - Phase 1 Ends{" "}
        <span className="font-medium text-foreground">
          {stageEnd ? stageEnd.toLocaleDateString() : "TBA"}
        </span>
      </p>

      {/* Info Notice */}
      <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Tokens are locked until presale ends. No guaranteed returns. Rewards
          are activity-based only.
        </p>
      </div>
    </div>
  );
};

export default PresaleWidget;
