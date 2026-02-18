"use client";
import { Plus, X, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Account } from "@/types/account.type";
import {
  Transaction,
  TransactionType,
  TransactionCategory,
} from "@/types/transaction.type";
import { createTransactions } from "@/queries/transaction/createTransactionMutation";
import { toast } from "sonner";

interface FloatingQuickAddProps {
  accounts: Account[];
  userId: string;
  userRole: "USER" | "FAMILY_MEMBER";
  onSuccess?: () => void;
}

const TRANSACTION_CATEGORIES = [
  "FOOD",
  "TRANSPORT",
  "HOUSING",
  "UTILITIES",
  "ENTERTAINMENT",
  "HEALTHCARE",
  "EDUCATION",
  "SHOPPING",
  "INVESTMENT",
  "FREELANCE",
  "TRAVEL",
  "SALARY",
  "BUSINESS",
  "OTHER",
] as const;

const FloatingQuickAdd = ({
  accounts,
  userId,
  userRole,
  onSuccess,
}: FloatingQuickAddProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    amount: "",
    description: "",
    category: "OTHER" as (typeof TRANSACTION_CATEGORIES)[number],
    accountId: "",
    date: new Date(),
  });

  const mutation = createTransactions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!formData.accountId) {
      toast.error("Please select an account");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    // Prepare transaction data
    const transactionData: Transaction = {
      type: formData.type as TransactionType,
      amount: Number(formData.amount),
      description: formData.description,
      category: formData.category as TransactionCategory,
      accountId: formData.accountId,
      date: formData.date,
      userId: userRole === "USER" ? userId : undefined,
      familyMemberId: userRole === "FAMILY_MEMBER" ? userId : undefined,
      isRecurring: false,
      status: "COMPLETED",
    };

    mutation.mutate(transactionData, {
      onSuccess: (response) => {
        toast.success(response?.data?.message || "Transaction created!");
        setOpen(false);
        // Reset form
        setFormData({
          type: "EXPENSE",
          amount: "",
          description: "",
          category: "OTHER",
          accountId: "",
          date: new Date(),
        });
        onSuccess?.();
      },
      onError: (error: any) => {
        console.error("Transaction creation failed:", error);
        toast.error(
          error?.response?.data?.message || "Failed to create transaction",
        );
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-linear-to-br from-yellow-400 via-amber-500 to-orange-500 shadow-2xl hover:shadow-amber-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
            aria-label="Quick add transaction"
          >
            <Plus className="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </DialogTrigger>
        <DialogContent className="w-[95%] sm:w-full max-w-md bg-linear-to-br from-gray-900 via-gray-800 to-black border border-amber-400/30 shadow-2xl text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-amber-500">
              Quick Add Transaction
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Transaction Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value: "INCOME" | "EXPENSE") =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white hover:border-amber-400/50 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20">
                  <SelectItem
                    value="EXPENSE"
                    className="text-white hover:bg-white/10"
                  >
                    Expense
                  </SelectItem>
                  <SelectItem
                    value="INCOME"
                    className="text-white hover:bg-white/10"
                  >
                    Income
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  NPR
                </span>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="pl-14 bg-white/10 border-white/20 text-white focus:border-amber-400/50 transition-all"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Description
              </label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-white/10 border-white/20 text-white focus:border-amber-400/50 transition-all"
                placeholder="e.g., Lunch at restaurant"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Category
              </label>
              <Select
                value={formData.category}
                onValueChange={(
                  value: (typeof TRANSACTION_CATEGORIES)[number],
                ) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white hover:border-amber-400/50 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20 max-h-60">
                  {TRANSACTION_CATEGORIES.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="text-white hover:bg-white/10"
                    >
                      {category.charAt(0) + category.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Account
              </label>
              <Select
                value={formData.accountId}
                onValueChange={(value) =>
                  setFormData({ ...formData, accountId: value })
                }
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white hover:border-amber-400/50 transition-all">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20">
                  {accounts.map((account) => (
                    <SelectItem
                      key={account.id}
                      value={account.id}
                      className="text-white hover:bg-white/10"
                    >
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/15 hover:border-amber-400/50 transition-all"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-900 border-white/20">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) =>
                      date && setFormData({ ...formData, date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-linear-to-r from-yellow-400 to-amber-500 text-white hover:from-yellow-500 hover:to-amber-600 font-semibold shadow-lg"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingQuickAdd;
