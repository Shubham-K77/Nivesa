import {
  Table,
  TableBody,
  TableCaption,
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
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Clock, MoreHorizontal, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
const TransactionTable = ({ transactions = [], type = "" }) => {
  //Color Mapping
  const colorMap = {
    FAMILY: "from-emerald-500/10 to-teal-500/10",
    CURRENT: "from-blue-500/10 to-cyan-500/10",
    SAVINGS: "from-amber-500/10 to-orange-500/10",
  };
  //Category Color Mapping
  const categoryColorMap = {
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
  //Sorting Function
  const filteredAndSortedTransactions = transactions;
  const handleSort = (key: string) => {};
  return (
    <div className="w-full flex flex-col justify-center items-center mb-4">
      {/* Filters */}
      {/* Transaction Table */}
      <div className="w-[95%] flex justify-center items-center rounded-md border border-white/20">
        <Table className="rounded-md min-w-full">
          <TableHeader
            className={`bg-linear-to-r ${
              colorMap[type] ?? "from-gray-900 to-slate-900"
            }text-gray-300 hover:text-white font-semibold sticky left-0`}
          >
            <TableRow className="bg-transparent hover:bg-transparent">
              {/* CheckBox */}
              <TableHead className="w-[40px] sm:w-[50px] text-white hover:cursor-pointer rounded-tl-md sticky left-0 bg-inherit">
                <Checkbox className="hover:cursor-pointer" />
              </TableHead>
              {/* Date */}
              <TableHead
                className="text-white hover:cursor-pointer min-w-[100px] sm:min-w-auto"
                onClick={() => handleSort("date")}
              >
                <div className="flex justify-start gap-x-2 sm:gap-x-4">
                  Date
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
                <div className="flex justify-start gap-x-2 sm:gap-x-4">
                  Category
                </div>
              </TableHead>
              {/* Amount */}
              <TableHead
                className="text-white hover:cursor-pointer min-w-[100px] sm:min-w-auto"
                onClick={() => handleSort("amount")}
              >
                <div className="flex justify-start gap-x-2 sm:gap-x-4">
                  Amount
                </div>
              </TableHead>
              {/* Recurring */}
              <TableHead className="text-white hidden md:table-cell">
                Recurring
              </TableHead>
              {/* Actions */}
              <TableHead className="w-[40px] sm:w-[50px] rounded-tr-xl"></TableHead>
            </TableRow>
          </TableHeader>
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
                    <Checkbox className="hover:cursor-pointer" />
                  </TableCell>
                  {/* Date */}
                  <TableCell className="text-xs sm:text-sm">
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
                      transaction.type === "EXPENSE"
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {transaction.type === "EXPENSE" ? "-" : "+"} रु{" "}
                    {transaction.amount}
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
                              {format(
                                new Date(transaction.nextRecurringDate),
                                "PP"
                              )}
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
                      <DropdownMenuContent className="bg-black/95 text-white">
                        <DropdownMenuItem className="hover:cursor-pointer text-blue-500/80">
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:cursor-pointer text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter></TableFooter>
        </Table>
      </div>
    </div>
  );
};

export default TransactionTable;
