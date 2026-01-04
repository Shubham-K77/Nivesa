"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
//Type For Transaction Info
import {
  Transaction,
  TransactionType,
  TransactionCategory,
} from "@/types/transaction.type";
const TransactionTable = ({
  transactions = [],
  type = "",
}: {
  transactions?: Transaction[];
  type?: string;
}) => {
  //Constants
  const router = useRouter();
  //UseState Variables
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  //Multiple Select Handling
  const handleSelect = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item != id)
        : [...current, id]
    );
  };
  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === filteredAndSortedTransactions.length
        ? []
        : filteredAndSortedTransactions.map((transaction) => transaction.id)
    );
  };
  //Handle Bulk Delete
  const handleBulkDelete = () => {};
  //Sorting Function
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];
    //Search Filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description?.toLowerCase().includes(search)
      );
    }
    //Type Filter
    if (typeFilter) {
      result = result.filter((transaction) => {
        if (typeFilter === "INCOME") return transaction.type === "INCOME";
        return transaction.type === "EXPENSE";
      });
    }
    //Recurring Filter
    if (recurringFilter) {
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") return transaction.isRecurring;
        return !transaction.isRecurring;
      });
    }
    //Category Filter
    if (categoryFilter) {
      result = result.filter(
        (transaction) => transaction.category === categoryFilter
      );
    }
    //Apply Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime(); //Ascending
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
    return result;
  }, [
    transactions,
    searchTerm,
    typeFilter,
    recurringFilter,
    categoryFilter,
    sortConfig,
  ]);
  const handleSort = (key: string) => {
    //Configuration
    setSortConfig((current) => ({
      field: key,
      direction:
        current.field === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };
  //Clearing Filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setCategoryFilter("");
    setRecurringFilter("");
    setSelectedIds([]);
  };
  //Color Mapping
  const colorMap: Record<string, string> = {
    FAMILY: "from-emerald-500/10 to-teal-500/10",
    CURRENT: "from-blue-500/10 to-cyan-500/10",
    SAVINGS: "from-amber-500/10 to-orange-500/10",
  };
  //Category Color Mapping
  const categoryColorMap: Record<string, string> = {
    FOOD: "bg-orange-500/10 text-orange-400",
    TRANSPORT: "bg-blue-600/10 text-blue-500",
    HOUSING: "bg-indigo-500/10 text-indigo-400",
    UTILITIES: "bg-yellow-500/10 text-yellow-400",
    ENTERTAINMENT: "bg-pink-500/10 text-pink-400",
    HEALTHCARE: "bg-red-600/10 text-red-500",
    EDUCATION: "bg-purple-600/10 text-purple-500",
    SHOPPING: "bg-fuchsia-600/10 text-fuchsia-500",
    INVESTMENT: "bg-emerald-600/10 text-emerald-500",
    FREELANCE: "bg-cyan-700/10 text-cyan-600",
    TRAVEL: "bg-teal-400/10 text-teal-500",
    SALARY: "bg-green-600/10 text-green-500",
    BUSINESS: "bg-amber-600/10 text-amber-500",
    OTHER: "bg-slate-600/10 text-slate-400",
  };
  //Delete Transaction Function
  const deleteTransaction = (transactionIds: string[]) => {};
  return (
    <div className="w-full flex flex-col justify-center items-center mb-4 gap-y-4">
      {/* Filters */}
      <div className="w-[95%] flex flex-col justify-start items-start lg:flex-row lg:items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8 text-white font-semibold"
            placeholder="Search Transactions..."
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
        </div>
        {/* DropDown Options */}
        <div className="flex justify-start items-center text-white gap-x-2">
          {/* Type Of Transaction */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-black/75 text-white">
              {Object.values(TransactionType).map((type) => (
                <SelectItem
                  value={type}
                  key={type}
                  className="hover:cursor-pointer"
                >
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Type Of Recurring */}
          <Select value={recurringFilter} onValueChange={setRecurringFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent className="bg-black/75 text-white">
              <SelectItem value="recurring" className="hover:cursor-pointer">
                Recurring Only
              </SelectItem>
              <SelectItem
                value="non-recurring"
                className="hover:cursor-pointer"
              >
                Non-recurring Only
              </SelectItem>
            </SelectContent>
          </Select>
          {/* Type Of Category */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-black/75 text-white">
              {Object.values(TransactionCategory).map((category) => (
                <SelectItem
                  key={category}
                  value={category}
                  className="hover:cursor-pointer"
                >
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Delete Button */}
          {selectedIds.length > 0 && (
            <div>
              <Button className="text-white text-center" variant="destructive">
                <Trash className="w-2 h-2 mr-1" onClick={handleBulkDelete} />
                {selectedIds.length === filteredAndSortedTransactions.length
                  ? "Delete All"
                  : `Delete Selected (${selectedIds.length})`}
              </Button>
            </div>
          )}
          {/* Clear Filter */}
          {(searchTerm || typeFilter || recurringFilter || categoryFilter) && (
            <Button
              size="icon"
              title="Clear Filters"
              onClick={handleClearFilters}
              className="hover:cursor-pointer text-white bg-emerald-400/80 hover:bg-emerald-300/80"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {/* Transaction Table */}
      <div className="w-[95%] flex justify-center items-center rounded-md border border-white/20">
        <Table className="rounded-md min-w-full">
          {/* Table Header */}
          <TableHeader
            className={`bg-linear-to-r ${
              colorMap[type] ?? "from-gray-900 to-slate-900"
            }text-gray-300 hover:text-white font-semibold sticky left-0`}
          >
            <TableRow className="bg-transparent hover:bg-transparent">
              {/* CheckBox */}
              <TableHead className="w-10 sm:w-[50px] text-white hover:cursor-pointer rounded-tl-md sticky left-0 bg-inherit">
                <Checkbox
                  className="hover:cursor-pointer"
                  onCheckedChange={() => handleSelectAll()}
                  checked={
                    selectedIds.length ===
                      filteredAndSortedTransactions.length &&
                    filteredAndSortedTransactions.length > 0
                  }
                />
              </TableHead>
              {/* Date */}
              <TableHead
                className="text-white hover:cursor-pointer min-w-[100px] sm:min-w-auto"
                onClick={() => handleSort("date")}
              >
                <div className="w-full flex justify-start items-center gap-x-2">
                  <div className="font-semibold">Date</div>
                  {sortConfig.field === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    ))}
                </div>
              </TableHead>
              {/* Description */}
              <TableHead className="text-white min-w-[150px] sm:min-w-auto">
                Description
              </TableHead>
              {/* Category */}
              <TableHead
                className="text-white hover:cursor-pointer min-w-[120px] sm:min-w-auto hidden sm:table-cell"
                onClick={() => handleSort("category")}
              >
                <div className="w-full flex justify-start items-center gap-x-2">
                  <div className="font-semibold">Category</div>
                  {sortConfig.field === "category" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    ))}
                </div>
              </TableHead>
              {/* Amount */}
              <TableHead
                className="text-white hover:cursor-pointer min-w-[100px] sm:min-w-auto"
                onClick={() => handleSort("amount")}
              >
                <div className="w-full flex justify-start items-center gap-x-2">
                  <div className="font-semibold">Amount</div>
                  {sortConfig.field === "amount" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    ))}
                </div>
              </TableHead>
              {/* Recurring */}
              <TableHead className="text-white hidden md:table-cell">
                Recurring
              </TableHead>
              {/* Actions */}
              <TableHead className="w-10 sm:w-[50px] rounded-tr-xl"></TableHead>
            </TableRow>
          </TableHeader>
          {/* Table Body */}
          <TableBody className="text-gray-300 hover:text-white font-semibold rounded-md">
            {filteredAndSortedTransactions?.length === 0 ? (
              <TableRow className="bg-transparent rounded-md hover:cursor-pointer hover:bg-gray-950/40">
                <TableCell colSpan={7} className="text-center">
                  {" "}
                  No Transactions Found!{" "}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTransactions.map((transaction) => (
                <TableRow className="bg-transparent rounded-md hover:cursor-pointer hover:bg-gray-950/40 border-white/20">
                  {/* CheckBox */}
                  <TableCell className="sticky left-0">
                    <Checkbox
                      className="hover:cursor-pointer"
                      onCheckedChange={() => handleSelect(transaction?.id)}
                      checked={selectedIds.includes(transaction?.id)}
                    />
                  </TableCell>
                  {/* Date */}
                  <TableCell className="text-xs sm:text-sm text-whiite">
                    {format(new Date(transaction.date), "PP")}
                  </TableCell>
                  {/* Description */}
                  <TableCell className="text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">
                    {transaction.description}
                  </TableCell>
                  {/* Category */}
                  <TableCell className="p-4">
                    <span
                      className={`inline-block px-1 py-0.5 rounded-sm text-xs font-semibold ${
                        categoryColorMap[transaction.category] ??
                        "bg-slate-500/10 text-slate-400"
                      }`}
                    >
                      {transaction.category}
                    </span>
                  </TableCell>
                  {/* Amount */}
                  <TableCell
                    className={`text-xs sm:text-sm font-bold ${
                      transaction.type === TransactionType.EXPENSE
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {transaction.type === TransactionType.EXPENSE ? "-" : "+"}{" "}
                    रु {transaction.amount}
                  </TableCell>
                  {/* Recurring */}
                  <TableCell>
                    {transaction.isRecurring ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className="rounded-sm bg-blue-500/10 text-blue-400 border-blue-500/30 gap-1 cursor-pointer"
                            >
                              <RefreshCw className="h-3 w-3" />
                              {transaction.recurringInterval?.toLowerCase()}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-700/85 text-white">
                            <p>
                              Next Date:{" "}
                              {transaction.nextRecurringDate
                                ? format(
                                    new Date(transaction.nextRecurringDate),
                                    "PP"
                                  )
                                : "N/A"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Badge
                        variant="outline"
                        className="rounded-sm bg-gray-500/10 text-gray-400 border-gray-500/30 gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        One-Time
                      </Badge>
                    )}
                  </TableCell>
                  {/* Actions */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:cursor-pointer"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-950/95 font-semibold border-gray-800 z-10">
                        <DropdownMenuItem
                          className="hover:cursor-pointer text-blue-500/80 hover:text-black"
                          onClick={() =>
                            router.push(
                              `/transaction/create?edit=${transaction.id}`
                            )
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="hover:cursor-pointer text-destructive hover:text-black"
                          onClick={() => deleteTransaction([transaction.id])}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {/* Table Footer */}
        </Table>
      </div>
    </div>
  );
};

export default TransactionTable;
