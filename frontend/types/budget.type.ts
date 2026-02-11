export interface Budget {
  id: string;
  accountId: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface BudgetData {
  budget: Budget | null;
  currentExpenses: number;
}

export interface FamilyBudget {
  id: string;
  familyMemberId: string;
  amount: number;
  lastAlertSent: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyBudgetData {
  budget: FamilyBudget | null;
  currentExpenses: number;
}

export interface FamilyMemberInfo {
  id: string;
  name: string;
  phoneNumber: string | null;
  imageUrl: string | null;
  isActive: boolean;
}
