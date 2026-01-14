"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Pencil, X } from "lucide-react";
import { Budget } from "@/types/budget.type";
interface BudgetProgressProps {
  initialBudget: Budget | null;
  currentExpenses: number;
}
const BudgetProgress = ({
  initialBudget,
  currentExpenses,
}: BudgetProgressProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );
  const percentageUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;
  //Functions
  const handleUpdateBudget = () => {};
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
              className="w-32"
              placeholder="Enter amount"
              autoFocus
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
                    2
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
    </div>
  );
};

export default BudgetProgress;
