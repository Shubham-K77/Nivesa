/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DrawerComponent from "@/components/custom/DrawerComponent";
//Icons:
import { IoMdAdd } from "react-icons/io";
import { GrTransaction } from "react-icons/gr";
//React Components:
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
//My Components:
import AccountInfoCard from "@/components/custom/AccountInfoCard";
import { UserContext } from "../layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
//Type Definition:
import { Account } from "@/types/account.type";
import { Transaction } from "@/types/transaction.type";
import getAccountsInitial from "@/queries/account/getAccountsInitial.queryOption";
import getFamilyMemberAccountsQuery from "@/queries/account/getFamilyMemberAccounts.queryOption";
import getDefaultAccountBudget from "@/queries/budget/getCurrentBudget.query";
import BudgetProgress from "@/components/custom/BudgetProgress";
import DashboardOverview from "@/components/custom/DashboardOverview";
import getDashboardInfo from "@/queries/transaction/getDashboardData.query";
const Page = () => {
  const currentUser = useContext(UserContext);
  const router = useRouter();
  //Tanstack Query => Refetch When The Role Is User
  const { data, isLoading, refetch } = useQuery({
    ...getAccountsInitial(currentUser?.id || ""),
    enabled: currentUser?.role === "USER" && !!currentUser?.id,
  });
  const accountInfo = data?.data?.accountInfo as Account[] | undefined;
  const defaultAccount = accountInfo?.find((account) => account.isDefault);

  // Fetch family member accounts
  const { data: familyMemberData, isLoading: familyMemberLoading } = useQuery({
    ...getFamilyMemberAccountsQuery(),
    enabled: currentUser?.role === "FAMILY_MEMBER" && !!currentUser?.id,
  });
  const familyAccountInfo = familyMemberData?.data?.accountInfo as
    | Account[]
    | undefined;
  const familyBudget = familyMemberData?.data?.familyBudget;

  //Budget Info
  const { data: budgetResponse, refetch: refetchBudget } = useQuery({
    ...getDefaultAccountBudget(defaultAccount?.id || ""),
    enabled: currentUser?.role === "USER" && !!defaultAccount?.id,
  });
  const budgetData = budgetResponse?.data;
  //Transactions Info
  const {
    data: transactions,
    isPending: transactionsLoading,
    refetch: transactionsRefetch,
  } = useQuery({
    ...getDashboardInfo(currentUser?.id || ""),
  });
  const transactionInfo = transactions?.data?.transactionsInfo as
    | Transaction[]
    | undefined;

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
            <div
              className="w-full h-[12vh] md:h-[8.5vh] lg:h-[12vh] rounded-md bg-linear-to-br from-yellow-400 via-amber-500 to-orange-500 flex justify-center items-center hover:cursor-pointer hover:bg-yellow-400/80 gap-x-4"
              onClick={() => router.push("/transaction/create")}
            >
              <GrTransaction className="text-white" size={22} />
              <div className="text-white font-semibold text-2xl md:text-xl lg:text-lg">
                New Transaction
              </div>
            </div>
            {/* To Open Account */}
            {currentUser?.role === "USER" ? (
              <DrawerComponent>
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
      {/* For Displaying Budget Overview*/}
      {currentUser?.role === "USER" ? (
        !isLoading ? (
          // Budget Overview
          <BudgetProgress
            initialBudget={budgetData?.budget}
            currentExpenses={budgetData?.currentExpenses || 0}
            accountId={defaultAccount?.id || ""}
            accountType={defaultAccount?.type || "CURRENT"}
            onBudgetUpdate={() => refetchBudget()}
          />
        ) : (
          <>
            <Skeleton className="w-full h-[25vh] bg-white/2" />
          </>
        )
      ) : (
        <></>
      )}
      {/* For Displaying The Pie-Chart And Overview */}
      {transactionsLoading === true ? (
        <>
          <Skeleton className="w-full h-[50vh] rounded-xl bg-white/5" />
        </>
      ) : (
        <>
          <DashboardOverview
            accounts={accountInfo ?? []}
            transactions={transactionInfo ?? []}
          />
        </>
      )}
      {/* Cards For Showing The Current Accounts In The System */}
      {currentUser?.role === "USER" ? (
        <div className="w-full grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 mb-4">
          {!isLoading && accountInfo ? (
            accountInfo.map((account: Account) => (
              <AccountInfoCard
                key={account.id}
                accountInfo={{ ...account, userId: currentUser?.id || "" }}
                userRole="USER"
              />
            ))
          ) : (
            <>
              <Skeleton className="w-full h-[35vh] rounded-lg bg-white/2" />
              <Skeleton className="w-full h-[35vh] rounded-lg bg-white/2" />
              <Skeleton className="w-full h-[35vh] rounded-lg bg-white/2" />
            </>
          )}
        </div>
      ) : currentUser?.role === "FAMILY_MEMBER" ? (
        <div className="w-full grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 mb-4">
          {!familyMemberLoading && familyAccountInfo ? (
            familyAccountInfo.map((account: Account) => (
              <AccountInfoCard
                key={account.id}
                accountInfo={{ ...account, userId: currentUser?.id || "" }}
                userRole="FAMILY_MEMBER"
                familyBudget={familyBudget}
              />
            ))
          ) : (
            <>
              <Skeleton className="w-full h-[35vh] rounded-lg bg-white/2" />
              <Skeleton className="w-full h-[35vh] rounded-lg bg-white/2" />
              <Skeleton className="w-full h-[35vh] rounded-lg bg-white/2" />
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
