import { useMutation } from "@tanstack/react-query";
import { createBudget } from "@/actions/budgets.api";

export default function createUpdateBudget() {
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
  });
}
