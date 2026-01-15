import { useQueryClient, useMutation } from "@tanstack/react-query";
import { createBudget } from "@/actions/budgets.api";

export default function createUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      accountId,
      amount,
    }: {
      accountId: string;
      amount: number;
    }) => {
      return await createBudget({ accountId: accountId, amount: amount });
    },
    onSuccess: (_, variables) => {
      //Force refetch the budget cache
      queryClient.refetchQueries({
        queryKey: ["budget", variables.accountId],
      });
    },
  });
}
