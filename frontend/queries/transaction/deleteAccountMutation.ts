import { deleteAccount } from "@/actions/accounts.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function deleteAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (accountId: string) => {
      return await deleteAccount(accountId);
    },
    onSuccess: (data, accountId, context) => {
      // Refetch all account queries using predicate to ensure all variations are updated
      queryClient.refetchQueries({
        predicate: (query) =>
          query.queryKey[0] === "initialAccount" ||
          query.queryKey[0] === "allAccounts" ||
          query.queryKey[0] === "account",
      });
    },
  });
}
