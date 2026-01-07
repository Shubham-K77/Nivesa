import { getSpecificAccountInfo } from "@/actions/accounts.api";
import { queryOptions } from "@tanstack/react-query";

export default function getSpecificAccount(accountId: string) {
  return queryOptions({
    queryKey: ["account", accountId],
    queryFn: () => getSpecificAccountInfo(accountId),
  });
}
