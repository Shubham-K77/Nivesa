import { useQueryClient, useMutation } from "@tanstack/react-query";
import { updateProfile } from "@/actions/users.api";
import { UserData } from "@/types/user.type";
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData: UserData) => {
      return updateProfile(userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}
