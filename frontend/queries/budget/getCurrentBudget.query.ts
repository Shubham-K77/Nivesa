import { queryOptions } from "@tanstack/react-query";
import { getBudgetInfo } from "@/actions/budgets.api";

export default function getDefaultAccountBudget(id: string) {
  return queryOptions({
    queryKey: ["budget", id],
    queryFn: () => getBudgetInfo(id),
  });
}
