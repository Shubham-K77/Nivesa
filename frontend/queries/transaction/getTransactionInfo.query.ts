import { queryOptions } from "@tanstack/react-query";
import { getSpecificTransactionInfo } from "@/actions/transactions.api";

export default function getTransactionInfo(transactionId: string) {
  return queryOptions({
    queryKey: ["transaction", transactionId],
    queryFn: () => getSpecificTransactionInfo(transactionId),
  });
}
