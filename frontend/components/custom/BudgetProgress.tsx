"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Pencil, X } from "lucide-react";
import { Budget } from "@/types/budget.type";
import createUpdateBudget from "@/queries/budget/createUpdateBudget.mutation";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
interface BudgetProgressProps {
  initialBudget: Budget | null;
  currentExpenses: number;
  accountId: string;
  onBudgetUpdate?: () => void;
}
const BudgetProgress = ({
  initialBudget,
  currentExpenses,
  accountId,
  onBudgetUpdate,
}: BudgetProgressProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || "",
  );
  const percentageUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;
  const mutation = createUpdateBudget();
  //Functions
  const handleUpdateBudget = () => {
    //Check Amount First
    const amount = Number(newBudget);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid number");
      setIsEditing(false);
      return;
    }
    //Call Update Function
    mutation.mutate(
      {
        accountId,
        amount,
      },
      {
        onSuccess: (data) => {
          setIsEditing(false);
          toast.success(`${data?.data?.message}`);
          // Trigger refetch in parent component
          onBudgetUpdate?.();
        },
        onError: (error) => {
          console.error("Failed to update budget:", error);
          toast.error("Failed to update/create the budget.");
        },
      },
    );
  };
  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };
  return (
    <div className="w-full border border-white/10 bg-white/2 rounded-xl p-4 flex flex-col justify-start items-start gap-y-2">
      {/* Title */}
      <div className="text-md text-white font-semibold">
        Monthly Budget (Default Account)
      </div>
      {/* For Displaying The Progress And Editing */}
      <div className="flex-1">
        {isEditing ? (
          <div className="w-full flex justify-start items-start gap-x-2">
            {/* Input To Update Data */}
            <Input
              type="number"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              className="w-32 text-white/85"
              placeholder="Enter amount"
              title="Update Budget"
              autoFocus
              disabled={mutation.isPending}
            />
            {/* CTA's */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleUpdateBudget}
              className="hover:cursor-pointer hover:bg-white/5"
            >
              <Check className="h-4 w-4 text-green-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="hover:cursor-pointer hover:bg-white/5"
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ) : (
          <div className="w-full flex justify-start items-start gap-x-4">
            {/* Info */}
            <div className="text-md text-muted-foreground text-left p-2">
              {initialBudget
                ? `NPR ${currentExpenses.toFixed(
                    2,
                  )} of NPR ${initialBudget.amount.toFixed(2)} spent`
                : "No Budget Set"}
            </div>
            {/* CTA */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="w-8 h-8 hover:cursor-pointer hover:bg-white/5"
              title="Edit Budget"
            >
              <Pencil className="h-3 w-3 text-white" />
            </Button>
          </div>
        )}
      </div>
      {/* Displaying The Progress Bar */}
      <div className="w-full flex flex-col justify-start items-start gap-y-2">
        {initialBudget && (
          <>
            <Progress
              value={percentageUsed}
              className="w-full bg-white/45 [&>div]:bg-green-500"
            />
            <p className="text-xs text-muted-foreground text-right w-full">
              {percentageUsed.toFixed(1)}% used
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default BudgetProgress;
