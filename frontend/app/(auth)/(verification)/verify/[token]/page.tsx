//Client Component
"use client";
import AuthForm from "@/components/custom/authForm";
import { useParams } from "next/navigation";

const OtpValidationPage = () => {
  const params = useParams();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  return (
    <div className="w-full max-w-md md:max-w-xl lg:max-w-md mx-auto bg-transparent flex flex-col justify-center items-center">
      <AuthForm type={"otp"} token={token} />
    </div>
  );
};

export default OtpValidationPage;
