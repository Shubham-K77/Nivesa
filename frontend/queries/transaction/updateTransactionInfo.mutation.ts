import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateTransaction } from "@/types/transaction.type";
import { updateSpecificTransaction } from "@/actions/transactions.api";

export default function updateTransactionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      transactionId,
      transactionData,
    }: {
      transactionId: string;
      transactionData: UpdateTransaction;
    }) => await updateSpecificTransaction(transactionId, transactionData),
    onSuccess: (_, { transactionId }) => {
      queryClient.refetchQueries({ queryKey: ["transaction", transactionId] });
    },
  });
}
