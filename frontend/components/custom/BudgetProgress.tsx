"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Pencil, X } from "lucide-react";
import { Budget, FamilyBudget, FamilyMemberInfo } from "@/types/budget.type";
import createUpdateBudget from "@/queries/budget/createUpdateBudget.mutation";
import createUpdateFamilyBudgetMutation from "@/queries/budget/createUpdateFamilyBudget.mutation";
import getFamilyMembersByAccountQuery from "@/queries/budget/getFamilyMembers.query";
import getFamilyBudgetQuery from "@/queries/budget/getFamilyBudget.query";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BudgetProgressProps {
  initialBudget: Budget | null;
  currentExpenses: number;
  accountId: string;
  accountType?: string;
  onBudgetUpdate?: () => void;
}

const BudgetProgress = ({
  initialBudget,
  currentExpenses,
  accountId,
  accountType = "CURRENT",
  onBudgetUpdate,
}: BudgetProgressProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || "",
  );
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string>("");

  const isFamilyAccount = accountType === "FAMILY";

  // Fetch family members if it's a family account
  const { data: familyMembersResponse } = useQuery({
    ...getFamilyMembersByAccountQuery(accountId),
    enabled: isFamilyAccount && !!accountId,
  });

  const familyMembers = familyMembersResponse?.data
    ?.familyMembers as FamilyMemberInfo[];

  // Fetch family budget for selected member
  const {
    data: familyBudgetResponse,
    refetch: refetchFamilyBudget,
    isLoading: familyBudgetLoading,
  } = useQuery({
    ...getFamilyBudgetQuery(selectedFamilyMember),
    enabled: isFamilyAccount && !!selectedFamilyMember,
  });

  const familyBudgetData = familyBudgetResponse?.data;
  const familyBudget = familyBudgetData?.budget as FamilyBudget | null;
  const familyCurrentExpenses = familyBudgetData?.currentExpenses || 0;

  // Set first family member as default when loaded
  useEffect(() => {
    if (familyMembers && familyMembers.length > 0 && !selectedFamilyMember) {
      setSelectedFamilyMember(familyMembers[0].id);
    }
  }, [familyMembers, selectedFamilyMember]);

  // Update budget input when family member changes
  useEffect(() => {
    if (isFamilyAccount && familyBudget) {
      setNewBudget(familyBudget.amount?.toString() || "");
    } else if (!isFamilyAccount && initialBudget) {
      setNewBudget(initialBudget.amount?.toString() || "");
    }
  }, [familyBudget, initialBudget, isFamilyAccount]);

  const mutation = createUpdateBudget();
  const familyMutation = createUpdateFamilyBudgetMutation();

  // Calculate percentage and current values based on account type
  const currentBudgetAmount = isFamilyAccount
    ? familyBudget?.amount || 0
    : initialBudget?.amount || 0;
  const currentExpensesAmount = isFamilyAccount
    ? familyCurrentExpenses
    : currentExpenses;
  const percentageUsed = currentBudgetAmount
    ? (currentExpensesAmount / currentBudgetAmount) * 100
    : 0;

  //Functions
  const handleUpdateBudget = () => {
    //Check Amount First
    const amount = Number(newBudget);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid number");
      setIsEditing(false);
      return;
    }

    if (isFamilyAccount) {
      // Update family member budget
      if (!selectedFamilyMember) {
        toast.error("Please select a family member");
        return;
      }

      familyMutation.mutate(
        {
          familyMemberId: selectedFamilyMember,
          amount,
        },
        {
          onSuccess: (data) => {
            setIsEditing(false);
            toast.success(`${data?.data?.message}`);
            refetchFamilyBudget();
            onBudgetUpdate?.();
          },
          onError: (error) => {
            console.error("Failed to update family budget:", error);
            toast.error("Failed to update/create the family budget.");
          },
        },
      );
    } else {
      // Update regular account budget
      mutation.mutate(
        {
          accountId,
          amount,
        },
        {
          onSuccess: (data) => {
            setIsEditing(false);
            toast.success(`${data?.data?.message}`);
            onBudgetUpdate?.();
          },
          onError: (error) => {
            console.error("Failed to update budget:", error);
            toast.error("Failed to update/create the budget.");
          },
        },
      );
    }
  };

  const handleCancel = () => {
    if (isFamilyAccount && familyBudget) {
      setNewBudget(familyBudget.amount?.toString() || "");
    } else if (!isFamilyAccount && initialBudget) {
      setNewBudget(initialBudget.amount?.toString() || "");
    }
    setIsEditing(false);
  };

  // Determine progress bar color based on usage
  const getProgressColor = () => {
    if (percentageUsed < 50)
      return "[&>div]:bg-linear-to-r [&>div]:from-green-500 [&>div]:to-emerald-400";
    if (percentageUsed < 75)
      return "[&>div]:bg-linear-to-r [&>div]:from-yellow-500 [&>div]:to-amber-400";
    if (percentageUsed < 90)
      return "[&>div]:bg-linear-to-r [&>div]:from-orange-500 [&>div]:to-amber-500";
    return "[&>div]:bg-linear-to-r [&>div]:from-red-500 [&>div]:to-rose-400";
  };

  const getStatusColor = () => {
    if (percentageUsed < 50) return "text-green-400";
    if (percentageUsed < 75) return "text-yellow-400";
    if (percentageUsed < 90) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="w-full border border-white/20 bg-linear-to-br from-white/5 to-white/2 backdrop-blur-sm rounded-2xl p-6 flex flex-col justify-start items-start gap-y-5 shadow-lg hover:border-amber-400/30 transition-all duration-300">
      {/* Header Section */}
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col gap-y-1">
          <h3 className="text-lg font-bold text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-amber-500">
            {isFamilyAccount ? "Family Budget Tracker" : "Monthly Budget"}
          </h3>
          <p className="text-xs text-gray-400">
            {isFamilyAccount
              ? "Track spending for each family member"
              : "Default Account Overview"}
          </p>
        </div>
      </div>

      {/* Family Member Dropdown */}
      {isFamilyAccount && familyMembers && familyMembers.length > 0 && (
        <div className="w-full flex flex-col gap-y-2">
          <label className="text-sm font-medium text-gray-300">
            Select Family Member
          </label>
          <Select
            value={selectedFamilyMember}
            onValueChange={setSelectedFamilyMember}
          >
            <SelectTrigger className="w-full bg-white/10 text-white border-white/20 hover:border-amber-400/50 transition-all duration-200 rounded-lg h-11">
              <SelectValue placeholder="Choose a family member" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20">
              {familyMembers.map((member) => (
                <SelectItem
                  key={member.id}
                  value={member.id}
                  className="text-white hover:bg-emerald-500/20 hover:text-white focus:bg-emerald-500/20 focus:text-white"
                >
                  {member.name}
                  {member.isActive ? " ✓" : " (Pending)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* For Displaying The Progress And Editing */}
      {(!isFamilyAccount || (isFamilyAccount && selectedFamilyMember)) && (
        <>
          {/* Budget Amount Section */}
          <div className="w-full bg-white/5 rounded-xl p-4 border border-white/10">
            {isEditing ? (
              <div className="w-full flex flex-col gap-y-3">
                <label className="text-sm font-medium text-gray-300">
                  Set Budget Amount
                </label>
                <div className="flex items-center gap-x-2">
                  {/* Input To Update Data */}
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                      NPR
                    </span>
                    <Input
                      type="number"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="w-full pl-14 bg-white/10 border-white/20 text-white text-lg font-semibold h-11 rounded-lg focus:border-amber-400/50 transition-all"
                      placeholder="Enter amount"
                      title="Update Budget"
                      autoFocus
                      disabled={mutation.isPending || familyMutation.isPending}
                    />
                  </div>
                  {/* CTA's */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleUpdateBudget}
                    className="h-11 w-11 hover:bg-green-500/20 hover:border hover:border-green-500/50 rounded-lg transition-all"
                    disabled={mutation.isPending || familyMutation.isPending}
                  >
                    <Check className="h-5 w-5 text-green-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                    className="h-11 w-11 hover:bg-red-500/20 hover:border hover:border-red-500/50 rounded-lg transition-all"
                    disabled={mutation.isPending || familyMutation.isPending}
                  >
                    <X className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center justify-between">
                {/* Budget Info */}
                {!familyBudgetLoading ? (
                  currentBudgetAmount > 0 ? (
                    <div className="flex flex-col gap-y-1">
                      <div className="flex items-baseline gap-x-2">
                        <span className="text-xs text-gray-400 font-medium">
                          Total Spending
                        </span>
                      </div>
                      <div className="flex items-baseline gap-x-3">
                        <span className="text-2xl font-bold text-white">
                          {formatCurrency(currentExpensesAmount)}
                        </span>
                        <span className="text-sm text-gray-400">of</span>
                        <span className="text-xl font-semibold text-green-400">
                          {formatCurrency(currentBudgetAmount)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        Remaining:{" "}
                        <span className={getStatusColor()}>
                          {formatCurrency(
                            currentBudgetAmount - currentExpensesAmount,
                          )}
                        </span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-y-1">
                      <span className="text-gray-400 text-sm">
                        No Budget Set
                      </span>
                      <span className="text-xs text-gray-500">
                        Click edit to set your budget
                      </span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-x-2">
                    <div className="animate-pulse h-8 w-32 bg-white/10 rounded"></div>
                  </div>
                )}
                {/* Edit Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-10 w-10 hover:bg-amber-500/20 hover:border hover:border-amber-500/50 rounded-lg transition-all group"
                  title="Edit Budget"
                >
                  <Pencil className="h-4 w-4 text-gray-400 group-hover:text-amber-400 transition-colors" />
                </Button>
              </div>
            )}
          </div>

          {/* Progress Bar Section */}
          {currentBudgetAmount > 0 && !familyBudgetLoading && (
            <div className="w-full flex flex-col gap-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">
                  Budget Usage
                </span>
                <span className={`text-sm font-bold ${getStatusColor()}`}>
                  {percentageUsed.toFixed(1)}% used
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={percentageUsed}
                  className={`w-full h-3 bg-white/10 border border-white/20 ${getProgressColor()}`}
                />
                {percentageUsed >= 90 && (
                  <div className="mt-2 flex items-center gap-x-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                    <span className="font-semibold">⚠️ Warning:</span>
                    <span>You're approaching your budget limit!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BudgetProgress;
