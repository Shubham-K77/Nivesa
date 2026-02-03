export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}
export enum TransactionCategory {
  FOOD = "FOOD",
  TRANSPORT = "TRANSPORT",
  HOUSING = "HOUSING",
  UTILITIES = "UTILITIES",
  ENTERTAINMENT = "ENTERTAINMENT",
  HEALTHCARE = "HEALTHCARE",
  EDUCATION = "EDUCATION",
  SHOPPING = "SHOPPING",
  INVESTMENT = "INVESTMENT",
  FREELANCE = "FREELANCE",
  TRAVEL = "TRAVEL",
  SALARY = "SALARY",
  BUSINESS = "BUSINESS",
  OTHER = "OTHER",
}
export enum RecurringInterval {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}
export type Transaction = {
  id?: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: Date;
  accountId: string;
  userId?: string;
  familyMemberId?: string;
  status?: "PENDING" | "COMPLETED" | "FAILED";
  lastProcessed?: Date;
  category: TransactionCategory;
  isRecurring: boolean;
  recurringInterval?: RecurringInterval;
  nextRecurringDate?: Date;
};

// Partial type for updates - all fields optional (matches backend EditTransactionDto)
export type UpdateTransaction = Partial<Transaction>;
