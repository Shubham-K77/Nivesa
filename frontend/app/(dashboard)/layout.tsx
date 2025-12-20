"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "../../actions/users.api";
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
  //Constants:
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    phoneNumber: string;
    name: string;
    imageUrl?: string;
    iat?: number;
    role: "USER" | "FAMILY_MEMBER";
  } | null>(null);

  useEffect(() => {
    const getActiveUser = async () => {
      setAuthChecked(false);
      setLoading(true);
      try {
        const response = await getCurrentUser();
        setCurrentUser(response?.data?.currentUser);
        setAuthChecked(true);
        setLoading(false);
      } catch (error: any) {
        setAuthChecked(false);
        setLoading(false);
        console.error(error);
        toast.error(error.response?.data?.message);
        return router.push("/");
      }
    };
    getActiveUser();
  }, [router]);

  return (
    <>
      {authChecked === true ? (
        loading === true ? (
          <div className="w-full min-h-screen flex flex-col justify-center items-center gap-y-4">
            <ImSpinner8
              className="text-white font-bold animate-spin"
              size={70}
            />
            <div className="text-white font-semibold text-xl">
              Signing you in, just a moment…
            </div>
          </div>
        ) : (
          <>
            <UserContext.Provider value={currentUser}>
              <div className="w-full min-h-screen flex flex-col justify-start items-center gap-y-8">
                <Sidebar />
                {children}
              </div>
            </UserContext.Provider>
          </>
        )
      ) : (
        <> </>
      )}
    </>
  );
}
