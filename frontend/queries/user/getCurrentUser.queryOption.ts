import { queryOptions } from "@tanstack/react-query";
import { getCurrentUser } from "@/actions/users.api";

export default function getActiveUser() {
  return queryOptions({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });
}
