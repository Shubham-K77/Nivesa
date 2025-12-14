import AuthForm from "@/components/custom/AuthForm";

const signupPage = () => {
  return (
    <div className="w-full max-w-md md:max-w-xl lg:max-w-md mx-auto bg-transparent flex flex-col justify-center items-center">
      <AuthForm type={"signup"} />
    </div>
  );
};

export default signupPage;
