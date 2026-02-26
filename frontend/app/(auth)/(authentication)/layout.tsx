"use client";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import getActiveUser from "@/queries/user/getCurrentUser.queryOption";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { data } = useQuery(getActiveUser());
  const statusCode = data?.data?.statusCode;

  useEffect(() => {
    if (statusCode === 200) {
      toast.info("User is already logged in.");
      router.push("/home");
    }
  }, [statusCode, router]);
  return (
    <>
      <BackgroundGradientAnimation className="w-full flex flex-col justify-start items-center text-white">
        {/* Header */}
        <div className="w-[90%] lg:w-[95%] mt-2 flex justify-start items-center gap-x-4 group">
          {/* Logo and Title Grouped for Hover and Tooltip */}
          <div
            className="flex items-center gap-x-4 group/logo-title"
            title="Back To Home"
          >
            <div
              className="w-[20%] md:w-[16.5vh] lg:w-[18.25vh] h-[22.5vh] md:h-[16.5vh] lg:h-[18.25vh] bg-transparent md:mt-2 lg:mt-0 transition-opacity duration-200 cursor-pointer group-hover:opacity-60"
              onClick={() => router.push("/")}
              style={{
                backgroundImage: `url(/images/logo.png)`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            ></div>
            <h1
              className="font-bold text-4xl md:text-6xl lg:text-4xl text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-amber-500 cursor-pointer transition-opacity duration-200 group-hover:opacity-60"
              onClick={() => router.push("/")}
            >
              Nivēśa
            </h1>
          </div>
        </div>
        {/* Main */}
        {children}
      </BackgroundGradientAnimation>
    </>
  );
}
