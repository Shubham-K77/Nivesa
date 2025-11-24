"use client";
import AuthForm from "@/components/custom/authForm";
import { useParams } from "next/navigation";

const ResetOtpPage = () => {
  const params = useParams();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  return (
    <div className="w-full max-w-md md:max-w-xl lg:max-w-md mx-auto bg-transparent flex flex-col justify-center items-center">
      <AuthForm type={"resetOtp"} token={token} />
    </div>
  );
};

export default ResetOtpPage;
