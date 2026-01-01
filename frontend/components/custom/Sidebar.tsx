"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { MdLogout } from "react-icons/md";
import { IoMenu } from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";
import { FaHome } from "react-icons/fa";
import { MdAccountBalanceWallet } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import { toast } from "sonner";
import { logout } from "@/actions/users.api";
//Sheet Component From ShadCn
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
const Sidebar = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathName = usePathname();
  //Function to initiate logout:
  const logoutUser = async () => {
    setLoading(true);
    try {
      const response = await logout();
      toast.success(response?.data?.message);
      setLoading(false);
      return router.push("/");
    } catch (error: any) {
      setLoading(false);
      console.error(error);
      return toast.error(error?.response?.data?.message);
    }
  };
  //Render:
  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="w-[10.5vh] h-[8.5vh] md:w-[8vh] md:h-[7.5vh] lg:w-[8.5vh] lg:h-[7.05vh] fixed top-4 left-4 bg-linear-to-br from-amber-600/80 to-amber-400 rounded-sm md:rounded-lg lg:rounded-sm transition-all ease-in-out duration-150 hover:scale-105 hover:cursor-pointer hover:bg-yellow-700/80 flex justify-center items-center mb-8">
          <div className="w-[8.5vh] h-[7.5vh] md:w-[7vh] md:h-[6.5vh] lg:w-[7.5vh] lg:h-[6.05vh] bg-linear-to-br from-amber-500/80 to-amber-300/80 rounded-sm md:rounded-lg lg:rounded-sm hover:cursor-pointer flex justify-center items-center">
            <IoMenu size={32} className="text-white" />
          </div>
        </div>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="bg-gray-950/80 border-0 w-[250px] md:w-[350px] lg:w-[300px] [&>button]:text-white"
      >
        <SheetTitle className="sr-only">Sidebar Navigation</SheetTitle>
        <div className="w-full h-screen flex flex-col justify-start items-start">
          {/* Top Section With Name And Logo */}
          <div className="w-full h-2/10 bg-transparent flex justify-center items-center mt-4">
            {/* Logo */}
            <div
              className="w-3/8 h-full rounded-[100%]"
              style={{
                backgroundImage: `url('/images/logo.png')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            ></div>
            {/* Title */}
            <div className="w-4/8 flex justify-center items-center">
              <div className="text-3xl font-semibold text-yellow-400/80">
                Nivēśa
              </div>
            </div>
          </div>
          {/* Middle Section With Content */}
          <div className="w-full h-7/10 bg-transparent flex flex-col justify-start items-center gap-y-4">
            {/* Home */}
            <div
              className={`w-[90%] h-1/10 rounded-lg hover:cursor-pointer flex justify-start items-center gap-x-4 p-3 hover:ml-4 ${
                pathName === "/home"
                  ? "bg-yellow-900/20 text-yellow-400/80 font-semibold"
                  : "bg-transparent hover:bg-gray-400/10 text-white"
              }`}
              onClick={() => router.push("/home")}
            >
              {/* Indicator of active */}
              {pathName === "/home" ? (
                <div className="w-[1.8vh] h-[1.8vh] rounded-full bg-amber-400/80"></div>
              ) : (
                ""
              )}
              {/* Icon */}
              <FaHome size={22} />
              {/* Text */}
              <div className="text-md">Home</div>
            </div>
            {/* My Finances */}
            <div
              className={`w-[90%] h-1/10 rounded-lg hover:cursor-pointer flex justify-start items-center gap-x-4 p-3 hover:ml-4 ${
                pathName === "/finances"
                  ? "bg-yellow-900/20 text-yellow-400/80 font-semibold"
                  : "bg-transparent hover:bg-gray-400/10 text-white"
              }`}
              onClick={() => router.push("/finances")}
            >
              {/* Indicator of active */}
              {pathName === "/finances" ? (
                <div className="w-[1.8vh] h-[1.8vh] rounded-full bg-amber-400/80"></div>
              ) : (
                ""
              )}
              {/* Icon */}
              <MdAccountBalanceWallet size={22} />
              {/* Text */}
              <div className="text-md">My Finances</div>
            </div>
            {/* My Profile */}
            <div
              className={`w-[90%] h-1/10 rounded-lg hover:cursor-pointer flex justify-start items-center gap-x-4 p-3 hover:ml-4 ${
                pathName === "/profile"
                  ? "bg-yellow-900/20 text-yellow-400/80 font-semibold"
                  : "bg-transparent hover:bg-gray-400/10 text-white"
              }`}
              onClick={() => router.push("/profile")}
            >
              {/* Indicator of active */}
              {pathName === "/profile" ? (
                <div className="w-[1.8vh] h-[1.8vh] rounded-full bg-amber-400/80"></div>
              ) : (
                ""
              )}
              {/* Icon */}
              <FaRegUserCircle size={22} />
              {/* Text */}
              <div className="text-md">Edit Profile</div>
            </div>
          </div>
          {/* Bottom Section With Logout */}
          <div className="w-full h-1/10 bg-transparent flex justify-center items-center mb-4">
            {/* Logout Button */}
            <div
              className="group w-[90%] h-[70%] rounded-lg bg-transparent hover:cursor-pointer hover:bg-red-900/20 flex justify-start items-center gap-x-4 p-3"
              onClick={() => logoutUser()}
            >
              {loading === true ? (
                <div className="w-full flex justify-center items-center">
                  <ImSpinner8 className="text-white" size={25} />
                </div>
              ) : (
                <>
                  {/* Icon */}
                  <MdLogout
                    className="text-gray-300 group-hover:text-red-400/80"
                    size={22}
                  />
                  {/* Text */}
                  <div className="text-gray-400 group-hover:text-red-400/80 text-md">
                    Logout
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
