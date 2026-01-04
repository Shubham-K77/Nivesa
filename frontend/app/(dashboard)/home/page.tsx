/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DrawerComponent from "@/components/custom/DrawerComponent";
//Icons:
import { IoMdAdd } from "react-icons/io";
import { GrTransaction } from "react-icons/gr";
//React Components:
import { useContext } from "react";
//My Components:
import AccountInfoCard from "@/components/custom/AccountInfoCard";
//API Actions:
import { getAccountsInfo } from "@/actions/accounts.api";
import { UserContext } from "../layout";
import { Skeleton } from "@/components/ui/skeleton";
import useDataFetch from "@/hooks/useDataFetch";
//Type Definition:
import { Account } from "@/types/account.type";
const Page = () => {
  const currentUser = useContext(UserContext);
  //Using The Hook (only fetches if user role is USER)
  const shouldFetch = currentUser?.role === "USER";
  const {
    data: accountInfo,
    loading,
    refetch,
  } = useDataFetch<Account[]>(
    shouldFetch ? getAccountsInfo : () => Promise.resolve({ data: {} }),
    "accountInfo",
    [currentUser?.id, currentUser?.role]
  );
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
          <div
            className={`w-full md:w-full lg:w-[85%] grid ${
              currentUser?.role === "USER"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-y-4 gap-x-4"
                : "grid-cols-1"
            }`}
          >
            {/* To Create Transaction */}
            <div className="w-full h-[12vh] md:h-[8.5vh] lg:h-[12vh] rounded-md bg-linear-to-br from-yellow-400 via-amber-500 to-orange-500 flex justify-center items-center hover:cursor-pointer hover:bg-yellow-400/80 gap-x-4">
              <GrTransaction className="text-white" size={22} />
              <div className="text-white font-semibold text-2xl md:text-xl lg:text-lg">
                New Transaction
              </div>
            </div>
            {/* To Open Account */}
            {currentUser?.role === "USER" ? (
              <DrawerComponent onSuccess={refetch}>
                <div className="relative w-full h-full overflow-visible isolation-isolate">
                  <div className="w-full bg-linear-to-br from-white/25 to-gray-950 backdrop-blur-md rounded-lg h-[12vh] md:h-[8.5vh] lg:h-[12vh] flex justify-center items-center gap-x-2 transition-all ease-in-out duration-150 hover:cursor-pointer">
                    <IoMdAdd className="text-white" size={22} />
                    <div className="text-white font-semibold text-2xl md:text-xl lg:text-lg">
                      Add Account
                    </div>
                  </div>
                </div>
              </DrawerComponent>
            ) : (
              <></>
            )}
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
      {/* Cards For Showing The Current Accounts In The System */}
      {currentUser?.role === "USER" ? (
        <div className="w-full grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 mb-4">
          {loading !== true ? (
            accountInfo?.map((account: Account) => (
              <AccountInfoCard
                key={account.id}
                accountInfo={{ ...account, userId: currentUser?.id || "" }}
                onDefaultChanged={refetch}
              />
            ))
          ) : (
            <>
              <Skeleton className="w-full h-[35vh] rounded-lg bg-gray-800/80" />
              <Skeleton className="w-full h-[35vh] rounded-lg bg-gray-800/80" />
              <Skeleton className="w-full h-[35vh] rounded-lg bg-gray-800/80" />
            </>
          )}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Page;
