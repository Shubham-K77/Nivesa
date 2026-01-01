"use client";
import { getEveryAccountInfo } from "@/actions/accounts.api";
import AccountInfoCard from "@/components/custom/AccountInfoCard";
import DrawerComponent from "@/components/custom/DrawerComponent";
import { Skeleton } from "@/components/ui/skeleton";
import useDataFetch from "@/hooks/useDataFetch";
import React from "react";
import { IoMdAdd } from "react-icons/io";
//Define type
type accountDataType = {
  id: string;
  name: string;
  type: string;
  balance: number;
  isDefault: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  transactions: [];
  familyMembers: [];
};
const FinancePage = () => {
  //useDataHook
  const {
    data: accountInfo,
    loading,
    refetch,
  } = useDataFetch<accountDataType[]>(getEveryAccountInfo, "accountInfo", []);
  return (
    <div className="w-[95%] lg:w-[75%] min-h-screen bg-transparent flex flex-col justify-start items-center gap-y-8 mt-12 lg:mt-4">
      {/* Motif Display */}
      <div className="w-full bg-transparent rounded-xl mt-12 flex justify-around items-center">
        {/* Text, Description And CTA */}
        <div className="w-full md:w-4/6 lg:w-4/6 flex flex-col p-4 justify-start items-start gap-y-8">
          {/* Hero Text */}
          <div className="text-white font-bold text-5xl md:text-6xl lg:text-5xl text-left">
            Personal Financial Portfolio
          </div>
          {/* Description */}
          <div className="text-gray-400 text-md md:text-lg lg:text-md text-justify md:text-left lg:text-justify">
            Organize and manage all your accounts in one place. Easily access,
            filter, and sort your accounts to keep your finances structured and
            under control.
          </div>
          {/* CTA Button */}
          <div className="w-full md:w-full lg:w-[85%] grid grid-cols-1">
            {/* To Create Transaction */}
            <DrawerComponent onSuccess={refetch}>
              <div className="w-full h-[12vh] md:h-[8.5vh] lg:h-[12vh] rounded-md bg-linear-to-br from-orange-600 via-amber-500 to-yellow-300 flex justify-center items-center hover:cursor-pointer hover:bg-yellow-400/80 gap-x-4">
                <IoMdAdd className="text-white" size={22} />
                <div className="text-white font-semibold text-2xl md:text-xl lg:text-lg">
                  Add Account
                </div>
              </div>
            </DrawerComponent>
          </div>
        </div>
        {/* Motif */}
        <div
          className="max-sm:hidden md:w-2/6 md:h-[48vh] lg:w-2/6 lg:h-[48vh]"
          style={{
            backgroundImage: `url('/motifs/myFinances.svg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
      </div>
      {/* Filtering Options */}
      {/* Cards Display */}
      <div className="w-full grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 mb-4">
        {loading !== true ? (
          accountInfo?.map((account) => (
            <AccountInfoCard
              key={account.id}
              accountInfo={account}
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
    </div>
  );
};

export default FinancePage;
