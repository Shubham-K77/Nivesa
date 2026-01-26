import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTransaction } from "@/actions/transactions.api";
import { Transaction } from "@/types/transaction.type";

export function createTransactions(accountId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transactionInfo: Transaction) => {
      return createTransaction(transactionInfo);
    },
    onSuccess: async () => {
      // Invalidate and refetch the account query
      if (accountId) {
        await queryClient.refetchQueries({
          queryKey: ["account", accountId],
        });
      } else {
        // If no specific accountId, invalidate all account queries
        await queryClient.refetchQueries({
          queryKey: ["account"],
        });
      }
    },
  });
}
