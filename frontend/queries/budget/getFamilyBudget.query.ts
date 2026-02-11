import { queryOptions } from "@tanstack/react-query";
import { getFamilyBudgetInfo } from "@/actions/budgets.api";

export default function getFamilyBudgetQuery(familyMemberId: string) {
  return queryOptions({
    queryKey: ["familyBudget", familyMemberId],
    queryFn: () => getFamilyBudgetInfo(familyMemberId),
    enabled: !!familyMemberId,
  });
}
