import { useQuery } from "@tanstack/react-query";
import { getRecentActivity, type ActivityPage } from "@/services/activity";

export const activityKeys = {
  all: ["activity"] as const,
  list: (walletAddress: string, page?: number, limit?: number) =>
    [...activityKeys.all, walletAddress, page, limit] as const,
};

export function useActivity(
  walletAddress: string | undefined,
  page?: number,
  limit?: number,
) {
  return useQuery<ActivityPage>({
    queryKey: activityKeys.list(walletAddress ?? "", page, limit),
    queryFn: () => getRecentActivity(walletAddress!, page, limit),
    enabled: !!walletAddress,
    staleTime: 30_000,
  });
}
