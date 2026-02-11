import { queryOptions } from "@tanstack/react-query";
import { retrieveDashboardInfo } from "@/actions/transactions.api";

export default function getDashboardInfo(userId: string) {
  return queryOptions({
    queryKey: ["dashboard", userId],
    queryFn: () => retrieveDashboardInfo(),
  });
}
