import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <BackgroundGradientAnimation className="w-full flex flex-col justify-start items-center text-white">
        {/* Header */}
        <div className="w-[90%] lg:w-[95%] mt-2 flex justify-start items-center gap-x-4">
          {/* Logo   */}
          <div
            className="w-[20%] md:w-[16.5vh] lg:w-[18.25vh] h-[22.5vh] md:h-[16.5vh] lg:h-[18.25vh] bg-transparent md:mt-2 lg:mt-0 hover:cursor-pointer"
            style={{
              backgroundImage: `url(/images/logo.png)`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          ></div>
          {/* Title */}
          <div className="font-bold text-4xl md:text-6xl lg:text-4xl text-yellow-400/80 hover:cursor-pointer">
            Nivēśa
          </div>
        </div>
        {/* Main */}
        {children}
      </BackgroundGradientAnimation>
    </>
  );
}
