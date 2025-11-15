"use client";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { useRouter } from "next/navigation";
import { IoMdArrowBack } from "react-icons/io";
export default function VerifyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  return (
    <>
      <BackgroundGradientAnimation className="w-full flex flex-col justify-start items-center text-white gap-y-4">
        {/* Header Component */}
        <div className="w-full flex flex-row justify-between items-center mt-4 px-4 sm:px-6 md:px-8 lg:px-12">
          {/* Back To Home Link */}
          <div
            className="flex justify-center items-center gap-x-2 hover:underline hover:cursor-pointer"
            onClick={() => router.push("/")}
          >
            <IoMdArrowBack className="text-gray-400/80 font-bold text-xl md:text-2xl" />
            <div className="text-sm md:text-lg font-semibold text-gray-400/80">
              Back to Home
            </div>
          </div>
          {/* Logo Display */}
          <div className="flex justify-center items-center">
            {/* Logo */}
            <div
              className="w-[12vh] h-[12vh] sm:w-[15vh] sm:h-[15vh] md:w-[18.5vh] md:h-[18.5vh] lg:w-[22.5vh] lg:h-[20.5vh]"
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
