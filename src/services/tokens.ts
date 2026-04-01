// Feature: dashboard-tokens-vesting

import { apiFetch } from "@/lib/api";

export interface TokenSummary {
  walletAddress: string;
  tokensPurchased: number;
  claimed: number;
  unclaimed: number;
  amountSpent: number;
  joinDate: string | null;
  lastActivity: string | null;
}

export interface PresaleTxDto {
  txHash: string;
  contract: string;
  address: string;
  tokenAddress: string;
  type: string;
  amount: number;
  stage: number;
  tokens: number;
  timestamp: number;
  usdAmount: number;
  quote: string;
}

export interface TransactionPage {
  data: PresaleTxDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VestingScheduleRecord {
  id: string;
  walletAddress: string;
  scheduleId: number;
  totalAmount: number;
  startTime: number;
  cliff: number;
  duration: number;
  releaseInterval: number;
  claimed: number;
  contract: string;
}

export interface VestingSummary {
  totalAllocated: number;
  totalClaimed: number;
  totalUnclaimed: number;
  scheduleCount: number;
}


export async function getTokenSummary(walletAddress: string): Promise<TokenSummary> {
  return apiFetch<TokenSummary>(`/user/wallet/${walletAddress}`);
}

export async function getTokenTransactions(
  walletAddress: string,
  page: number,
  limit: number
): Promise<TransactionPage> {
  return apiFetch<TransactionPage>(
    `/transactions/address/${walletAddress}?type=Buy&page=${page}&limit=${limit}`
  );
}

export async function getClaimTransactions(
  walletAddress: string,
  page: number,
  limit: number
): Promise<TransactionPage> {
  return apiFetch<TransactionPage>(
    `/transactions/address/${walletAddress}?type=Claim&page=${page}&limit=${limit}`
  );
}

export async function getVestingSchedules(walletAddress: string): Promise<VestingScheduleRecord[]> {
  return apiFetch<VestingScheduleRecord[]>(`/vesting/${walletAddress}`);
}

export async function getVestingSummary(walletAddress: string): Promise<VestingSummary> {
  return apiFetch<VestingSummary>(`/vesting/${walletAddress}/summary`);
}
