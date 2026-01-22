"use client";
//Tanstack Query
import { useQuery } from "@tanstack/react-query";
import getAllAccounts from "@/queries/account/getAllAccounts.queryOption";
//Hooks
import { useContext } from "react";
import { UserContext } from "../../layout";
//Components
import AddTransactionForm from "@/components/custom/AddTransactionForm";
//Type
import { Account } from "@/types/account.type";
const page = () => {
  //Getting LoggedIn User
  const currentUser = useContext(UserContext);
  const { data } = useQuery(getAllAccounts(currentUser?.id || ""));
  const accountsInfo: Account[] = data?.data?.accountInfo;
  return (
    <div className="w-[95%] lg:w-[75%] min-h-screen bg-transparent flex flex-col justify-start items-center gap-y-12 mt-12 lg:mt-4">
      {/* Motif Display */}
      <div className="w-full bg-transparent rounded-xl mt-12 flex justify-around items-center">
        {/* Text, Description And CTA */}
        <div className="w-full md:w-4/6 lg:w-4/6 flex flex-col p-4 justify-start items-start gap-y-8">
          {/* Hero Text */}
          <div className="text-white font-bold text-5xl md:text-6xl lg:text-5xl text-left">
            Record New Transaction Entry
          </div>
          {/* Description */}
          <div className="text-gray-400 text-md md:text-lg lg:text-md text-justify md:text-left lg:text-justify">
            Create and manage detailed transactions effortlessly for your
            default account. Keep track of every income and expense with clear,
            organized records that help you understand your financial flow.
          </div>
        </div>
        {/* Motif */}
        <div
          className="max-sm:hidden md:w-2/6 md:h-[48vh] lg:w-2/6 lg:h-[48vh]"
          style={{
            backgroundImage: `url('/motifs/transaction_bg.svg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
      </div>
      {/* Form Component */}
      <div className="w-full flex flex-col justify-start items-center gap-y-6">
        {/* Form Component */}
        <AddTransactionForm accounts={accountsInfo} />
      </div>
    </div>
  );
};

export default page;
