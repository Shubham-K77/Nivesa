/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";
//ShadCn User Input Form
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
//ShadCn Input Otp
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
//Routing
import { useRouter } from "next/navigation";
//React
import { useState } from "react";
//Schema For Signup
const signupSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must have 8+ characters..."
    ),
  fullName: z.string().min(2),
});
//Schema For Login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  fullName: z.string().optional(),
});
//Schema For Otp Validation
const otpSchema = z.object({
  email: z.string().email().optional(),
  otp: z.string().length(6, "OTP must be 6 characters"),
});

const AuthForm = ({ type }: { type: string }) => {
  //Constant for routing
  const router = useRouter();
  const [isResendClicked, setIsResendClicked] = useState(false);
  //Determine the schema and default values
  let selectedSchema:
    | typeof signupSchema
    | typeof loginSchema
    | typeof otpSchema;
  let defaultValues:
    | z.infer<typeof signupSchema>
    | z.infer<typeof loginSchema>
    | z.infer<typeof otpSchema>;
  if (type === "signup") {
    selectedSchema = signupSchema;
    defaultValues = {
      email: "",
      password: "",
      fullName: "",
    };
  } else if (type === "login") {
    selectedSchema = loginSchema;
    defaultValues = {
      email: "",
      password: "",
    };
  } else {
    selectedSchema = otpSchema;
    defaultValues = {
      email: "",
      otp: "",
    };
  }

  const form = useForm<any>({
    resolver: zodResolver(selectedSchema),
    defaultValues,
  });
  function onSubmit(values: any) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }
  return (
    <div className="w-[95%] md:w-full lg:w-full bg-transparent">
      {/* Title and Description */}
      <div className="w-full flex flex-col justify-center items-center gap-y-2 mb-6">
        <div className="text-4xl font-bold text-white">
          {type === "signup"
            ? "Create Your Account"
            : type === "login"
            ? "Welcome Back"
            : "Verify Your Email"}
        </div>
        <div className="text-md md:text-lg lg:text-md text-gray-400/80 text-center">
          {type === "signup"
            ? "Start your financial management journey today"
            : type === "login"
            ? "Sign in to keep your financial goals on track"
            : "We've sent a verification code to your email"}
        </div>
      </div>
      {/* Form UI   */}
      {type === "otp" ? (
        <>
          <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 gap-y-2 flex flex-col justify-start items-center">
            {/* Title */}
            <div className="text-3xl md:text-3xl lg:text-2xl text-white font-bold text-center">
              Email Verification
            </div>
            {/* SubTitle */}
            <div className="text-md md:text-xl lg:text-lg text-gray-400/90 text-center mb-4">
              Confirm your OTP to access your account
            </div>
            {/* Otp-Input Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full gap-y-4 flex flex-col justify-start items-center"
              >
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem className="w-full flex justify-center items-center">
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                          className="w-full"
                          {...field}
                        >
                          <InputOTPGroup className="w-full">
                            <InputOTPSlot
                              index={0}
                              className="h-[10.5vh] w-[8.5vh] md:w-[7.5vh] md:h-[7.5vh] lg:w-[8.5vh] lg:h-[8.5vh] border-2 border-gray-200/10 text-white font-semibold text-2xl lg:text-xl"
                            />
                            <InputOTPSlot
                              index={1}
                              className="h-[10.5vh] w-[8.5vh] md:w-[7.5vh] md:h-[7.5vh] lg:w-[8.5vh] lg:h-[8.5vh] border-2 border-gray-200/10 text-white font-semibold text-2xl lg:text-xl"
                            />
                            <InputOTPSlot
                              index={2}
                              className="h-[10.5vh] w-[8.5vh] md:w-[7.5vh] md:h-[7.5vh] lg:w-[8.5vh] lg:h-[8.5vh] border-2 border-gray-200/10 text-white font-semibold text-2xl lg:text-xl"
                            />
                            <InputOTPSlot
                              index={3}
                              className="h-[10.5vh] w-[8.5vh] md:w-[7.5vh] md:h-[7.5vh] lg:w-[8.5vh] lg:h-[8.5vh] border-2 border-gray-200/10 text-white font-semibold text-2xl lg:text-xl"
                            />
                            <InputOTPSlot
                              index={4}
                              className="h-[10.5vh] w-[8.5vh] md:w-[7.5vh] md:h-[7.5vh] lg:w-[8.5vh] lg:h-[8.5vh] border-2 border-gray-200/10 text-white font-semibold text-2xl lg:text-xl"
                            />
                            <InputOTPSlot
                              index={5}
                              className="h-[10.5vh] w-[8.5vh] md:w-[7.5vh] md:h-[7.5vh] lg:w-[8.5vh] lg:h-[8.5vh] border-2 border-gray-200/10 text-white font-semibold text-2xl lg:text-xl"
                            />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* CTA Button */}
                <Button
                  type="submit"
                  className="w-[95%] h-[9.5vh] md:h-[7vh] lg:h-[7.5vh] bg-linear-to-r from-yellow-400/80 to-amber-500/80 border border-amber-300/40 flex justify-center items-center text-white font-semibold text-xl md:text-2xl lg:text-sm mb-4 mt-4 hover:cursor-pointer transition-all ease-in-out duration-150 hover:scale-105"
                >
                  Submit
                </Button>
                {/* Resend Link */}
                <div
                  className="w-[95%] text-center text-sm md:text-xl lg:text-sm text-white font-semibold hover:underline hover:text-blue-500 hover:cursor-pointer"
                  onClick={() => setIsResendClicked(!isResendClicked)}
                >
                  Didn't receive the code?
                </div>
                {/* Resend Component */}
                {isResendClicked === true ? (
                  <>
                    <div className="w-[98%] flex justify-center items-center gap-x-2 mt-4">
                      {/* Form Field */}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="w-[70%] flex flex-col space-y-2 justify-start items-start">
                            <FormLabel className="font-normal text-sm md:text-xl lg:text-sm text-white">
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
                      {/* Resend Button */}
                      <Button
                        type="button"
                        onClick={() => {
                          const email = form.getValues("email");
                          console.log("Resending OTP to:", email);
                          // Add your resend logic here
                        }}
                        className="w-[25%] h-[7vh] md:h-[5.75vh] lg:h-[7vh] border-2 border-gray-200/80 rounded-lg bg-transparent text-sm md:text-xl lg:text-sm font-semibold text-white hover:bg-amber-400/70 mt-8 hover:cursor-pointer"
                      >
                        Resend
                      </Button>
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </form>
            </Form>
          </div>
        </>
      ) : (
        // Forms For Signup And Login
        <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 gap-y-4 mb-4">
          {/* Title */}
          <div className="text-2xl md:text-3xl lg:text-2xl text-white font-bold text-center mb-4">
            {type === "signup" ? "" : "Sign In"}
          </div>
          {/* Form Component */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-[98%] space-y-4 flex flex-col justify-start items-center"
            >
              {/* The Fields For The Form According To The Component */}
              {type === "signup" ? (
                <>
                  {/* FullName Field */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="w-full flex flex-col space-y-2 justify-start items-start">
                        <FormLabel className="font-normal text-sm md:text-lg lg:text-sm text-white">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            {...field}
                            type="text"
                            className="bg-gray-700/40 backdrop-blur-md p-2 rounded-lg border border-gray-700/80 w-full h-[7vh] md:h-[5.75vh] lg:h-[7vh] flex justify-center items-center font-semibold text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Email Address Field */}
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
                  {/* Password Field */}
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
                </>
              ) : (
                <>
                  {/* Email Address Field */}
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
                  {/* Password Field */}
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
                </>
              )}
              {/* CTA Button */}
              <Button
                type="submit"
                className="w-[95%] h-[7.5vh] md:h-[6vh] lg:h-[7.5vh] bg-linear-to-r from-yellow-400/80 to-amber-500/80 border border-amber-300/40 flex justify-center items-center text-white font-semibold text-md md:text-lg lg:text-sm mb-4 mt-4 hover:cursor-pointer transition-all ease-in-out duration-150 hover:scale-105"
              >
                {type === "signup" ? "Register" : "Sign In"}
              </Button>
              {/* Jump Link */}
              <div className="w-[95%] flex justify-center items-center gap-x-2">
                <div className="text-sm text-gray-400/80">
                  {type === "signup"
                    ? "Already have an account?"
                    : "Don't have an account?"}
                </div>
                <div
                  className="text-sm font-semibold text-amber-500/80 hover:cursor-pointer hover:underline"
                  onClick={() => {
                    if (type === "signup") {
                      router.push("/login");
                    } else {
                      router.push("/signup");
                    }
                  }}
                >
                  {type === "signup" ? "Sign In" : "Sign Up"}
                </div>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};

export default AuthForm;
