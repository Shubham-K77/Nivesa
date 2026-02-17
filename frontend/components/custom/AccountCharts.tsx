"use client";
import { Transaction } from "@/types/transaction.type";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import { BsGraphUpArrow, BsGraphDownArrow } from "react-icons/bs";

//Object For Date Range
const Date_Ranges = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last 1 Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  All: { label: "All Time", days: null },
} as const;
type DateRangeKey = keyof typeof Date_Ranges;

const AccountCharts = ({
  transactions = [],
}: {
  transactions?: Transaction[];
}) => {
  const [dateRange, setDateRange] = useState<DateRangeKey>("1M");

  //Filtering Transactions
  const filteredTransactions = useMemo(() => {
    const range = Date_Ranges[dateRange];
    const now = new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    //Filtering The Days - Parse dates properly
    const filtered = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endOfDay(now);
    });

    //Getting The Income And Expense Values
    const grouped = filtered.reduce<
      Record<
        string,
        { date: string; sortDate: Date; income: number; expense: number }
      >
    >((acc, transaction) => {
      const transactionDate = new Date(transaction.date);
      const dateKey = format(transactionDate, "MMM dd");

      //If Date Doesn't Exist In The Accumulator
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          sortDate: transactionDate,
          income: 0,
          expense: 0,
        };
      }

      //Check Exisitng Transactions Type - Convert string amount to number
      const amount = Number(transaction.amount) || 0;
      if (transaction.type === "INCOME") {
        acc[dateKey].income += amount;
      } else {
        acc[dateKey].expense += amount;
      }

      //Return Accumulator
      return acc;
    }, {});

    //Return Grouped Object To Array sorted by actual date
    return Object.values(grouped).sort(
      (a, b) => a.sortDate.getTime() - b.sortDate.getTime(),
    );
  }, [transactions, dateRange]);
  //Calculating Totals For Given Periods
  const totals = useMemo(() => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      return { income: 0, expense: 0 };
    }
    return filteredTransactions.reduce<{ income: number; expense: number }>(
      (acc, day) => ({
        income: acc.income + (Number(day.income) || 0),
        expense: acc.expense + (Number(day.expense) || 0),
      }),
      { income: 0, expense: 0 },
    );
  }, [filteredTransactions]);
  return (
    <div className="w-[95%] mt-4 mb-4 min-h-[400px] sm:min-h-[500px] flex flex-col justify-start items-center border border-white/10 bg-white/2 rounded-xl p-2 sm:p-4 gap-y-4 sm:gap-y-6">
      {/* Title & Select */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mt-2 sm:mt-4 px-2 sm:px-4">
        {/* Title */}
        <div className="flex flex-col justify-start items-start">
          <div className="text-white font-semibold text-lg sm:text-xl">
            Transaction Overview
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Income vs Expense analysis
          </div>
        </div>
        {/* Dropdown */}
        <Select
          defaultValue={dateRange}
          onValueChange={(value) => setDateRange(value as DateRangeKey)}
        >
          <SelectTrigger className="w-full sm:w-40 md:w-[180px] text-white text-sm">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="bg-gray-950">
            {Object.entries(Date_Ranges).map(([key, { label }]) => (
              <SelectItem
                key={key}
                value={key}
                className="text-white hover:cursor-pointer"
              >
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Display Income And Expenses Info */}
      <div className="w-full grid gird-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-y-3 gap-x-0 lg:gap-y-0 lg:gap-x-6">
        {/* Income Info */}
        <div className="w-full text-center p-6 bg-emerald-500/3 border border-emerald-500/20 rounded-xl">
          <p className="w-full text-emerald-300/70 gap-x-2 flex justify-center items-center text-xs sm:text-sm">
            <BsGraphUpArrow className="w-3 h-3 sm:w-4 sm:h-4" /> Total Income
          </p>
          <p className="text-base sm:text-lg font-bold text-emerald-400 mt-1">
            NPR {totals.income.toFixed(2)}
          </p>
        </div>
        {/* Expense Info */}
        <div className="w-full text-center p-6 bg-rose-500/3 border border-rose-500/20 rounded-xl">
          <p className="w-full text-rose-300/70 gap-x-2 flex justify-center items-center text-xs sm:text-sm">
            <BsGraphDownArrow className="w-3 h-3 sm:w-4 sm:h-4" /> Total Expense
          </p>
          <p className="text-base sm:text-lg font-bold text-rose-400 mt-1">
            NPR {totals.expense.toFixed(2)}
          </p>
        </div>
        {/* Profit Info */}
        <div
          className={`w-full text-center p-6 border rounded-xl ${
            totals.income - totals.expense >= 0
              ? "bg-emerald-500/3 border-emerald-500/20"
              : "bg-rose-500/3 border-rose-500/20"
          }`}
        >
          <p
            className={`w-full gap-x-2 flex justify-center items-center text-xs sm:text-sm ${
              totals.income - totals.expense >= 0
                ? "text-emerald-300/70"
                : "text-rose-300/70"
            }`}
          >
            {totals.income - totals.expense >= 0 ? (
              <BsGraphUpArrow className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <BsGraphDownArrow className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
            Net
          </p>
          <p
            className={`text-base sm:text-lg font-bold mt-1 ${
              totals.income - totals.expense >= 0
                ? "text-emerald-400"
                : "text-rose-400"
            }`}
          >
            NPR {(totals.income - totals.expense).toFixed(2)}
          </p>
        </div>
      </div>
      {/* Display The Bar-Chart */}
      <div className="w-[95%] md:w-[90%] lg:w-[95%] p-3 sm:p-4 md:p-6 rounded-lg bg-white/1 border border-white/10 backdrop-blur-sm">
        <ResponsiveContainer width="100%" height={300} className="sm:h-[350px]">
          <BarChart
            responsive
            data={filteredTransactions}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" fontSize={10} className="sm:text-xs" />
            <YAxis
              width={40}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `NPR ${value}`}
            />
            <Tooltip
              formatter={(value: any, name: string | undefined) => {
                const numValue = Number(value);
                if (numValue === 0) return null;
                return [`NPR ${numValue.toFixed(2)}`, name || ""];
              }}
            />
            <Legend />
            <Bar
              dataKey="income"
              name="Income"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expense"
              name="Expense"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Description */}
      <div className="mb-12 w-full lg:px-16 flex justify-start items-center text-muted-foreground text-sm">
        Data represents transactions for the selected period
      </div>
    </div>
  );
};

export default AccountCharts;
