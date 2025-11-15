import AuthForm from "@/components/custom/authForm";

const otpValidationPage = () => {
  return (
    <div className="w-full max-w-md md:max-w-xl lg:max-w-md mx-auto bg-transparent flex flex-col justify-center items-center">
      <AuthForm type={"otp"} />
    </div>
  );
};

export default otpValidationPage;
