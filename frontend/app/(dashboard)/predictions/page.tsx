"use client";

import { useContext, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { UserContext } from "../layout";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";
import getAccountsInitial from "@/queries/account/getAccountsInitial.queryOption";
import getFamilyMemberAccountsQuery from "@/queries/account/getFamilyMemberAccounts.queryOption";
import type { Account } from "@/types/account.type";
import { predictSpending } from "@/actions/transactions.api";

interface PredictionDay {
  date: string;
  predicted_spending: number;
  lower_bound: number;
  upper_bound: number;
}
interface PredictionResponse {
  predictions: PredictionDay[];
  total_predicted: number;
  historical_avg: number;
  model_used: string;
  data_points_used?: number;
  mae?: number; // Mean Absolute Error
}
const PredictionsPage = () => {
  const currentUser = useContext(UserContext);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [predictionData, setPredictionData] =
    useState<PredictionResponse | null>(null);
  const { data: userData, isLoading: userAccountsLoading } = useQuery({
    ...getAccountsInitial(currentUser?.id || ""),
    enabled: currentUser?.role === "USER" && !!currentUser?.id,
  });
  const userAccounts = userData?.data?.accountInfo as Account[] | undefined;
  // Fetch family member accounts
  const { data: familyMemberData, isLoading: familyMemberLoading } = useQuery({
    ...getFamilyMemberAccountsQuery(),
    enabled: currentUser?.role === "FAMILY_MEMBER" && !!currentUser?.id,
  });
  const familyAccounts = familyMemberData?.data?.accountInfo as
    | Account[]
    | undefined;
  // Combine accounts based on role
  const accounts = currentUser?.role === "USER" ? userAccounts : familyAccounts;
  const isLoading =
    currentUser?.role === "USER" ? userAccountsLoading : familyMemberLoading;
  const selectedAccount = accounts?.find((acc) => acc.id === selectedAccountId);

  // Helper to get unique expense days
  const getExpenseDays = (account: Account) => {
    const expenseTransactions = account.transactions.filter(
      (t) => t.type === "EXPENSE",
    );
    const uniqueDates = new Set(
      expenseTransactions.map(
        (t) => new Date(t.date).toISOString().split("T")[0],
      ),
    );
    return uniqueDates.size;
  };

  // Predict mutation
  const predictMutation = useMutation({
    mutationFn: async (account: Account) => {
      const transactions = account.transactions.map((txn) => ({
        id: txn.id,
        amount: txn.amount,
        category: txn.category,
        type: txn.type,
        date: txn.date,
        status: txn.status,
      }));

      const response = await predictSpending(transactions);
      return response.data as PredictionResponse;
    },
    onSuccess: (data) => {
      setPredictionData(data);
      toast.success("Forecast generated successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Failed to generate forecast",
      );
    },
  });
  const handlePredict = () => {
    if (!selectedAccount) {
      toast.error("Please select an account");
      return;
    }

    const expenseDays = getExpenseDays(selectedAccount);

    if (expenseDays < 14) {
      toast.error(
        `Need at least 14 days of expense data. You have ${expenseDays} days.`,
      );
      return;
    }

    predictMutation.mutate(selectedAccount);
  };
  // Prepare chart data
  const getChartData = () => {
    if (!selectedAccount || !predictionData) return [];
    // Get last 30 days of historical data
    const expenses = selectedAccount.transactions
      .filter((txn) => txn.type === "EXPENSE")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // Aggregate by date
    const dailyMap = new Map<string, number>();
    expenses.forEach((txn) => {
      const date = new Date(txn.date).toISOString().split("T")[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + txn.amount);
    });

    // Calculate median for outlier filtering
    const amounts = Array.from(dailyMap.values());
    const sortedAmounts = [...amounts].sort((a, b) => a - b);
    const median = sortedAmounts[Math.floor(sortedAmounts.length / 2)] || 0;
    const outlierThreshold = median * 10; // Remove values > 10x median

    // Get last 30 days and filter outliers
    const historicalData = Array.from(dailyMap.entries())
      .slice(-30)
      .map(([date, amount]) => ({
        date,
        historical: amount > outlierThreshold ? null : amount,
        predicted: null,
        lower: null,
        upper: null,
      }))
      .filter((d) => d.historical !== null || d.date); // Keep all dates

    // Add predictions
    const predictions = predictionData.predictions.map((pred) => ({
      date: pred.date,
      historical: null,
      predicted: pred.predicted_spending,
      lower: pred.lower_bound,
      upper: pred.upper_bound,
    }));

    return [...historicalData, ...predictions];
  };
  if (isLoading) {
    return (
      <div className="w-[95%] lg:w-[75%] min-h-screen bg-transparent flex flex-col justify-start items-center gap-y-8 mt-12 lg:mt-4">
        <Skeleton className="w-full h-[600px] bg-white/5" />
      </div>
    );
  }
  return (
    <div className="w-[95%] lg:w-[75%] min-h-screen bg-transparent flex flex-col justify-start items-center gap-y-8 mt-12 lg:mt-4 pb-12">
      {/* Header */}
      <div className="w-full mt-12 flex flex-col gap-y-4">
        <div className="flex items-center gap-x-3">
          <h1 className="text-3xl font-bold text-white">Spending Forecast</h1>
        </div>
        <p className="text-white/60 text-base">
          AI-powered predictions for your next 7 days of spending using SARIMA
          model
        </p>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-2">
            How Forecasting Works
          </h3>
          <p className="text-xs text-white/70 leading-relaxed">
            The model analyzes your historical expense patterns using SARIMA
            (Seasonal AutoRegressive Integrated Moving Average) with 7-day
            seasonality. It processes your transaction data by:{" "}
            <span className="font-semibold text-white/90">(1)</span> filtering
            expense transactions,
            <span className="font-semibold text-white/90">(2)</span> encoding
            spending categories based on your patterns,
            <span className="font-semibold text-white/90">(3)</span> aggregating
            daily totals,
            <span className="font-semibold text-white/90">(4)</span> removing
            extreme outliers (winsorization at 99th percentile), and
            <span className="font-semibold text-white/90">(5)</span> training a
            personalized model on your complete history. The forecast shows
            predicted daily spending (yellow dashed line) with 80% confidence
            intervals (shaded area).
          </p>
        </div>
      </div>
      {/* Account Selector */}
      <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <label className="text-white text-sm font-medium mb-2 block">
          Select Account
        </label>
        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
          <SelectTrigger className="w-full bg-black/30 border-white/20 text-white">
            <SelectValue placeholder="Choose an account to analyze" />
          </SelectTrigger>
          <SelectContent className="bg-black border-white/20">
            {isLoading ? (
              <SelectItem value="loading" disabled className="text-white/50">
                Loading accounts...
              </SelectItem>
            ) : accounts && accounts.length > 0 ? (
              accounts.map((account) => {
                const expenseDays = getExpenseDays(account);
                const hasEnoughData = expenseDays >= 14;
                return (
                  <SelectItem
                    key={account.id}
                    value={account.id}
                    className="text-white hover:bg-white/10"
                  >
                    {account.name} ({account.type}) - {expenseDays} days
                    {!hasEnoughData && "(Need 14+ days)"}
                  </SelectItem>
                );
              })
            ) : (
              <SelectItem value="none" disabled className="text-white/50">
                No accounts found
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {selectedAccount && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-white/60">
              Total transactions: {selectedAccount.transactions.length}
              <br />
              Expense transactions:{" "}
              {
                selectedAccount.transactions.filter((t) => t.type === "EXPENSE")
                  .length
              }{" "}
              ({getExpenseDays(selectedAccount)} unique days)
              {getExpenseDays(selectedAccount) < 14 && (
                <span className="text-yellow-400 block mt-1">
                  Need at least 14 days of expense data for forecasting
                </span>
              )}
              {getExpenseDays(selectedAccount) >= 14 &&
                getExpenseDays(selectedAccount) < 21 && (
                  <span className="text-blue-400 block mt-1">
                    21+ days needed for accuracy (MAE) calculation
                  </span>
                )}
            </div>
            <Button
              onClick={handlePredict}
              disabled={predictMutation.isPending}
              className="bg-linear-to-r from-yellow-400 to-amber-500 text-white hover:from-yellow-500 hover:to-amber-600 font-semibold hover:cursor-pointer"
            >
              {predictMutation.isPending ? "Analyzing..." : "Generate Forecast"}
            </Button>
          </div>
        )}
      </div>
      {/* Chart */}
      {predictionData && (
        <>
          <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Spending Trend & Forecast
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={getChartData()}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                  tickFormatter={(value) => `रु${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.9)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [
                    value ? `रु${Math.round(value).toLocaleString()}` : "N/A",
                    "",
                  ]}
                />
                <Legend
                  wrapperStyle={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "12px",
                  }}
                  iconSize={10}
                />
                <Line
                  type="monotone"
                  dataKey="historical"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Historical"
                  dot={{ fill: "#3b82f6", r: 2 }}
                  connectNulls={true}
                  strokeDasharray="3 3"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Predicted"
                  dot={{ fill: "#fbbf24", r: 3 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="upper"
                  stroke="rgba(251, 191, 36, 0.3)"
                  strokeWidth={1}
                  name="Upper (80%)"
                  dot={false}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="lower"
                  stroke="rgba(251, 191, 36, 0.3)"
                  strokeWidth={1}
                  name="Lower (80%)"
                  dot={false}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Prediction Summary */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-x-2 mb-2">
                <Calendar className="w-4 h-4 text-yellow-400" />
                <h3 className="text-white/60 text-xs font-medium">
                  Next 7 Days
                </h3>
              </div>
              <p className="text-2xl font-bold text-white">
                रु{Math.round(predictionData.total_predicted).toLocaleString()}
              </p>
              <p className="text-xs text-white/50 mt-1">
                7 days × रु
                {Math.round(
                  predictionData.total_predicted / 7,
                ).toLocaleString()}
                /day avg
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-400" />
                <h3 className="text-white/60 text-xs font-medium">
                  Daily Average (Historical)
                </h3>
              </div>
              <p className="text-2xl font-bold text-white">
                रु{Math.round(predictionData.historical_avg).toLocaleString()}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <h3 className="text-white/60 text-xs font-medium">
                  Model Used
                </h3>
              </div>
              <p className="text-sm font-bold text-white">
                {predictionData.model_used}
              </p>
            </div>
          </div>
        </>
      )}
      {/* Empty State */}
      {!selectedAccountId && !predictionData && (
        <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-12 text-center">
          <TrendingUp className="w-16 h-16 text-yellow-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Account Selected
          </h3>
          <p className="text-white/60">
            Select an account above to generate spending forecasts
          </p>
        </div>
      )}
    </div>
  );
};

export default PredictionsPage;
