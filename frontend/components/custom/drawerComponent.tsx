/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
//Form Component
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CURRENT", "SAVINGS"]),
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
import { createNewAccount } from "@/actions/accounts.api";
import { UserContext } from "@/app/(dashboard)/layout";
import { useRouter } from "next/navigation";

const DrawerComponent = ({ children }: any) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentUser = useContext(UserContext);
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
  async function onSubmit(values: any) {
    try {
      setLoading(true);
      const { name, type, balance, isDefault, userId } = values;
      const response = await createNewAccount({
        name,
        type,
        balance,
        isDefault,
        userId,
      });
      setLoading(false);
      setOpen(false);
      form.reset();
      router.refresh();
      return toast.success(response.data.message);
    } catch (error: any) {
      setLoading(false);
      console.error(error);
      return toast.error(error?.response?.data?.message);
    }
  }
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="bg-gray-950/80">
        <DrawerHeader>
          <DrawerTitle className="text-white">Create New Account</DrawerTitle>
        </DrawerHeader>
        <div>
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
                  <FormItem className="w-full flex flex-col space-y-2 justify-start items-start">
                    <FormLabel className="font-normal text-sm md:text-lg lg:text-sm text-white">
                      Name of Account
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Salary Account"
                        {...field}
                        type="text"
                        className="bg-gray-700/40 backdrop-blur-md p-2 rounded-lg border border-gray-700/80 w-full h-[7vh] md:h-[5.75vh] lg:h-[7vh] flex justify-center items-center font-semibold text-white"
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
                    <FormLabel className="font-normal text-sm md:text-lg lg:text-sm text-white">
                      Account Type
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="bg-gray-700/40 p-2 rounded-lg border border-gray-700/80 w-full h-[7vh] min-h-[7vh] flex justify-start items-center font-semibold text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CURRENT">Current</SelectItem>
                          <SelectItem value="SAVINGS">Savings</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="mt-2 w-full text-left text-red-500 text-xs md:text-sm lg:text-xs line-clamp-2" />
                  </FormItem>
                )}
              />
              {/* Initial Balance Field */}
              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem className="w-full flex flex-col space-y-2 justify-start items-start">
                    <FormLabel className="font-normal text-sm md:text-lg lg:text-sm text-white">
                      Initial Balance
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.0"
                        {...field}
                        type="number"
                        step={"0.01"}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        className="bg-gray-700/40 backdrop-blur-md p-2 rounded-lg border border-gray-700/80 w-full h-[7vh] md:h-[5.75vh] lg:h-[7vh] flex justify-center items-center font-semibold text-white"
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
                  <FormItem className="w-full flex justify-around items-center">
                    <div className="w-full flex flex-col space-y-2 justify-start items-start p-2">
                      <FormLabel className="font-normal text-sm md:text-lg lg:text-sm text-white">
                        Set as Default
                      </FormLabel>
                      <div className="font-normal text-sm md:text-lg lg:text-sm text-white">
                        The Account will be selected by default for transactions
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=unchecked]:bg-gray-700 data-[state=checked]:bg-amber-400"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {/* CTA Buttons For Submit And Cancel */}
              <div className="w-full flex justify-start items-center space-x-4">
                {/* Cancel Button */}
                <DrawerClose asChild>
                  <Button
                    type="button"
                    className="w-[45%] lg:w-[12%] h-[6.5vh] bg-white flex justify-center items-center text-black font-semibold text-md md:text-lg lg:text-sm hover:cursor-pointer rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </Button>
                </DrawerClose>
                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-[45%] lg:w-[12%] h-[7.5vh] md:h-[6vh] lg:h-[7.5vh] bg-linear-to-br from-yellow-400/80 to-amber-800/80 border border-amber-300/40 flex justify-center items-center text-white font-semibold text-md md:text-lg lg:text-sm hover:cursor-pointer"
                >
                  {loading === true ? (
                    <ImSpinner8 className="text-white animate-spin" size={25} />
                  ) : (
                    "Create"
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
