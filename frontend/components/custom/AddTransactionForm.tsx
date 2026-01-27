"use client";
//Type
import { Account } from "@/types/account.type";
import { zodResolver } from "@hookform/resolvers/zod";
interface AddTransactionFormProps {
  accounts: Account[];
}
//React Hook Form
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useContext } from "react";
//Next Components
import { useRouter } from "next/navigation";
import { UserContext } from "@/app/(dashboard)/layout";
//Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import DrawerComponent from "./DrawerComponent";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "../ui/switch";
import { Transaction } from "@/types/transaction.type";
import { createTransactions } from "@/queries/transaction/createTransactionMutation";
import { toast } from "sonner";
import ReceiptScanner from "./ReceiptScanner";
import { scanReceiptMutation } from "@/queries/transaction/scanReceiptMutation";
//Enums
enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}
enum TransactionCategory {
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
enum RecurringInterval {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}
enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}
//Filter Categories According To User's Selection
const filteredCategories = (selectedType: "INCOME" | "EXPENSE") => {
  let categories;
  if (selectedType === "INCOME") {
    categories = {
      SALARY: "SALARY",
      FREELANCE: "FREELANCE",
      INVESTMENT: "INVESTMENT",
      BUSINESS: "BUSINESS",
      OTHER: "OTHER",
    };
  } else {
    categories = {
      FOOD: "FOOD",
      TRANSPORT: "TRANSPORT",
      HOUSING: "HOUSING",
      UTILITIES: "UTILITIES",
      ENTERTAINMENT: "ENTERTAINMENT",
      HEALTHCARE: "HEALTHCARE",
      EDUCATION: "EDUCATION",
      SHOPPING: "SHOPPING",
      TRAVEL: "TRAVEL",
      OTHER: "OTHER",
    };
  }
  return categories;
};
//Transaction Schema
const transactionSchema = z
  .object({
    type: z.nativeEnum(TransactionType),
    userId: z.string().optional(),
    amount: z.number(),
    accountId: z.string(),
    familyMemberId: z.string().optional(),
    description: z.string().optional(),
    date: z.date(),
    category: z.nativeEnum(TransactionCategory),
    receiptUrl: z.string().optional(),
    isRecurring: z.boolean().optional(),
    recurringInterval: z.nativeEnum(RecurringInterval).optional(),
    nextRecurringDate: z.date().optional(),
    lastProcessed: z.date().optional(),
    status: z.nativeEnum(TransactionStatus).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring interval is required when transaction is recurring",
        path: ["recurringInterval"],
      });
    }
  });
//Form For Creating Transaction
const AddTransactionForm = ({ accounts }: AddTransactionFormProps) => {
  //Router
  const router = useRouter();
  //Get Current User
  const currentUser = useContext(UserContext);
  //Creating Form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    getValues,
    reset,
  } = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: TransactionType.EXPENSE,
      amount: 0,
      description: "",
      accountId: accounts?.find((acc) => acc.isDefault)?.id,
      date: new Date(),
      isRecurring: false,
    },
  });
  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");
  const accountId = watch("accountId");
  const category = watch("category");
  //Create Mutation
  const transactionMutation = createTransactions(accountId);
  const receiptMutation = scanReceiptMutation();
  const { isPending } = transactionMutation;
  //Submit Function
  const onSubmit = async (data: z.infer<typeof transactionSchema>) => {
    if (!currentUser) {
      toast.error("User not authenticated");
      return;
    }
    try {
      const formData = {
        ...data,
        amount: parseFloat(data.amount.toString()),
        ...(currentUser.role === "USER"
          ? { userId: currentUser.id, familyMemberId: undefined }
          : { familyMemberId: currentUser.id, userId: undefined }),
      };
      await transactionMutation.mutateAsync(formData as Transaction);
      toast.success("Transaction created successfully!");
      reset();
      router.back();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to create transaction",
      );
    }
  };
  //Receipt Scanning Callback
  const handleFileSubmit = (file: File) => {
    receiptMutation.mutate(file, {
      onSuccess: (data) => {
        const transactionInfo = data.transactionInfo;
        // Add null check
        if (!transactionInfo) {
          toast.error("No receipt data found in image");
          return;
        }
        // Auto-fill form with scanned data
        if (transactionInfo.amount) {
          setValue("amount", transactionInfo.amount);
        }
        if (transactionInfo.date) {
          setValue("date", new Date(transactionInfo.date));
        }
        if (transactionInfo.description) {
          setValue("description", transactionInfo.description);
        }
        if (transactionInfo.type) {
          setValue("type", transactionInfo.type as TransactionType);
        }
        if (transactionInfo.category) {
          if (
            Object.values(TransactionCategory).includes(
              transactionInfo.category as TransactionCategory,
            )
          ) {
            setValue(
              "category",
              transactionInfo.category as TransactionCategory,
            );
          }
        }
        // Show additional success message for auto-fill
        toast.success("Form auto-filled with receipt data!");
      },
    });
  };
  return (
    <>
      {/* Ai Receipt Scanner CTA*/}
      <ReceiptScanner
        onScanComplete={handleFileSubmit}
        isScanning={receiptMutation.isPending}
      />
      <div className="w-full flex justify-center items-center p-8 bg-white/2 border border-white/5 rounded-xl mb-6">
        <form
          className="w-full flex flex-col justify-start items-start gap-y-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Transaction Details */}
          <div className="w-full flex justify-start items-center p-4 gap-x-4">
            {/* Motif */}
            <div className="w-[7.5vh] h-[7.5vh] rounded-full bg-linear-to-br from-amber-400/80 via-orange-400/80 to-yellow-400/80 flex justify-center items-center">
              <div className="font-bold text-2xl text-white">1</div>
            </div>
            {/* Text */}
            <div className="text-xl font-bold text-white">
              Transaction Details
            </div>
          </div>
          <div className="w-full flex flex-col justify-start items-center p-8 gap-y-4 rounded-xl bg-white/3 border border-white/7">
            {/* Transaction Type */}
            <div className="w-full flex flex-col justify-start items-start gap-y-2">
              <label className="text-white text-sm font-medium">
                Transaction Type
              </label>
              <Select
                onValueChange={(value) => setValue("type", value as any)}
                value={type}
              >
                <SelectTrigger className="w-[95%] text-white">
                  <SelectValue
                    placeholder="Select Type"
                    className="text-white"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                </SelectContent>
              </Select>
              {/* Error Message */}
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>
            {/* Transaction Amount & Transaction Account */}
            <div className="w-full grid grid-cols-2 gap-x-6">
              {/* Transaction Amount Component */}
              <div className="w-full flex flex-col justify-start items-start gap-y-2">
                <label className="text-white text-sm font-medium">
                  Transaction Amount
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="text-white"
                  {...register("amount", { valueAsNumber: true })}
                />
                {/* Error Message */}
                {errors.amount && (
                  <p className="text-sm text-red-500">
                    {errors.amount.message}
                  </p>
                )}
              </div>
              {/* Transaction Account Component */}
              <div className="w-full flex flex-col justify-start items-start gap-y-2">
                <label className="text-white text-sm font-medium">
                  Transaction Account
                </label>
                <Select
                  onValueChange={(value) => setValue("accountId", value)}
                  defaultValue={getValues("accountId")}
                >
                  <SelectTrigger className="w-[95%] text-white">
                    <SelectValue
                      placeholder="Select Account"
                      className="text-white"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} (NPR {Number(account.balance).toFixed(2)}
                        )
                      </SelectItem>
                    ))}
                    <DrawerComponent>
                      <Button
                        variant="ghost"
                        className="w-full select-none items-center text-sm outline-none"
                      >
                        Create New Account
                      </Button>
                    </DrawerComponent>
                  </SelectContent>
                </Select>
                {/* Error Message */}
                {errors.accountId && (
                  <p className="text-sm text-red-500">
                    {errors.accountId.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Payment Details */}
          <div className="w-full flex justify-start items-center p-4 gap-x-4">
            {/* Motif */}
            <div className="w-[7.5vh] h-[7.5vh] rounded-full bg-linear-to-br from-amber-400/80 via-orange-400/80 to-yellow-400/80 flex justify-center items-center">
              <div className="font-bold text-2xl text-white">2</div>
            </div>
            {/* Text */}
            <div className="text-xl font-bold text-white">Payment Details</div>
          </div>
          <div className="w-full flex flex-col justify-start items-center p-8 gap-y-4 rounded-xl bg-white/3 border border-white/7">
            {/* Category Selection */}
            <div className="w-full flex flex-col justify-start items-start gap-y-2">
              <label className="text-white text-sm font-medium">
                Transaction Category
              </label>
              <Select
                onValueChange={(value) => setValue("category", value as any)}
                value={category || ""}
              >
                <SelectTrigger className="w-[95%] text-white">
                  <SelectValue
                    placeholder="Select Category"
                    className="text-white"
                  />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(
                    filteredCategories(type as "INCOME" | "EXPENSE"),
                  ).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() +
                        category.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Error Message */}
              {errors.category && (
                <p className="text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>
            {/* Date Selection */}
            <div className="w-full flex flex-col justify-start items-start gap-y-2">
              <label className="text-white text-sm font-medium">
                Transaction Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full pl-3 text-left font-normal"
                  >
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => setValue("date", date || new Date())}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    className="rounded-md border shadow-sm"
                    captionLayout="dropdown"
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {/* Error Message */}
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>
            {/* Description Input */}
            <div className="w-full flex flex-col justify-start items-start gap-y-2">
              <label className="text-white text-sm font-medium">
                Transaction Description
              </label>
              <Input
                type="text"
                placeholder="Enter description"
                className="text-white"
                {...register("description")}
              />
              {/* Error Message */}
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
          {/* Repeat Settings */}
          <div className="w-full flex justify-start items-center p-4 gap-x-4">
            {/* Motif */}
            <div className="w-[7.5vh] h-[7.5vh] rounded-full bg-linear-to-br from-amber-400/80 via-orange-400/80 to-yellow-400/80 flex justify-center items-center">
              <div className="font-bold text-2xl text-white">3</div>
            </div>
            {/* Text */}
            <div className="text-xl font-bold text-white">Repeat Settings</div>
          </div>
          <div className="w-full flex flex-col justify-start items-start p-8 gap-y-4 rounded-xl bg-white/3 border border-white/7">
            {/* Recuring Transaction Switch */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <label className="text-sm font-medium cursor-pointer text-white">
                  Recurring Transaction
                </label>
                <p className="text-sm text-muted-foreground">
                  Set up a recurring schedule for this transaction
                </p>
              </div>
              <Switch
                checked={isRecurring}
                onCheckedChange={(checked) => setValue("isRecurring", checked)}
                className="data-[state=unchecked]:bg-gray-500 data-[state=checked]:bg-amber-500 hover:cursor-pointer"
              />
            </div>
            {/* Recurring Interval Select */}
            {isRecurring && (
              <>
                {" "}
                <label className="text-white text-sm font-medium">
                  Transaction Interval
                </label>
                <Select
                  onValueChange={(value) =>
                    setValue("recurringInterval", value as any)
                  }
                  defaultValue={getValues("recurringInterval")}
                >
                  <SelectTrigger className="w-[95%] text-white">
                    <SelectValue
                      placeholder="Select Type"
                      className="text-white"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">DAILY</SelectItem>
                    <SelectItem value="WEEKLY">WEEKLY</SelectItem>
                    <SelectItem value="MONTHLY">MONTHLY</SelectItem>
                    <SelectItem value="YEARLY">YEARLY</SelectItem>
                  </SelectContent>
                </Select>
                {/* Error Message */}
                {errors.recurringInterval && (
                  <p className="text-sm text-red-500">
                    {errors.recurringInterval.message}
                  </p>
                )}
              </>
            )}
          </div>
          {/* CTA BUTTONS */}
          <div className="w-full grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-y-6 lg:gap-x-6 mt-4">
            <Button
              type="button"
              className="w-full text-white h-[8.5vh] font-semibold text-md bg-red-400/40 hover:cursor-pointer hover:bg-red-500"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-linear-to-br from-yellow-400/80 via-orange-400/80 to-amber-400/80 text-white h-[8.5vh] font-semibold text-md hover:cursor-pointer hover:bg-amber-400/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Transaction"
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddTransactionForm;
