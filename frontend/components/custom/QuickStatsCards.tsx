"use client";
import { Transaction } from "@/types/transaction.type";
import { Account } from "@/types/account.type";
import { TrendingUp, TrendingDown, Wallet, Calendar } from "lucide-react";
import { startOfDay, startOfWeek, startOfMonth, isAfter } from "date-fns";
import { formatCurrency } from "@/lib/currency";

interface QuickStatsCardsProps {
  transactions: Transaction[];
  accounts: Account[];
  familyBudget?: number | null;
}

const QuickStatsCards = ({
  transactions,
  accounts,
  familyBudget,
}: QuickStatsCardsProps) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const monthStart = startOfMonth(now);
  // Calculate today's spending
  const todayExpenses = transactions
    .filter(
      (t) =>
        t.type === "EXPENSE" &&
        isAfter(new Date(t.date), todayStart) &&
        t.status === "COMPLETED",
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);
  // Calculate this week's spending
  const weekExpenses = transactions
    .filter(
      (t) =>
        t.type === "EXPENSE" &&
        isAfter(new Date(t.date), weekStart) &&
        t.status === "COMPLETED",
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);
  // Calculate this month's spending
  const monthExpenses = transactions
    .filter(
      (t) =>
        t.type === "EXPENSE" &&
        isAfter(new Date(t.date), monthStart) &&
        t.status === "COMPLETED",
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);
  // Calculate total balance across all accounts (or use allocated family budget)
  const totalBalance =
    familyBudget != null
      ? familyBudget
      : accounts.reduce((sum, account) => sum + Number(account.balance), 0);
  const stats = [
    {
      title: "Today's Spending",
      value: todayExpenses,
      icon: Calendar,
      color: "from-blue-500 to-cyan-400",
      bgGradient: "from-blue-500/10 to-cyan-400/10",
      iconBg: "bg-blue-500/20",
    },
    {
      title: "This Week",
      value: weekExpenses,
      icon: TrendingDown,
      color: "from-purple-500 to-pink-400",
      bgGradient: "from-purple-500/10 to-pink-400/10",
      iconBg: "bg-purple-500/20",
    },
    {
      title: "This Month",
      value: monthExpenses,
      icon: TrendingUp,
      color: "from-orange-500 to-red-400",
      bgGradient: "from-orange-500/10 to-red-400/10",
      iconBg: "bg-orange-500/20",
    },
    {
      title: familyBudget != null ? "Remaining Budget" : "Available Balance",
      value: totalBalance,
      icon: Wallet,
      color: "from-green-500 to-emerald-400",
      bgGradient: "from-green-500/10 to-emerald-400/10",
      iconBg: "bg-green-500/20",
    },
  ];
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`relative overflow-hidden rounded-2xl border border-white/20 bg-linear-to-br ${stat.bgGradient} backdrop-blur-sm p-5 hover:border-amber-400/30 transition-all duration-300 group`}
          >
            {/* Icon */}
            <div
              className={`${stat.iconBg} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon
                className={`w-6 h-6 text-transparent bg-clip-text bg-linear-to-r ${stat.color}`}
                style={{ stroke: `url(#gradient-${index})` }}
              />
              <svg width="0" height="0">
                <defs>
                  <linearGradient
                    id={`gradient-${index}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor={
                        stat.color.includes("blue")
                          ? "#3b82f6"
                          : stat.color.includes("purple")
                            ? "#a855f7"
                            : stat.color.includes("orange")
                              ? "#f97316"
                              : "#10b981"
                      }
                    />
                    <stop
                      offset="100%"
                      stopColor={
                        stat.color.includes("cyan")
                          ? "#22d3ee"
                          : stat.color.includes("pink")
                            ? "#f472b6"
                            : stat.color.includes("red")
                              ? "#f87171"
                              : "#34d399"
                      }
                    />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {/* Content */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {stat.title}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {formatCurrency(stat.value)}
              </p>
            </div>
            {/* Decorative gradient overlay */}
            <div
              className={`absolute -right-8 -bottom-8 w-32 h-32 bg-linear-to-br ${stat.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-300`}
            ></div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickStatsCards;
