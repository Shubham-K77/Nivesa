"use client";
import { Account } from "@/types/account.type";
import { Transaction } from "@/types/transaction.type";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns/format";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
type DashboardOverviewProps = {
  accounts: Account[];
  transactions: Transaction[];
};
const DashboardOverview = ({
  accounts,
  transactions,
}: DashboardOverviewProps) => {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts?.find((a) => a?.isDefault)?.id || accounts[0]?.id,
  );
  //Filter The Transactions for the account
  const currentTransaction = transactions.filter(
    (t) => t.accountId === selectedAccountId,
  );
  //Five Recent Transactions
  const recentTransactions = currentTransaction
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  //Component
  return (
    <div className="w-full rounded-xl bg-transparent grid grid-cols-1 gap-y-4 lg:grid-cols-2 lg:gap-x-4">
      {/* Recent Transactions */}
      <div className="w-full rounded-lg bg-white/2 border border-white/5 flex flex-col justify-center items-center gap-y-4 p-2">
        {/* Title Section */}
        <div className="w-[95%] flex flex-row items-center justify-between space-y-0 pb-4 mt-4">
          {/* Title */}
          <div className="text-white text-md">Recent Transactions</div>
          {/* Select */}
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
          >
            <SelectTrigger className="w-[180px] text-white">
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
        <div className="w-[95%] p-2 space-y-4">
          {recentTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No recent transactions
            </p>
          ) : (
            recentTransactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between">
                {/* Display Description With Date */}
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none text-white">
                    {txn.description || "Untitled Transaction"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(txn.date), "PP")}
                  </p>
                </div>
                {/* Display Income Or Expense */}
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center ${txn.type === "EXPENSE" ? "text-red-500" : "text-green-500"}`}
                  >
                    {txn.type === "EXPENSE" ? (
                      <ArrowDownRight className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                    )}
                    NPR. {Number(txn.amount).toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="w-full rounded-lg bg-white/2 border border-white/5 flex flex-col justify-center items-center gap-y-4 p-2"></div>
    </div>
  );
};

export default DashboardOverview;
