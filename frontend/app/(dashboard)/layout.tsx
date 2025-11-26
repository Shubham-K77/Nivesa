"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "../(auth)/(api)/user.api";
import { toast } from "sonner";
import { ImSpinner8 } from "react-icons/im";
import Sidebar from "@/components/custom/sidebar";

export const UserContext = createContext({});

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  //Constants:
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    const getActiveUser = async () => {
      setLoading(true);
      try {
        const response = await getCurrentUser();
        setCurrentUser(response?.data?.currentUser);
        setLoading(false);
        toast.success("Welcome Back!", { id: "welcome-back" });
      } catch (error: any) {
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
      {loading === true ? (
        <div className="w-full min-h-screen flex flex-col justify-center items-center gap-y-4">
          <ImSpinner8 className="text-white font-bold animate-spin" size={70} />
          <div className="text-white font-semibold text-xl">
            Signing you in, just a moment…
          </div>
        </div>
      ) : (
        <>
          <UserContext.Provider value={currentUser}>
            <div className="w-full min-h-screen flex justify-start items-start">
              <div className="w-[18%] h-screen bg-gray-950/80">
                <Sidebar />
              </div>
              <div className="w-[83%]">{children}</div>
            </div>
          </UserContext.Provider>
        </>
      )}
    </>
  );
}
