/* eslint-disable react/no-unescaped-entities */
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must have 8+ characters, uppercase, lowercase, number, and symbol"
    ),
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .regex(/^[A-Za-z]+([ '-][A-Za-z]+)*$/, "Invalid full name"),
});

const AuthForm = ({ type }: { type: string }) => {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
    },
  });
  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }
  return (
    <div className="w-[95%] md:w-full lg:w-full bg-transparent">
      {/* Title and Description */}
      <div className="w-full flex flex-col justify-center items-center gap-y-2 mb-6">
        <div className="text-4xl font-bold text-white">
          {type === "signup" ? "Create Your Account" : "Welcome Back"}
        </div>
        <div className="text-md text-gray-400/80 text-center">
          {type === "signup"
            ? "Start your financial management journey today"
            : "Sign in to keep your financial goals on track every day"}
        </div>
      </div>
      {/* Form UI   */}
      <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 gap-y-4 mb-4">
        {/* Title */}
        <div className="text-2xl md:text-3xl lg:text-2xl text-white font-bold text-center mb-4">
          {type === "signup" ? "" : "Sign In"}
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-[98%] space-y-4 flex flex-col justify-start items-center"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full flex flex-col space-y-2 justify-start items-start">
                  <FormLabel className="font-normal text-sm md:text-lg lg:text-sm text-white">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="example@email.com"
                      {...field}
                      type="email"
                      className="bg-gray-700/40 backdrop-blur-md p-2 rounded-lg border border-gray-700/80 w-full h-[7vh] md:h-[5.75vh] lg:h-[7vh] flex justify-center items-center font-semibold text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="w-full flex flex-col space-y-2 justify-start items-start">
                  <FormLabel className="font-normal text-sm md:text-lg lg:text-sm text-white">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder=".........."
                      {...field}
                      type="password"
                      className="bg-gray-700/40 backdrop-blur-md p-2 rounded-lg border border-gray-700/80 w-full h-[7vh] md:h-[5.75vh] lg:h-[7vh] flex justify-center items-center"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-[95%] h-[7.5vh] md:h-[6vh] lg:h-[7.5vh] bg-linear-to-r from-yellow-400/80 to-amber-500/80 border border-amber-300/40 flex justify-center items-center text-white font-semibold text-md md:text-lg lg:text-sm mb-4 mt-4 hover:cursor-pointer"
            >
              {type === "signup" ? "Register" : "Sign In"}
            </Button>
            <div className="w-[95%] flex justify-center items-center gap-x-2">
              <div className="text-sm text-gray-400/80">
                Don't have an account?
              </div>
              <div className="text-sm font-semibold text-amber-500/80 hover:cursor-pointer hover:underline">
                Sign Up
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AuthForm;
