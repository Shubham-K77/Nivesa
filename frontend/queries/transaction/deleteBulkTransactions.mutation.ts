import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBulkTransactions } from "@/actions/transactions.api";

type TransactionsArray = {
  transactions: Array<string>;
};

export function useDeleteTransactions(accountId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TransactionsArray) => {
      return deleteBulkTransactions(data);
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
