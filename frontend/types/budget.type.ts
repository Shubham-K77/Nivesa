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
