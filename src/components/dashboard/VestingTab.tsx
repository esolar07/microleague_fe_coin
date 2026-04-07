// Feature: dashboard-tokens-vesting
import { useState, useEffect } from "react";
import { useReadContract, useWriteContract, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { motion } from "framer-motion";
import {
  Wallet, AlertTriangle, Lock, Clock, ExternalLink,
  ChevronLeft, ChevronRight, RefreshCw, Percent,
} from "lucide-react";
import { APP_CHAIN } from "@/config/network";
import { PRESALE_ADDRESS } from "@/config/presale";
import { tokenPresaleAbi } from "@/contracts/tokenPresaleAbi";
import { requestSwitchChain } from "@/web3/requestSwitchChain";
import {
  getVestingSchedules,
  getVestingSummary,
  getClaimTransactions,
  VestingScheduleRecord,
  VestingSummary,
  TransactionPage,
} from "@/services/tokens";
import VestingClaimModal from "./VestingClaimModal";
import { formatBlockchainError } from "@/utils/formatError";

interface VestingTabProps {
  address: string | undefined;
  isConnected: boolean;
  isOnCorrectChain: boolean;
  saleTokenDecimals: number | undefined;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function formatDuration(seconds: number): string {
  if (seconds >= 86400 * 30) return `${Math.round(seconds / (86400 * 30))} month(s)`;
  if (seconds >= 86400 * 7)  return `${Math.round(seconds / (86400 * 7))} week(s)`;
  if (seconds >= 86400)      return `${Math.round(seconds / 86400)} day(s)`;
  return `${seconds}s`;
}

function daysUntil(unix: number): number {
  return Math.max(0, Math.ceil((unix * 1000 - Date.now()) / (1000 * 86400)));
}

interface QuarterGroup {
  label: string;
  lastUnlock: number;
  firstUnlock: number;
  amount: number;
}

function buildQuarterGroups(
  startTime: number,
  releaseInterval: number,
  duration: number,
  totalAmount: number,
): QuarterGroup[] {
  if (releaseInterval <= 0 || duration <= 0) return [];
  const numIntervals = Math.round(duration / releaseInterval);
  const amountPerInterval = totalAmount / numIntervals;
  const map = new Map<string, QuarterGroup>();
  for (let i = 0; i < numIntervals; i++) {
    const unlockTime = startTime + releaseInterval * (i + 1);
    const d = new Date(unlockTime * 1000);
    const q = Math.floor(d.getMonth() / 3) + 1;
    const key = `Q${q} ${d.getFullYear()}`;
    if (!map.has(key)) {
      map.set(key, { label: key, firstUnlock: unlockTime, lastUnlock: unlockTime, amount: 0 });
    }
    const g = map.get(key)!;
    g.lastUnlock = unlockTime;
    g.amount += amountPerInterval;
  }
  return Array.from(map.values());
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function VestingTab({ address, isConnected, isOnCorrectChain, saleTokenDecimals }: VestingTabProps) {
  const decimals = saleTokenDecimals ?? 18;
  const now = Math.floor(Date.now() / 1000);

  // ── UI state ──
  const [autoStake, setAutoStake] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<"confirm" | "processing" | "done">("confirm");
  const [modalError, setModalError] = useState<string | undefined>(undefined);
  const [claimableForModal, setClaimableForModal] = useState(0);

  // ── Backend API state ──
  const [apiSchedules, setApiSchedules] = useState<VestingScheduleRecord[] | null>(null);
  const [apiSummary, setApiSummary] = useState<VestingSummary | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // ── Claim history state ──
  const [claimPage, setClaimPage] = useState(1);
  const [claimData, setClaimData] = useState<TransactionPage | null>(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // ── Fetch backend data ──
  const fetchApiData = () => {
    if (!address) return;
    setApiLoading(true);
    setApiError(null);
    Promise.all([
      getVestingSchedules(address),
      getVestingSummary(address),
    ])
      .then(([schedules, summary]) => {
        setApiSchedules(schedules);
        setApiSummary(summary);
      })
      .catch((err: unknown) => {
        setApiError(err instanceof Error ? err.message : "Failed to load vesting data");
      })
      .finally(() => setApiLoading(false));
  };

  useEffect(() => { fetchApiData(); }, [address]);

  // ── Fetch claim history ──
  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    setClaimLoading(true);
    setClaimError(null);
    getClaimTransactions(address, claimPage, 10)
      .then((r) => { if (!cancelled) setClaimData(r); })
      .catch((err: unknown) => { if (!cancelled) setClaimError(err instanceof Error ? err.message : "Failed to load claim history"); })
      .finally(() => { if (!cancelled) setClaimLoading(false); });
    return () => { cancelled = true; };
  }, [address, claimPage]);

  // ── Contract: claimEnabled ──
  const { data: claimEnabledRaw } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "claimEnabled",
    chainId: APP_CHAIN.id,
    query: { enabled: Boolean(PRESALE_ADDRESS) },
  });
  const claimEnabled = claimEnabledRaw ?? false;

  // ── Contract: canUserClaim ──
  const { data: canClaimData, refetch: refetchCanClaim } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "canUserClaim",
    args: address ? [address as `0x${string}`] : undefined,
    chainId: APP_CHAIN.id,
    query: { enabled: Boolean(address && PRESALE_ADDRESS) },
  });
  // canClaimData = [canClaim: bool, claimable: bigint, reason: string]
  const canClaim = canClaimData?.[0] ?? false;
  const liveClaimable = canClaimData?.[1] !== undefined
    ? Number(formatUnits(canClaimData[1], decimals))
    : 0;


    console.log(canClaimData,'canClaimData');
    

  // ── Contract: per-schedule live claimable via getVestingSchedule ──
  const scheduleCount = apiSchedules?.length ?? 0;
  const contractScheduleReads = useReadContracts({
    contracts: Array.from({ length: Math.min(scheduleCount, 10) }, (_, i) => ({
      abi: tokenPresaleAbi,
      address: PRESALE_ADDRESS as `0x${string}`,
      functionName: "getVestingSchedule" as const,
      args: [address as `0x${string}`, BigInt(i)] as const,
      chainId: APP_CHAIN.id,
    })),
    query: { enabled: Boolean(address && PRESALE_ADDRESS && scheduleCount > 0) },
  });

  // ── Contract: totalAllocated & totalClaimed for stat cards ──
  const { data: totalAllocatedRaw, refetch: refetchAllocated } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "totalAllocated",
    args: address ? [address as `0x${string}`] : undefined,
    chainId: APP_CHAIN.id,
    query: { enabled: Boolean(address && PRESALE_ADDRESS) },
  });
  const { data: totalClaimedRaw, refetch: refetchClaimed } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "totalClaimed",
    args: address ? [address as `0x${string}`] : undefined,
    chainId: APP_CHAIN.id,
    query: { enabled: Boolean(address && PRESALE_ADDRESS) },
  });

  const totalAllocatedMLC = totalAllocatedRaw !== undefined ? Number(formatUnits(totalAllocatedRaw, decimals)) : null;
  const totalClaimedMLC   = totalClaimedRaw   !== undefined ? Number(formatUnits(totalClaimedRaw,   decimals)) : null;
  const totalRemainingMLC = totalAllocatedMLC !== null && totalClaimedMLC !== null
    ? Math.max(0, totalAllocatedMLC - totalClaimedMLC)
    : null;

  // Next unlock: earliest future cliff end across all schedules
  const nextUnlockTime = apiSchedules?.reduce<number | null>((best, s) => {
    const cliffEnd = s.startTime + s.cliff;
    if (cliffEnd > now) return best === null ? cliffEnd : Math.min(best, cliffEnd);
    return best;
  }, null) ?? null;

  // ── Write: claim ──
  const { writeContractAsync } = useWriteContract();

  const refetchAll = () => {
    refetchCanClaim();
    refetchAllocated();
    refetchClaimed();
    contractScheduleReads.refetch();
    fetchApiData();
    setClaimPage(1);
    // Don't null claimData — the useEffect will replace it when claimPage changes
  };

  const handleClaimClick = () => {
    // Prefer per-schedule claimable sum when global canUserClaim returns 0
    const amount = liveClaimable > 0
      ? liveClaimable
      : contractScheduleReads.data?.reduce((sum, r) => {
          if (r.status === "success") {
            const result = r.result as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
            return sum + Number(formatUnits(result[3], decimals));
          }
          return sum;
        }, 0) ?? 0;
    setClaimableForModal(amount);
    setModalError(undefined);
    setModalStep("confirm");
    setModalOpen(true);
  };

  const handleConfirmClaim = async () => {
    if (!PRESALE_ADDRESS) return;
    setModalStep("processing");
    try {
      await writeContractAsync({
        abi: tokenPresaleAbi,
        address: PRESALE_ADDRESS,
        functionName: "claim",
        chain: undefined,
        account: address as `0x${string}`,
      });
      setModalStep("done");
      // Refetch contract data immediately (on-chain state is already updated)
      refetchCanClaim();
      refetchAllocated();
      refetchClaimed();
      contractScheduleReads.refetch();
      // Refetch backend API data after a delay (listener needs time to process the event)
      setTimeout(() => {
        fetchApiData();
        setClaimPage(1);
        // Don't null claimData here — let the useEffect re-fetch replace it naturally
      }, 3000);
      // Refetch again after more time for the listener to fully process
      setTimeout(() => {
        refetchCanClaim();
        refetchAllocated();
        refetchClaimed();
        contractScheduleReads.refetch();
        fetchApiData();
        setClaimPage(1);
      }, 8000);
    } catch (err: unknown) {
      // console.log(err,'err');
      // formatBlockchainError(err)
      // const raw = err instanceof Error ? err.message : "Transaction failed";
      // let msg = "Transaction failed. Please try again.";
      // if (/user rejected|user denied/i.test(raw)) {
      //   msg = "Transaction was rejected.";
      // } else if (/insufficient funds|insufficient balance/i.test(raw)) {
      //   msg = "Insufficient ETH balance to pay for gas. Please add ETH to your wallet and try again.";
      // }
      setModalError(formatBlockchainError(err));
      setModalStep("confirm");
    }
  };

  // ── Not connected ──
  if (!isConnected) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
        <Wallet className="w-12 h-12 opacity-50" />
        <p className="text-lg">Connect your wallet to view your vesting schedules</p>
      </motion.div>
    );
  }

  const stakingApy = 12.5; // static for now

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

      {/* Claim not enabled */}
      {!claimEnabled && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400 flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0" />
          Claiming is not yet enabled by the contract
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="mlc-card-elevated p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Total Vested</p>
            <Lock className="w-4 h-4 text-muted-foreground" />
          </div>
          {totalAllocatedMLC === null
            ? <div className="h-7 w-28 bg-secondary/50 rounded animate-pulse" />
            : <p className="text-xl font-bold text-foreground">{totalAllocatedMLC.toLocaleString(undefined, { maximumFractionDigits: 2 })} MLC</p>
          }
          <p className="text-xs text-muted-foreground">
            {apiSummary ? `Over ${apiSummary.scheduleCount} schedule${apiSummary.scheduleCount !== 1 ? "s" : ""}` : "—"}
          </p>
        </div>

        <div className="mlc-card-elevated p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Claimed</p>
            <Lock className="w-4 h-4 text-success" />
          </div>
          {totalClaimedMLC === null
            ? <div className="h-7 w-28 bg-secondary/50 rounded animate-pulse" />
            : <p className="text-xl font-bold text-success">{totalClaimedMLC.toLocaleString(undefined, { maximumFractionDigits: 2 })} MLC</p>
          }
          <p className="text-xs text-muted-foreground">
            {totalAllocatedMLC && totalAllocatedMLC > 0 && totalClaimedMLC !== null
              ? `${((totalClaimedMLC / totalAllocatedMLC) * 100).toFixed(0)}% of total`
              : "0% of total"}
          </p>
        </div>

        <div className="mlc-card-elevated p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <Clock className="w-4 h-4 text-warning" />
          </div>
          {totalRemainingMLC === null
            ? <div className="h-7 w-28 bg-secondary/50 rounded animate-pulse" />
            : <p className="text-xl font-bold text-foreground">{totalRemainingMLC.toLocaleString(undefined, { maximumFractionDigits: 2 })} MLC</p>
          }
          <p className="text-xs text-muted-foreground">
            {nextUnlockTime ? `Next: ${formatDate(nextUnlockTime)}` : "—"}
          </p>
        </div>

        <div className="mlc-card-elevated p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Staking APY</p>
            <Percent className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xl font-bold text-primary">{stakingApy}%</p>
          <p className="text-xs text-success">Auto-stake {autoStake ? "ON" : "OFF"}</p>
        </div>
      </div>

      {/* ── API error ── */}
      {apiError && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{apiError}</p>
          <button className="mlc-btn-secondary text-sm px-3 py-1.5 flex items-center gap-1" onClick={fetchApiData}>
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* ── Loading skeletons ── */}
      {apiLoading && !apiSchedules && (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="mlc-card-elevated p-5 space-y-3 animate-pulse">
              <div className="h-5 w-40 bg-secondary/50 rounded" />
              <div className="h-4 w-full bg-secondary/50 rounded" />
              <div className="h-4 w-3/4 bg-secondary/50 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!apiLoading && apiSchedules?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <Lock className="w-10 h-10 opacity-40" />
          <p className="text-sm text-center">No vesting schedules found. Purchase MLC tokens to create a vesting schedule.</p>
        </div>
      )}

      {/* ── Vesting Schedule Cards ── */}
      {apiSchedules && apiSchedules.map((s, idx) => {
        // Live contract data for this schedule index
        const contractResult = contractScheduleReads.data?.[idx];
        const contractData = contractResult?.status === "success" ? contractResult.result as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint] : null;
        const liveVested    = contractData ? Number(formatUnits(contractData[2], decimals)) : null;
        const liveClaimableSchedule = contractData ? Number(formatUnits(contractData[3], decimals)) : null;
        const liveClaimed   = contractData ? Number(formatUnits(contractData[1], decimals)) : s.claimed;

        const vestingEnd = s.startTime + s.duration;
        const progressPct = s.totalAmount > 0 ? Math.min(100, (liveClaimed / s.totalAmount) * 100) : 0;

        // releaseInterval from contract takes priority over DB (DB stores 0 if not captured)
        const releaseIntervalLive = contractData ? Number(contractData[7]) : s.releaseInterval;
        const groups = buildQuarterGroups(s.startTime, releaseIntervalLive, s.duration, s.totalAmount);

        let cumulativeClaimed = 0;

        return (
          <div key={s.id} className="mlc-card-elevated overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Vesting Schedule</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(s.startTime)} → {formatDate(vestingEnd)} · Cliff: {formatDuration(s.cliff)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Claimed / Total</p>
                <p className="font-semibold text-foreground text-sm">
                  {liveClaimed.toLocaleString(undefined, { maximumFractionDigits: 2 })} / {s.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} MLC
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="px-5 py-3 border-b border-border/50">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>{progressPct.toFixed(0)}% claimed</span>
                {liveVested !== null && (
                  <span>{liveVested.toLocaleString(undefined, { maximumFractionDigits: 2 })} MLC vested</span>
                )}
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            {/* Quarter rows — or single tranche if no interval data yet */}
            <div className="divide-y divide-border/40">
              {groups.length === 0 ? (() => {
                const cliffEnd = s.startTime + s.cliff;
                const isLocked = now < cliffEnd;
                const isClaimed = liveClaimed >= s.totalAmount - 0.0001;
                const isClaimable = !isLocked && !isClaimed && (liveClaimableSchedule ?? 0) > 0 && canClaim;
                const days = daysUntil(cliffEnd);
                const displayAmount = isClaimable && liveClaimableSchedule !== null
                  ? liveClaimableSchedule
                  : s.totalAmount;
                return (
                  <div className={`flex items-center justify-between px-5 py-3.5 ${isClaimable ? "bg-success/5" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isClaimed ? "bg-success/15" : !isLocked ? "bg-success/15" : "bg-warning/10"}`}>
                        <Lock className={`w-3.5 h-3.5 ${isClaimed ? "text-success" : !isLocked ? "text-success" : "text-warning"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Vesting Period</p>
                        <p className="text-xs text-muted-foreground">Cliff ends {formatDate(cliffEnd)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-foreground">
                        {displayAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} MLC
                      </span>
                      {isClaimable ? (
                        <button onClick={handleClaimClick} className="mlc-btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                          Claim →
                        </button>
                      ) : isClaimed ? (
                        <span className="text-xs text-success font-medium px-2 py-1 rounded-full bg-success/10">Claimed</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-warning font-medium px-2 py-1 rounded-full bg-warning/10">
                          <Clock className="w-3 h-3" />{days}d
                        </span>
                      )}
                    </div>
                  </div>
                );
              })() : groups.map((g, gi) => {
                const groupClaimed = Math.min(g.amount, Math.max(0, liveClaimed - cumulativeClaimed));
                cumulativeClaimed += g.amount;
                const isFullyUnlocked = now >= g.lastUnlock;
                const isLocked = now < g.firstUnlock;
                const isClaimed = groupClaimed >= g.amount - 0.0001;
                const isClaimable = !isLocked && !isClaimed && (liveClaimableSchedule ?? 0) > 0 && canClaim;
                const days = daysUntil(g.firstUnlock);
                // Show claimable amount when claim is available, otherwise show group total
                const displayAmount = isClaimable && liveClaimableSchedule !== null
                  ? Math.min(liveClaimableSchedule, g.amount - groupClaimed)
                  : g.amount;
                return (
                  <div key={gi} className={`flex items-center justify-between px-5 py-3.5 ${isClaimable ? "bg-success/5" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isClaimed ? "bg-success/15" : !isLocked ? "bg-success/15" : "bg-warning/10"}`}>
                        <Lock className={`w-3.5 h-3.5 ${isClaimed ? "text-success" : !isLocked ? "text-success" : "text-warning"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{g.label}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(g.lastUnlock)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-foreground">
                        {displayAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} MLC
                      </span>
                      {isClaimable ? (
                        <button onClick={handleClaimClick} className="mlc-btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                          Claim →
                        </button>
                      ) : isClaimed ? (
                        <span className="text-xs text-success font-medium px-2 py-1 rounded-full bg-success/10">Claimed</span>
                      ) : isFullyUnlocked && !isClaimed ? (
                        !claimEnabled ? (
                          <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-secondary/50">Claim not enabled</span>
                        ) : liveClaimable > 0 ? (
                          <button onClick={handleClaimClick} className="mlc-btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                            Claim →
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-secondary/50">Unlocked</span>
                        )
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-warning font-medium px-2 py-1 rounded-full bg-warning/10">
                          <Clock className="w-3 h-3" />{days}d
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Auto-stake toggle */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-border/50 bg-secondary/20">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Percent className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Auto-Stake Claimed Tokens</p>
                  <p className="text-xs text-muted-foreground">Earn {stakingApy}% APY automatically</p>
                </div>
              </div>
              <button
                role="switch"
                aria-checked={autoStake}
                onClick={() => setAutoStake((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${autoStake ? "bg-success" : "bg-secondary"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${autoStake ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>
        );
      })}

      {/* ── Global Claim All button ── */}
      {claimEnabled && canClaim && liveClaimable > 0 && (
        <div className="pt-1">
          <button onClick={handleClaimClick} className="mlc-btn-primary text-sm px-5 py-2">
            Claim All ({liveClaimable.toLocaleString(undefined, { maximumFractionDigits: 4 })} MLC)
          </button>
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

      {/* ── Claim History ── */}
      <div className="mlc-card-elevated p-4 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Claim History</h3>

        {claimError && (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{claimError}</p>
            <button className="mlc-btn-secondary text-sm px-3 py-1.5 flex items-center gap-1"
              onClick={() => { setClaimError(null); setClaimPage((p) => p); }}>
              <RefreshCw className="w-3.5 h-3.5" /> Retry
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
                          <a href={`https://sepolia.etherscan.io/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline font-mono text-xs">
                            {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
            {!claimLoading && claimData?.data.length === 0 && (
              <p className="py-8 text-center text-muted-foreground text-sm">No claim history found</p>
            )}
          </div>
        )}

        {claimData && claimData.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button className="mlc-btn-secondary text-sm px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
              disabled={claimPage <= 1} onClick={() => setClaimPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-sm text-muted-foreground">Page {claimPage} / {claimData.totalPages}</span>
            <button className="mlc-btn-secondary text-sm px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
              disabled={claimPage >= claimData.totalPages} onClick={() => setClaimPage((p) => Math.min(claimData.totalPages, p + 1))}>
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
