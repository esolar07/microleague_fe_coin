// Feature: dashboard-tokens-vesting
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, AlertTriangle, ExternalLink, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { formatUnits } from "viem";
import { useSwitchChain } from "wagmi";
import { APP_CHAIN } from "@/config/network";
import { requestSwitchChain } from "@/web3/requestSwitchChain";
import { getTokenTransactions, TransactionPage } from "@/services/tokens";

interface MyTokensTabProps {
  address: string | undefined;
  isConnected: boolean;
  isOnCorrectChain: boolean;
  saleTokenDecimals: number | undefined;
  userTotalAllocated: bigint | undefined;
  userTotalClaimed: bigint | undefined;
  userClaimableAmount: bigint | undefined;
}

export default function MyTokensTab({
  address,
  isConnected,
  isOnCorrectChain,
  saleTokenDecimals,
  userTotalAllocated,
  userTotalClaimed,
  userClaimableAmount,
}: MyTokensTabProps) {
  const { switchChainAsync } = useSwitchChain();

  const [page, setPage] = useState(1);
  const [txData, setTxData] = useState<TransactionPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getTokenTransactions(address, page, 10)
      .then((result) => {
        if (!cancelled) setTxData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load transactions");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [address, page]);

  const decimals = saleTokenDecimals ?? 18;
  const isLoading = userTotalAllocated === undefined;

  const totalAllocatedMLC = userTotalAllocated !== undefined
    ? Number(formatUnits(userTotalAllocated, decimals))
    : 0;
  const totalClaimedMLC = userTotalClaimed !== undefined
    ? Number(formatUnits(userTotalClaimed, decimals))
    : 0;
  const claimableMLC = userClaimableAmount !== undefined
    ? Number(formatUnits(userClaimableAmount, decimals))
    : 0;
  const lockedTokens = Math.max(0, totalAllocatedMLC - totalClaimedMLC - claimableMLC);

  const skeletonCell = (
    <span className="bg-secondary/50 rounded animate-pulse h-8 w-24 inline-block" />
  );

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground"
      >
        <Wallet className="w-12 h-12 opacity-50" />
        <p className="text-lg">Connect your wallet to view your token holdings</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Wrong Network Banner */}
      {!isOnCorrectChain && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="font-medium">Wrong Network</span>
            <span className="text-sm text-muted-foreground">
              — Please switch to {APP_CHAIN.name}
            </span>
          </div>
          <button
            className="mlc-btn-primary text-sm px-4 py-1.5"
            onClick={() => requestSwitchChain(APP_CHAIN)}
          >
            Switch Network
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="mlc-card-elevated p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total MLC Allocated</p>
          <p className="text-xl font-semibold text-foreground">
            {isLoading ? skeletonCell : totalAllocatedMLC.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </p>
        </div>
        <div className="mlc-card-elevated p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Claimed</p>
          <p className="text-xl font-semibold text-foreground">
            {isLoading ? skeletonCell : totalClaimedMLC.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </p>
        </div>
        <div className="mlc-card-elevated p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Currently Claimable</p>
          <p className="text-xl font-semibold text-foreground">
            {isLoading ? skeletonCell : claimableMLC.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </p>
        </div>
        <div className="mlc-card-elevated p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Locked Tokens</p>
          <p className="text-xl font-semibold text-foreground">
            {isLoading ? skeletonCell : lockedTokens.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </p>
        </div>
      </div>

      {/* Purchase History */}
      <div className="mlc-card-elevated p-4 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Purchase History</h3>

        {/* Error state */}
        {error && (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
            <button
              className="mlc-btn-secondary text-sm px-3 py-1.5 flex items-center gap-1"
              onClick={() => { setError(null); setPage((p) => p); }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        {!error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">Stage</th>
                  <th className="pb-2 pr-4 font-medium">MLC Amount</th>
                  <th className="pb-2 pr-4 font-medium">USD Value</th>
                  <th className="pb-2 pr-4 font-medium">Payment Token</th>
                  <th className="pb-2 font-medium">Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/50">
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j} className="py-3 pr-4">
                            <span className="bg-secondary/50 rounded animate-pulse h-4 w-20 inline-block" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : txData?.data.map((tx) => (
                      <tr key={tx.txHash} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                        <td className="py-3 pr-4 text-muted-foreground">
                          {new Date(tx.timestamp * 1000).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4 text-foreground">{tx.stage}</td>
                        <td className="py-3 pr-4 text-foreground">
                          {tx.tokens.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </td>
                        <td className="py-3 pr-4 text-foreground">
                          ${tx.usdAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground font-mono text-xs">
                          {tx.quote.slice(0, 6)}...{tx.quote.slice(-4)}
                        </td>
                        <td className="py-3">
                          <a
                            href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline font-mono text-xs"
                          >
                            {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>

            {/* Empty state */}
            {!loading && txData?.data.length === 0 && (
              <p className="py-8 text-center text-muted-foreground text-sm">
                No purchase history found
              </p>
            )}
          </div>
        )}

        {/* Pagination */}
        {txData && txData.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              className="mlc-btn-secondary text-sm px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <span className="text-sm text-muted-foreground">
              Page {page} / {txData.totalPages}
            </span>
            <button
              className="mlc-btn-secondary text-sm px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
              disabled={page >= txData.totalPages}
              onClick={() => setPage((p) => Math.min(txData.totalPages, p + 1))}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
