"use client";
//Shadcn Components:
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
//Routing:
import { useRouter } from "next/navigation";
//Icons:
import { GiHamburgerMenu } from "react-icons/gi";

const Navbar = () => {
  //Constant:
  const router = useRouter();
  return (
    <div className="w-[95%] h-[11.5vh] md:w-[95%] md:h-[10.5vh] lg:w-[75%] lg:h-[11.5vh] rounded-2xl bg-black/40 lg:backdrop-blur-lg fixed top-4 left-1/2 -translate-x-1/2 flex justify-around items-center border-2 border-gray-800/80 z-50">
      {/* Logo and title */}
      <div className="w-[35%] flex justify-start md:justify-center lg:justify-start items-center gap-x-2 md:gap-x-3 lg:gap-x-4">
        {/* Logo */}
        <div
          className="max-sm:hidden md:w-[36%] lg:w-[16.25%] h-[22.5vh] md:h-[16vh] lg:h-[8.25vh] bg-transparent md:mt-2 lg:mt-0"
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
      {/* Buttons Around, Visibile To Large Viewports */}
      <div className="hidden lg:flex lg:w-[60%] justify-evenly items-center gap-x-2">
        <div className="text-md text-white hover:cursor-pointer hover:text-yellow-400/80">
          Features
        </div>
        <div className="text-md text-white hover:cursor-pointer hover:text-yellow-400/80">
          How it Works
        </div>
        <div className="text-md text-white hover:cursor-pointer hover:text-yellow-400/80">
          Pricing
        </div>
        {/* CTA Buttons */}
        <Button
          className="bg-transparent border border-yellow-300/80 text-center text-yellow-400/80 w-[18%] h-[6.5vh] text-md hover:cursor-pointer hover:bg-yellow-400/40 hover:text-white"
          onClick={() => router.push("/login")}
        >
          Sign In
        </Button>
        <Button
          className="bg-yellow-500/80 text-center text-white w-[20%] h-[6.5vh] text-md hover:cursor-pointer hover:bg-yellow-600/80"
          onClick={() => router.push("/signup")}
        >
          Get Started
        </Button>
      </div>
      {/* Hamburger Menu For Sm and Md Viewports */}
      <Dialog>
        {/* Hamburger Icon For Triggering Selection */}
        <DialogTrigger>
          <div className="w-[10.5vh] h-[8.5vh] md:w-[10vh] md:h-[7vh] bg-amber-400/80 flex justify-center items-center lg:hidden rounded-md">
            <GiHamburgerMenu className="text-3xl md:text-4xl text-white font-semibold" />
          </div>
        </DialogTrigger>
        <DialogContent className="w-[90%] bg-linear-to-br from-gray-950/95 via-slate-900/95 to-gray-950/95 backdrop-blur-md border-2 border-yellow-400/50 shadow-[0_0_50px_rgba(251,191,36,0.3)] text-white">
          <DialogHeader>
            <div className="w-full bg-transparent flex flex-col justify-start items-center gap-y-3 py-2">
              <div className="w-full h-[7vh] text-base font-medium md:font-semibold md:text-xl text-gray-200 hover:cursor-pointer bg-transparent hover:bg-linear-to-r hover:from-yellow-500/90 hover:to-amber-500/90 hover:text-black flex justify-center items-center transition-all ease-in-out duration-200 rounded-lg">
                Features
              </div>
              <div className="w-full h-[7vh] text-base font-medium md:font-semibold md:text-xl text-gray-200 hover:cursor-pointer bg-transparent hover:bg-linear-to-r hover:from-yellow-500/90 hover:to-amber-500/90 hover:text-black flex justify-center items-center transition-all ease-in-out duration-200 rounded-lg">
                How it Works
              </div>
              <div className="w-full h-[7vh] text-base font-medium md:font-semibold md:text-xl text-gray-200 hover:cursor-pointer bg-transparent hover:bg-linear-to-r hover:from-yellow-500/90 hover:to-amber-500/90 hover:text-black flex justify-center items-center transition-all ease-in-out duration-200 rounded-lg">
                Pricing
              </div>
              <div
                className="w-full h-[7vh] text-base font-bold md:text-xl text-gray-900 hover:cursor-pointer bg-linear-to-r from-yellow-400 to-amber-400 flex justify-center items-center transition-all ease-in-out duration-200 rounded-lg hover:from-yellow-500 hover:to-amber-500 hover:scale-[1.02] mt-2"
                onClick={() => router.push("/login")}
              >
                Sign In
              </div>
              <div
                className="w-full h-[7vh] text-base font-bold md:text-xl text-yellow-400 hover:cursor-pointer bg-transparent border-2 border-yellow-400/70 flex justify-center items-center transition-all ease-in-out duration-200 rounded-lg hover:bg-yellow-400/20 hover:border-yellow-300 hover:scale-[1.02]"
                onClick={() => router.push("/signup")}
              >
                Get Started
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Navbar;
