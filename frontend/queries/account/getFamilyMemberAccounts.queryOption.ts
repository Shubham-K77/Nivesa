import { queryOptions } from "@tanstack/react-query";
import { getFamilyMemberAccounts } from "@/actions/accounts.api";

export default function getFamilyMemberAccountsQuery() {
  return queryOptions({
    queryKey: ["familyMemberAccounts"],
    queryFn: getFamilyMemberAccounts,
  });
}
