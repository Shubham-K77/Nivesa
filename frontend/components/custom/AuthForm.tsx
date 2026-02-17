/* eslint-disable @typescript-eslint/no-explicit-any */
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
//Toaster
import { toast } from "sonner";
//Routing
import { useRouter } from "next/navigation";
//React
import { useState } from "react";
//My Server Component For Api Calls
import {
  login,
  resendOtp,
  signup,
  verify,
  resetEmail,
  resetResendOtp,
  resetVerifyOtp,
  resetPassword,
} from "@/actions/users.api";
//Icons
import { ImSpinner8 } from "react-icons/im";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { setFamilyMemberPassword } from "@/actions/familyMembers.api";
//Schema For Signup
const signupSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must have 8+ characters, including uppercase, lowercase, number, and special char.",
    ),
  name: z.string().min(2),
  phoneNumber: z
    .string()
    .regex(
      /^\+977\d{10}$/,
      "Invalid phone number format. Please enter the number in the format: +977 followed by exactly 10 digits. Example: +9779801234567",
    )
    .optional()
    .or(z.literal("")),
});
//Schema For Login
const loginSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must have 8+ characters, including uppercase, lowercase, number, and special char.",
    ),
});
//Schema For Otp Validation
const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 characters"),
});
//Schema For Reset Password : Email Request
const resetPasswordEmailSchema = z.object({
  email: z.string().email(),
});
//Schema For Reset Password: Final Password Reset
const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must have 8+ characters, including uppercase, lowercase, number, and special char.",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
//Type for the Auth Form Props
type AuthFormProps = {
  type:
    | "signup"
    | "login"
    | "otp"
    | "resetEmail"
    | "resetOtp"
    | "resetPassword"
    | "setPasswordFamilyMember";
  token?: string; // optional token
};
const AuthForm = ({ type, token }: AuthFormProps) => {
  //Routing
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  //Determine the schema and default values
  let selectedSchema:
    | typeof signupSchema
    | typeof loginSchema
    | typeof otpSchema
    | typeof resetPasswordEmailSchema
    | typeof resetPasswordSchema;
  let defaultValues:
    | z.infer<typeof signupSchema>
    | z.infer<typeof loginSchema>
    | z.infer<typeof otpSchema>
    | z.infer<typeof resetPasswordEmailSchema>
    | z.infer<typeof resetPasswordSchema>;
  if (type === "signup") {
    selectedSchema = signupSchema;
    defaultValues = {
      email: "",
      password: "",
      name: "",
      phoneNumber: "",
    };
  } else if (type === "login") {
    selectedSchema = loginSchema;
    defaultValues = {
      email: "",
      password: "",
    };
  } else if (type === "otp" || type === "resetOtp") {
    selectedSchema = otpSchema;
    defaultValues = {
      otp: "",
    };
  } else if (type === "resetEmail") {
    selectedSchema = resetPasswordEmailSchema;
    defaultValues = {
      email: "",
    };
  } else if (type === "resetPassword" || type === "setPasswordFamilyMember") {
    selectedSchema = resetPasswordSchema;
    defaultValues = {
      newPassword: "",
      confirmPassword: "",
    };
  } else {
    throw new Error(`Invalid auth form type: ${type}`);
  }
  const form = useForm<any>({
    resolver: zodResolver(selectedSchema),
    defaultValues,
  });
  async function onSubmit(values: any) {
    if (type === "signup") {
      setLoading(true);
      try {
        const { email, name, phoneNumber, password } = values;
        const payload = {
          email,
          name,
          password,
          ...(phoneNumber ? { phoneNumber } : {}), // only include if not empty
        };
        const response = await signup(payload);
        toast.success(response.data.message);
        setLoading(false);
        return router.push(`/verify/${response.data.token}`);
      } catch (error: any) {
        setLoading(false);
        return toast.error(error.response?.data?.message);
      }
    } else if (type === "login") {
      try {
        setLoading(true);
        const { email, password } = values;
        const response = await login({ email, password });
        setLoading(false);
        toast.success(response.data.message);
        return router.push("/home");
      } catch (error: any) {
        setLoading(false);
        return toast.error(error.response?.data?.message);
      }
      // return router.push("/login");
    } else if (type === "otp") {
      try {
        setLoading(true);
        const { otp } = values;
        const response = await verify({ otp, token: token || "" });
        setLoading(false);
        toast.success(response.data.message);
        return router.push("/login");
      } catch (error: any) {
        setLoading(false);
        return toast.error(error.response?.data?.message);
      }
    } else if (type === "resetEmail") {
      try {
        setLoading(true);
        const { email } = values;
        const response = await resetEmail({ email });
        setLoading(false);
        toast.success(response.data.message);
        return router.push(`/reset/${response.data.token}`);
      } catch (error: any) {
        setLoading(false);
        return toast.error(error?.response?.data?.message);
      }
    } else if (type === "resetOtp") {
      try {
        setLoading(true);
        const { otp } = values;
        const response = await resetVerifyOtp({ otp, token: token || "" });
        setLoading(false);
        toast.success(response.data.message);
        return router.push(`/reset/password/${response.data.token}`);
      } catch (error: any) {
        setLoading(false);
        return toast.error(error?.response?.data?.message);
      }
    } else if (type === "resetPassword") {
      try {
        setLoading(true);
        const { newPassword } = values;
        const response = await resetPassword({
          token: token || "",
          newPassword,
        });
        setLoading(false);
        toast.success(response.data.message);
        return router.push(`/login`);
      } catch (error: any) {
        setLoading(false);
        return toast.error(error?.response?.data?.message);
      }
    } else {
      try {
        setLoading(true);
        const { newPassword } = values;
        const response = await setFamilyMemberPassword({
          token: token || "",
          newPassword,
        });
        setLoading(false);
        toast.success(response.data.message);
        return router.push("/login");
      } catch (error: any) {
        setLoading(false);
        return toast.error(error?.response?.data?.message);
      }
    }
  }
  return (
    <div className="w-[95%] md:w-full lg:w-full bg-transparent">
      {/* Title and Description */}
      <div className="w-full flex flex-col justify-center items-center gap-y-3 mb-8">
        <h2 className="text-4xl md:text-5xl lg:text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-amber-500">
          {type === "signup"
            ? "Create Your Account"
            : type === "login"
              ? "Welcome Back"
              : type === "resetEmail"
                ? "Verify Your Email"
                : type === "otp" || type === "resetOtp"
                  ? "Confirm Your Identity"
                  : "Update Your Password"}
        </h2>
        <p className="text-base md:text-lg lg:text-base text-gray-300/90 text-center max-w-md px-4">
          {type === "signup"
            ? "Start your financial management journey today"
            : type === "login"
              ? "Sign in to keep your financial goals on track"
              : type === "otp" || type === "resetOtp"
                ? "We've sent a verification code to your email"
                : type === "resetEmail"
                  ? "Give us your email to reset your password"
                  : "Enter a new password to secure your account."}
        </p>
      </div>
      {/* Form UI   */}
      {type === "otp" || type === "resetOtp" ? (
        <>
          <div className="w-full bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8 sm:p-10 gap-y-3 flex flex-col justify-start items-center shadow-2xl hover:border-amber-400/30 transition-all duration-300">
            {/* Title */}
            <div className="text-3xl md:text-3xl lg:text-2xl text-white font-bold text-center">
              OTP Verification
            </div>
            {/* SubTitle */}
            <div className="text-md md:text-xl lg:text-lg text-gray-400/90 text-center mb-4">
              {type === "otp"
                ? "Confirm your OTP to access your account"
                : "Confirm your OTP to reset your password"}
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
                    <FormItem className="w-full flex flex-col justify-center items-center">
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
                      <FormMessage className="mt-2 w-full text-center text-red-500 text-xs md:text-sm lg:text-xs line-clamp-2" />
                    </FormItem>
                  )}
                />
                {/* CTA Button */}
                <Button
                  type="submit"
                  className="w-[95%] h-[9.5vh] md:h-[7vh] lg:h-[7.5vh] bg-linear-to-r from-yellow-400/80 to-amber-500/80 border border-amber-300/40 flex justify-center items-center text-white font-semibold text-xl md:text-2xl lg:text-sm mb-4 mt-4 hover:cursor-pointer transition-all ease-in-out duration-150 hover:scale-105"
                >
                  {loading === true ? (
                    <ImSpinner8 className="text-2xl font-semibold animate-spin" />
                  ) : (
                    "Submit"
                  )}
                </Button>
              </form>
            </Form>
            {/* Resend Link */}
            <div
              className="w-[95%] text-center text-sm md:text-xl lg:text-sm text-white font-semibold hover:underline hover:text-blue-500 hover:cursor-pointer"
              onClick={async () => {
                try {
                  setLoading(true);
                  // Add your resend logic here
                  let response;
                  if (type === "otp") {
                    response = await resendOtp({
                      token: token || "",
                    });
                  } else {
                    response = await resetResendOtp({ token: token || "" });
                  }
                  setLoading(false);
                  toast.success(response.data.message);
                  if (type === "otp") {
                    return router.push(`/verify/${response.data.token}`);
                  } else {
                    return router.push(`/reset/${response.data.token}`);
                  }
                } catch (error: any) {
                  setLoading(false);
                  toast.error(error.response?.data?.message);
                  if (type === "otp") {
                    return router.push("/signup");
                  } else {
                    return router.push("/reset");
                  }
                }
              }}
            >
              {loading === true ? (
                <div className="flex items-center justify-center w-full">
                  <ImSpinner8 className="text-2xl font-semibold animate-spin" />
                </div>
              ) : (
                "Didn't receive the code?"
              )}
            </div>
          </div>
        </>
      ) : type === "resetEmail" ? (
        <>
          <div className="w-full bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8 sm:p-10 gap-y-4 mb-4 shadow-2xl hover:border-amber-400/30 transition-all duration-300">
            {/* Title */}
            <div className="text-2xl md:text-3xl lg:text-2xl text-white font-bold text-center mb-6">
              Recover Your Account
            </div>
            {/* Form Component */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-[98%] space-y-4 flex flex-col justify-start items-center"
              >
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
                      <FormMessage className="mt-2 w-full text-left text-red-500 text-xs md:text-sm lg:text-xs line-clamp-2" />
                    </FormItem>
                  )}
                />
                {/* CTA Button */}
                <Button
                  type="submit"
                  className="w-[95%] h-[7.5vh] md:h-[6vh] lg:h-[7.5vh] bg-linear-to-r from-yellow-400/80 to-amber-500/80 border border-amber-300/40 flex justify-center items-center text-white font-semibold text-md md:text-lg lg:text-sm mb-4 mt-4 hover:cursor-pointer transition-all ease-in-out duration-150 hover:scale-105"
                >
                  {loading === true ? (
                    <ImSpinner8 className="text-2xl font-semibold animate-spin" />
                  ) : (
                    "Proceed"
                  )}
                </Button>
                {/* Jump Link */}
                <div className="w-[95%] flex justify-center items-center gap-x-2">
                  <div className="text-sm text-gray-400/80">
                    Already have an account?
                  </div>
                  <div
                    className="text-sm font-semibold text-amber-500/80 hover:cursor-pointer hover:underline"
                    onClick={() => router.push("/login")}
                  >
                    Sign In
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </>
      ) : type === "resetPassword" || type === "setPasswordFamilyMember" ? (
        <>
          <div className="w-full bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8 sm:p-10 gap-y-4 mb-4 shadow-2xl hover:border-amber-400/30 transition-all duration-300">
            {/* Title */}
            <div className="text-2xl md:text-3xl lg:text-2xl text-white font-bold text-center mb-6">
              Choose a New Password
            </div>
            {/* Form Component */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-[98%] space-y-4 flex flex-col justify-start items-center"
              >
                {/* New Password Field */}
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem className="w-full flex flex-col space-y-2 justify-start items-start">
                      <FormLabel className="font-normal text-sm md:text-lg lg:text-sm text-white">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            placeholder="............"
                            {...field}
                            type={showNewPassword ? "text" : "password"}
                            className="bg-gray-700/40 backdrop-blur-md p-2 pr-12 rounded-lg border border-gray-700/80 w-full h-[7vh] md:h-[5.75vh] lg:h-[7vh] flex justify-center items-center font-semibold text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-400 transition-colors duration-200 hover:cursor-pointer"
                          >
                            {showNewPassword ? (
                              <FaEyeSlash className="text-xl" />
                            ) : (
                              <FaEye className="text-xl" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="mt-2 w-full text-left text-red-500 text-xs md:text-sm lg:text-xs line-clamp-2" />
                    </FormItem>
                  )}
                />
                {/* Repeat Password Field */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="w-full flex flex-col space-y-2 justify-start items-start">
                      <FormLabel className="font-normal text-sm md:text-lg lg:text-sm text-white">
                        Retype New Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            placeholder="............"
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            className="bg-gray-700/40 backdrop-blur-md p-2 pr-12 rounded-lg border border-gray-700/80 w-full h-[7vh] md:h-[5.75vh] lg:h-[7vh] flex justify-center items-center font-semibold text-white"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-400 transition-colors duration-200 hover:cursor-pointer"
                          >
                            {showConfirmPassword ? (
                              <FaEyeSlash className="text-xl" />
                            ) : (
                              <FaEye className="text-xl" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="mt-2 w-full text-left text-red-500 text-xs md:text-sm lg:text-xs line-clamp-2" />
                    </FormItem>
                  )}
                />
                {/* CTA Button */}
                <Button
                  type="submit"
                  className="w-[95%] h-[7.5vh] md:h-[6vh] lg:h-[7.5vh] bg-linear-to-r from-yellow-400/80 to-amber-500/80 border border-amber-300/40 flex justify-center items-center text-white font-semibold text-md md:text-lg lg:text-sm mb-4 mt-4 hover:cursor-pointer transition-all ease-in-out duration-150 hover:scale-105"
                >
                  {loading === true ? (
                    <ImSpinner8 className="text-2xl font-semibold animate-spin" />
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </>
      ) : (
        // Forms For Signup And Login
        <div className="w-full bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8 sm:p-10 gap-y-4 mb-4 shadow-2xl hover:border-amber-400/30 transition-all duration-300">
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
                    name="name"
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
                        <FormMessage className="mt-2 w-full text-left text-red-500 text-xs md:text-sm lg:text-xs line-clamp-2" />
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
                        <FormMessage className="mt-2 w-full text-left text-red-500 text-xs md:text-sm lg:text-xs line-clamp-2" />
                      </FormItem>
                    )}
                  />
                  {/* Phone Number Field */}
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="w-full flex flex-col space-y-2 justify-start items-start">
                        <FormLabel className="font-normal text-sm md:text-lg lg:text-sm text-white">
                          WhatsApp Number (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+9779801234567"
                            {...field}
                            type="text"
                            className="bg-gray-700/40 backdrop-blur-md p-2 rounded-lg border border-gray-700/80 w-full h-[7vh] md:h-[5.75vh] lg:h-[7vh] flex justify-center items-center font-semibold text-white"
                          />
                        </FormControl>
                        <FormMessage className="mt-2 w-full text-left text-red-500 text-xs md:text-sm lg:text-xs line-clamp-2" />
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
                          <div className="relative w-full">
                            <Input
                              placeholder=".........."
                              {...field}
                              type={showPassword ? "text" : "password"}
                              className="bg-gray-700/40 backdrop-blur-md p-2 pr-12 rounded-lg border border-gray-700/80 w-full h-[7vh] md:h-[5.75vh] lg:h-[7vh] flex justify-center items-center font-semibold text-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-400 transition-colors duration-200 hover:cursor-pointer"
                            >
                              {showPassword ? (
                                <FaEyeSlash className="text-xl" />
                              ) : (
                                <FaEye className="text-xl" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="mt-2 w-full text-left text-red-500 text-xs md:text-sm lg:text-xs line-clamp-2" />
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
                        <FormMessage className="mt-2 w-full text-left text-red-500 text-xs md:text-sm lg:text-xs line-clamp-2" />
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
                          <div className="relative w-full">
                            <Input
                              placeholder=".........."
                              {...field}
                              type={showPassword ? "text" : "password"}
                              className="bg-gray-700/40 backdrop-blur-md p-2 pr-12 rounded-lg border border-gray-700/80 w-full h-[7vh] md:h-[5.75vh] lg:h-[7vh] flex justify-center items-center font-semibold text-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-400 transition-colors duration-200 hover:cursor-pointer"
                            >
                              {showPassword ? (
                                <FaEyeSlash className="text-xl" />
                              ) : (
                                <FaEye className="text-xl" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="mt-2 w-full text-left text-red-500 text-xs md:text-sm lg:text-xs line-clamp-2" />
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
                {loading === true ? (
                  <ImSpinner8 className="text-2xl font-semibold animate-spin" />
                ) : type === "signup" ? (
                  "Register"
                ) : (
                  "Sign In"
                )}
              </Button>
              {/* Jump to reset password */}
              {type === "login" ? (
                <div className="w-[95%] flex justify-center items-center gap-x-2">
                  <div
                    className="text-sm font-semibold text-amber-500/80 hover:cursor-pointer hover:underline"
                    onClick={() => router.push("/reset")}
                  >
                    Forgot your password?
                  </div>
                </div>
              ) : (
                <> </>
              )}
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
