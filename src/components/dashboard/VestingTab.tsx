// Feature: dashboard-tokens-vesting
import { useState, useEffect } from "react";
import { useReadContract, useWriteContract, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { motion } from "framer-motion";
import {
  Wallet,
  AlertTriangle,
  Lock,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Percent,
} from "lucide-react";
import { APP_CHAIN } from "@/config/network";
import { PRESALE_ADDRESS } from "@/config/presale";
import { tokenPresaleAbi } from "@/contracts/tokenPresaleAbi";
import { requestSwitchChain } from "@/web3/requestSwitchChain";
import {
  useVestingSchedules,
  useVestingSummary,
  useClaimTransactions,
  tokenKeys,
} from "@/hooks/use-tokens";
import { useQueryClient } from "@tanstack/react-query";
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
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDuration(seconds: number): string {
  if (seconds >= 86400 * 30)
    return `${Math.round(seconds / (86400 * 30))} month(s)`;
  if (seconds >= 86400 * 7)
    return `${Math.round(seconds / (86400 * 7))} week(s)`;
  if (seconds >= 86400) return `${Math.round(seconds / 86400)} day(s)`;
  return `${seconds}s`;
}

function getTimeRemaining(unix: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const total = Math.max(0, unix * 1000 - Date.now());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds, total };
}

function formatTimeRemaining(unix: number): string {
  const { days, hours, minutes, seconds, total } = getTimeRemaining(unix);
  if (total <= 0) return "Unlocked";

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(" ");
}

// No quarterly grouping needed - we'll show simple locked/unlocked amounts

// ── Component ─────────────────────────────────────────────────────────────────

// Countdown component that updates every second
function Countdown({ targetTime }: { targetTime: number }) {
  const [timeLeft, setTimeLeft] = useState(formatTimeRemaining(targetTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(formatTimeRemaining(targetTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  return <>{timeLeft}</>;
}

export default function VestingTab({
  address,
  isConnected,
  isOnCorrectChain,
  saleTokenDecimals,
}: VestingTabProps) {
  const decimals = saleTokenDecimals ?? 18;
  const now = Math.floor(Date.now() / 1000);

  // ── UI state ──
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<"confirm" | "processing" | "done">(
    "confirm",
  );
  const [modalError, setModalError] = useState<string | undefined>(undefined);
  const [claimableForModal, setClaimableForModal] = useState(0);

  // ── Backend API state ──
  const queryClient = useQueryClient();
  const {
    data: apiSchedules,
    isLoading: apiLoading,
    isError: apiErrorBool,
    error: apiErrorObj,
    refetch: refetchApiSchedules,
  } = useVestingSchedules(address);
  const { data: apiSummary, refetch: refetchApiSummary } =
    useVestingSummary(address);
  const apiError = apiErrorBool
    ? apiErrorObj instanceof Error
      ? apiErrorObj.message
      : "Failed to load vesting data"
    : null;

  const fetchApiData = () => {
    refetchApiSchedules();
    refetchApiSummary();
  };

  // ── Claim history state ──
  const [claimPage, setClaimPage] = useState(1);
  const {
    data: claimData,
    isLoading: claimLoading,
    isError: claimErrorBool,
    error: claimErrorObj,
  } = useClaimTransactions(address, claimPage, 10);
  const claimError = claimErrorBool
    ? claimErrorObj instanceof Error
      ? claimErrorObj.message
      : "Failed to load claim history"
    : null;

  // ── Contract: claimEnabled ──
  const { data: claimEnabledRaw } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "claimEnabled",
    chainId: APP_CHAIN.id,
    query: { enabled: Boolean(PRESALE_ADDRESS) },
  });
  const claimEnabled = claimEnabledRaw ?? false;

  console.log(claimEnabled, "claimEnabled");

  // ── Contract: canUserClaim ──
  const { data: canClaimData, refetch: refetchCanClaim } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "canUserClaim",
    args: address ? [address as `0x${string}`] : undefined,
    chainId: APP_CHAIN.id,
    query: {
      enabled: Boolean(address && PRESALE_ADDRESS),
      gcTime: 0, // Don't cache this query
      staleTime: 0, // Always consider stale
    },
  });
  // canClaimData = [canClaim: bool, claimable: bigint, reason: string]
  const canClaim = canClaimData?.[0] ?? false;
  const liveClaimable =
    canClaimData?.[1] !== undefined
      ? Number(formatUnits(canClaimData[1], decimals))
      : 0;

  console.log(canClaimData, "canClaimData");

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
    query: {
      enabled: Boolean(address && PRESALE_ADDRESS && scheduleCount > 0),
      gcTime: 0, // Don't cache
      staleTime: 0, // Always stale
    },
  });

  // ── Contract: totalAllocated & totalClaimed for stat cards ──
  const { data: totalAllocatedRaw, refetch: refetchAllocated } =
    useReadContract({
      abi: tokenPresaleAbi,
      address: PRESALE_ADDRESS,
      functionName: "totalAllocated",
      args: address ? [address as `0x${string}`] : undefined,
      chainId: APP_CHAIN.id,
      query: {
        enabled: Boolean(address && PRESALE_ADDRESS),
        gcTime: 0,
        staleTime: 0,
      },
    });
  const { data: totalClaimedRaw, refetch: refetchClaimed } = useReadContract({
    abi: tokenPresaleAbi,
    address: PRESALE_ADDRESS,
    functionName: "totalClaimed",
    args: address ? [address as `0x${string}`] : undefined,
    chainId: APP_CHAIN.id,
    query: {
      enabled: Boolean(address && PRESALE_ADDRESS),
      gcTime: 0,
      staleTime: 0,
    },
  });

  const totalAllocatedMLC =
    totalAllocatedRaw !== undefined
      ? Number(formatUnits(totalAllocatedRaw, decimals))
      : null;
  const totalClaimedMLC =
    totalClaimedRaw !== undefined
      ? Number(formatUnits(totalClaimedRaw, decimals))
      : null;
  const totalRemainingMLC =
    totalAllocatedMLC !== null && totalClaimedMLC !== null
      ? Math.max(0, totalAllocatedMLC - totalClaimedMLC)
      : null;

  // Next unlock: earliest future cliff end across all schedules
  const nextUnlockTime =
    apiSchedules?.reduce<number | null>((best, s) => {
      const cliffEnd = s.startTime + s.cliff;
      if (cliffEnd > now)
        return best === null ? cliffEnd : Math.min(best, cliffEnd);
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
    if (address) {
      queryClient.invalidateQueries({
        queryKey: tokenKeys.claims(address, claimPage, 10),
      });
    }
  };

  const handleClaimClick = () => {
    // Prefer per-schedule claimable sum when global canUserClaim returns 0
    const amount =
      liveClaimable > 0
        ? liveClaimable
        : (contractScheduleReads.data?.reduce((sum, r) => {
            if (r.status === "success") {
              const result = r.result as readonly [
                bigint,
                bigint,
                bigint,
                bigint,
                bigint,
                bigint,
                bigint,
                bigint,
                bigint,
              ];
              return sum + Number(formatUnits(result[3], decimals));
            }
            return sum;
          }, 0) ?? 0);
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

      // Immediate refetch with cache invalidation
      await Promise.all([
        refetchCanClaim(),
        refetchAllocated(),
        refetchClaimed(),
        contractScheduleReads.refetch(),
      ]);

      // Invalidate all token-related queries immediately
      if (address) {
        queryClient.invalidateQueries({
          queryKey: tokenKeys.vestingSchedules(address),
        });
        queryClient.invalidateQueries({
          queryKey: tokenKeys.vestingSummary(address),
        });
        queryClient.invalidateQueries({
          queryKey: tokenKeys.claims(address, claimPage, 10),
        });
      }

      // Force refetch after delay for backend sync
      setTimeout(async () => {
        await Promise.all([
          refetchCanClaim(),
          refetchAllocated(),
          refetchClaimed(),
          contractScheduleReads.refetch(),
        ]);

        if (address) {
          queryClient.invalidateQueries({
            queryKey: tokenKeys.vestingSchedules(address),
          });
          queryClient.invalidateQueries({
            queryKey: tokenKeys.vestingSummary(address),
          });
          queryClient.invalidateQueries({
            queryKey: tokenKeys.claims(address, claimPage, 10),
          });
        }
      }, 3000);

      // Final refetch after more time
      setTimeout(async () => {
        await Promise.all([
          refetchCanClaim(),
          refetchAllocated(),
          refetchClaimed(),
          contractScheduleReads.refetch(),
        ]);

        if (address) {
          queryClient.invalidateQueries({
            queryKey: tokenKeys.vestingSchedules(address),
          });
          queryClient.invalidateQueries({
            queryKey: tokenKeys.vestingSummary(address),
          });
          queryClient.invalidateQueries({
            queryKey: tokenKeys.claims(address, claimPage, 10),
          });
        }
      }, 8000);
    } catch (err: unknown) {
      setModalError(formatBlockchainError(err));
      setModalStep("confirm");
    }
  };

  // ── Not connected ──
  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground"
      >
        <Wallet className="w-12 h-12 opacity-50" />
        <p className="text-lg">
          Connect your wallet to view your vesting schedules
        </p>
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
            <span className="font-medium">
              Wrong Network — Please switch to {APP_CHAIN.name}
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
          {totalAllocatedMLC === null ? (
            <div className="h-7 w-28 bg-secondary/50 rounded animate-pulse" />
          ) : (
            <p className="text-xl font-bold text-foreground">
              {totalAllocatedMLC.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              MLC
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {apiSummary
              ? `Over ${apiSummary.scheduleCount} schedule${apiSummary.scheduleCount !== 1 ? "s" : ""}`
              : "—"}
          </p>
        </div>

        <div className="mlc-card-elevated p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Claimed</p>
            <Lock className="w-4 h-4 text-success" />
          </div>
          {totalClaimedMLC === null ? (
            <div className="h-7 w-28 bg-secondary/50 rounded animate-pulse" />
          ) : (
            <p className="text-xl font-bold text-success">
              {totalClaimedMLC.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              MLC
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {totalAllocatedMLC &&
            totalAllocatedMLC > 0 &&
            totalClaimedMLC !== null
              ? `${((totalClaimedMLC / totalAllocatedMLC) * 100).toFixed(0)}% of total`
              : "0% of total"}
          </p>
        </div>

        <div className="mlc-card-elevated p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <Clock className="w-4 h-4 text-warning" />
          </div>
          {totalRemainingMLC === null ? (
            <div className="h-7 w-28 bg-secondary/50 rounded animate-pulse" />
          ) : (
            <p className="text-xl font-bold text-foreground">
              {totalRemainingMLC.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              MLC
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {nextUnlockTime ? `Next: ${formatDate(nextUnlockTime)}` : "—"}
          </p>
        </div>

        <div className="mlc-card-elevated p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Available to Claim</p>
            <Lock className="w-4 h-4 text-success" />
          </div>
          {liveClaimable === null || liveClaimable === undefined ? (
            <div className="h-7 w-28 bg-secondary/50 rounded animate-pulse" />
          ) : (
            <p className="text-xl font-bold text-success">
              {liveClaimable.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              MLC
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {liveClaimable > 0 ? "Ready to claim now" : "Nothing to claim yet"}
          </p>
        </div>
      </div>

      {/* ── API error ── */}
      {apiError && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{apiError}</p>
          <button
            className="mlc-btn-secondary text-sm px-3 py-1.5 flex items-center gap-1"
            onClick={fetchApiData}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* ── Loading skeletons ── */}
      {apiLoading && !apiSchedules && (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="mlc-card-elevated p-5 space-y-3 animate-pulse"
            >
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
          <p className="text-sm text-center">
            No vesting schedules found. Purchase MLC tokens to create a vesting
            schedule.
          </p>
        </div>
      )}

      {/* ── Vesting Schedule Cards ── */}
      {apiSchedules &&
        apiSchedules.map((s, idx) => {
          // Live contract data for this schedule index
          const contractResult = contractScheduleReads.data?.[idx];
          const contractData =
            contractResult?.status === "success"
              ? (contractResult.result as readonly [
                  bigint,
                  bigint,
                  bigint,
                  bigint,
                  bigint,
                  bigint,
                  bigint,
                  bigint,
                  bigint,
                ])
              : null;

          // Extract values from smart contract
          const liveVested = contractData
            ? Number(formatUnits(contractData[2], decimals))
            : null;
          const liveClaimableSchedule = contractData
            ? Number(formatUnits(contractData[3], decimals))
            : null;
          const liveClaimed = contractData
            ? Number(formatUnits(contractData[1], decimals))
            : s.claimed;

          const vestingEnd = s.startTime + s.cliff + s.duration;
          const cliffEnd = s.startTime + s.cliff;
          const progressPct =
            s.totalAmount > 0
              ? Math.min(100, (liveClaimed / s.totalAmount) * 100)
              : 0;

          // Calculate locked and unlocked amounts
          const unlockedAmount = liveVested ?? 0;
          const lockedAmount = Math.max(0, s.totalAmount - unlockedAmount);
          const claimableAmount = liveClaimableSchedule ?? 0;
          const claimedAmount = liveClaimed;

          // Debug logging
          console.log(`Schedule ${idx}:`, {
            totalAmount: s.totalAmount,
            liveClaimed: claimedAmount,
            liveVested: unlockedAmount,
            liveClaimable: claimableAmount,
            lockedAmount,
            cliff: s.cliff,
            duration: s.duration,
            startTime: s.startTime,
            cliffEnd,
            vestingEnd,
            currentTime: now,
          });

          const isCliffActive = now < cliffEnd;
          const isFullyVested = now >= vestingEnd;
          const canClaimNow = claimEnabled && canClaim && claimableAmount > 0;

          return (
            <div key={s.id} className="mlc-card-elevated overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Vesting Schedule
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(s.startTime)} → {formatDate(vestingEnd)} ·
                      Cliff: {formatDuration(s.cliff)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    Claimed / Total
                  </p>
                  <p className="font-semibold text-foreground text-sm">
                    {claimedAmount.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    /{" "}
                    {s.totalAmount.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    MLC
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="px-5 py-3 border-b border-border/50">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>{progressPct.toFixed(0)}% claimed</span>
                  <span>
                    {unlockedAmount.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    MLC vested
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Locked Amount Row */}
              {lockedAmount > 0 && (
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-warning/10">
                      <Lock className="w-3.5 h-3.5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Locked Amount
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isCliffActive
                          ? `Cliff ends ${formatDate(cliffEnd)}`
                          : `Vesting until ${formatDate(vestingEnd)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      {lockedAmount.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      MLC
                    </span>
                    {isCliffActive ? (
                      <span className="flex items-center gap-1 text-xs text-warning font-medium px-2 py-1 rounded-full bg-warning/10">
                        <Clock className="w-3 h-3" />
                        <Countdown targetTime={cliffEnd} />
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-secondary/50">
                        Vesting
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Unlocked Amount Row */}
              {unlockedAmount > 0 && (
                <div
                  className={`flex items-center justify-between px-5 py-3.5 ${canClaimNow ? "bg-success/5" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-success/15">
                      <Lock className="w-3.5 h-3.5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Unlocked Amount
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {claimableAmount > 0
                          ? `Available to claim now`
                          : claimedAmount >= unlockedAmount - 0.0001
                            ? "All unlocked tokens claimed"
                            : "Unlocked and ready"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-success">
                      {claimableAmount.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      MLC
                    </span>
                    {canClaimNow ? (
                      <button
                        onClick={handleClaimClick}
                        className="mlc-btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                      >
                        Claim →
                      </button>
                    ) : claimedAmount >= unlockedAmount - 0.0001 ? (
                      <span className="text-xs text-success font-medium px-2 py-1 rounded-full bg-success/10">
                        Claimed
                      </span>
                    ) : !claimEnabled ? (
                      <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-secondary/50">
                        Claim not enabled
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-secondary/50">
                        Unlocked
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Auto-stake toggle */}
              {/* <div className="flex items-center justify-between px-5 py-4 border-t border-border/50 bg-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Percent className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Auto-Stake Claimed Tokens
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Earn {stakingApy}% APY automatically
                    </p>
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={autoStake}
                  onClick={() => setAutoStake((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${autoStake ? "bg-success" : "bg-secondary"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${autoStake ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div> */}
            </div>
          );
        })}

      {/* ── Global Claim All button ── */}
      {claimEnabled && canClaim && liveClaimable > 0 && (
        <div className="pt-1">
          <button
            onClick={handleClaimClick}
            className="mlc-btn-primary text-sm px-5 py-2"
          >
            Claim All (
            {liveClaimable.toLocaleString(undefined, {
              maximumFractionDigits: 4,
            })}{" "}
            MLC)
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
        <h3 className="text-base font-semibold text-foreground">
          Claim History
        </h3>

        {claimError && (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{claimError}</p>
            <button
              className="mlc-btn-secondary text-sm px-3 py-1.5 flex items-center gap-1"
              onClick={() => setClaimPage((p) => p)}
            >
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
                      <tr
                        key={tx.txHash}
                        className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                      >
                        <td className="py-3 pr-4 text-muted-foreground">
                          {new Date(tx.timestamp * 1000).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4 text-success font-medium">
                          +
                          {tx.tokens.toLocaleString(undefined, {
                            maximumFractionDigits: 4,
                          })}{" "}
                          MLC
                        </td>
                        <td className="py-3">
                          <a
                            href={`https://sepolia.basescan.org/tx/${tx.txHash}`}
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
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-sm text-muted-foreground">
              Page {claimPage} / {claimData.totalPages}
            </span>
            <button
              className="mlc-btn-secondary text-sm px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
              disabled={claimPage >= claimData.totalPages}
              onClick={() =>
                setClaimPage((p) => Math.min(claimData.totalPages, p + 1))
              }
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
