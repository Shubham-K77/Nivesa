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
//Lenis:
import { useLenis } from "./LenisProvider";

const Navbar = () => {
  //Constant:
  const router = useRouter();
  const lenis = useLenis();

  const scrollToSection = (id: string) => {
    const element = document.querySelector(id) as HTMLElement;
    if (element && lenis) {
      lenis.scrollTo(element, {
        offset: -80, // Offset for the fixed navbar
        duration: 1.5,
      });
    }
  };
  return (
    <nav className="w-[88%] max-w-5xl px-4 py-2 md:px-6 md:py-2.5 rounded-2xl bg-black/60 backdrop-blur-xl fixed top-4 left-1/2 -translate-x-1/2 flex justify-between items-center border border-gray-700/50 shadow-lg z-50">
      {/* Logo and title */}
      <div className="flex justify-start items-center gap-x-2 md:gap-x-3">
        {/* Logo */}
        <div
          className="hidden md:block w-10 h-10 md:w-11 md:h-11 bg-transparent hover:cursor-pointer hover:scale-105 transition-transform duration-200"
          style={{
            backgroundImage: `url(/images/logo.png)`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
        {/* Title */}
        <h1 className="font-bold text-xl md:text-2xl text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-amber-500 hover:cursor-pointer hover:scale-105 transition-transform duration-200">
          Nivēśa
        </h1>
      </div>
      {/* Buttons Around, Visible To Large Viewports */}
      <div className="hidden lg:flex items-center gap-x-4">
        <button
          onClick={() => scrollToSection("#features")}
          className="text-sm text-gray-200 hover:text-amber-400 transition-colors duration-200 hover:cursor-pointer"
        >
          Features
        </button>
        <button
          onClick={() => scrollToSection("#how-it-works")}
          className="text-sm text-gray-200 hover:text-amber-400 transition-colors duration-200 hover:cursor-pointer"
        >
          How it Works
        </button>
        <button
          onClick={() => scrollToSection("#pricing")}
          className="text-sm text-gray-200 hover:text-amber-400 transition-colors duration-200 hover:cursor-pointer"
        >
          Pricing
        </button>
        {/* CTA Buttons */}
        <Button
          className="bg-transparent border border-amber-400/50 text-amber-400 hover:bg-amber-400/20 hover:border-amber-400 px-4 py-1.5 text-sm rounded-lg transition-all duration-200 hover:cursor-pointer"
          onClick={() => router.push("/login")}
        >
          Sign In
        </Button>
        <Button
          className="bg-linear-to-r from-yellow-400 to-amber-500 text-white hover:from-yellow-500 hover:to-amber-600 px-4 py-1.5 text-sm rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:cursor-pointer"
          onClick={() => router.push("/signup")}
        >
          Get Started
        </Button>
      </div>
      {/* Hamburger Menu For Sm and Md Viewports */}
      <Dialog>
        {/* Hamburger Icon For Triggering Selection */}
        <DialogTrigger asChild>
          <button className="lg:hidden p-2 bg-linear-to-br from-yellow-400 to-amber-500 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 hover:cursor-pointer">
            <GiHamburgerMenu className="text-xl md:text-2xl text-gray-900" />
          </button>
        </DialogTrigger>
        <DialogContent className="w-[90%] md:w-[85%] max-w-md bg-linear-to-br from-gray-900 via-gray-800 to-black backdrop-blur-xl border border-amber-400/30 shadow-2xl text-white rounded-2xl">
          <DialogHeader>
            <div className="w-full flex flex-col justify-start items-center gap-y-3 py-4">
              <button
                onClick={() => scrollToSection("#features")}
                className="w-full py-3 text-lg font-semibold text-gray-200 bg-gray-800/30 hover:bg-linear-to-r hover:from-yellow-400 hover:to-amber-500 hover:text-gray-900 flex justify-center items-center transition-all duration-200 rounded-xl border border-gray-700/50 hover:border-transparent"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("#how-it-works")}
                className="w-full py-3 text-lg font-semibold text-gray-200 bg-gray-800/30 hover:bg-linear-to-r hover:from-yellow-400 hover:to-amber-500 hover:text-gray-900 flex justify-center items-center transition-all duration-200 rounded-xl border border-gray-700/50 hover:border-transparent"
              >
                How it Works
              </button>
              <button
                onClick={() => scrollToSection("#pricing")}
                className="w-full py-3 text-lg font-semibold text-gray-200 bg-gray-800/30 hover:bg-linear-to-r hover:from-yellow-400 hover:to-amber-500 hover:text-gray-900 flex justify-center items-center transition-all duration-200 rounded-xl border border-gray-700/50 hover:border-transparent"
              >
                Pricing
              </button>
              <button
                className="w-full py-3 text-lg font-bold text-white bg-linear-to-r from-yellow-400 to-amber-500 flex justify-center items-center transition-all duration-200 rounded-xl hover:from-yellow-500 hover:to-amber-600 hover:scale-[1.02] mt-4 shadow-lg border border-yellow-300/30"
                onClick={() => router.push("/login")}
              >
                Sign In
              </button>
              <button
                className="w-full py-3 text-lg font-bold text-amber-400 bg-gray-800/50 border-2 border-amber-400/50 flex justify-center items-center transition-all duration-200 rounded-xl hover:bg-amber-400/20 hover:border-amber-400 hover:scale-[1.02] shadow-md"
                onClick={() => router.push("/signup")}
              >
                Get Started
              </button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;
