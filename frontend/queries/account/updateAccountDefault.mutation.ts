import { useQueryClient, useMutation } from "@tanstack/react-query";
import { updateDefaultFlag } from "@/actions/accounts.api";
export function makeAccountDefault() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      accountId,
    }: {
      userId: string;
      accountId: string;
    }) => {
      return await updateDefaultFlag({
        userId,
        accountId,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({
        queryKey: ["initialAccount", variables.userId],
      });
      queryClient.refetchQueries({
        queryKey: ["allAccounts", variables.userId],
      });
    },
  });
}
