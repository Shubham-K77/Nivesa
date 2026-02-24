/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
//Form Component
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CURRENT", "SAVINGS", "FAMILY"]),
  balance: z
    .number("Balance must be specified in number")
    .default(0)
    .optional(),
  isDefault: z.boolean().default(false).optional(),
  userId: z.string().min(1, "UserId is required"),
});
//ShadCn Component
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImSpinner8 } from "react-icons/im";
//React
import { useContext, useState } from "react";
import { UserContext } from "@/app/(dashboard)/layout";
import FamilyMembersList, { FamilyMember } from "./FamilyMemberFormList";
//TanStack Query
import { useCreateAccount } from "@/queries/account/createAccount.mutation";

const DrawerComponent = ({ children }: any) => {
  const [open, setOpen] = useState(false);
  const currentUser = useContext(UserContext);
  const [members, setMembers] = useState<FamilyMember[]>([
    { id: Date.now(), name: "", email: "", phoneNumber: "" },
  ]);
  const form = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: 0,
      isDefault: false,
      userId: currentUser?.id || "",
    },
  });
  const createAccountMutation = useCreateAccount();

  async function onSubmit(values: any) {
    const { name, type, balance, isDefault, userId } = values;
    const payload = {
      name,
      type,
      balance,
      isDefault,
      userId,
      ...(type === "FAMILY" && {
        familyMemberInfo: members.map(({ id, ...rest }) => ({
          name: rest.name,
          email: rest.email || undefined,
          phoneNumber: rest.phoneNumber || undefined,
        })),
      }),
    };
    createAccountMutation.mutate(payload, {
      onSuccess: (response) => {
        toast.success(response?.data.message);
        setOpen(false);
        form.reset();
      },
      onError: (error: any) => {
        console.error(error);
        toast.error(error?.response?.data?.message);
      },
    });
  }
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="bg-black border-t border-white/5 max-h-[90vh] pointer-events-auto">
        <DrawerHeader className="border-b border-white/5 pb-4">
          <DrawerTitle className="text-white font-semibold text-lg">
            Create New Account
          </DrawerTitle>
        </DrawerHeader>
        <div
          className="overflow-y-auto max-h-[70vh] px-2 pointer-events-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-white/20"
          onWheel={(e) => e.stopPropagation()}
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-[98%] space-y-4 flex flex-col justify-start items-center px-4 pb-4"
            >
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full flex flex-col space-y-2 justify-start items-start mt-2">
                    <FormLabel className="font-medium text-sm text-white/70">
                      Name of Account
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Salary Account"
                        {...field}
                        type="text"
                        className="bg-[#0a0a0a] p-2 rounded-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-0 w-full h-[7vh] md:h-[5.75vh] lg:h-[7vh] flex justify-center items-center font-normal text-white placeholder:text-white/50"
                      />
                    </FormControl>
                    <FormMessage className="mt-2 w-full text-left text-red-500 text-xs md:text-sm lg:text-xs line-clamp-2" />
                  </FormItem>
                )}
              />
              {/* Type Field */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="w-full flex flex-col space-y-2 justify-start items-start">
                    <FormLabel className="font-medium text-sm text-white/70">
                      Account Type
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="bg-[#0a0a0a] p-2 rounded-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-0 w-full h-[7vh] min-h-[7vh] flex justify-between items-center font-normal text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0a0a] border-0">
                          <SelectItem
                            value="CURRENT"
                            className="text-white hover:bg-emerald-500/20 hover:text-white focus:bg-emerald-500/20 focus:text-white"
                          >
                            Current
                          </SelectItem>
                          <SelectItem
                            value="SAVINGS"
                            className="text-white hover:bg-emerald-500/20 hover:text-white focus:bg-emerald-500/20 focus:text-white"
                          >
                            Savings
                          </SelectItem>
                          <SelectItem
                            value="FAMILY"
                            className="text-white hover:bg-emerald-500/20 hover:text-white focus:bg-emerald-500/20 focus:text-white"
                          >
                            Family
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="mt-2 w-full text-left text-red-500 text-xs md:text-sm lg:text-xs line-clamp-2" />
                  </FormItem>
                )}
              />
              {/* If Type == Family */}
              {form.watch("type") === "FAMILY" ? (
                <div className="w-full">
                  <FamilyMembersList
                    members={members}
                    setMembers={setMembers}
                  />
                </div>
              ) : null}
              {/* Initial Balance Field */}
              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem className="w-full flex flex-col space-y-2 justify-start items-start">
                    <FormLabel className="font-medium text-sm text-white/70">
                      Initial Balance
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.0"
                        {...field}
                        type="number"
                        step={"0.01"}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        className="bg-[#0a0a0a] p-2 rounded-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-0 w-full h-[7vh] md:h-[5.75vh] lg:h-[7vh] flex justify-center items-center font-normal text-white placeholder:text-white/50"
                      />
                    </FormControl>
                    <FormMessage className="mt-2 w-full text-left text-red-500 text-xs md:text-sm lg:text-xs line-clamp-2" />
                  </FormItem>
                )}
              />
              {/* IsDefault Field */}
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="w-full flex justify-between items-center bg-[#0a0a0a] rounded-lg p-4 border-0">
                    <div className="flex flex-col space-y-1 justify-start items-start">
                      <FormLabel className="font-medium text-sm text-white">
                        Set as Default
                      </FormLabel>
                      <div className="font-normal text-xs text-white/50">
                        This account will be selected by default for
                        transactions
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=unchecked]:bg-white/10 data-[state=checked]:bg-emerald-500"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {/* CTA Buttons For Submit And Cancel */}
              <div className="w-full flex justify-end items-center gap-3 pt-2">
                {/* Cancel Button */}
                <DrawerClose asChild>
                  <Button
                    type="button"
                    className="px-6 h-10 bg-[#0a0a0a] hover:bg-[#1a1a1a] border-0 flex justify-center items-center text-white/70 hover:text-white font-medium text-sm hover:cursor-pointer rounded-lg transition-colors"
                  >
                    Cancel
                  </Button>
                </DrawerClose>
                {/* Submit Button */}
                <Button
                  type="submit"
                  className="px-6 h-10 bg-amber-500 hover:bg-amber-600 flex justify-center items-center text-white font-semibold text-sm hover:cursor-pointer rounded-lg transition-colors"
                >
                  {createAccountMutation.isPending ? (
                    <ImSpinner8 className="text-white animate-spin" size={18} />
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerComponent;
