"use client";

import { ReactNode, useContext, useEffect } from "react";
import { UserContext } from "../layout";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
export default function UserDashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  //Only Allowed For User's Role:
  const router = useRouter();
  const currentUser = useContext(UserContext);
  useEffect(() => {
    const isUserLoggedIn = () => {
      if (currentUser?.role !== "USER") {
        toast.error("You are not permitted to enter this page.");
        return router.push("/home");
      }
    };
    //Call the function
    isUserLoggedIn();
  }, []);
  return <>{children}</>;
}
