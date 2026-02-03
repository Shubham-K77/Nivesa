import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createNewAccount,
  createNewFamilyAccount,
} from "@/actions/accounts.api";

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const { type, ...rest } = data;
      if (type === "CURRENT" || type === "SAVINGS") {
        return createNewAccount({ ...rest, type });
      } else {
        return createNewFamilyAccount({ ...rest, type });
      }
    },
    onSuccess: (_, variables) => {
      // Refetch all account-related queries using predicate
      queryClient.refetchQueries({
        predicate: (query) =>
          query.queryKey[0] === "initialAccount" ||
          query.queryKey[0] === "allAccounts",
      });
    },
  });
}
