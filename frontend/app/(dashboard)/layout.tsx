"use client";
import { createContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import getActiveUser from "@/queries/user/getCurrentUser.queryOption";
import { toast } from "sonner";
import { ImSpinner8 } from "react-icons/im";
import Sidebar from "@/components/custom/Sidebar";

export const UserContext = createContext<{
  id: string;
  email: string;
  phoneNumber: string;
  name: string;
  imageUrl?: string;
  iat?: number;
  role: "USER" | "FAMILY_MEMBER";
} | null>(null);

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useQuery(getActiveUser());
  const currentUser = data?.data?.currentUser ?? null;

  useEffect(() => {
    if (isError) {
      console.error(error);
      toast.error(
        (error as any)?.response?.data?.message || "Authentication failed"
      );
      router.push("/");
    }
  }, [isError, error, router]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-center items-center gap-y-4">
        <ImSpinner8 className="text-white font-bold animate-spin" size={70} />
        <div className="text-white font-semibold text-xl">
          Signing you in, just a moment…
        </div>
      </div>
    );
  }

  if (isError) {
    return null;
  }

  return (
    <UserContext.Provider value={currentUser}>
      <div className="w-full min-h-screen flex flex-col justify-start items-center gap-y-8">
        <Sidebar />
        {children}
      </div>
    </UserContext.Provider>
  );
}
