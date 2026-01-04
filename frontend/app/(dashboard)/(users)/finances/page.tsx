"use client";
import { getEveryAccountInfo } from "@/actions/accounts.api";
import AccountInfoCard from "@/components/custom/AccountInfoCard";
import DrawerComponent from "@/components/custom/DrawerComponent";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import useDataFetch from "@/hooks/useDataFetch";
import {
  ArrowDown,
  ArrowUp,
  Coins,
  PiggyBank,
  Search,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
//Define type
import { Account } from "@/types/account.type";
import { Button } from "@/components/ui/button";
const FinancePage = () => {
  //useState
  type SortDirection = "Ascending" | "Descending" | null;
  const [dateSort, setDateSort] = useState<SortDirection>(null);
  const [amountSort, setAmountSort] = useState<SortDirection>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  //useDataHook
  const {
    data: accountInfo,
    loading,
    refetch,
  } = useDataFetch<Account[]>(getEveryAccountInfo, "accountInfo", []);
  //Filtering Logic
  const sortedAndFilteredData = useMemo(() => {
    let data = [...(accountInfo ?? [])];
    //For Search
    if (searchTerm) {
      data = data?.filter((account) =>
        account.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    //Type Filtering
    if (typeFilter) {
      data = data.filter((account) => account.type === typeFilter);
    }
    //Sorting Logic
    data.sort((a, b) => {
      if (dateSort) {
        const dateDiff =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (dateDiff !== 0) {
          return dateSort === "Ascending" ? dateDiff : -dateDiff;
        }
      }
      if (amountSort) {
        const amountDiff = a.balance - b.balance;
        if (amountDiff !== 0) {
          return amountSort === "Ascending" ? amountDiff : -amountDiff;
        }
      }
      return 0;
    });
    return data;
  }, [searchTerm, typeFilter, dateSort, amountSort, accountInfo]);
  //Reset Filter Logic
  const resetFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setDateSort(null);
    setAmountSort(null);
  };
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
      <div className="w-full flex justify-start items-start gap-x-4">
        {/* Search Bar  */}
        <div className="flex-1 relative">
          <Input
            className="pl-8 text-white bg-transparent border"
            placeholder="Search for accounts ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute top-2.5 left-2 w-4 h-4 text-white" />
        </div>
        {/* Type Select */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="bg-transparent text-white">
            <SelectValue
              placeholder="All Types"
              className="text-white font-semibold"
            />
          </SelectTrigger>
          <SelectContent className="bg-gray-900/75">
            <SelectItem
              value="FAMILY"
              className="hover:cursor-pointer text-white"
            >
              Family <Users className="text-blue-400/80 font-semibold" />
            </SelectItem>
            <SelectItem
              value="SAVINGS"
              className="hover:cursor-pointer text-white"
            >
              Savings <PiggyBank className="text-amber-400/80 font-semibold" />
            </SelectItem>
            <SelectItem
              value="CURRENT"
              className="hover:cursor-pointer text-white"
            >
              Current <Coins className="text-orange-400/80" />
            </SelectItem>
          </SelectContent>
        </Select>
        {/* Date Select */}
        <Select
          value={dateSort ?? undefined}
          onValueChange={(value: "Ascending" | "Descending") =>
            setDateSort(value)
          }
        >
          <SelectTrigger className="bg-transparent text-white">
            <SelectValue
              placeholder="All Dates"
              className="text-white font-semibold"
            />
          </SelectTrigger>
          <SelectContent className="text-white bg-gray-900/75">
            <SelectItem
              value="Ascending"
              className="hover:cursor-pointer text-white"
            >
              Earliest Date <ArrowUp className="w-4 h-4 text-green-400" />
            </SelectItem>
            <SelectItem
              value="Descending"
              className="hover:cursor-pointer text-white"
            >
              Latest Date <ArrowDown className="w-4 h-4 text-red-400" />
            </SelectItem>
          </SelectContent>
        </Select>
        {/* Balance Select */}
        <Select
          value={amountSort ?? undefined}
          onValueChange={(value: "Ascending" | "Descending") =>
            setAmountSort(value)
          }
        >
          <SelectTrigger className="bg-transparent text-white">
            <SelectValue
              placeholder="All Balance"
              className="text-white font-semibold"
            />
          </SelectTrigger>
          <SelectContent className="text-white bg-gray-900/75">
            <SelectItem
              value="Ascending"
              className="hover:cursor-pointer text-white"
            >
              Low - High <ArrowUp className="w-4 h-4 text-green-400" />
            </SelectItem>
            <SelectItem
              value="Descending"
              className="hover:cursor-pointer text-white"
            >
              High - Low <ArrowDown className="w-4 h-4 text-red-400" />
            </SelectItem>
          </SelectContent>
        </Select>
        {/* Display Reset Button */}
        {(searchTerm || typeFilter || dateSort || amountSort) && (
          <Button
            size="icon"
            className="bg-linear-to-br from-emerald-400/80 via-teal-400/80 to-cyan-400/80 hover:cursor-pointer text-center"
            title="Reset Filters"
            onClick={resetFilters}
          >
            <X className="text-white w-4 h-4" />
          </Button>
        )}
      </div>
      {/* Cards Display */}
      <div className="w-full grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 mb-4">
        {loading !== true ? (
          sortedAndFilteredData?.map((account) => (
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
