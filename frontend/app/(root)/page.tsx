/* eslint-disable react/no-unescaped-entities */
// ShadCn Components
import DisplayCard from "@/components/custom/DisplayCard";
import HowItWorksCard from "@/components/custom/HowItWorksCard";
import SubscriptionCard from "@/components/custom/SubscriptionCard";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
//Icons:
import { FaArrowRight } from "react-icons/fa";

export default function Home() {
  return (
    <div className="w-full flex flex-col justify-start items-center">
      {/* Hero Section     */}
      <BackgroundBeamsWithCollision className="relative z-0 mt-8">
        <div className="w-full h-screen md:h-[90vh] lg:h-[105vh] flex flex-col justify-center items-center bg-transparent gap-y-3 md:gap-y-4 relative z-10 px-4">
          {/* Tagline */}
          <div className="w-[85%] md:w-[60%] lg:w-[20%] rounded-2xl bg-linear-to-r from-amber-500/50 to-yellow-500/50 backdrop-blur-md border-2 border-amber-400/70 flex justify-center items-center p-3 md:p-4 mb-4 md:mb-6 shadow-xl">
            <div className="text-xs md:text-base lg:text-sm font-bold text-yellow-100 text-center">
              🧠 Powered by AI & Machine Learning
            </div>
          </div>
          {/* Hero Text */}
          <div className="w-[95%] lg:w-[65%] flex flex-col justify-start items-center gap-y-1 md:gap-y-2 mb-4 md:mb-6">
            <div className="text-4xl md:text-6xl lg:text-6xl font-bold text-white text-center leading-tight">
              Master Your Daily Finances
            </div>
            <div className="text-4xl md:text-6xl lg:text-6xl font-bold text-white text-center leading-tight">
              with
              <span className="text-4xl md:text-6xl lg:text-6xl font-bold text-yellow-400 ml-2">
                Nivēśa
              </span>
            </div>
          </div>
          {/* Description */}
          <div className="w-[90%] lg:w-[55%] flex justify-center items-center mb-4 md:mb-6">
            <div className="text-sm md:text-lg lg:text-md text-gray-100 text-center leading-relaxed px-2">
              Predict your spending before it happens with our intelligent AI.
              Get personalized insights, prevent budget overruns, and achieve
              financial freedom. Nivēśa means "investment" in Nepali – and we'll
              help you invest in your financial future.
            </div>
          </div>
          {/* CTA */}
          <div className="w-[85%] h-[8vh] md:w-[60%] md:h-[9vh] lg:w-[20%] lg:h-[8.5vh] rounded-2xl bg-linear-to-r from-yellow-400 to-amber-500 flex justify-center items-center hover:cursor-pointer transition-all ease-in-out duration-200 hover:scale-105 shadow-2xl hover:shadow-yellow-500/60 border-2 border-yellow-300/50 active:scale-95">
            <div className="text-lg md:text-xl lg:text-[1.10rem] font-bold text-white drop-shadow-md">
              Take Control Now!
            </div>
          </div>
        </div>
      </BackgroundBeamsWithCollision>
      {/* Features Section */}
      <div className="w-full lg:h-[150vh] flex flex-col justify-center items-center text-center relative py-12 md:py-16 bg-linear-to-b from-black/90 via-black/80 to-black/90 px-4">
        {/* Title Section */}
        <div className="mb-6 md:mb-8">
          {/* Title And Description */}
          <div className="relative inline-block">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 px-4 md:px-8">
              Why Choose Nivēśa?
            </h1>

            {/* Curve under heading only */}
            <svg
              className="absolute left-0 right-0 -bottom-2"
              width="100%"
              height="12"
              viewBox="0 0 1000 12"
              preserveAspectRatio="none"
            >
              <path
                d="M10 8 Q 500 2, 990 8"
                stroke="#FFD700"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {/* Description */}
          <p className="text-gray-200/90 mt-4 md:mt-6 text-sm md:text-base p-2 max-w-3xl mx-auto leading-relaxed">
            Our intelligent platform provides comprehensive financial management
            tailored to your income and spending needs.
          </p>
        </div>
        {/* Cards Section */}
        <div className="w-[95%] lg:w-[85%] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 p-2">
          <DisplayCard
            icon={1}
            title={"Predictive Spending Analytics"}
            desc={
              "Track expenses with AI that learns your patterns and predicts future spending before it happens."
            }
          />
          <DisplayCard
            icon={2}
            title={"Personalized Financial Insights"}
            desc={
              "Get detailed analysis of your spending habits, budget health, and actionable recommendations for improvement."
            }
          />
          <DisplayCard
            icon={3}
            title={"Smart Budget Alerts"}
            desc={
              "Receive proactive warnings about potential overspending before you run out of money each month."
            }
          />
          <DisplayCard
            icon={4}
            title={"AI Receipt Scanning"}
            desc={
              "Snap photos of receipts and let AI automatically extract, categorize, and log your expenses instantly."
            }
          />
          <DisplayCard
            icon={5}
            title={"Progress Dashboard"}
            desc={
              "Monitor your financial growth over time with visual charts, trends, and monthly performance reports."
            }
          />
          <DisplayCard
            icon={6}
            title={"WhatsApp Integration"}
            desc={
              "Stay informed anywhere, anytime. Get real-time spending alerts and updates on your preferred platform."
            }
          />
        </div>
      </div>
      {/* How it Works? Section */}
      <div className="w-full lg:h-screen bg-transparent flex flex-col justify-center items-center text-center relative py-12 gap-y-3 md:gap-y-4 px-4">
        {/* Title Section */}
        <div className="mb-4 md:mb-6">
          {/* Title And Description */}
          <div className="relative inline-block">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 px-4 md:px-8">
              How Nivēśa Works?
            </h1>

            {/* Curve under heading only */}
            <svg
              className="absolute left-0 right-0 -bottom-2"
              width="100%"
              height="12"
              viewBox="0 0 1000 12"
              preserveAspectRatio="none"
            >
              <path
                d="M10 8 Q 500 2, 990 8"
                stroke="#FFD700"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {/* Description */}
          <p className="text-gray-300/80 mt-4 md:mt-6 text-sm md:text-base p-2 leading-relaxed">
            Get started in minutes and begin managing your finances smarter with
            our streamlined onboarding process.
          </p>
        </div>
        {/* Cards Section */}
        <div className="w-[95%] md:w-[85%] lg:w-[85%] grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-10 lg:gap-y-0 p-2">
          <HowItWorksCard
            value={1}
            title={"Set Your Financial Profile"}
            desc={
              "Share your income, expenses, and goals for personalized budget recommendations tailored to your lifestyle."
            }
          />
          <HowItWorksCard
            value={2}
            title={"Track with AI Intelligence"}
            desc={
              "Log transactions with AI-powered predictions that learn your patterns and forecast future spending."
            }
          />
          <HowItWorksCard
            value={3}
            title={"Get Insights & Prosper"}
            desc={
              "Receive smart alerts and monitor your progress with personalized recommendations and visual analytics."
            }
          />
        </div>
      </div>
      {/* Pricing Section */}
      <div className="w-full lg:h-[150vh] bg-linear-to-b from-black/90 via-gray-900/80 to-black/90 flex flex-col justify-center items-center text-center relative py-12 md:py-16 gap-y-3 md:gap-y-4 px-4">
        {/* Title Section */}
        <div className="mb-6 md:mb-8">
          {/* Title And Description */}
          <div className="relative inline-block">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 px-4 md:px-8">
              Simple, Transparent Pricing
            </h1>

            {/* Curve under heading only */}
            <svg
              className="absolute left-0 right-0 -bottom-2"
              width="100%"
              height="12"
              viewBox="0 0 1000 12"
              preserveAspectRatio="none"
            >
              <path
                d="M10 8 Q 500 2, 990 8"
                stroke="#FFD700"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {/* Description */}
          <p className="text-gray-300/80 mt-4 md:mt-6 text-sm md:text-base p-2 leading-relaxed">
            Choose the plan that fits your needs. All plans include core
            features to help you master your finances.
          </p>
        </div>
        {/* Cards Section */}
        <div className="w-[95%] md:w-[85%] lg:w-[85%] grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-10 lg:gap-y-0 p-2">
          <SubscriptionCard
            type={"Free"}
            desc={"Great for trying out smart budgeting"}
            price={"RS 0"}
            subprice={"forever"}
            points={[
              "Track up to 50 transactions per month",
              "Basic expense categorization",
              "Simple budget creation",
              "Monthly spending summary",
              "Manual transaction entry",
              "Basic dashboard view",
            ]}
          />
          <SubscriptionCard
            type={"Student"}
            desc={"Ideal for students and budget-conscious individuals"}
            price={"RS 149"}
            subprice={"per month"}
            points={[
              "Unlimited transaction tracking",
              "AI-powered spending predictions",
              "Smart budget alerts via WhatsApp",
              "AI receipt scanning (OCR)",
              "Multi-account management",
              "Visual spending analytics",
              "Monthly financial insights report",
              "Progress tracking dashboard",
            ]}
          />
          <SubscriptionCard
            type={"Pro"}
            desc={"Designed for ambitious savers and professionals"}
            price={"RS 249"}
            subprice={"per month"}
            points={[
              "Everything in Student",
              "Advanced predictive analytics (75-85% accuracy)",
              "Seasonal trend analysis",
              "Recurring transaction detection",
              "Priority WhatsApp alerts",
              "Automated monthly reports with AI insights",
              "Budget goal recommendations",
              "Export data & detailed reports",
              "Premium customer support",
            ]}
          />
        </div>
      </div>
      {/* Banner */}
      <div className="w-full px-4 sm:px-6 md:px-12 pt-0 pb-16 md:pb-20 bg-linear-to-b from-black/90 to-black/95">
        <div className="max-w-7xl mx-auto bg-linear-to-br from-yellow-500 via-amber-500 to-orange-600 p-6 sm:p-8 md:p-12 text-center shadow-2xl rounded-2xl md:rounded-3xl backdrop-blur-sm border-2 border-yellow-400/30">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4 leading-tight">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-white/90 text-sm sm:text-base md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
            Join many smart students who have transformed their spending habits
            with Nivēśa. Start your journey with us and invest in your financial
            future.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
            <button className="w-full sm:w-auto bg-white text-amber-600 font-bold px-6 md:px-8 py-3 md:py-3.5 text-base md:text-lg rounded-xl hover:bg-gray-50 transition-all duration-200 hover:cursor-pointer hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2">
              Start Today
              <FaArrowRight className="text-sm" />
            </button>
            <button className="w-full sm:w-auto border-2 border-white/70 text-white font-bold px-6 md:px-8 py-3 md:py-3.5 text-base md:text-lg rounded-xl hover:cursor-pointer hover:bg-white/30 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
