"use client";
import { use, useContext } from "react";
import { useRouter } from "next/navigation";
//Icons
import { FaRegUser } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { MdOutlineSavings } from "react-icons/md";
import { CiCalendar } from "react-icons/ci";
import { IoIosTrendingUp } from "react-icons/io";
import { IoIosTrendingDown } from "react-icons/io";
import { FaArrowLeft } from "react-icons/fa6";
import { GrTransaction } from "react-icons/gr";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountCardSkeleton } from "@/components/custom/skeletons";
import TransactionTable from "@/components/custom/TransactionTable";
import { useQuery } from "@tanstack/react-query";
import getSpecificAccount from "@/queries/account/getSpecificAccountInfo.queryOption";
import getFamilyMemberAccountsQuery from "@/queries/account/getFamilyMemberAccounts.queryOption";
import { UserContext } from "../../../layout";
//Type
import { Account } from "@/types/account.type";
import AccountCharts from "@/components/custom/AccountCharts";
const AccountsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const router = useRouter();
  const currentUser = useContext(UserContext);
  const isFamilyMember = currentUser?.role === "FAMILY_MEMBER";
  //useQuery
  const { data, isLoading } = useQuery(getSpecificAccount(id));
  const accountInfo: Account = data?.data?.accountInfo;
  // Fetch family budget for family member role
  const { data: familyData } = useQuery({
    ...getFamilyMemberAccountsQuery(),
    enabled: isFamilyMember,
  });
  const familyBudget = familyData?.data?.familyBudget;
  // For family members, only show their own transactions
  const visibleTransactions = isFamilyMember
    ? accountInfo?.transactions?.filter(
        (t: any) => t.familyMemberId === currentUser?.id,
      )
    : accountInfo?.transactions;
  // Compute remaining budget (allocated - all completed expenses) for family member
  const totalSpentByMember =
    isFamilyMember && visibleTransactions
      ? visibleTransactions
          .filter((t: any) => t.type === "EXPENSE" && t.status === "COMPLETED")
          .reduce((sum: number, t: any) => sum + Number(t.amount), 0)
      : 0;
  const remainingBudget = isFamilyMember
    ? Math.max(0, Number(familyBudget?.amount ?? 0) - totalSpentByMember)
    : null;
  return (
    <div className="w-full min-h-screen flex flex-col justify-start items-center gap-y-8 bg-transparent">
      {/* Top Banner */}
      {!isLoading ? (
        <div
          className={`w-full h-screen lg:h-[55vh] bg-linear-to-br grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 ${
            accountInfo?.type === "FAMILY"
              ? "from-emerald-500/10 to-teal-500/10"
              : accountInfo?.type === "CURRENT"
                ? "from-blue-500/10 to-cyan-500/10"
                : "from-amber-500/10 to-orange-500/10"
          }`}
        >
          {/* Basic Info */}
          <div className="w-[95%] flex flex-col justify-center items-start p-4 gap-y-4 mt-15 lg:mt-4">
            {/* Mottiffs & Name & tags  */}
            <div className="w-full flex flex-col justify-start items-start gap-y-4 lg:flex-row lg:justify-center lg:items-center lg:gap-x-6">
              {/* Motifs And Title */}
              <div className="w-full flex justify-start items-center gap-x-4">
                {/* Mottiff */}
                <div className="w-[10.5vh] h-[8.5vh]  md:w-[12vh] md:h-[12vh] lg:w-[9.5vh] lg:h-[8.5vh] rounded-lg bg-black flex justify-center items-center">
                  {accountInfo?.type === "FAMILY" ? (
                    <FiUsers className="font-semibold text-emerald-400/80 w-8 h-8 md:w-16 md:h-16 lg:w-10 lg:h-10" />
                  ) : accountInfo?.type === "CURRENT" ? (
                    <FaRegUser className="font-semibold text-sky-400/80 w-8 h-8 md:w-16 md:h-16 lg:w-10 lg:h-10" />
                  ) : (
                    <MdOutlineSavings className="font-semibold text-orange-400/80 w-8 h-8 md:w-16 md:h-16 lg:w-10 lg:h-10" />
                  )}
                </div>
                {/* Title */}
                <div className="text-white font-bold text-2xl md:text-5xl lg:text-4xl">
                  {accountInfo?.name}
                </div>
              </div>
              {/* Tag For Personal Or Family */}
              <div className="flex justify-center items-center gap-x-2">
                <div className="w-[14.5vh] h-[4vh] rounded-md bg-gray-800/80 flex justify-center items-center">
                  <div className="text-white font-semibold text-sm md:text-lg lg:text-sm">
                    {accountInfo?.type === "FAMILY" ? "Family" : "Personal"}
                  </div>
                </div>
                {/* Tag For Default */}
                {accountInfo?.isDefault === true ? (
                  <div className="w-[12.5vh] h-[4vh] rounded-md bg-amber-400/10 flex justify-center items-center">
                    <div className="text-amber-600/80 font-semibold text-sm md:text-lg lg:text-sm">
                      Default
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
            {/* Created Date */}
            <div className="flex justify-start items-center gap-x-4 p-2">
              <CiCalendar className="text-gray-200/80 w-8 h-8 lg:w-6 lg:h-6" />
              <div className="text-sm md:text-lg lg:text-sm text-gray-200/80">
                Created{"  "}
                {accountInfo?.createdAt &&
                  new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  }).format(new Date(accountInfo.createdAt))}
              </div>
            </div>
            {/* CTA */}
            <div className="w-full grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-0 lg:gap-x-6">
              {/* Back Button */}
              <div
                className="w-full h-[8.5vh] rounded-lg flex justify-center items-center bg-transparent gap-x-2 border transition-all ease-in-out duration-150 hover:cursor-pointer"
                onClick={() => router.back()}
              >
                {/* Arrow */}
                <FaArrowLeft className="text-white w-8 h-8 lg:w-6 lg:h-6" />
                {/* Text */}
                <div className="text-sm md:text-xl lg:text-sm font-semibold text-white">
                  Back to Previous Page
                </div>
              </div>
              {/* Create Transaction Button */}
              <div
                className={`w-full h-[8.5vh] rounded-md bg-linear-to-br border shadow flex justify-center items-center hover:cursor-pointer gap-x-4 backdrop-blur-sm transition-all ease-in-out duration-150 hover:scale-105  ${
                  accountInfo?.type === "FAMILY"
                    ? "from-emerald-500/10 to-teal-500/10 shadow-teal-500/30 border-teal-500/30"
                    : accountInfo?.type === "CURRENT"
                      ? "from-blue-500/10 to-cyan-500/10 shadow-cyan-500/30 border-cyan-500/30"
                      : "from-amber-500/10 to-orange-500/10 shadow-orange-500/30 border-orange-500/30"
                }`}
                onClick={() => router.push("/transaction/create")}
              >
                <GrTransaction className="text-white w-8 h-8 lg:w-6 lg:h-6" />
                <div className="text-white font-semibold text-sm md:text-lg lg:text-sm">
                  Create Transaction
                </div>
              </div>
            </div>
          </div>
          {/* Card Showing Balance */}
          <div className="w-[95%] flex justify-center items-center">
            {/* Display Card */}
            <div
              className={`w-[85%] md:w-[75%] h-[30vh] lg:w-[55%] lg:h-[35vh] rounded-lg border shadow backdrop-blur-sm bg-linear-to-br flex flex-col justify-center items-start gap-y-4 p-6 ${
                accountInfo?.type === "FAMILY"
                  ? "from-emerald-500/10 to-teal-500/10 shadow-teal-500/30 border-teal-500/30"
                  : accountInfo?.type === "CURRENT"
                    ? "from-blue-500/10 to-cyan-500/10 shadow-cyan-500/30 border-cyan-500/30"
                    : "from-amber-500/10 to-orange-500/10 shadow-orange-500/30 border-orange-500/30"
              }`}
            >
              {/* Title */}
              <div className="text-md text-lg lg:text-md text-white/80">
                {isFamilyMember ? "Remaining Budget" : "Available Balance"}
              </div>
              {/* Availabel Amount */}
              <div className="text-white text-3xl md:text-4xl lg:text-3xl font-bold">
                NPR{" "}
                {isFamilyMember
                  ? (remainingBudget?.toFixed(3) ?? "0.000")
                  : Number(accountInfo?.balance ?? 0).toFixed(3)}
              </div>
              {/* Legend For Income And Expense */}
              <div className="w-full flex justify-start items-center gap-x-6">
                {/* Income Explanation */}
                <div className="flex justify-start items-center gap-x-3">
                  {/* Motiff */}
                  <div className="w-[7.5vh] h-[7.5vh] md:w-[9.5vh] md:h-[9.5vh] lg:w-[7.5vh] lg:h-[7.5vh] rounded-full bg-black flex justify-center items-center">
                    <IoIosTrendingUp className="text-emerald-400 w-8 h-8 md:w-10 md:h-10 lg:w-8 lg:h-8" />
                  </div>
                  {/* Text */}
                  <div className="text-sm md:text-lg lg:text-sm font-semibold text-emerald-400">
                    Income
                  </div>
                </div>
                {/* Expense Explanation */}
                <div className="flex justify-start items-center gap-x-3">
                  {/* Motiff */}
                  <div className="w-[7.5vh] h-[7.5vh] md:w-[9.5vh] md:h-[9.5vh] lg:w-[7.5vh] lg:h-[7.5vh] rounded-full bg-black flex justify-center items-center">
                    <IoIosTrendingDown className="text-rose-400 w-8 h-8 md:w-10 md:h-10 lg:w-8 lg:h-8" />
                  </div>
                  {/* Text */}
                  <div className="text-sm md:text-lg lg:text-sm font-semibold text-rose-400">
                    Expense
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Skeleton className="w-full h-[55vh] bg-white/2 rounded-none" />
      )}
      {/* Transaction Chart */}
      {!isLoading ? (
        <AccountCharts transactions={visibleTransactions} />
      ) : (
        <Skeleton className="w-full h-[55vh] bg-white/2 rounded-none" />
      )}
      {/* Transaction Table */}
      {!isLoading ? (
        <TransactionTable
          transactions={visibleTransactions}
          type={accountInfo?.type}
          accountId={id}
          isFamilyMember={isFamilyMember}
        />
      ) : (
        <Skeleton className="w-full h-[55vh] bg-white/2 rounded-none" />
      )}
    </div>
  );
};

export default AccountsPage;
