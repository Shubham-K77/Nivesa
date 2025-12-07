/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DrawerComponent from "@/components/custom/drawerComponent";
import { IoMdAdd } from "react-icons/io";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { getAccountsInfo } from "@/actions/accounts.api";
import { UserContext } from "../layout";
const Page = () => {
  const [accountInfo, setAccountInfo] = useState({});
  const currentUser = useContext(UserContext);
  useEffect(() => {
    if (!currentUser?.id) return;
    const fetchAccountsInfo = async () => {
      try {
        const response = await getAccountsInfo(currentUser?.id);
        setAccountInfo(response.data.accountInfo);
        return toast.success(response.data.message);
      } catch (error: any) {
        console.error(error);
        return toast.error(error?.response?.data?.message);
      }
    };
    fetchAccountsInfo();
  }, [currentUser?.id]);
  return (
    <div className="w-[95%] lg:w-[75%] min-h-screen bg-transparent flex flex-col justify-start items-center gap-y-8 mt-12 lg:mt-4">
      {/* Motif Display */}
      <div className="w-full bg-transparent rounded-xl mt-12 flex justify-around items-center">
        {/* Text, Description And CTA */}
        <div className="w-full md:w-4/6 lg:w-4/6 flex flex-col p-4 justify-start items-start gap-y-8">
          {/* Hero Text */}
          <div className="text-white font-bold text-5xl md:text-6xl lg:text-5xl text-left">
            Your Personal Finance Companion
          </div>
          {/* Description */}
          <div className="text-gray-400 text-md md:text-lg lg:text-md text-justify md:text-left lg:text-justify">
            Get a complete view of your spending, budgets, and goals all in one
            place. Nivesa helps you stay organized and in control of your
            financial life.
          </div>
          {/* CTA Button */}
          <div className="w-[75%] h-[10.5vh] md:w-[60%] md:h-[7.85vh] lg:w-[26%] lg:h-[7.6vh] rounded-md bg-amber-400/80 flex justify-center items-center transition-all ease-in-out duration-150 hover:scale-105 hover:cursor-pointer hover:bg-yellow-400/80">
            <div className="text-white font-semibold text-xl md:text-2xl lg:text-sm">
              Create Transaction
            </div>
          </div>
        </div>
        {/* Motif */}
        <div
          className="max-sm:hidden md:w-2/6 md:h-[48vh] lg:w-2/6 lg:h-[42vh]"
          style={{
            backgroundImage: `url('/motifs/dashboard.svg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
      </div>
      {/* Drawer For Opening Account */}
      <div className="w-full grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <DrawerComponent>
          <div className="relative w-full h-full overflow-visible isolation-isolate">
            <div className="w-full bg-linear-to-br from-white/25 to-gray-950 backdrop-blur-md rounded-lg h-[18vh] flex justify-center items-center gap-x-2 transition-all ease-in-out duration-150 hover:cursor-pointer border">
              <IoMdAdd className="text-white" size={32} />
              <div className="text-white font-semibold text-2xl md:text-3xl lg:text-lg">
                Add Account
              </div>
            </div>
          </div>
        </DrawerComponent>
      </div>
    </div>
  );
};

export default Page;
