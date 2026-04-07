import { useQuery } from "@tanstack/react-query";
import { getBankTransfers, type BankTransferRecord } from "@/services/bankTransfer";

export function useBankTransfers(walletAddress: string | undefined) {
  return useQuery<BankTransferRecord[]>({
    queryKey: ["bank-transfers", walletAddress],
    queryFn: () => getBankTransfers(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 30_000,
  });
}
