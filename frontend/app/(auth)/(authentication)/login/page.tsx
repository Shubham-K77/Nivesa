import AuthForm from "@/components/custom/AuthForm";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md md:max-w-xl lg:max-w-md mx-auto bg-transparent flex flex-col justify-center items-center">
      <AuthForm type={"login"} />
    </div>
  );
}
