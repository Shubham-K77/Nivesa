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
import { userInfo } from "@/types/user.type";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
//Sheet Component From ShadCn
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import getActiveUser from "@/queries/user/getCurrentUser.queryOption";
const Sidebar = () => {
  const router = useRouter();
  const pathName = usePathname();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  //Get Current User
  const { data, isLoading } = useQuery(getActiveUser());
  const userInfo: userInfo = data?.data?.currentUser;
  //Function to initiate logout:
  const logoutUser = async () => {
    setLogoutLoading(true);
    try {
      const response = await logout();
      toast.success(response?.data?.message);
      return router.push("/");
    } catch (error: any) {
      console.error(error);
      return toast.error(error?.response?.data?.message);
    } finally {
      setLogoutLoading(false);
      setShowLogoutDialog(false);
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
        className="bg-black border-r border-white/5 w-[250px] md:w-[350px] lg:w-[300px] [&>button]:text-white"
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
                  ? "bg-white/10 text-orange-500 font-semibold"
                  : "bg-transparent hover:bg-white/5 text-white/60 hover:text-white"
              }`}
              onClick={() => router.push("/home")}
            >
              {/* Indicator of active */}
              {pathName === "/home" ? (
                <div className="w-[1.8vh] h-[1.8vh] rounded-full bg-orange-500"></div>
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
                  ? "bg-white/10 text-orange-500 font-semibold"
                  : "bg-transparent hover:bg-white/5 text-white/60 hover:text-white"
              }`}
              onClick={() => router.push("/finances")}
            >
              {/* Indicator of active */}
              {pathName === "/finances" ? (
                <div className="w-[1.8vh] h-[1.8vh] rounded-full bg-orange-500"></div>
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
                  ? "bg-white/10 text-orange-500 font-semibold"
                  : "bg-transparent hover:bg-white/5 text-white/60 hover:text-white"
              }`}
              onClick={() => router.push("/profile")}
            >
              {/* Indicator of active */}
              {pathName === "/profile" ? (
                <div className="w-[1.8vh] h-[1.8vh] rounded-full bg-orange-500"></div>
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
            {isLoading ? (
              <Skeleton className="w-[95%] h-[8vh] rounded-lg bg-gray-900/60 border border-white/5" />
            ) : (
              <Dialog
                open={showLogoutDialog}
                onOpenChange={setShowLogoutDialog}
              >
                <DialogTrigger asChild>
                  <div className="w-[95%] bg-white/3 rounded-lg border border-white/5 flex justify-start items-center gap-x-4 p-2 hover:cursor-pointer">
                    {/* Avatar */}
                    {userInfo?.imageUrl.trim() ? (
                      <div
                        className="w-12 h-12 rounded-full"
                        style={{
                          backgroundImage: `url(${userInfo?.imageUrl})`,
                          backgroundPosition: "center",
                          backgroundSize: "cover",
                          backgroundRepeat: "no-repeat",
                        }}
                      ></div>
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-linear-to-br from-teal-400/80 via-cyan-400/80 to-emerald-400/80 text-center text-white">
                        {userInfo?.name ? (
                          <>
                            {userInfo.name.split(" ")[0].charAt(0)}
                            {userInfo.name.split(" ")[1]?.charAt(0) ?? ""}
                          </>
                        ) : (
                          "?"
                        )}
                      </div>
                    )}
                    {/* Name Render */}
                    <div className="flex flex-col justify-start items-start gap-y-1">
                      <div className="text-white text-sm">
                        {userInfo?.name ? userInfo?.name : "?"}
                      </div>
                      <div className="text-white/35 text-sm">Basic Plan</div>
                    </div>
                    {/* Icon For Logout */}
                    <Button
                      className="hover:text-white text-white"
                      size="icon"
                      disabled
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </DialogTrigger>
                <DialogContent className="bg-gray-950/75 text-white border border-white/5">
                  {/* For title and description */}
                  <DialogHeader>
                    <DialogTitle>Confirm Logout</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to log out? Logging out will end
                      your current session.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="destructive"
                        className="text-white hover:cursor-pointer hover:bg-red-400/80"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      className="bg-orange-500/80 text-white hover:cursor-pointer hover:bg-orange-400/80"
                      onClick={logoutUser}
                    >
                      {logoutLoading ? (
                        <>
                          Logging Out
                          <ImSpinner8 className="w-4 h-4 text-white animate-spin" />
                        </>
                      ) : (
                        "Logout"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
