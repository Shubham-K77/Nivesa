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
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: Date;
  category: TransactionCategory;
  isRecurring: boolean;
  recurringInterval?: RecurringInterval;
  nextRecurringDate?: Date;
};
