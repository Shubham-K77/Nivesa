"use client";
import { Account } from "@/types/account.type";
import { Transaction, TransactionCategory } from "@/types/transaction.type";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns/format";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import {
  Pie,
  PieChart,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
type DashboardOverviewProps = {
  accounts: Account[];
  transactions: Transaction[];
};
// Define colors for pie chart
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF6B9D",
  "#C77DFF",
  "#00D9FF",
];
const DashboardOverview = ({
  accounts,
  transactions,
}: DashboardOverviewProps) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  //Filter The Transactions for the account
  const currentTransaction = transactions.filter(
    (t) => t.accountId === selectedAccountId,
  );
  //Five Recent Transactions
  const recentTransactions = currentTransaction
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  //Calculate The Expense Breakdown for the current month
  const currentDate = new Date();
  const currentMonthExpenses = currentTransaction.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      t.type === "EXPENSE" &&
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });
  //Structure The Data For Graph
  const expensesByCategory = currentMonthExpenses.reduce(
    (acc, transaction) => {
      const category = transaction.category;
      // Force amount to be a number
      const amount = Number(transaction.amount);
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    },
    {} as Record<TransactionCategory, number>,
  );
  // Converting The Data Into Suitable Pie-Chart Format
  const data = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));
  //Component
  return (
    <div className="w-full rounded-xl bg-transparent grid grid-cols-1 gap-y-4 lg:grid-cols-2 lg:gap-x-4">
      {/* Recent Transactions */}
      <div className="w-full rounded-lg bg-white/2 border border-white/5 flex flex-col justify-center items-center gap-y-4 p-2 sm:p-4">
        {/* Title Section */}
        <div className="w-[95%] flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-4 mt-2 sm:mt-4">
          {/* Title */}
          <div className="text-white text-sm sm:text-base md:text-md">
            Recent Transactions
          </div>
          {/* Select */}
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
          >
            <SelectTrigger className="w-[120px] sm:w-[150px] md:w-[180px] text-white text-xs sm:text-sm">
              <SelectValue
                placeholder="Select Account"
                className="text-white"
              />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Transactions Section */}
        <div className="w-[95%] p-1 sm:p-2 space-y-2 sm:space-y-3">
          {recentTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 text-sm sm:text-base">
              No recent transactions
            </p>
          ) : (
            recentTransactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between gap-2"
              >
                {/* Display Description With Date */}
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium leading-none text-white truncate">
                    {txn.description || "Untitled Transaction"}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {format(new Date(txn.date), "PP")}
                  </p>
                </div>
                {/* Display Income Or Expense */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <div
                    className={`flex items-center ${txn.type === "EXPENSE" ? "text-red-500" : "text-green-500"}`}
                  >
                    {txn.type === "EXPENSE" ? (
                      <ArrowDownRight className="mr-0.5 sm:mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <ArrowUpRight className="mr-0.5 sm:mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    <span className="text-xs sm:text-sm">
                      NPR. {Number(txn.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Pie-Chart Information */}
      <div className="w-full rounded-lg bg-white/2 border border-white/5 flex flex-col justify-center items-center gap-y-4 p-2 sm:p-4">
        {/* Title Section */}
        <div className="w-[95%] flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-4 mt-2 sm:mt-4">
          {/* Title */}
          <div className="text-white text-sm sm:text-base md:text-md">
            Category Breakdown
          </div>
          {/* Select */}
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
          >
            <SelectTrigger className="w-[120px] sm:w-[150px] md:w-[180px] text-white text-xs sm:text-sm">
              <SelectValue
                placeholder="Select Account"
                className="text-white"
              />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Pie-Chart Section */}
        <div className="w-[95%] p-2 flex items-center justify-center">
          {data.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 text-sm sm:text-base">
              No expenses this month
            </p>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={250}
              className="sm:h-[280px] md:h-[300px]"
            >
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="30%"
                  outerRadius="60%"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ percent }) =>
                    percent ? `${(percent * 100).toFixed(0)}%` : ""
                  }
                  labelLine={false}
                  style={{ fontSize: "14px", fontWeight: "600" }}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `NPR ${Number(value).toFixed(2)}`}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
