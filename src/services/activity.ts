import { apiFetch } from "@/lib/api";

export interface ActivityRecord {
  id: string;
  walletAddress: string;
  action: string;
  activityType: "Buy" | "Claim" | "Vesting_Created";
  amount: number;
  usdAmount: number;
  txHash: string | null;
  metadata: Record<string, unknown> | null;
  timestamp: string;
  createdAt: string;
}

export interface ActivityPage {
  data: ActivityRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getRecentActivity(
  walletAddress: string,
  page?: number,
  limit?: number,
): Promise<ActivityPage> {
  const params = new URLSearchParams();
  if (page !== undefined) params.set("page", String(page));
  if (limit !== undefined) params.set("limit", String(limit));

  const query = params.toString();
  const path = `/activity/${walletAddress}${query ? `?${query}` : ""}`;

  return apiFetch<ActivityPage>(path);
}
