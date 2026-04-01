// Feature: dashboard-tokens-vesting
import { useState, useEffect } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import { formatUnits } from "viem";
import { motion } from "framer-motion";
import { Wallet, AlertTriangle, Lock, Clock, ExternalLink, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { APP_CHAIN } from "@/config/network";
import { PRESALE_ADDRESS } from "@/config/presale";
import { tokenPresaleAbi } from "@/contracts/tokenPresaleAbi";
import { requestSwitchChain } from "@/web3/requestSwitchChain";
import { getClaimTransactions, TransactionPage } from "@/services/tokens";
import VestingClaimModal from "./VestingClaimModal";

interface VestingTabProps {
  address: string | undefined;
  isConnected: boolean;
  isOnCorrectChain: boolean;
  saleTokenDecimals: number | undefined;
}

interface VestingSchedule {
  index: number;
  totalAmount: number;
  claimed: number;
  vested: number;
  claimable: number;
  startTime: number;
  cliff: number;
  duration: number;
  releaseInterval: number;
  stageId: number;
}

type VestingStatus = "Cliff Period" | "Vesting" | "Fully Vested";

function getVestingStatus(now: number, startTime: number, cliff: number, duration: number): VestingStatus {
  if (now < startTime + cliff) return "Cliff Period";
  if (now >= startTime + duration) return "Fully Vested";
  return "Vesting";
}

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatInterval(seconds: number): string {
  if (seconds >= 86400 * 30) return `Every ${Math.round(seconds / (86400 * 30))} month(s)`;
  if (seconds >= 86400 * 7) return `Every ${Math.round(seconds / (86400 * 7))} week(s)`;
  if (seconds >= 86400) return `Every ${Math.round(seconds / 86400)} day(s)`;
  if (seconds >= 3600) return `Every ${Math.round(seconds / 3600)} hour(s)`;
  return `Every ${seconds}s`;
}

function formatDuration(seconds: number): string {
  if (seconds >= 86400 * 30) return `${Math.round(seconds / (86400 * 30))} month(s)`;
  if (seconds >= 86400 * 7) return `${Math.round(seconds / (86400 * 7))} week(s)`;
  if (seconds >= 86400) return `${Math.round(seconds / 86400)} day(s)`;
  return `${seconds}s`;
}

type ScheduleResult = readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];

function parseSchedule(index: number, data: ScheduleResult, decimals: number): VestingSchedule {
  const [totalAmount, claimed, vested, claimable, startTime, cliff, duration, releaseInterval, stageId] = data;
  return {
    index,
    totalAmount: Number(formatUnits(totalAmount, decimals)),
    claimed: Number(formatUnits(claimed, decimals)),
    vested: Number(formatUnits(vested, decimals)),
    claimable: Number(formatUnits(claimable, decimals)),
    startTime: Number(startTime),
    cliff: Number(cliff),
    duration: Number(duration),
    releaseInterval: Number(releaseInterval),
    stageId: Number(stageId),
  };
}

export default function VestingTab({ address, isConnected, isOnCorrectChain, saleTokenDecimals }: VestingTabProps) {
  const decimals = saleTokenDecimals ?? 18;
  const now = Math.floor(Date.now() / 1000);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<"confirm" | "processing" | "done">("confirm");
  const [modalError, setModalError] = useState<string | undefined>(undefined);
  const [claimableForModal, setClaimableForModal] = useState(0);

  // Claim history state
  const [claimPage, setClaimPage] = useState(1);
  const [claimData, setClaimData] = useState<TransactionPage | null>(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    setClaimLoading(true);
    setClaimError(null);
    getClaimTransactions(address, claimPage, 10)
      .then((result) => { if (!cancelled) setClaimData(result); })
      .catch((err: unknown) => { if (!cancelled) setClaimError(err instanceof Error ? err.message : "Failed to load claim history"); })
      .finally(() => { if (!cancelled) setClaimLoading(false); });
    return () => { cancelled = true; };
  }, [address, claimPage]);

  // const { data: claimEnabled } = useReadContract({
  //   abi: tokenPresaleAbi,
  //   address: PRESALE_ADDRESS,
  //   functionName: "claimEnabled",
  //   chainId: APP_CHAIN.id,
  //   query: { enabled: Boolean(PRESALE_ADDRESS) },
  // });

  const claimEnabled: boolean = true

  const { data: scheduleCount, refetch: refetchCount } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "getVestingSchedulesCount",
    args: address ? [address as `0x${string}`] : undefined,
    chainId: APP_CHAIN.id,
    query: { enabled: Boolean(address && PRESALE_ADDRESS) },
  });

  const count = scheduleCount !== undefined ? Number(scheduleCount) : undefined;
  const enabled = (idx: number) => Boolean(address && PRESALE_ADDRESS && count !== undefined && count > idx);
  const scheduleArgs = (idx: number) =>
    address ? ([address as `0x${string}`, BigInt(idx)] as const) : undefined;

  const s0 = useReadContract({ abi: tokenPresaleAbi, address: PRESALE_ADDRESS, functionName: "getVestingSchedule", args: scheduleArgs(0), chainId: APP_CHAIN.id, query: { enabled: enabled(0) } });
  const s1 = useReadContract({ abi: tokenPresaleAbi, address: PRESALE_ADDRESS, functionName: "getVestingSchedule", args: scheduleArgs(1), chainId: APP_CHAIN.id, query: { enabled: enabled(1) } });
  const s2 = useReadContract({ abi: tokenPresaleAbi, address: PRESALE_ADDRESS, functionName: "getVestingSchedule", args: scheduleArgs(2), chainId: APP_CHAIN.id, query: { enabled: enabled(2) } });
  const s3 = useReadContract({ abi: tokenPresaleAbi, address: PRESALE_ADDRESS, functionName: "getVestingSchedule", args: scheduleArgs(3), chainId: APP_CHAIN.id, query: { enabled: enabled(3) } });
  const s4 = useReadContract({ abi: tokenPresaleAbi, address: PRESALE_ADDRESS, functionName: "getVestingSchedule", args: scheduleArgs(4), chainId: APP_CHAIN.id, query: { enabled: enabled(4) } });

  const allResults = [s0, s1, s2, s3, s4];

  const schedules: VestingSchedule[] = [];
  if (count !== undefined) {
    for (let i = 0; i < Math.min(count, 5); i++) {
      const data = allResults[i].data;
      if (data) {
        schedules.push(parseSchedule(i, data as ScheduleResult, decimals));
      }
    }
  }

  const refetchAll = () => {
    refetchCount();
    s0.refetch();
    s1.refetch();
    s2.refetch();
    s3.refetch();
    s4.refetch();
    // Re-trigger claim history fetch by resetting to page 1
    setClaimPage(1);
    setClaimData(null);
  };

  const { writeContractAsync } = useWriteContract();

  const handleClaimClick = (claimable: number) => {
    setClaimableForModal(claimable);
    setModalError(undefined);
    setModalStep("confirm");
    setModalOpen(true);
  };

  const handleConfirmClaim = async () => {
    if (!PRESALE_ADDRESS) return;
    const presaleAddr = PRESALE_ADDRESS;
    setModalStep("processing");
    try {
      await writeContractAsync({
        abi: tokenPresaleAbi,
        address: presaleAddr,
        functionName: "claim",
        chain: undefined,
        account: address as `0x${string}`,
      });
      setModalStep("done");
      refetchAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      setModalError(msg.length > 120 ? msg.slice(0, 120) + "..." : msg);
      setModalStep("confirm");
    }
  };

  if (!isConnected) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
        <Wallet className="w-12 h-12 opacity-50" />
        <p className="text-lg">Connect your wallet to view your vesting schedules</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Wrong Network Banner */}
      {!isOnCorrectChain && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="font-medium">Wrong Network — Please switch to {APP_CHAIN.name}</span>
          </div>
          <button className="mlc-btn-primary text-sm px-4 py-1.5" onClick={() => requestSwitchChain(APP_CHAIN)}>
            Switch Network
          </button>
        </div>
      )}

      {/* Claim not enabled notice */}
      {!claimEnabled && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400 flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0" />
          Claiming not yet enabled
        </div>
      )}

      {/* Loading state */}
      {count === undefined && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="mlc-card-elevated p-5 space-y-3 animate-pulse">
              <div className="h-5 w-40 bg-secondary/50 rounded" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[0, 1, 2, 3].map((j) => <div key={j} className="h-10 bg-secondary/50 rounded" />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {count === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <Lock className="w-10 h-10 opacity-40" />
          <p className="text-sm text-center">No vesting schedules found. Purchase MLC tokens to create a vesting schedule.</p>
        </div>
      )}

      {/* Schedule cards */}
      {count !== undefined && count > 0 && (
        <div className="space-y-4">
          {schedules.map((s) => {
            const status = getVestingStatus(now, s.startTime, s.cliff, s.duration);
            const progressPct = s.totalAmount > 0 ? Math.min(100, (s.vested / s.totalAmount) * 100) : 0;

            return (
              <div key={s.index} className="mlc-card-elevated p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Stage {s.stageId + 1}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${status === "Fully Vested" ? "bg-success/10 text-success" :
                      status === "Cliff Period" ? "bg-warning/10 text-warning" :
                        "bg-primary/10 text-primary"
                    }`}>{status}</span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Vested</span>
                    <span>{progressPct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>

                {/* Fields grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
                  <div><p className="text-xs text-muted-foreground">Total Amount</p><p className="font-medium text-foreground">{s.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })} MLC</p></div>
                  <div><p className="text-xs text-muted-foreground">Claimed</p><p className="font-medium text-foreground">{s.claimed.toLocaleString(undefined, { maximumFractionDigits: 4 })} MLC</p></div>
                  <div><p className="text-xs text-muted-foreground">Vested So Far</p><p className="font-medium text-foreground">{s.vested.toLocaleString(undefined, { maximumFractionDigits: 4 })} MLC</p></div>
                  <div><p className="text-xs text-muted-foreground">Claimable</p><p className="font-medium text-success">{s.claimable.toLocaleString(undefined, { maximumFractionDigits: 4 })} MLC</p></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="font-medium text-foreground">{formatDate(s.startTime)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cliff Period</p>
                    <p className="font-medium text-foreground">{formatDuration(s.cliff)}</p>
                    <p className="text-xs text-muted-foreground">ends {formatDate(s.startTime + s.cliff)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Vesting Duration</p>
                    <p className="font-medium text-foreground">{formatDuration(s.duration)}</p>
                    <p className="text-xs text-muted-foreground">ends {formatDate(s.startTime + s.cliff + s.duration)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Release Frequency</p>
                    <p className="font-medium text-foreground">{formatInterval(s.releaseInterval)}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Single claim button for all schedules */}
          {claimEnabled && (
            <div className="pt-1 relative group inline-block">
              {(() => {
                const totalClaimable = schedules.reduce((sum, s) => sum + s.claimable, 0);
                const canClaim = totalClaimable > 0;
                return (
                  <>
                    <button
                      disabled={!canClaim}
                      onClick={() => canClaim && handleClaimClick(totalClaimable)}
                      className="mlc-btn-primary text-sm px-5 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Claim All ({totalClaimable.toLocaleString(undefined, { maximumFractionDigits: 4 })} MLC)
                    </button>
                    {!canClaim && (
                      <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-card border border-border rounded px-2 py-1 text-xs text-muted-foreground whitespace-nowrap z-10">
                        Nothing vested yet
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      <VestingClaimModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        claimableAmount={claimableForModal}
        onConfirm={handleConfirmClaim}
        step={modalStep}
        errorMessage={modalError}
      />

      {/* Claim History */}
      <div className="mlc-card-elevated p-4 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Claim History</h3>

        {claimError && (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{claimError}</p>
            <button
              className="mlc-btn-secondary text-sm px-3 py-1.5 flex items-center gap-1"
              onClick={() => { setClaimError(null); setClaimPage((p) => p); }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {!claimError && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">MLC Claimed</th>
                  <th className="pb-2 font-medium">Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {claimLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/50">
                        {[0, 1, 2].map((j) => (
                          <td key={j} className="py-3 pr-4">
                            <span className="bg-secondary/50 rounded animate-pulse h-4 w-20 inline-block" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : claimData?.data.map((tx) => (
                      <tr key={tx.txHash} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                        <td className="py-3 pr-4 text-muted-foreground">
                          {new Date(tx.timestamp * 1000).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4 text-success font-medium">
                          +{tx.tokens.toLocaleString(undefined, { maximumFractionDigits: 4 })} MLC
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

            {!claimLoading && claimData?.data.length === 0 && (
              <p className="py-8 text-center text-muted-foreground text-sm">
                No claim history found
              </p>
            )}
          </div>
        )}

        {claimData && claimData.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              className="mlc-btn-secondary text-sm px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
              disabled={claimPage <= 1}
              onClick={() => setClaimPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <span className="text-sm text-muted-foreground">
              Page {claimPage} / {claimData.totalPages}
            </span>
            <button
              className="mlc-btn-secondary text-sm px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
              disabled={claimPage >= claimData.totalPages}
              onClick={() => setClaimPage((p) => Math.min(claimData.totalPages, p + 1))}
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
