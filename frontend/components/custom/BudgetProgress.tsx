"use client";
import { useState, useEffect } from "react";
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
import { useQuery } from "@tanstack/react-query";
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

  return (
    <div className="w-full border border-white/10 bg-white/2 rounded-xl p-4 flex flex-col justify-start items-start gap-y-4">
      {/* Title */}
      <div className="text-md text-white font-semibold">
        {isFamilyAccount
          ? "Family Member Budget"
          : "Monthly Budget (Default Account)"}
      </div>

      {/* Family Member Dropdown */}
      {isFamilyAccount && familyMembers && familyMembers.length > 0 && (
        <div className="w-full flex flex-col gap-y-2">
          <label className="text-sm text-muted-foreground">
            Select Family Member
          </label>
          <Select
            value={selectedFamilyMember}
            onValueChange={setSelectedFamilyMember}
          >
            <SelectTrigger className="w-full bg-white/5 text-white border-white/10">
              <SelectValue placeholder="Choose a family member" />
            </SelectTrigger>
            <SelectContent>
              {familyMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
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
          <div className="flex-1 w-full">
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
                  disabled={mutation.isPending || familyMutation.isPending}
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
                  {!familyBudgetLoading
                    ? currentBudgetAmount > 0
                      ? `NPR ${currentExpensesAmount.toFixed(
                          2,
                        )} of NPR ${currentBudgetAmount.toFixed(2)} spent`
                      : "No Budget Set"
                    : "Loading..."}
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
            {currentBudgetAmount > 0 && !familyBudgetLoading && (
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
        </>
      )}
    </div>
  );
};

export default BudgetProgress;
