"use client";
import { getSpecificAccountInfo } from "@/actions/accounts.api";
import useDataFetch from "@/hooks/useDataFetch";
import { use } from "react";
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
//Type
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
const AccountsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const router = useRouter();
  //useDataFetchHook
  const { data: accountInfo, loading } = useDataFetch<accountDataType>(
    () => getSpecificAccountInfo(id),
    "accountInfo",
    [id]
  );
  return (
    <div className="w-full min-h-screen flex flex-col justify-start items-center gap-y-8 bg-transparent">
      {/* Top Banner */}
      {loading !== true ? (
        <div
          className={`w-full h-[55vh] bg-linear-to-br grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 ${
            accountInfo?.type === "FAMILY"
              ? "from-emerald-500/10 to-teal-500/10"
              : accountInfo?.type === "CURRENT"
              ? "from-blue-500/10 to-cyan-500/10"
              : "from-amber-500/10 to-orange-500/10"
          }`}
        >
          {/* Basic Info */}
          <div className="w-[95%] flex flex-col justify-center items-center p-4 gap-y-4">
            {/* Mottiffs & Name & tags  */}
            <div className="w-full flex justify-center items-center gap-x-6">
              {/* Mottiff */}
              <div className="w-[8.5vh] h-[8.5vh] rounded-lg bg-black flex justify-center items-center">
                {accountInfo?.type === "FAMILY" ? (
                  <FiUsers
                    className="font-semibold text-emerald-400/80"
                    size={32}
                  />
                ) : accountInfo?.type === "CURRENT" ? (
                  <FaRegUser
                    className="font-semibold text-sky-400/80"
                    size={32}
                  />
                ) : (
                  <MdOutlineSavings
                    className="font-semibold text-orange-400/80"
                    size={32}
                  />
                )}
              </div>
              {/* Title */}
              <div className="text-white font-bold text-4xl">
                {accountInfo?.name}
              </div>
              {/* Tag For Personal Or Family */}
              <div className="w-[14.5vh] h-[4vh] rounded-md bg-gray-800/80 flex justify-center items-center">
                <div className="text-white font-semibold text-sm">
                  {accountInfo?.type === "FAMILY" ? "Family" : "Personal"}
                </div>
              </div>
              {/* Tag For Default */}
              {accountInfo?.isDefault === true ? (
                <div className="w-[12.5vh] h-[4vh] rounded-md bg-amber-400/10 flex justify-center items-center">
                  <div className="text-amber-600/80 font-semibold text-sm">
                    Default
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
            {/* Created Date */}
            <div className="w-[80%] flex justify-start items-center gap-x-4 p-4">
              <CiCalendar className="text-gray-200/80" size={22} />
              <div className="text-sm text-gray-200/80">
                Created{"  "}
                {accountInfo?.createdAt &&
                  new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  }).format(new Date(accountInfo.createdAt))}
              </div>
            </div>
            {/* CTA, Todo: Get The User Role */}
            <div className="w-full grid grid-cols-2 gap-x-6">
              {/* Back Button */}
              <div
                className="w-full h-[8.5vh] rounded-lg flex justify-center items-center bg-transparent gap-x-2 border transition-all ease-in-out duration-150 hover:cursor-pointer hover:bg-black hover:scale-105"
                onClick={() => router.back()}
              >
                {/* Arrow */}
                <FaArrowLeft className="text-white" size={18} />
                {/* Text */}
                <div className="text-sm font-semibold text-white">
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
              >
                <GrTransaction className="text-white" size={18} />
                <div className="text-white font-semibold text-sm">
                  Create Transaction
                </div>
              </div>
            </div>
          </div>
          {/* Card Showing Balance */}
          <div className="w-[95%] flex justify-center items-center">
            {/* Display Card */}
            <div
              className={`w-[55%] h-[35vh] rounded-lg border shadow backdrop-blur-sm bg-linear-to-br flex flex-col justify-center items-start gap-y-4 p-6 ${
                accountInfo?.type === "FAMILY"
                  ? "from-emerald-500/10 to-teal-500/10 shadow-teal-500/30 border-teal-500/30"
                  : accountInfo?.type === "CURRENT"
                  ? "from-blue-500/10 to-cyan-500/10 shadow-cyan-500/30 border-cyan-500/30"
                  : "from-amber-500/10 to-orange-500/10 shadow-orange-500/30 border-orange-500/30"
              }`}
            >
              {/* Title */}
              <div className="text-md text-white/80">Available Balance</div>
              {/* Availabel Amount */}
              <div className="text-white text-3xl font-bold">
                NPR {accountInfo?.balance}
              </div>
              {/* Legend For Income And Expense */}
              <div className="w-full flex justify-start items-center gap-x-6">
                {/* Income Explanation */}
                <div className="flex justify-start items-center gap-x-3">
                  {/* Motiff */}
                  <div className="w-[7.5vh] h-[7.5vh] rounded-full bg-black flex justify-center items-center">
                    <IoIosTrendingUp className="text-emerald-400" size={28} />
                  </div>
                  {/* Text */}
                  <div className="text-sm font-semibold text-emerald-400">
                    Income
                  </div>
                </div>
                {/* Expense Explanation */}
                <div className="flex justify-start items-center gap-x-3">
                  {/* Motiff */}
                  <div className="w-[7.5vh] h-[7.5vh] rounded-full bg-black flex justify-center items-center">
                    <IoIosTrendingDown className="text-rose-400" size={28} />
                  </div>
                  {/* Text */}
                  <div className="text-sm font-semibold text-rose-400">
                    Expense
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Skeleton className="w-full h-[55vh] bg-gray-800/80 rounded-none" />
        </>
      )}
    </div>
  );
};

export default AccountsPage;
