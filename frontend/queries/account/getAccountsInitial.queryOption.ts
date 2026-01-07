import { queryOptions } from "@tanstack/react-query";
import { getAccountsInfo } from "@/actions/accounts.api";
export default function getAccountsInitial(id: string) {
  return queryOptions({
    queryKey: ["initialAccount", id],
    queryFn: getAccountsInfo,
  });
}
