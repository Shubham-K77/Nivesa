/* eslint-disable react/no-unescaped-entities */
// ShadCn Components
import DisplayCard from "@/components/custom/displayCard";
import HowItWorksCard from "@/components/custom/howItWorksCard";
import SubscriptionCard from "@/components/custom/subscriptionCard";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
//Icons:
import { FaArrowRight } from "react-icons/fa";

export default function Home() {
  return (
    <div className="w-full flex flex-col justify-start items-center">
      {/* Hero Section     */}
      <BackgroundBeamsWithCollision className="relative z-0">
        <div className="w-full h-[112vh] md:h-[85vh] lg:h-screen flex flex-col justify-center items-center bg-transparent gap-y-4 relative z-10">
          {/* Tagline */}
          <div className="w-[75%] h-[5.5vh] md:w-[50%] md:h-[4vh] lg:w-[20%] lg:h-[5.5vh] rounded-2xl bg-amber-500/30 border md:border-0 lg:border border-amber-400/80 flex justify-center items-center p-2 mb-6">
            <div className="text-sm md:text-lg lg:text-sm font-semibold text-yellow-300/80">
              🧠 Powered by AI & Machine Learning
            </div>
          </div>
          {/* Hero Text */}
          <div className="w-[95%] lg:w-[65%] flex flex-col justify-start items-center gap-y-2 mb-6">
            <div className="text-5xl md:text-7xl lg:text-6xl font-bold text-white text-center">
              Master Your Daily Finances
            </div>
            <div className="text-5xl md:text-7xl lg:text-6xl font-bold text-white text-center">
              with
              <span className="text-5xl md:text-7xl lg:text-6xl font-bold text-yellow-400/80 ml-2">
                Nivēśa
              </span>
            </div>
          </div>
          {/* Description */}
          <div className="w-[90%] lg:w-[55%] flex justify-center items-center mb-6">
            <div className="text-md lg:text-md text-white text-center">
              Predict your spending before it happens with our intelligent AI.
              Get personalized insights, prevent budget overruns, and achieve
              financial freedom. Nivēśa means "investment" in Nepali – and we'll
              help you invest in your financial future.
            </div>
          </div>
          {/* CTA */}
          <div className="w-[85%] h-[10.5vh] md:w-[55%] md:h-[8.5vh] lg:w-[20%] lg:h-[8.5vh] rounded-lg bg-yellow-400/70 flex justify-center items-center hover:cursor-pointer transition-all ease-in-out duration-150 hover:scale-95 hover:bg-amber-500/80">
            <div className="text-xl md:text-2xl lg:text-[1.10rem] font-bold text-white">
              Take Control Now!
            </div>
          </div>
        </div>
      </BackgroundBeamsWithCollision>
      {/* Features Section */}
      <div className="w-full lg:h-[150vh] flex flex-col justify-center items-center text-center relative py-12 bg-black/80">
        {/* Title Section */}
        <div className="mb-6">
          {/* Title And Description */}
          <div className="relative inline-block">
            {/* Title */}
            <h1 className="text-5xl font-bold text-white mb-4 px-8">
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
          <p className="text-gray-300/80 mt-6 text-md p-2">
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
      <div className="w-full lg:h-screen bg-transparent flex flex-col justify-center items-center text-center relative py-12 gap-y-4">
        {/* Title Section */}
        <div className="mb-6">
          {/* Title And Description */}
          <div className="relative inline-block">
            {/* Title */}
            <h1 className="text-5xl font-bold text-white mb-4 px-8">
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
          <p className="text-gray-300/80 mt-6 text-md p-2">
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
      <div className="w-full lg:h-[150vh] bg-black/80 flex flex-col justify-center items-center text-center relative py-12 gap-y-4">
        {/* Title Section */}
        <div className="mb-6">
          {/* Title And Description */}
          <div className="relative inline-block">
            {/* Title */}
            <h1 className="text-5xl font-bold text-white mb-4 px-8">
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
          <p className="text-gray-300/80 mt-6 text-md p-2">
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
      <div className="w-full px-4 sm:px-8 md:px-12 pt-0 pb-20 bg-black/80">
        <div className="max-w-7xl mx-auto bg-linear-to-br from-yellow-600 via-amber-400 to-amber-800 p-8 sm:p-10 md:p-12 text-center shadow-xl rounded-2xl backdrop-blur-md">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-white/90 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            Join many smart students who have transformed their spending habits
            with Nivēśa. Start your journey with us and invest in your financial
            future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-white text-yellow-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:cursor-pointer hover:scale-105 shadow-lg flex items-center gap-2">
              Start Today
              <FaArrowRight className="text-sm" />
            </button>
            <button className="border-2 border-white/40 text-white font-semibold px-8 py-3 rounded-lg hover:cursor-pointer hover:bg-white/20 transition-all duration-200 hover:scale-105">
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
