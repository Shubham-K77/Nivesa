import { queryOptions } from "@tanstack/react-query";
import { getFamilyMembersByAccount } from "@/actions/budgets.api";

export default function getFamilyMembersByAccountQuery(accountId: string) {
  return queryOptions({
    queryKey: ["familyMembers", accountId],
    queryFn: () => getFamilyMembersByAccount(accountId),
    enabled: !!accountId,
  });
}
