import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitBankTransfer, type BankTransferSubmission } from "@/services/bankTransfer";

export function useSubmitBankTransfer(walletAddress: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BankTransferSubmission) => submitBankTransfer(data),
    onSuccess: () => {
      // Invalidate bank transfers list so it refetches
      queryClient.invalidateQueries({ queryKey: ["bank-transfers", walletAddress] });
    },
  });
}
