import { useMutation } from "@tanstack/react-query";
import { createUpdateFamilyBudget } from "@/actions/budgets.api";

export default function createUpdateFamilyBudgetMutation() {
  return useMutation({
    mutationFn: async ({
      familyMemberId,
      amount,
    }: {
      familyMemberId: string;
      amount: number;
    }) => {
      return await createUpdateFamilyBudget({ familyMemberId, amount });
    },
  });
}
