"use client";
import { useRouter } from "next/navigation";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
const NotFoundPage = () => {
  const router = useRouter();
  return (
    <BackgroundGradientAnimation className="w-full flex flex-col justify-start items-center text-white">
      <div className="w-full min-h-screen flex flex-col justify-start items-center gap-y-2">
        {/* Nivesa Logo  */}
        <div className="w-full flex justify-start items-center p-2 gap-x-4">
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
          {/* Title */}
          <div className="font-bold text-4xl md:text-3xl lg:text-3xl text-yellow-400/80">
            Nivēśa
          </div>
        </div>
        {/* 404 Motif */}
        <div
          className="w-[75%] h-[65vh] md:w-[55%] md:h-[60vh] lg:w-[17.5%] lg:h-[55vh] flex justify-center items-center"
          style={{
            backgroundImage: `url('/motifs/404.svg')`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
        {/* Button To Home */}
        <div
          className="w-[75%] h-[10.5vh] md:w-[60%] md:h-[8.25vh] lg:w-[18%] lg:h-[7.6vh] rounded-md bg-linear-to-br from-amber-300 to-amber-800/80 flex justify-center items-center transition-all ease-in-out duration-150 hover:scale-105 hover:cursor-pointer hover:bg-yellow-400/80"
          onClick={() => router.push("/")}
        >
          <div className="text-white font-semibold text-xl md:text-2xl lg:text-sm">
            Back To Home
          </div>
        </div>
      </div>
    </BackgroundGradientAnimation>
  );
};

export default NotFoundPage;
