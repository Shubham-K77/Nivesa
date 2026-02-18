"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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
//Delete Mutation
import { useDeleteTransactions } from "@/queries/transaction/deleteBulkTransactions.mutation";
import { toast } from "sonner";
import BarLoader from "./BarLoader";
const TransactionTable = ({
  transactions = [],
  type,
  accountId,
  isFamilyMember = false,
}: {
  transactions?: Transaction[];
  type?: string;
  accountId?: string;
  isFamilyMember?: boolean;
}) => {
  //Constants
  const router = useRouter();
  //Delete Mutation
  const deleteMutation = useDeleteTransactions(accountId || "");
  const isDeleting = deleteMutation.isPending;
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
  const [familyMemberFilter, setFamilyMemberFilter] = useState("");
  //Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  //Multiple Select Handling
  const handleSelect = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item != id)
        : [...current, id],
    );
  };
  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === filteredAndSortedTransactions.length
        ? []
        : filteredAndSortedTransactions.map((transaction) => transaction.id),
    );
  };
  //Handle Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await deleteMutation.mutateAsync({ transactions: selectedIds });
      setSelectedIds([]);
      toast.success("Transactions deleted successfully.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete transactions.",
      );
    }
  };
  //Handle Single Delete
  const deleteTransaction = async (transaction: Array<string>) => {
    try {
      await deleteMutation.mutateAsync({ transactions: transaction });
      toast.success("Transaction deleted successfully.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete transaction.",
      );
    }
  };
  //Sorting Function
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];
    //Search Filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description?.toLowerCase().includes(search),
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
        (transaction) => transaction.category === categoryFilter,
      );
    }
    //Family Member Filter
    if (familyMemberFilter) {
      result = result.filter(
        (transaction) => transaction.familyMemberId === familyMemberFilter,
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
    familyMemberFilter,
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
    setFamilyMemberFilter("");
    setSelectedIds([]);
  };
  //Pagination Logic
  const totalPages = Math.ceil(
    filteredAndSortedTransactions.length / itemsPerPage,
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredAndSortedTransactions.slice(
    startIndex,
    endIndex,
  );
  //Pagination Handlers
  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
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

  // Get unique family members from transactions
  const familyMembers = useMemo(() => {
    const membersMap = new Map();
    transactions.forEach((txn) => {
      if (txn.familyMember) {
        membersMap.set(txn.familyMember.id, txn.familyMember);
      }
    });
    return Array.from(membersMap.values());
  }, [transactions]);

  return (
    <div className="w-full flex flex-col justify-center items-center mb-4 gap-y-4">
      {/* Filters */}
      <div className="w-[95%] flex flex-col justify-start items-start gap-3 sm:gap-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8 text-white font-semibold text-sm sm:text-base"
            placeholder="Search Transactions..."
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
        </div>
        {/* DropDown Options */}
        <div className="w-full flex flex-wrap justify-start items-center text-white gap-2">
          {/* Type Of Transaction */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-auto min-w-[140px]">
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
            <SelectTrigger className="w-full sm:w-auto min-w-40">
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
            <SelectTrigger className="w-full sm:w-auto min-w-[150px]">
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
          {/* Family Member Filter - Only for FAMILY account type, hidden for family member role */}
          {type === "FAMILY" && familyMembers.length > 0 && !isFamilyMember && (
            <Select
              value={familyMemberFilter}
              onValueChange={setFamilyMemberFilter}
            >
              <SelectTrigger className="w-full sm:w-auto min-w-[150px]">
                <SelectValue placeholder="All Members" />
              </SelectTrigger>
              <SelectContent className="bg-black/75 text-white">
                {familyMembers.map((member) => (
                  <SelectItem
                    key={member.id}
                    value={member.id}
                    className="hover:cursor-pointer"
                  >
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {/* Delete Button */}
          {selectedIds.length > 0 && (
            <Button
              className="text-white text-center hover:cursor-pointer text-xs sm:text-sm w-full sm:w-auto"
              variant="destructive"
              onClick={handleBulkDelete}
            >
              <Trash className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">
                {selectedIds.length === filteredAndSortedTransactions.length
                  ? "Delete All"
                  : `Delete Selected (${selectedIds.length})`}
              </span>
              <span className="sm:hidden">Delete ({selectedIds.length})</span>
            </Button>
          )}
          {/* Clear Filter */}
          {(searchTerm ||
            typeFilter ||
            recurringFilter ||
            categoryFilter ||
            familyMemberFilter) && (
            <Button
              size="icon"
              title="Clear Filters"
              onClick={handleClearFilters}
              className="hover:cursor-pointer text-white bg-emerald-400/80 hover:bg-emerald-300/80 shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {/* Loader For Delete */}
      {isDeleting && <BarLoader />}
      {/* Transaction Table */}
      <div className="w-[95%] flex justify-center items-center rounded-md border border-white/20 overflow-x-auto">
        <Table className="rounded-md min-w-full">
          {/* Table Header */}
          <TableHeader
            className={`bg-linear-to-r ${
              colorMap[type || ""] ?? "from-gray-900 to-slate-900"
            } text-gray-300 hover:text-white font-semibold sticky left-0`}
          >
            <TableRow className="bg-transparent hover:bg-transparent">
              {/* CheckBox */}
              <TableHead className="hidden sm:table-cell w-8 sm:w-10 md:w-[50px] text-white hover:cursor-pointer rounded-tl-md sticky left-0 bg-inherit text-xs sm:text-sm">
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
                className="text-white hover:cursor-pointer min-w-[70px] sm:min-w-20 text-xs sm:text-sm"
                onClick={() => handleSort("date")}
              >
                <div className="w-full flex justify-start items-center gap-x-1">
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
              <TableHead className="text-white min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm">
                Description
              </TableHead>
              {/* Category */}
              <TableHead
                className="text-white hover:cursor-pointer min-w-[100px] sm:min-w-[120px] hidden sm:table-cell text-xs sm:text-sm"
                onClick={() => handleSort("category")}
              >
                <div className="w-full flex justify-start items-center gap-x-1 sm:gap-x-2">
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
                className="text-white hover:cursor-pointer min-w-20 sm:min-w-[90px] text-xs sm:text-sm"
                onClick={() => handleSort("amount")}
              >
                <div className="w-full flex justify-start items-center gap-x-1">
                  <div className="font-semibold">Amount</div>
                  {sortConfig.field === "amount" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    ))}
                </div>
              </TableHead>
              {/* Family Member - Only for FAMILY account type, hidden for family member role */}
              {type === "FAMILY" && !isFamilyMember && (
                <TableHead className="text-white min-w-[100px] sm:min-w-[120px] hidden lg:table-cell text-xs sm:text-sm">
                  Member
                </TableHead>
              )}
              {/* Recurring */}
              <TableHead className="text-white hidden md:table-cell text-xs sm:text-sm">
                Recurring
              </TableHead>
              {/* Actions */}
              <TableHead className="w-8 sm:w-10 md:w-[50px] rounded-tr-md"></TableHead>
            </TableRow>
          </TableHeader>
          {/* Table Body */}
          <TableBody className="text-gray-300 hover:text-white font-semibold rounded-md">
            {filteredAndSortedTransactions?.length === 0 ? (
              <TableRow
                key="no-transactions"
                className="bg-transparent rounded-md hover:cursor-pointer hover:bg-gray-950/40"
              >
                <TableCell
                  colSpan={type === "FAMILY" && !isFamilyMember ? 8 : 7}
                  className="text-center"
                >
                  {" "}
                  No Transactions Found!{" "}
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="bg-transparent rounded-md hover:cursor-pointer hover:bg-gray-950/40 border-white/20"
                >
                  {/* CheckBox */}
                  <TableCell className="hidden sm:table-cell sticky left-0">
                    <Checkbox
                      className="hover:cursor-pointer"
                      onCheckedChange={() => handleSelect(transaction?.id)}
                      checked={selectedIds.includes(transaction?.id)}
                    />
                  </TableCell>
                  {/* Date */}
                  <TableCell className="text-[10px] sm:text-xs md:text-sm text-white">
                    {format(new Date(transaction.date), "MMM dd")}
                  </TableCell>
                  {/* Description */}
                  <TableCell className="text-[10px] sm:text-xs md:text-sm truncate max-w-20 sm:max-w-[120px] md:max-w-none">
                    {transaction.description}
                  </TableCell>
                  {/* Category */}
                  <TableCell className="hidden sm:table-cell p-2 sm:p-4">
                    <span
                      className={`inline-block px-1 py-0.5 rounded-sm text-[10px] sm:text-xs font-semibold ${
                        categoryColorMap[transaction.category] ??
                        "bg-slate-500/10 text-slate-400"
                      }`}
                    >
                      {transaction.category}
                    </span>
                  </TableCell>
                  {/* Amount */}
                  <TableCell
                    className={`text-[10px] sm:text-xs md:text-sm font-bold ${
                      transaction.type === TransactionType.EXPENSE
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    <span className="hidden sm:inline">
                      {transaction.type === TransactionType.EXPENSE ? "-" : "+"}{" "}
                      रु {transaction.amount}
                    </span>
                    <span className="sm:hidden">
                      {transaction.type === TransactionType.EXPENSE ? "-" : "+"}
                      {transaction.amount}
                    </span>
                  </TableCell>
                  {/* Family Member - Only for FAMILY account type, hidden for family member role */}
                  {type === "FAMILY" && !isFamilyMember && (
                    <TableCell className="hidden lg:table-cell text-[10px] sm:text-xs md:text-sm">
                      {transaction.familyMember ? (
                        <div className="flex items-center gap-x-2">
                          {transaction.familyMember.imageUrl ? (
                            <img
                              src={transaction.familyMember.imageUrl}
                              alt={transaction.familyMember.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <span className="text-emerald-400 text-xs font-semibold">
                                {transaction.familyMember.name
                                  .split(" ")
                                  .map((word: string) => word[0])
                                  .join("")}
                              </span>
                            </div>
                          )}
                          <span className="text-white">
                            {transaction.familyMember.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                  )}
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
                                    "PP",
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
                  <TableCell className="p-1 sm:p-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:cursor-pointer"
                        >
                          <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-950/95 font-semibold border-gray-800 z-10">
                        <DropdownMenuItem
                          className="hover:cursor-pointer text-blue-500/80 hover:text-black"
                          onClick={() =>
                            router.push(
                              `/transaction/create?edit=${transaction.id}`,
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
          {totalPages > 1 && (
            <TableFooter className="bg-transparent rounded-bl-lg rounded-br-lg">
              <TableRow className="hover:bg-transparent border-t border-white/20">
                <TableCell
                  colSpan={type === "FAMILY" && !isFamilyMember ? 8 : 7}
                  className="py-3 sm:py-4 bg-transparent"
                >
                  <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                    {/* Left side - Info */}
                    <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(endIndex, filteredAndSortedTransactions.length)}{" "}
                      of {filteredAndSortedTransactions.length} transactions
                    </div>
                    {/* Right side - Controls */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                      {/* Previous button */}
                      <Button
                        className="hover:cursor-pointer bg-linear-to-br from-amber-400/80 via-orange-400/80 to-yellow-400/80 hover:bg-amber-500/90 text-white disabled:opacity-80 disabled:cursor-not-allowed text-xs sm:text-sm px-2 sm:px-4"
                        size="sm"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      {/* Page numbers */}
                      <div className="flex gap-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((num) => (
                          <Button
                            key={num}
                            size="sm"
                            onClick={() => setCurrentPage(num)}
                            className={`text-xs sm:text-sm px-2 sm:px-3 ${
                              currentPage === num
                                ? "bg-linear-to-br from-emerald-400/80 via-green-400/80 to-teal-400/80 hover:from-emerald-500 hover:via-green-500 hover:to-teal-500 text-white"
                                : "bg-transparent border border-white/20 hover:bg-gray-600 text-white hover:cursor-pointer"
                            }`}
                          >
                            {num}
                          </Button>
                        ))}
                      </div>
                      {/* Next button */}
                      <Button
                        className="hover:cursor-pointer bg-linear-to-br from-amber-400/80 via-orange-400/80 to-yellow-400/80 hover:bg-amber-500/90 text-white disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm px-2 sm:px-4"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  );
};

export default TransactionTable;
