"use client";
import { createContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import getActiveUser from "@/queries/user/getCurrentUser.queryOption";
import { toast } from "sonner";
import Sidebar from "@/components/custom/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";

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
        (error as any)?.response?.data?.message || "Authentication failed",
      );
      router.push("/");
    }
  }, [isError, error, router]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-start bg-black pt-20">
        <div className="w-[95%] lg:w-[75%] flex flex-col gap-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center gap-x-4">
            <Skeleton className="h-12 w-12 rounded-lg bg-white/10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48 bg-white/10" />
              <Skeleton className="h-4 w-32 bg-white/10" />
            </div>
          </div>
          {/* Content Skeleton */}
          <Skeleton className="h-[60vh] w-full rounded-xl bg-white/5" />
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
