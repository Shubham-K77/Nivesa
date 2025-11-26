"use client";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { getCurrentUser } from "../(api)/user.api";
import { toast } from "sonner";
export default function VerifyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  useEffect(() => {
    const getActiveUser = async () => {
      const response = await getCurrentUser();
      if (response.data?.statusCode === 200) {
        toast.info("User is already logged in.");
        return router.push("/home");
      }
    };
    getActiveUser();
  }, [router]);
  return (
    <>
      <BackgroundGradientAnimation className="w-full flex flex-col justify-start items-center text-white gap-y-4">
        {/* Header Component */}
        <div className="w-full flex flex-row justify-between items-center mt-4 px-4 sm:px-6 md:px-8 lg:px-12">
          {/* Back To Home Link */}
          <div
            className="flex justify-center items-center gap-x-2 hover:cursor-pointer p-3 md:p-4 lg:p-3 bg-yellow-600/80 rounded-lg transition-all ease-in-out duration-150 hover:scale-105"
            onClick={() => router.push("/")}
          >
            <IoMdArrowBack className="text-white font-bold text-xl md:text-3xl lg:text-xl" />
            <div className="text-sm md:text-xl lg:text-sm text-white">
              Back to Home
            </div>
          </div>
          {/* Logo Display */}
          <div className="flex justify-center items-center">
            {/* Logo */}
            <div
              className="w-[15.5vh] h-[15.5vh] sm:w-[15.5vh] sm:h-[15.5vh] md:w-[18.5vh] md:h-[18.5vh] lg:w-[22.5vh] lg:h-[20.5vh]"
              style={{
                backgroundImage: `url(/images/logo.png)`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            ></div>
          </div>
        </div>
        {/* Main Component */}
        {children}
      </BackgroundGradientAnimation>
    </>
  );
}
