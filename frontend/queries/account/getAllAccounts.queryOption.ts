import { queryOptions } from "@tanstack/react-query";
import { getEveryAccountInfo } from "@/actions/accounts.api";
export default function getAllAccounts(id: string) {
  return queryOptions({
    queryKey: ["allAccounts", id],
    queryFn: getEveryAccountInfo,
  });
}
