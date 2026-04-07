import { useQuery } from "@tanstack/react-query";
import {
  getTokenSummary,
  getTokenTransactions,
  getClaimTransactions,
  getVestingSchedules,
  getVestingSummary,
  type TokenSummary,
  type TransactionPage,
  type VestingScheduleRecord,
  type VestingSummary,
} from "@/services/tokens";

export const tokenKeys = {
  all: ["tokens"] as const,
  summary: (walletAddress: string) =>
    [...tokenKeys.all, "summary", walletAddress] as const,
  transactions: (walletAddress: string, page: number, limit: number) =>
    [...tokenKeys.all, "transactions", walletAddress, page, limit] as const,
  claims: (walletAddress: string, page: number, limit: number) =>
    [...tokenKeys.all, "claims", walletAddress, page, limit] as const,
  vestingSchedules: (walletAddress: string) =>
    [...tokenKeys.all, "vesting-schedules", walletAddress] as const,
  vestingSummary: (walletAddress: string) =>
    [...tokenKeys.all, "vesting-summary", walletAddress] as const,
};

export function useTokenSummary(walletAddress: string | undefined) {
  return useQuery<TokenSummary>({
    queryKey: tokenKeys.summary(walletAddress ?? ""),
    queryFn: () => getTokenSummary(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 60_000,
  });
}

export function useTokenTransactions(
  walletAddress: string | undefined,
  page: number,
  limit: number,
) {
  return useQuery<TransactionPage>({
    queryKey: tokenKeys.transactions(walletAddress ?? "", page, limit),
    queryFn: () => getTokenTransactions(walletAddress!, page, limit),
    enabled: !!walletAddress,
    staleTime: 30_000,
  });
}

export function useClaimTransactions(
  walletAddress: string | undefined,
  page: number,
  limit: number,
) {
  return useQuery<TransactionPage>({
    queryKey: tokenKeys.claims(walletAddress ?? "", page, limit),
    queryFn: () => getClaimTransactions(walletAddress!, page, limit),
    enabled: !!walletAddress,
    staleTime: 30_000,
  });
}

export function useVestingSchedules(walletAddress: string | undefined) {
  return useQuery<VestingScheduleRecord[]>({
    queryKey: tokenKeys.vestingSchedules(walletAddress ?? ""),
    queryFn: () => getVestingSchedules(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 60_000,
  });
}

export function useVestingSummary(walletAddress: string | undefined) {
  return useQuery<VestingSummary>({
    queryKey: tokenKeys.vestingSummary(walletAddress ?? ""),
    queryFn: () => getVestingSummary(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 60_000,
  });
}
