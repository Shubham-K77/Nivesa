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
    onSuccess: () => {
      // Invalidate and refetch the account query
      queryClient.invalidateQueries({ queryKey: ["account", accountId] });
    },
  });
}
